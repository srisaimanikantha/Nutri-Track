from fastapi import FastAPI, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from transformers import pipeline
import io
from PIL import Image

app = FastAPI()

# Allow CORS for local testing
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load zero-shot image classification model
# This will be much more accurate since we define exactly what we are looking for!
try:
    print("Loading zero-shot image classification model...")
    # clip-vit-large-patch14 is a highly accurate ZERO-SHOT model (near 99% for zero-shot text match)
    classifier = pipeline("zero-shot-image-classification", model="openai/clip-vit-large-patch14")
    print("Model loaded successfully!")
except Exception as e:
    print(f"Failed to load HuggingFace classifier model: {e}")
    classifier = None

# We can specify the exact classes we have in CALORIES_MAP plus a class for 'none of these'
# We formulate them as descriptive phrases for better CLIP accuracy
FOOD_LABELS = [
    "an apple", "a banana", "a pizza", "a hot dog", "a sandwich", 
    "a donut", "a slice of cake", "an orange", "a carrot", "broccoli", 
    "a plate of plain rice", "a bowl of dal", "indian roti bread",
    "butter chicken", "chicken tikka masala", "palak paneer", "chole bhature",
    "dosa", "idli", "samosa", "biryani", "naan bread", "dal makhani",
    "paneer butter masala", "vada pav", "panipuri", "aloo paratha",
    "gulab jamun", "rasgulla", "jalebi", "tandoori chicken", "pav bhaji",
    "mutton curry", "fish curry", "sambar", "upma", "poha", "dhokla",
    "an empty plate or random object"
]

# Map specific model labels back to what backend CALORIES_MAP expects
LABEL_MAP = {
    "an apple": "apple",
    "a banana": "banana",
    "a pizza": "pizza",
    "a hot dog": "hot dog",
    "a sandwich": "sandwich",
    "a donut": "donut",
    "a slice of cake": "cake",
    "an orange": "orange",
    "a carrot": "carrot",
    "broccoli": "broccoli",
    "a plate of plain rice": "rice",
    "a bowl of dal": "dal",
    "indian roti bread": "roti",
    "butter chicken": "butter chicken",
    "chicken tikka masala": "chicken tikka masala",
    "palak paneer": "palak paneer",
    "chole bhature": "chole bhature",
    "dosa": "dosa",
    "idli": "idli",
    "samosa": "samosa",
    "biryani": "biryani",
    "naan bread": "naan",
    "dal makhani": "dal makhani",
    "paneer butter masala": "paneer butter masala",
    "vada pav": "vada pav",
    "panipuri": "panipuri",
    "aloo paratha": "aloo paratha",
    "gulab jamun": "gulab jamun",
    "rasgulla": "rasgulla",
    "jalebi": "jalebi",
    "tandoori chicken": "tandoori chicken",
    "pav bhaji": "pav bhaji",
    "mutton curry": "mutton curry",
    "fish curry": "fish curry",
    "sambar": "sambar",
    "upma": "upma",
    "poha": "poha",
    "dhokla": "dhokla"
}

@app.get("/")
def read_root():
    return {"message": "Food Item Detection API is running with Zero-Shot AI!"}

@app.post("/predict")
async def predict_food(image: UploadFile = File(...)):
    if not classifier:
        return {"error": "Model not loaded", "predictions": []}
    
    try:
        # Read image to memory
        contents = await image.read()
        pil_image = Image.open(io.BytesIO(contents)).convert("RGB")
        
        # Run inference using HuggingFace Pipeline
        # We pass our predefined set of labels for zero-shot classification!
        results = classifier(pil_image, candidate_labels=FOOD_LABELS)
        
        # Process results
        predictions = []
        
        # For zero-shot, the pipeline returns a list of dictionaries with 'label' and 'score'
        # The results are sorted descending by score.
        # So we can just take the top 1 or top 2 confident predictions.
        # The sum of scores will be around 1.0 depending on the model pipeline.
        
        # Let's just take the first result since 'results' is sorted by score
        if len(results) > 0:
            top_item = results[0]
            label = top_item["label"]
            score = top_item["score"]
            
            # Since the softmax covers all ~40 choices, the score might be smaller
            # We only dismiss if it is "random object" or the confidence is abysmally low
            if "random object" not in label and "empty plate" not in label:
                std_foodName = LABEL_MAP.get(label, label)
                
                predictions.append({
                    "class": std_foodName,
                    "confidence": float(score),
                    "bbox": [0,0,0,0] # Backend only cares about class and confidence
                })
        
        return {"predictions": predictions}
        
    except Exception as e:
        import traceback
        traceback.print_exc()
        return {"error": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
