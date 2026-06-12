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

class ANN(nn.Module):
    def __init__(self, hidden_layer_sizes: list, hidden_layer_functions: list):
        super().__init__()

        layers = [
            nn.Linear(3736, hidden_layer_sizes[0]),
        ]

        hidden_layer_sizes.append(1)
        for i in range(len(hidden_layer_functions)):
            layers.append(hidden_layer_functions[i])
            layers.append(nn.Linear(hidden_layer_sizes[i], hidden_layer_sizes[i+1]))
        layers.append(nn.Sigmoid())

        layers = [x for x in layers if x is not None]
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        return self.model(x)

class AnnModel(NNBaseAug):
    def __init__(self):
        super().__init__('ann')
    

    def gen_model(self):
        if self.trial is not None:
            hidden_layer_cnt = self.trial.suggest_int('layer_cnt', 1, 3)
            hidden_layer_sizes = [self.trial.suggest_int(f'layer_{i}_nodes', 1, 1000) for i in range(hidden_layer_cnt)]
            hidden_layer_functions = [self.activation_functions[self.trial.suggest_int(f'layer_{i}_function', 0, len(self.activation_functions) - 1)] for i in range(hidden_layer_cnt)]
            return ANN(hidden_layer_sizes, hidden_layer_functions)
        else:
            hidden_layer_cnt = self.study.best_params['layer_cnt']
            hidden_layer_sizes = [self.study.best_params[f'layer_{i}_nodes'] for i in range(hidden_layer_cnt)]
            hidden_layer_functions = [self.activation_functions[self.study.best_params[f'layer_{i}_function']] for i in range(hidden_layer_cnt)]
            return ANN(hidden_layer_sizes, hidden_layer_functions)

# Dataset

augmented = pd.read_csv('data/augmented.csv')
validation = pd.read_csv('data/validation.csv')

X_aug = augmented[augmented.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_aug = augmented['label'].astype('float').to_numpy(copy=True)
X_test = validation[validation.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_test = validation['label'].astype('float').to_numpy(copy=True)

# Model

model = AnnModel()

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
