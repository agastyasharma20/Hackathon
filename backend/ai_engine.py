import re
import numpy as np
from typing import List, Dict, Any, Tuple, Optional

# Let's set up variables for the hybrid vector matching with a fallback
VECTOR_ENGINE_READY = False
model = None
faiss_index = None
complaint_ids_mapping = []
dimension = 384 # Dimension of MiniLM-L6-v2

def load_vector_engine() -> bool:
    global model, faiss_index, VECTOR_ENGINE_READY, complaint_ids_mapping
    if VECTOR_ENGINE_READY:
        return True
    try:
        from sentence_transformers import SentenceTransformer
        import faiss
        print("[AI ENGINE] Initializing SentenceTransformer model ('all-MiniLM-L6-v2') lazily in the background...")
        model = SentenceTransformer("all-MiniLM-L6-v2")
        faiss_index = faiss.IndexFlatIP(dimension)
        complaint_ids_mapping = []
        VECTOR_ENGINE_READY = True
        print("[AI ENGINE] SentenceTransformer vector engine loaded successfully.")
        return True
    except Exception as e:
        print(f"[AI ENGINE] Warning: SentenceTransformers/FAISS lazy loading failed ({e}). Using scikit-learn TF-IDF fallback engine.")
        VECTOR_ENGINE_READY = False
        return False

# Standard fallback using scikit-learn (which is lightweight and has no model weight downloads)
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

fallback_vectorizer = TfidfVectorizer(stop_words='english', ngram_range=(1, 2))
fallback_tfidf_matrix = None
fallback_complaints_db = [] # List of dicts with 'id' and 'text'

# Categories & Departments Configuration
CATEGORIES_MAPPING = {
    "Roads": {
        "code": "ROADS",
        "name": "Road Maintenance Division",
        "keywords": ["road", "pothole", "street", "crack", "bridge", "highway", "pavement", "asphalt", "flyover", "tar"]
    },
    "Water": {
        "code": "WATER",
        "name": "Municipal Water Department",
        "keywords": ["water", "leak", "pipe", "sewage", "drain", "flooding", "drainage", "tap", "dirty", "leakage", "overflow"]
    },
    "Electricity": {
        "code": "POWER",
        "name": "Power Grid Board",
        "keywords": ["electricity", "power", "outage", "blackout", "spark", "transformer", "wire", "voltage", "current", "meter", "load"]
    },
    "Garbage": {
        "code": "GARBAGE",
        "name": "Waste Management Authority",
        "keywords": ["garbage", "trash", "waste", "litter", "dump", "cleanup", "smell", "bin", "dumpyard", "debris", "plastic"]
    },
    "Public Safety": {
        "code": "SAFETY",
        "name": "Public Safety Command",
        "keywords": ["safety", "crime", "police", "light", "theft", "harassment", "danger", "dark", "streetlights", "accident", "threat", "gang"]
    },
    "Corruption": {
        "code": "CORRUPTION",
        "name": "Anti-Corruption Vigilance Bureau",
        "keywords": ["corruption", "bribe", "bribery", "money", "fraud", "officer", "cheat", "vigilance", "demand", "clerk", "extortion"]
    }
}

# Realtime Triage Classifier
def analyze_complaint_text(text: str) -> Dict[str, Any]:
    text_lower = text.lower()
    
    # 1. Category Classification based on keyword weights
    scores = {cat: 0 for cat in CATEGORIES_MAPPING}
    for cat, val in CATEGORIES_MAPPING.items():
        for kw in val["keywords"]:
            # Give higher weight to exact word matches
            matches = len(re.findall(r'\b' + re.escape(kw) + r'\b', text_lower))
            scores[cat] += matches * 2.0
            # Give partial weight to substring matches
            if kw in text_lower and matches == 0:
                scores[cat] += 0.5
                
    best_cat = max(scores, key=scores.get)
    # Default to Roads if no keyword matches at all
    if scores[best_cat] == 0:
        if "water" in text_lower or "sewer" in text_lower:
            best_cat = "Water"
        elif "light" in text_lower or "pole" in text_lower:
            best_cat = "Public Safety"
        else:
            best_cat = "Roads"
            
    cat_details = CATEGORIES_MAPPING[best_cat]
    
    # 2. Sentiment Analysis
    negative_words = ["leakage", "damaged", "broken", "worst", "terrible", "corruption", "bribe", "danger", "unsafe", 
                      "dirty", "smell", "horrible", "delay", "poor", "inaction", "useless", "accident", "harm", "suffering", "fail"]
    positive_words = ["please", "request", "hope", "kindly", "thanks", "appreciate", "better", "improve", "support"]
    
    neg_count = sum(text_lower.count(w) for w in negative_words)
    pos_count = sum(text_lower.count(w) for w in positive_words)
    
    sentiment_score = 0.0
    if neg_count > 0 or pos_count > 0:
        sentiment_score = (pos_count - neg_count) / max(neg_count + pos_count, 1)
        sentiment_score = max(-1.0, min(1.0, sentiment_score))
    else:
        # Default mild negative for civic complaints
        sentiment_score = -0.2
        
    if sentiment_score < -0.6:
        sentiment_label = "Highly Negative"
    elif sentiment_score < -0.1:
        sentiment_label = "Negative"
    elif sentiment_score < 0.2:
        sentiment_label = "Neutral"
    else:
        sentiment_label = "Positive"
        
    # 3. Urgency Prediction
    critical_keywords = ["fire", "sparking", "bribery", "extortion", "threat", "gang", "flood", "flooding", "collapsed", "bleeding", "hazard", "danger", "high voltage", "accident"]
    high_keywords = ["severe", "leakage", "broken", "dark", "streetlights", "smell", "overflow", "roadblock", "blockage"]
    
    has_critical = any(kw in text_lower for kw in critical_keywords)
    has_high = any(kw in text_lower for kw in high_keywords)
    
    if has_critical or sentiment_score < -0.7:
        urgency = "Critical"
    elif has_high or sentiment_score < -0.4:
        urgency = "High"
    elif sentiment_score < -0.1:
        urgency = "Medium"
    else:
        urgency = "Low"
        
    # 4. Escalation Risk
    if urgency == "Critical":
        escalation_risk = "Critical"
    elif urgency == "High" and sentiment_score < -0.5:
        escalation_risk = "High"
    elif urgency == "High" or sentiment_score < -0.3:
        escalation_risk = "Medium"
    else:
        escalation_risk = "Low"
        
    # 5. Confidence Score
    # Score goes up if we have strong keyword matching in the target category
    base_confidence = 0.7
    match_score = scores[best_cat]
    if match_score > 4:
        confidence = min(0.98, base_confidence + 0.15)
    elif match_score > 0:
        confidence = min(0.92, base_confidence + 0.10)
    else:
        confidence = 0.65
        
    return {
        "category": best_cat,
        "sentiment": round(sentiment_score, 2),
        "sentiment_label": sentiment_label,
        "urgency": urgency,
        "department_code": cat_details["code"],
        "department_name": cat_details["name"],
        "escalation_risk": escalation_risk,
        "confidence_score": round(confidence, 2)
    }

