import os
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import optuna
from sklearn.model_selection import train_test_split
from sklearn.utils import shuffle
from sklearn.decomposition import PCA
from sklearn.base import TransformerMixin
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import StratifiedKFold

class NNBaseAug:
    def __init__(self, name):
        if not os.path.exists('db'):
            os.makedirs('db')
        self.study = optuna.create_study(direction='minimize', study_name=name, storage=f'sqlite:///db/{name}.db', load_if_exists=True)
        self.trial = None
        self.name = name
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.folds = 5
        self.activation_functions = [nn.Softmax(dim=1), nn.Sigmoid(), nn.ReLU()]

    def gen_model(self) -> nn.Module:
        pass

    def gen_reducer(self, X, y) -> TransformerMixin | None:
        pass

    def train(self, model: nn.Module, X_train, y_train, X_val, y_val) -> TransformerMixin | None:
        criterion = nn.MSELoss()
        optimizer = optim.Adam(model.parameters())

        reducer = self.gen_reducer(X_train, y_train)
        if reducer is not None:
            X_train = reducer.transform(X_train)
            X_val = reducer.transform(X_val)

        train_dataset = TensorDataset(torch.from_numpy(X_train).to(torch.float32), torch.from_numpy(y_train).to(torch.float32))
        train_loader = DataLoader(train_dataset, batch_size=32)
        val_dataset = TensorDataset(torch.from_numpy(X_val).to(torch.float32), torch.from_numpy(y_val).to(torch.float32))
        val_loader = DataLoader(val_dataset, batch_size=32)

        best_model = None
        best_val_mse = 1

        epochs_with_no_improvement = 0
        for _ in range(50):
            # Train
            model.train()
            for inputs, targets in train_loader:
                inputs = inputs.to(self.device)
                targets = targets.unsqueeze(1).to(self.device)
                outputs = model(inputs)
                loss = criterion(outputs, targets)

                optimizer.zero_grad()
                loss.backward()
                optimizer.step()

            # Validate
            model.eval()
            val_mse = 0.0
            with torch.no_grad():
                for inputs, targets in val_loader:
                    inputs = inputs.to(self.device)
                    targets = targets.unsqueeze(1).to(self.device)
                    outputs = model(inputs)

                    loss = criterion(outputs, targets)
                    val_mse += loss.item() * inputs.size(0)
            val_mse = val_mse / len(val_loader.dataset)

            if val_mse < best_val_mse:
                best_val_mse = val_mse
                best_model = copy.deepcopy(model.state_dict())
                epochs_with_no_improvement = 0
            else:
                epochs_with_no_improvement += 1
                if epochs_with_no_improvement > 5:
                    break

        model.load_state_dict(best_model)
        return reducer
    
    def evaluate(self, model: nn.Module, X_test, y_test, reducer):
        criterion = nn.MSELoss()

        if reducer is not None:
            X_test = reducer.transform(X_test)

        test_dataset = TensorDataset(torch.from_numpy(X_test).to(torch.float32), torch.from_numpy(y_test).to(torch.float32))
        test_loader = DataLoader(test_dataset, batch_size=32)

        model.eval()
        test_mse = 0.0
        with torch.no_grad():
            for inputs, targets in test_loader:
                inputs = inputs.to(self.device)
                targets = targets.unsqueeze(1).to(self.device)
                outputs = model(inputs)

                loss = criterion(outputs, targets)
                test_mse += loss.item() * inputs.size(0)

        return test_mse / len(test_loader.dataset)

    def get_kfold_mse(self, model: nn.Module, X_aug, y_aug, X_test, y_test):
        skf = StratifiedKFold(
            n_splits=self.folds,
            shuffle=True,
            random_state=42
        )

        k_fold_loss = 0

        for train_idx, val_idx in skf.split(X_aug, y_aug):
            X_train, X_val = X_aug[train_idx], X_aug[val_idx]
            y_train, y_val = y_aug[train_idx], y_aug[val_idx]
            
            reducer = self.train(model, X_train, y_train, X_val, y_val)
            k_fold_loss += self.evaluate(model, X_test, y_test, reducer)

        k_fold_loss /= self.folds
        return k_fold_loss

    def objective(self, trial, X_aug, y_aug, X_test, y_test):
        self.trial = trial
        mse = self.get_kfold_mse(self.gen_model().to(self.device), X_aug, y_aug, X_test, y_test)
        self.trial = None
        return mse
    
    def optimize(self, X_aug, y_aug, X_test, y_test, n_trials=None):
        def objective(trial):
            return self.objective(trial, X_aug, y_aug, X_test, y_test)
        self.study.optimize(objective, n_trials=n_trials)

    def export_reducer(self, reducer):
        pass

    def export(self, X_aug, y_aug, X_test, y_test):
        skf = StratifiedKFold(
            n_splits=self.folds,
            shuffle=True,
            random_state=42
        )

        best_model = None
        best_reducer = None
        best_model_input_size = 3736
        best_test_mse = 1000000

        for train_idx, val_idx in skf.split(X_aug, y_aug):
            model = self.gen_model().to(self.device)
            X_train, X_val = X_aug[train_idx], X_aug[val_idx]
            y_train, y_val = y_aug[train_idx], y_aug[val_idx]
            
            reducer = self.train(model, X_train, y_train, X_val, y_val)
            test_mse = self.evaluate(model, X_test, y_test, reducer)

            if test_mse < best_test_mse:
                best_test_mse = test_mse
                best_model = model
                best_reducer = reducer
                best_model_input_size = 3736
                if reducer is not None:
                    best_model_input_size = best_reducer.transform(np.random.randn(1, 3736)).shape[1]

        best_model.cpu()
        torch.onnx.export(
            best_model,
            torch.ones([1, best_model_input_size]),
            f"{self.name}.onnx",
            export_params=True,
            opset_version=14,
            input_names=['input'],
            output_names=['type2_confidence'],
            external_data=False,
        )

        if best_reducer is not None:
            self.export_reducer(best_reducer)

    def confusion_matrix(self, model: nn.Module, X_aug, y_aug, X_test, y_test):
        skf = StratifiedKFold(
            n_splits=self.folds,
            shuffle=True,
            random_state=42
        )

        total_true_positive = 0
        total_true_negative = 0
        total_false_positive = 0
        total_false_negative = 0

        for train_idx, val_idx in skf.split(X_aug, y_aug):
            X_train, X_val = X_aug[train_idx], X_aug[val_idx]
            y_train, y_val = y_aug[train_idx], y_aug[val_idx]
            
            reducer = self.train(model, X_train, y_train, X_val, y_val)

            test_dataset = TensorDataset(torch.from_numpy(X_test if reducer is None else reducer.transform(X_test)).to(torch.float32), torch.from_numpy(y_test).to(torch.float32))
            test_loader = DataLoader(test_dataset, batch_size=32)

            model.eval()
            with torch.no_grad():
                true_positive = 0
                true_negative = 0
                false_positive = 0
                false_negative = 0
                
                for inputs, targets in test_loader:
                    inputs = inputs.to(self.device)
                    targets = targets.to(self.device)
                    outputs = model(inputs)

                    outputs = outputs.detach().cpu().numpy()
                    targets = targets.detach().cpu().numpy()

                    treshold = 0.6
                    for i in range(outputs.size):
                        if targets[i] >= 0.5:
                            if outputs[i] >= treshold:
                                true_positive += 1
                            else:
                                false_negative += 1
                        else:
                            if (outputs[i] < treshold):
                                true_negative += 1
                            else:
                                false_positive += 1

                total_true_positive += true_positive
                total_true_negative += true_negative
                total_false_positive += false_positive
                total_false_negative += false_negative
            
        return {
            'avg_true_positive': total_true_positive / self.folds,
            'avg_true_negative': total_true_negative / self.folds,
            'avg_false_positive': total_false_positive / self.folds,
            'avg_false_negative': total_false_negative / self.folds,
            'avg_recall': total_true_positive / (total_true_positive + total_false_negative),
            'f1_score': (2 * (total_true_positive / (total_true_positive + total_false_positive)) * (total_true_positive / (total_true_positive + total_false_negative))) / ((total_true_positive / (total_true_positive + total_false_positive)) + (total_true_positive / (total_true_positive + total_false_negative))),
        }
