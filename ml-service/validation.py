import io
import base64
from PIL import Image
import numpy as np

# Configurations
SUPPORTED_CROPS = ["wheat", "cotton", "corn", "tomato"]
MIN_IMAGE_WIDTH = 50
MIN_IMAGE_HEIGHT = 50

# Load MobileNetV2 for generic object detection (Crop vs Non-Crop)
try:
    import tensorflow as tf
    from tensorflow.keras.applications.mobilenet_v2 import MobileNetV2, preprocess_input, decode_predictions
    # Load with pre-trained ImageNet weights
    object_model = MobileNetV2(weights='imagenet')
    print("[SUCCESS] MobileNetV2 loaded for Crop/Non-Crop validation.")
except Exception as e:
    print("[WARNING] Could not load TensorFlow or MobileNetV2. Error:", e)
    object_model = None

def decode_image(base64_string):
    try:
        data_part = base64_string.split(",")[1] if "," in base64_string else base64_string
        img_bytes = base64.b64decode(data_part)
        img = Image.open(io.BytesIO(img_bytes))
        return img
    except Exception as e:
        return None

def validate_image_quality(img):
    if img is None:
        return False, "Image could not be decoded."
        
    print(f"\n[ML DEBUG]")
    print(f"image_width = {img.width}")
    print(f"image_height = {img.height}")
    print(f"image_mode = {img.mode}")
    print(f"image_format = {img.format}")
    
    if img.width < MIN_IMAGE_WIDTH or img.height < MIN_IMAGE_HEIGHT:
        return False, f"Image is too small. Minimum resolution is {MIN_IMAGE_WIDTH}x{MIN_IMAGE_HEIGHT}."
        
    # Check if image is completely uniform (blank)
    try:
        img_array = np.array(img.convert('L'))
        if np.std(img_array) < 5.0:
            return False, "Image lacks detail (too blank or uniform)."
    except:
        pass
        
    return True, "Image quality is acceptable."

import cv2
import os

def detect_crop(img):
    try:
        # First try face detection using OpenCV (super fast, no TF needed)
        # Convert PIL to OpenCV format
        open_cv_image = np.array(img.convert('RGB')) 
        # Convert RGB to BGR 
        open_cv_image = open_cv_image[:, :, ::-1].copy()
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
        
        cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
        if os.path.exists(cascade_path):
            face_cascade = cv2.CascadeClassifier(cascade_path)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30))
            if len(faces) > 0:
                print(f"[ML] Object Validation: Detected {len(faces)} face(s). Rejecting image.")
                return False, "Invalid image. Human face detected."
    except Exception as e:
        print("[DEBUG] Face detection error:", e)

    # If no face is found, try MobileNetV2 for cars/buildings/dogs etc.
    if object_model is not None:
        try:
            # Resize for MobileNetV2
            img_resized = img.convert('RGB').resize((224, 224))
            img_array = np.array(img_resized)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            preds = object_model.predict(img_array, verbose=0)
            decoded = decode_predictions(preds, top=5)[0]
            
            # Blacklist of obvious non-crop items (strictly non-plants)
            blacklist_keywords = [
                "person", "face", "suit", "seat_belt", "sunglasses", "laptop", "monitor", "screen", 
                "cellphone", "keyboard", "mouse", "desk", "car", "sports_car", "cab", "truck", "wheel", 
                "bicycle", "motorcycle", "dog", "cat", "bird", "fish", "building", "house", "room", "street",
                "traffic_light", "parking_meter", "stopwatch", "digital_clock",
                "canoe", "boat", "ship", "paddle", "water", "lake"
            ]
            
            top_class = decoded[0][1].lower()
            top_conf = decoded[0][2]
            
            print(f"\n[ML DEBUG]")
            print(f"crop_validation_confidence = {top_conf:.4f}")
            print(f"crop_validation_result = {top_class}")
            print(f"detected_crop = (Not explicit, using generic object logic)")
            
            # If confidence is reasonably high and it's heavily blacklisted, reject
            if top_conf > 0.15:
                for bad_word in blacklist_keywords:
                    if bad_word in top_class:
                        return False, f"Invalid image. Detected: {top_class.replace('_', ' ')}."
                        
                # Check the other top 3 predictions to be safe
                for i in range(1, 3):
                    cls_name = decoded[i][1].lower()
                    cls_conf = decoded[i][2]
                    if cls_conf > 0.2:
                        for bad_word in blacklist_keywords:
                            if bad_word in cls_name:
                                return False, f"Invalid image. Detected: {cls_name.replace('_', ' ')}."
                                
            return True, "Crop detected."
        except Exception as e:
            print("[DEBUG] detect_crop MobileNet error:", e)
            return True, "Crop detection failed, allowing by default."
            
    # If MobileNet is missing and no face was detected, fall back to basic color heuristic
    try:
        # Convert to HSV to check for green/yellow/brown (typical plant colors)
        hsv_img = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2HSV)
        
        # Define range for plant colors (green, yellow, some brown)
        # Hue: 20-80 covers yellow to green. 
        # Saturation: 40-255 (ignore white/gray)
        # Value: 40-255 (ignore black)
        lower_plant = np.array([15, 30, 30])
        upper_plant = np.array([90, 255, 255])
        
        mask = cv2.inRange(hsv_img, lower_plant, upper_plant)
        plant_ratio = cv2.countNonZero(mask) / (hsv_img.shape[0] * hsv_img.shape[1])
        
        print(f"[ML] Object Validation: Plant color ratio: {plant_ratio:.2f}")
        
        if plant_ratio < 0.05:
            return False, "Invalid image. No significant plant material detected."
            
    except Exception as e:
        print("[DEBUG] Color heuristic error:", e)

    return True, "Crop detection skipped (Model unavailable, allowed by heuristic)."

def validate_supported_crop(crop_type):
    if not crop_type:
        return False
    if crop_type.lower() not in SUPPORTED_CROPS:
        return False
    return True
