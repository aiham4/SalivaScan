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

channel_sizes = [8, 16, 32, 64]
kernel_sizes = [3, 5, 7, 9, 11]
stride_sizes = [1, 2, 3]

class CNN(nn.Module):
    def __init__(self, conv_layer_sizes, hidden_layer_sizes, hidden_layer_functions):
        super(CNN, self).__init__()

        layers = []

        for i, (kernel_size, output_size, stride_size, padding_size) in enumerate(conv_layer_sizes):
            layers.append(nn.Conv1d(
                in_channels=1 if i == 0 else channel_sizes[conv_layer_sizes[i-1][1]],
                out_channels=channel_sizes[output_size],
                kernel_size=kernel_sizes[kernel_size],
                stride=stride_sizes[stride_size],
                padding=((kernel_sizes[kernel_size] - 1) // 2) * padding_size,
            ))
            layers.append(nn.ReLU6())
            layers.append(nn.MaxPool1d(2))

        with torch.no_grad():
            dummy = torch.zeros(1, 1, 3736)
            dummy = nn.Sequential(*layers)(dummy)
            flattened_size = dummy.view(1, -1).size(1)
        layers.append(nn.Flatten())
        layers.append(nn.Linear(flattened_size, hidden_layer_sizes[0]))

        for i in range(len(hidden_layer_sizes) - 1):
            layers.append(hidden_layer_functions[i])
            layers.append(nn.Linear(hidden_layer_sizes[i], hidden_layer_sizes[i+1]))
        layers.append(hidden_layer_functions[-1])
        layers.append(nn.Linear(hidden_layer_sizes[-1], 1))
        layers.append(nn.Sigmoid())

        layers = [x for x in layers if x is not None]
        self.model = nn.Sequential(*layers)

    def forward(self, x):
        x = x.unsqueeze(1)
        return self.model(x)

class CnnModel(NNBaseAug):
    def __init__(self):
        super().__init__('cnn')
    

    def gen_model(self):
        if self.trial is not None:
            conv_layer_sizes = []
            for i in range(self.trial.suggest_int('conv_layer_count', 1, 3)):
                conv_layer_sizes.append((self.trial.suggest_int(f'conv_layer_{i}_kernel', 0, len(kernel_sizes) - 1), self.trial.suggest_int(f'conv_layer_{i}_out', 0, len(channel_sizes) - 1), self.trial.suggest_int(f'conv_layer_{i}_stride', 0, len(stride_sizes) - 1), self.trial.suggest_int(f'conv_layer_{i}_padding', 0, 1)))
            hidden_layer_cnt = self.trial.suggest_int('hidden_layer_cnt', 1, 3)
            hidden_layer_sizes = [self.trial.suggest_int(f'layer_{i}_nodes', 1, 1000) for i in range(hidden_layer_cnt)]
            hidden_layer_functions = [self.activation_functions[self.trial.suggest_int(f'layer_{i}_function', 0, len(self.activation_functions) - 1)] for i in range(hidden_layer_cnt)]
            return CNN(conv_layer_sizes, hidden_layer_sizes, hidden_layer_functions)
        else:
            conv_layer_sizes = []
            for i in range(self.study.best_params['conv_layer_count']):
                conv_layer_sizes.append((self.study.best_params[f'conv_layer_{i}_kernel'], self.study.best_params[f'conv_layer_{i}_out'], self.study.best_params[f'conv_layer_{i}_stride'], self.study.best_params[f'conv_layer_{i}_padding']))
            hidden_layer_cnt = self.study.best_params['hidden_layer_cnt']
            hidden_layer_sizes = [self.study.best_params[f'layer_{i}_nodes'] for i in range(hidden_layer_cnt)]
            hidden_layer_functions = [self.activation_functions[self.study.best_params[f'layer_{i}_function']] for i in range(hidden_layer_cnt)]
            return CNN(conv_layer_sizes, hidden_layer_sizes, hidden_layer_functions)

# Dataset

augmented = pd.read_csv('data/augmented.csv')
validation = pd.read_csv('data/validation.csv')

X_aug = augmented[augmented.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_aug = augmented['label'].astype('float').to_numpy(copy=True)
X_test = validation[validation.columns.drop(['label'])].astype('float').to_numpy(copy=True)
y_test = validation['label'].astype('float').to_numpy(copy=True)

# Model

model = CnnModel()

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
