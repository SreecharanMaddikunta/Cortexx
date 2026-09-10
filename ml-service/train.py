import os
import tensorflow as tf
from tensorflow.keras.applications import MobileNetV2
from tensorflow.keras.layers import Dense, GlobalAveragePooling2D, Dropout
from tensorflow.keras.models import Model
from tensorflow.keras.preprocessing.image import ImageDataGenerator

# ==============================================================================
# 🚀 KISAN MITRA AI: CROP DISEASE CNN TRAINING PIPELINE
# ==============================================================================
# This script trains a MobileNetV2 Transfer Learning model on leaf images.
# For a hackathon, run this script inside Google Colab (with a GPU) or locally.
# It expects a folder structure like:
# dataset/
# ├── Tomato_Early_Blight/
# ├── Tomato_Healthy/
# ├── Corn_Northern_Leaf_Blight/
# └── Corn_Healthy/
# ==============================================================================

# Hyperparameters
IMG_SIZE = (224, 224)
BATCH_SIZE = 32
EPOCHS = 10
DATASET_DIR = "dataset/"
MODEL_SAVE_PATH = "plant_disease_model.h5"

def build_model(num_classes):
    print("[INFO] Loading MobileNetV2 base model...")
    # Load pre-trained MobileNetV2 without the top classification layer
    base_model = MobileNetV2(weights='imagenet', include_top=False, input_shape=(224, 224, 3))
    
    # Freeze the base model to prevent destroying pre-trained weights
    base_model.trainable = False
    
    # Add our custom classification head for Crop Diseases
    x = base_model.output
    x = GlobalAveragePooling2D()(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(0.5)(x)
    predictions = Dense(num_classes, activation='softmax')(x)
    
    model = Model(inputs=base_model.input, outputs=predictions)
    
    model.compile(
        optimizer=tf.keras.optimizers.Adam(learning_rate=0.001),
        loss='categorical_crossentropy',
        metrics=['accuracy']
    )
    return model

def train():
    if not os.path.exists(DATASET_DIR):
        print(f"[ERROR] Dataset directory '{DATASET_DIR}' not found!")
        print("Please download the PlantVillage dataset from Kaggle and extract it to 'dataset/'")
        print("Kaggle Link: https://www.kaggle.com/datasets/emmarex/plantdisease")
        return

    print("[INFO] Preparing Data Augmentation Pipeline...")
    # We use augmentation to simulate farmers taking bad/rotated photos
    datagen = ImageDataGenerator(
        rescale=1./255,
        rotation_range=20,
        width_shift_range=0.2,
        height_shift_range=0.2,
        horizontal_flip=True,
        validation_split=0.2 # 80% Train, 20% Val
    )

    train_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='training'
    )

    val_generator = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode='categorical',
        subset='validation'
    )

    num_classes = len(train_generator.class_indices)
    print(f"[INFO] Found {num_classes} crop disease classes: {train_generator.class_indices}")

    model = build_model(num_classes)

    print("[INFO] Beginning Model Training (Transfer Learning)...")
    history = model.fit(
        train_generator,
        validation_data=val_generator,
        epochs=EPOCHS
    )

    print(f"[INFO] Saving trained model to {MODEL_SAVE_PATH}...")
    model.save(MODEL_SAVE_PATH)
    
    # Save class indices for inference mapping
    import json
    with open('class_indices.json', 'w') as f:
        json.dump(train_generator.class_indices, f)
        
    print("[SUCCESS] Training complete. You can now run the FastAPI ml-service!")

if __name__ == "__main__":
    train()