# Seed FAISS / TF-IDF Index for Duplicates
def initialize_duplicate_detector(complaints: List[Dict[str, Any]]):
    global fallback_complaints_db, fallback_tfidf_matrix
    
    if not complaints:
        return
        
    fallback_complaints_db = [{"id": c["id"], "text": c["description"]} for c in complaints]
    
    # Initialize TF-IDF Fallback
    try:
        texts = [c["description"] for c in complaints]
        fallback_tfidf_matrix = fallback_vectorizer.fit_transform(texts)
        print(f"[AI ENGINE] TF-IDF fallback index built successfully with {len(texts)} documents.")
    except Exception as e:
        print(f"Error initializing TF-IDF Matrix: {e}")
        
    # Initialize Vector index if FAISS is available
    if load_vector_engine():
        try:
            global faiss_index, complaint_ids_mapping
            faiss_index = faiss.IndexFlatIP(dimension)
            complaint_ids_mapping = []
            
            embeddings = []
            for c in complaints:
                emb = model.encode(c["description"])
                # Normalize for Cosine Similarity
                emb_norm = emb / np.linalg.norm(emb)
                embeddings.append(emb_norm)
                complaint_ids_mapping.append(c["id"])
                
            if embeddings:
                faiss_index.add(np.array(embeddings).astype('float32'))
                print(f"[AI ENGINE] FAISS vector index seeded successfully with {len(embeddings)} vectors.")
        except Exception as e:
            print(f"Error seeding FAISS Index: {e}")

# Search for Duplicate / Similar Complaints
def search_similar_complaints(new_text: str, similarity_threshold: float = 0.45) -> Optional[Dict[str, Any]]:
    if not new_text or len(new_text) < 10:
        return None
        
    # 1. Attempt FAISS Vector Search if ready
    if load_vector_engine() and len(complaint_ids_mapping) > 0:
        try:
            new_emb = model.encode(new_text)
            new_emb_norm = new_emb / np.linalg.norm(new_emb)
            
            # Query top 1
            D, I = faiss_index.search(np.array([new_emb_norm]).astype('float32'), 1)
            sim_score = float(D[0][0])
            matched_idx = int(I[0][0])
            
            if matched_idx >= 0 and matched_idx < len(complaint_ids_mapping) and sim_score >= similarity_threshold:
                return {
                    "id": complaint_ids_mapping[matched_idx],
                    "similarity_score": round(sim_score, 2),
                    "engine": "FAISS-MiniLM"
                }
        except Exception as e:
            print(f"Vector search failed, using TF-IDF fallback: {e}")
            
    # 2. TF-IDF Cosine Similarity Fallback
    if fallback_tfidf_matrix is not None and len(fallback_complaints_db) > 0:
        try:
            new_vector = fallback_vectorizer.transform([new_text])
            similarities = cosine_similarity(new_vector, fallback_tfidf_matrix).flatten()
            best_match_idx = int(np.argmax(similarities))
            best_sim_score = float(similarities[best_match_idx])
            
            if best_sim_score >= similarity_threshold:
                return {
                    "id": fallback_complaints_db[best_match_idx]["id"],
                    "similarity_score": round(best_sim_score, 2),
                    "engine": "TFIDF-Cosine"
                }
        except Exception as e:
            print(f"TF-IDF similarity search failed: {e}")
            
    return None

# Add a newly created complaint to the active indexes for real-time duplicate checking
def add_complaint_to_indexes(complaint_id: int, text: str):
    global fallback_tfidf_matrix, fallback_complaints_db
    
    # 1. Update Fallback database
    fallback_complaints_db.append({"id": complaint_id, "text": text})
    try:
        texts = [c["text"] for c in fallback_complaints_db]
        fallback_tfidf_matrix = fallback_vectorizer.fit_transform(texts)
    except Exception as e:
        print(f"Error updating TF-IDF Matrix: {e}")
        
    # 2. Update FAISS Index if enabled
    if load_vector_engine():
        try:
            emb = model.encode(text)
            emb_norm = emb / np.linalg.norm(emb)
            faiss_index.add(np.array([emb_norm]).astype('float32'))
            complaint_ids_mapping.append(complaint_id)
        except Exception as e:
            print(f"Error adding to FAISS index: {e}")
