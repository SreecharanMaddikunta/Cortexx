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
        # Convert PIL to OpenCV format
        open_cv_image = np.array(img.convert('RGB')) 
        # Convert RGB to BGR 
        open_cv_image = open_cv_image[:, :, ::-1].copy()
        gray = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2GRAY)
        
        # 1. Face Detection (Reject images with humans/faces)
        cascade_path = os.path.join(os.path.dirname(__file__), 'haarcascade_frontalface_default.xml')
        if os.path.exists(cascade_path):
            face_cascade = cv2.CascadeClassifier(cascade_path)
            faces = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=4, minSize=(40, 40))
            if len(faces) > 0:
                print(f"[ML] Object Validation: Detected {len(faces)} face(s). Rejecting image.")
                return False, "Invalid image. Human face detected."
                
        # 2. Edge / Texture Density (Plants have high texture, laptops/walls/sky have low texture)
        edges = cv2.Canny(gray, 50, 150)
        edge_ratio = np.sum(edges > 0) / (gray.shape[0] * gray.shape[1])
        print(f"[ML] Object Validation: Edge density: {edge_ratio:.4f}")
        if edge_ratio < 0.015:
            return False, "Invalid image. Lacks texture (too smooth, likely a wall, screen, or sky)."
            
    except Exception as e:
        print("[DEBUG] Face/Edge detection error:", e)

    # 3. MobileNetV2 (if available) for object detection
    if object_model is not None:
        try:
            # Resize for MobileNetV2
            img_resized = img.convert('RGB').resize((224, 224))
            img_array = np.array(img_resized)
            img_array = np.expand_dims(img_array, axis=0)
            img_array = preprocess_input(img_array)
            
            preds = object_model.predict(img_array, verbose=0)
            decoded = decode_predictions(preds, top=5)[0]
            
            top_class = decoded[0][1].lower()
            top_conf = decoded[0][2]
            
            print(f"\n[ML DEBUG]")
            print(f"crop_validation_confidence = {top_conf:.4f}")
            print(f"crop_validation_result = {top_class}")
            
            # Expanded blacklist of obvious non-crop items
            generic_blacklist = [
                "laptop", "notebook", "desktop_computer", "monitor", "screen", "television", "cellular_telephone", 
                "keyboard", "mouse", "desk", "car", "sports_car", "cab", "truck", "wheel", "bicycle", "motorcycle", 
                "dog", "cat", "bird", "fish", "building", "house", "room", "street", "traffic_light", "parking_meter", 
                "stopwatch", "digital_clock", "canoe", "boat", "ship", "paddle", "water", "lake", "person", "face", 
                "suit", "seat_belt", "sunglasses", "envelope", "paper_towel", "toilet_tissue", "wall", "window_shade",
                "book_jacket", "web_site", "menu", "comic_book", "crossword_puzzle", "street_sign",
                "wardrobe", "cabinet", "refrigerator", "microwave", "oven", "toaster", "washer", "dishwasher",
                "pillow", "bed", "couch", "chair", "sofa", "dining_table", "cup", "coffee_mug", "plate", "bowl",
                "fork", "spoon", "knife", "bottle", "wine_bottle", "beer_bottle", "water_bottle", "shoe", "boot",
                "sandal", "sneaker", "sock", "shirt", "jersey", "t-shirt", "tie", "hat", "cap", "helmet",
                "glasses", "watch", "ring", "necklace", "earring", "bracelet", "bag", "backpack",
                "handbag", "suitcase", "purse", "wallet", "umbrella", "pen", "pencil", "ruler", "eraser", "marker",
                "book", "magazine", "newspaper", "printer", "scanner", "camera", "lens", "tripod",
                "speaker", "microphone", "headphones", "earphones", "guitar", "piano", "drum", "violin",
                "teddy", "toy", "ball", "racket"
            ]
            
            # Whitelist of plant-like or natural things in ImageNet
            plant_whitelist = [
                "daisy", "yellow_lady's_slipper", "corn", "acorn", "hip", "buckeye", "coral_fungus", "agaric", 
                "gyromitra", "stinkhorn", "earthstar", "hen-of-the-woods", "bolete", "ear", "head_cabbage", 
                "broccoli", "cauliflower", "zucchini", "spaghetti_squash", "acorn_squash", "butternut_squash", 
                "cucumber", "artichoke", "bell_pepper", "cardoon", "mushroom", "granny_smith", "strawberry", 
                "orange", "lemon", "fig", "pineapple", "banana", "jackfruit", "custard_apple", "pomegranate", 
                "hay", "greenhouse", "pot", "vase", "flower_pot", "leaf", "plant", "tree", "grass",
                "snail", "slug", "nematode", "earthworm", "ladybug", "fly", "bee", "ant", "grasshopper",
                "cricket", "walking_stick", "cockroach", "mantis", "cicada", "leafhopper", "lacewing",
                "dragonfly", "damselfly", "admiral", "ringlet", "monarch", "cabbage_butterfly", "sulphur_butterfly",
                "lycaenid", "green_lizard", "chameleon", "green_snake", "vine_snake", "night_snake", "king_snake", 
                "garter_snake", "water_snake", "ground_beetle", "long-horned_beetle", "leaf_beetle", "dung_beetle", 
                "rhinoceros_beetle", "weevil", "spider", "tick", "centipede", "isopod"
            ]
            
            is_plant_like = False
            for i in range(3):
                cls_name = decoded[i][1].lower()
                for white_word in plant_whitelist:
                    if white_word in cls_name:
                        is_plant_like = True
                        break
                if is_plant_like:
                    break
                    
            is_blacklisted = False
            blacklisted_class = ""
            for i in range(2): # Check top 2 for blacklist
                cls_name = decoded[i][1].lower()
                for bad_word in generic_blacklist:
                    if bad_word in cls_name:
                        is_blacklisted = True
                        blacklisted_class = cls_name
                        break
                if is_blacklisted:
                    break

            if is_blacklisted and not is_plant_like:
                return False, f"Invalid image. Detected: {blacklisted_class.replace('_', ' ')}."
                
            if top_conf > 0.35 and not is_plant_like:
                return False, f"Invalid image. Looks like a {top_class.replace('_', ' ')}, not a crop."

        except Exception as e:
            print("[DEBUG] detect_crop MobileNet error:", e)

    # 4. Color Heuristic (Strict fallback check)
    try:
        hsv_img = cv2.cvtColor(open_cv_image, cv2.COLOR_BGR2HSV)
        
        # Plant colors (Green)
        lower_green = np.array([25, 40, 40])
        upper_green = np.array([90, 255, 255])
        mask_green = cv2.inRange(hsv_img, lower_green, upper_green)
        
        # Plant colors (Yellow/Brown for diseased/dry leaves)
        lower_yellow = np.array([10, 50, 40])
        upper_yellow = np.array([25, 255, 255])
        mask_yellow = cv2.inRange(hsv_img, lower_yellow, upper_yellow)
        
        mask = cv2.bitwise_or(mask_green, mask_yellow)
        plant_ratio = cv2.countNonZero(mask) / (hsv_img.shape[0] * hsv_img.shape[1])
        print(f"[ML] Object Validation: Plant color ratio: {plant_ratio:.2f}")
        
        # Skin colors (To reject hands/faces that might pass face detection)
        lower_skin = np.array([0, 30, 50])
        upper_skin = np.array([20, 150, 255])
        mask_skin = cv2.inRange(hsv_img, lower_skin, upper_skin)
        skin_ratio = cv2.countNonZero(mask_skin) / (hsv_img.shape[0] * hsv_img.shape[1])
        print(f"[ML] Object Validation: Skin color ratio: {skin_ratio:.2f}")
        
        if skin_ratio > 0.4:
            return False, "Invalid image. Detected large amount of skin-like colors."
            
        if plant_ratio < 0.10:
            return False, "Invalid image. No significant crop or plant material detected."
            
    except Exception as e:
        print("[DEBUG] Color heuristic error:", e)

    return True, "Crop detected."

def validate_supported_crop(crop_type):
    if not crop_type:
        return False
    if crop_type.lower() not in SUPPORTED_CROPS:
        return False
    return True
