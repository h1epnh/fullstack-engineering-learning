import pytesseract
import cv2
import numpy as np
import re
from PIL import Image

# Load the image
image_path = "./images/43.png"
image = cv2.imread(image_path, cv2.IMREAD_COLOR)

# Convert to grayscale
gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)

# Apply contrast enhancement using CLAHE (helps with uneven lighting)
clahe = cv2.createCLAHE(clipLimit=3.0, tileGridSize=(8, 8))
gray = clahe.apply(gray)

# Apply Gaussian Blur to reduce noise (preserving details)
gray = cv2.GaussianBlur(gray, (3, 3), 0)

# Adaptive thresholding for better binarization
thresh = cv2.adaptiveThreshold(
    gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 31, 10
)

# Morphological operations to remove small noise and connect broken letters
kernel = np.ones((2, 2), np.uint8)
thresh = cv2.morphologyEx(thresh, cv2.MORPH_CLOSE, kernel, iterations=1)
thresh = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel, iterations=1)

# Invert the image for better OCR (Tesseract prefers dark text on white background)
thresh = cv2.bitwise_not(thresh)

# Perform OCR using the Vietnamese language model
custom_config = "--psm 6 --oem 3 -l vie"
extracted_text = pytesseract.image_to_string(thresh, config=custom_config)

# Clean up extracted text
extracted_text = re.sub(r"\n+", "\n", extracted_text).strip()
extracted_text = re.sub(r"\s+", " ", extracted_text)  # Remove extra spaces

print(extracted_text)
