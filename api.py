"""
Email Spam Detection API
Backend service for classifying emails as spam or legitimate
"""

import pickle
import os
import string
import nltk
from nltk.stem.porter import PorterStemmer
from nltk.corpus import stopwords
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List
import numpy as np
from fastapi.middleware.cors import CORSMiddleware

# Setup NLTK resources
try:
    nltk.data.find('corpora/stopwords')
except LookupError:
    nltk.download('stopwords', quiet=True)

# Initialize text processor
text_processor = PorterStemmer()

def process_email_content(email_text: str) -> str:
    """
    Preprocess email text for classification
    Converts text to lowercase, removes punctuation and numbers,
    stems words, and filters stopwords
    """
    processed = email_text.lower()
    processed = processed.translate(str.maketrans('', '', string.punctuation))
    word_list = processed.split()
    word_list = [w for w in word_list if not w.isdigit()]
    word_list = [text_processor.stem(w) for w in word_list 
                 if w not in stopwords.words('english')]
    return ' '.join(word_list)

# Load ML model and vectorizer
CLASSIFIER_FILE = "./spam_classifier.pkl"
VECTORIZER_FILE = "./tfidf_vectorizer.pkl"

if not os.path.exists(CLASSIFIER_FILE):
    raise FileNotFoundError(f"Classifier model not found: {CLASSIFIER_FILE}")

with open(CLASSIFIER_FILE, "rb") as model_file:
    email_classifier = pickle.load(model_file)
    if not hasattr(email_classifier, "predict"):
        raise ValueError("Model doesn't support prediction")
    if not hasattr(email_classifier, "predict_proba"):
        raise ValueError("Model doesn't support probability prediction")
    
if not os.path.exists(VECTORIZER_FILE):
    raise FileNotFoundError(f"Vectorizer not found: {VECTORIZER_FILE}")

with open(VECTORIZER_FILE, "rb") as vec_file:
    text_vectorizer = pickle.load(vec_file)
    if not hasattr(text_vectorizer, "transform"):
        raise ValueError("Vectorizer doesn't support transformation")

# Initialize FastAPI app
api = FastAPI(title="Email Spam Classifier API", version="1.0")

# Configure CORS for frontend access
allowed_origins = ["http://localhost:5500", "http://127.0.0.1:5500"]
api.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request/Response models
class EmailInput(BaseModel):
    text: str

class ClassificationResult(BaseModel):
    category: str
    confidence: float

class ApiResponse(BaseModel):
    status: str
    results: List[ClassificationResult]

@api.get("/")
def api_info():
    """API information endpoint"""
    return {"service": "Email Spam Classifier", "status": "active"}

@api.post("/predict", response_model=ApiResponse)
def classify_email(email_input: EmailInput):
    """
    Classify email content as spam or legitimate
    Returns classification category and confidence score
    """
    if not isinstance(email_input, EmailInput):
        raise HTTPException(status_code=400, 
                          detail="Invalid request format")
    
    email_text = email_input.text
    if not isinstance(email_text, str) or not email_text.strip():
        raise HTTPException(status_code=400, 
                          detail="Email text is required")
    
    # Preprocess and vectorize email text
    processed_text = process_email_content(email_text)
    text_features = text_vectorizer.transform([processed_text])
    
    # Get prediction and confidence
    prediction_result = email_classifier.predict(text_features)
    confidence_scores = email_classifier.predict_proba(text_features)
    
    # Determine category (1 = spam, 0 = legitimate)
    is_spam = prediction_result[0] == 1
    category = "spam" if is_spam else "ham"
    confidence = float(np.max(confidence_scores[0]))
    
    return ApiResponse(
        status="success",
        results=[ClassificationResult(category=category, confidence=confidence)]
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(api, host="localhost", port=8000)
