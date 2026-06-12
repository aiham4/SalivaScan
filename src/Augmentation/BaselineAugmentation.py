import numpy as np
import pandas as pd
from sklearn.model_selection import train_test_split


# files
CONTROL_FILE = "CONTROL DATASET (2).csv"
DIABETES_FILE = "TYPE 2 DIABETES DATASET.csv"

OUTPUT_COMBINED = "combined_real_labeled_spectra_BaselineDrift.csv"
OUTPUT_TRAIN = "TrainingAugmented-BaselineDrift.csv"
OUTPUT_TEST = "Validation-BaselineDrift.csv"


# settings
TEST_SIZE = 0.20
RANDOM_STATE = 42
TARGET_PER_CLASS = 1600

# baseline settings
# These values are intentionally small so the augmented spectra remain realistic.
# OFFSET_SCALE controls vertical baseline movement.
# SLOPE_SCALE controls linear baseline tilt across the wavenumber range.
OFFSET_SCALE = 0.01
SLOPE_SCALE = 0.01


# load data
control_df = pd.read_csv(CONTROL_FILE)
diabetes_df = pd.read_csv(DIABETES_FILE)

control_df["label"] = 0
diabetes_df["label"] = 1


# find spectrum columns
def is_number_column(col):
    try:
        float(col)
        return True
    except ValueError:
        return False


control_cols = [col for col in control_df.columns if is_number_column(col)]
diabetes_cols = [col for col in diabetes_df.columns if is_number_column(col)]

spectral_cols = sorted(
    list(set(control_cols).intersection(set(diabetes_cols))),
    key=lambda x: float(x)
)

if len(spectral_cols) == 0:
    raise ValueError("No spectral columns found. Check the CSV files.")

print(f"Using {len(spectral_cols)} spectral columns.")


# combine both groups
control_clean = control_df[spectral_cols + ["label"]].copy()
diabetes_clean = diabetes_df[spectral_cols + ["label"]].copy()

combined = pd.concat([control_clean, diabetes_clean], ignore_index=True)
combined.to_csv(OUTPUT_COMBINED, index=False)

X = combined[spectral_cols].values.astype(float)
y = combined["label"].values.astype(int)
wavenumbers = np.array([float(col) for col in spectral_cols])

print("\nOriginal data:")
print(f"Total spectra: {len(X)}")
print(f"Control: {(y == 0).sum()}")
print(f"Diabetes: {(y == 1).sum()}")


# split before augmentation
# This keeps the validation/test set real and untouched, same as the EMSA workflow.
X_train, X_test, y_train, y_test = train_test_split(
    X,
    y,
    test_size=TEST_SIZE,
    random_state=RANDOM_STATE,
    stratify=y
)

print("\nSplit:")
print(f"Train: {len(X_train)}")
print(f"Test: {len(X_test)}")


# prepare normalized wavenumber axis for baseline generation
# It ranges from -1 to 1 so the slope parameter has a simple meaning.
wn = (wavenumbers - wavenumbers.mean()) / (wavenumbers.max() - wavenumbers.min())
wn = 2 * wn


# make extra spectra for one class
def make_augmented_class(
    X_class,
    class_label,
    n_needed,
    rng,
    normalized_wavenumbers,
    offset_scale,
    slope_scale
):
    if n_needed <= 0:
        return np.empty((0, X_class.shape[1])), np.empty((0,), dtype=int)

    # Sample real spectra with replacement, then add a small artificial baseline.
    # The baseline has a random offset and a random linear slope.
    base_indices = rng.integers(0, len(X_class), size=n_needed)
    X_base = X_class[base_indices].copy()

    spectral_range = np.mean(np.ptp(X_class, axis=1))

    offsets = rng.normal(
        loc=0.0,
        scale=offset_scale * spectral_range,
        size=(n_needed, 1)
    )

    slopes = rng.normal(
        loc=0.0,
        scale=slope_scale * spectral_range,
        size=(n_needed, 1)
    )

    baseline = offsets + slopes * normalized_wavenumbers.reshape(1, -1)

    X_aug = X_base + baseline
    y_aug = np.full(n_needed, class_label, dtype=int)

    return X_aug, y_aug


# balance both classes
rng = np.random.default_rng(RANDOM_STATE)

X_parts = []
y_parts = []

for class_label in [0, 1]:
    X_class = X_train[y_train == class_label]
    y_class = y_train[y_train == class_label]

    n_real = len(X_class)
    n_needed = TARGET_PER_CLASS - n_real

    print(f"\nClass {class_label}")
    print(f"Real training spectra: {n_real}")
    print(f"Extra spectra made: {max(n_needed, 0)}")

    X_aug, y_aug = make_augmented_class(
        X_class=X_class,
        class_label=class_label,
        n_needed=n_needed,
        rng=rng,
        normalized_wavenumbers=wn,
        offset_scale=OFFSET_SCALE,
        slope_scale=SLOPE_SCALE
    )

    X_parts.append(X_class)
    y_parts.append(y_class)

    if len(X_aug) > 0:
        X_parts.append(X_aug)
        y_parts.append(y_aug)


X_train_final = np.vstack(X_parts)
y_train_final = np.concatenate(y_parts)


# shuffle final training file
idx = rng.permutation(len(X_train_final))

X_train_final = X_train_final[idx]
y_train_final = y_train_final[idx]


# save files
train_df = pd.DataFrame(X_train_final, columns=spectral_cols)
train_df["label"] = y_train_final

test_df = pd.DataFrame(X_test, columns=spectral_cols)
test_df["label"] = y_test

train_df.to_csv(OUTPUT_TRAIN, index=False)
test_df.to_csv(OUTPUT_TEST, index=False)

print("\nDone.")
print(f"Saved: {OUTPUT_COMBINED}")
print(f"Saved: {OUTPUT_TRAIN}")
print(f"Saved: {OUTPUT_TEST}")

print("\nTraining set:")
print(train_df["label"].value_counts().sort_index())

print("\nTest set:")
print(test_df["label"].value_counts().sort_index())
