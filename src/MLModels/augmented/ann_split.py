from NNBaseAug import NNBaseAug
import os
import sys
import copy
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset
import optuna
from sklearn.model_selection import train_test_split
from sklearn.utils import shuffle
from sklearn.cross_decomposition import PLSRegression
import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
from sklearn.model_selection import StratifiedKFold
from skl2onnx import to_onnx
from skl2onnx import convert_sklearn
from skl2onnx.common.data_types import FloatTensorType
from skl2onnx.algebra.onnx_ops import OnnxSub, OnnxMatMul, OnnxDiv
import onnx
from onnx import compose, version_converter
import argparse

class SplitANN(nn.Module):
    def __init__(self, split_index, region1_layers, region1_functions, region2_layers, region2_functions, input_function, hidden_layer_sizes, hidden_layer_functions):
        super(SplitANN, self).__init__()
        self.split_index = split_index

        region1 = []
        region1.append(nn.Linear(split_index, region1_layers[0]))
        for i in range(len(region1_layers) - 1):
            region1.append(region1_functions[i])
            region1.append(nn.Linear(region1_layers[i], region1_layers[i+1]))

        region2 = []
        region2.append(nn.Linear(3736 - split_index, region2_layers[0]))
        for i in range(len(region2_layers) - 1):
            region2.append(region2_functions[i])
            region2.append(nn.Linear(region2_layers[i], region2_layers[i+1]))

        connected = [input_function]
        connected.append(nn.Linear(region1_layers[-1] + region2_layers[-1], hidden_layer_sizes[0]))
        for i in range(len(hidden_layer_sizes) - 1):
            connected.append(hidden_layer_functions[i])
            connected.append(nn.Linear(hidden_layer_sizes[i], hidden_layer_sizes[i+1]))
        connected.append(hidden_layer_functions[2])
        connected.append(nn.Linear(hidden_layer_sizes[-1], 1))
        connected.append(nn.Sigmoid())

        self.ann1 = nn.Sequential(*[x for x in region1 if x is not None])
        self.ann2 = nn.Sequential(*[x for x in region2 if x is not None])
        self.ann = nn.Sequential(*[x for x in connected if x is not None])

    def forward(self, x):
        x_fp = x[:, :self.split_index]
        x_fg = x[:, self.split_index:]

        h_fp = self.ann1(x_fp)
        h_fg = self.ann2(x_fg)
        h = torch.cat([h_fp, h_fg], dim=1)

        return self.ann(h)

class AnnSplitModel(NNBaseAug):
    def __init__(self):
        super().__init__('ann_split')
    

    def gen_model(self):
        if self.trial is not None:
            split_index = self.trial.suggest_int(f'split_index', 50, 3000)

            region1_size = self.trial.suggest_int(f'region_1_layers', 1, 3)
            region1_layers = [self.trial.suggest_int(f'region1_{i}_nodes', 1, 500) for i in range(region1_size)]
            region1_functions = [self.activation_functions[self.trial.suggest_int(f'region1_{i}_function', 0, len(self.activation_functions) - 1)] for i in range(region1_size - 1)]

            region2_size = self.trial.suggest_int(f'region_2_layers', 1, 3)
            region2_layers = [self.trial.suggest_int(f'region2_{i}_nodes', 1, 500) for i in range(region2_size)]
            region2_functions = [self.activation_functions[self.trial.suggest_int(f'region2_{i}_function', 0, len(self.activation_functions) - 1)] for i in range(region2_size - 1)]

            input_function = self.activation_functions[self.trial.suggest_int('input_function', 0, len(self.activation_functions) - 1)]

            hidden_layer_sizes = [self.trial.suggest_int(f'layer_{i}_nodes', 1, 1000) for i in range(3)]
            hidden_layer_functions = [self.activation_functions[self.trial.suggest_int(f'layer_{i}_function', 0, len(self.activation_functions) - 1)] for i in range(3)]
            
            return SplitANN(split_index, region1_layers, region1_functions, region2_layers, region2_functions, input_function, hidden_layer_sizes, hidden_layer_functions)
        else:
            split_index = self.study.best_params[f'split_index']

            region1_size = self.study.best_params[f'region_1_layers']
            region1_layers = [self.study.best_params[f'region1_{i}_nodes'] for i in range(region1_size)]
            region1_functions = [self.activation_functions[self.study.best_params[f'region1_{i}_function']] for i in range(region1_size - 1)]

            region2_size = self.study.best_params[f'region_2_layers']
            region2_layers = [self.study.best_params[f'region2_{i}_nodes'] for i in range(region2_size)]
            region2_functions = [self.activation_functions[self.study.best_params[f'region2_{i}_function']] for i in range(region2_size - 1)]

            input_function = self.activation_functions[self.study.best_params['input_function']]

            hidden_layer_sizes = [self.study.best_params[f'layer_{i}_nodes'] for i in range(3)]
            hidden_layer_functions = [self.activation_functions[self.study.best_params[f'layer_{i}_function']] for i in range(3)]
            
            return SplitANN(split_index, region1_layers, region1_functions, region2_layers, region2_functions, input_function, hidden_layer_sizes, hidden_layer_functions)

    def export(self, X_aug, y_aug, X_test, y_test):
        skf = StratifiedKFold(
            n_splits=self.folds,
            shuffle=True,
            random_state=42
        )

        best_model = None
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

        best_model.cpu()
        torch.onnx.export(
            best_model,
            (torch.ones([1, 3736])),
            f"{self.name}.onnx",
            export_params=True,
            opset_version=14,
            input_names=['input'],
            output_names=['type2_confidence'],
            external_data=False,
        )

# Dataset

augmented = pd.read_csv('data/augmented.csv')
validation = pd.read_csv('data/validation.csv')

X_aug = augmented[augmented.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_aug = augmented['label'].astype('float').to_numpy(copy=True)
X_test = validation[validation.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_test = validation['label'].astype('float').to_numpy(copy=True)

# Model

model = AnnSplitModel()

# Args

parser = argparse.ArgumentParser()
parser.add_argument('-e', '--export', required=False, action='store_true')
parser.add_argument('-i', '--info', required=False, action='store_true')
parser.add_argument('-n', required=False, default=100, type=int)
args = vars(parser.parse_args())

if args['export'] == True:
    model.export(X_aug, y_aug, X_test, y_test)
    exit(0)

if args['info'] == True:
    with open(f"{model.name}.txt", "w") as f:
        f.write(f'Cross MSE: {model.study.best_value}\n')
        f.write(f'Best params: {model.study.best_params}\n\n')
        f.write(str(model.confusion_matrix(model.gen_model().to(model.device), X_aug, y_aug, X_test, y_test)))
    exit(0)

model.optimize(X_aug, y_aug, X_test, y_test, args['n'] if args['n'] >= 0 else None)

print(model.study.best_params)
print(model.study.best_value)
print(model.confusion_matrix(model.gen_model().to(model.device), X_aug, y_aug, X_test, y_test))
model.export(X_aug, y_aug, X_test, y_test)
