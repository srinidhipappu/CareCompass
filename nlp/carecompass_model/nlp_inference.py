"""
CareCompass AI — nlp_inference.py
===================================
Production inference module. Auto-selects BERT (if available) or TF-IDF.

Usage:
    from nlp_inference import CareCompassNLP
    nlp = CareCompassNLP(model_dir="./carecompass_model")
    result = nlp.predict("fever and chest pain")

Returns:
    {
      "input":             "fever and chest pain",
      "predicted_disease": "Pneumonia",
      "specialization":    "Pulmonology",
      "urgency":           "Urgent",
      "confidence":        0.94,
      "top_predictions": [
          {"disease": "Pneumonia",  "confidence": 0.94, "specialization": "Pulmonology", "urgency": "Urgent"},
          {"disease": "COVID-19",   "confidence": 0.04, "specialization": "Pulmonology", "urgency": "Urgent"},
          {"disease": "Bronchitis", "confidence": 0.01, "specialization": "Pulmonology", "urgency": "Mild"},
      ]
    }
"""

import os, re, json, pickle
import numpy as np

try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    HAS_TORCH = True
except ImportError:
    HAS_TORCH = False

STOPWORDS = {
    'i','am','have','been','having','feel','feeling','my','me',
    'the','a','an','is','are','was','be','do','did','experiencing',
    'suffering','from','patient','presents','symptoms','include',
    'complaining','of','notice','dealing','with','also','some',
    'very','quite','really','bit','little','lot','much','many',
}

def preprocess(text: str) -> str:
    text = text.lower().strip()
    text = re.sub(r'\balong with\b|\btogether with\b', ',', text)
    text = re.sub(r'\band\b|\bwith\b|\bplus\b|\balso\b', ',', text)
    text = re.sub(r'[;|]', ',', text)
    text = re.sub(r'\b(i am|i have|ive been|i feel|i notice|im|patient presents)\b', '', text)
    text = re.sub(r'\b(experiencing|suffering from|complaining of|dealing with)\b', '', text)
    text = re.sub(r'\b(symptoms include|my symptoms are|symptoms are)\b', '', text)
    text = re.sub(r'\b(some|very|quite|really|a bit|a little|severe|mild|chronic|sudden|extreme|persistent|constant)\b', '', text)
    parts  = text.split(',')
    tokens = []
    for p in parts:
        p = p.strip()
        p = re.sub(r'[^a-z\s]', '', p)
        p = re.sub(r'\s+', ' ', p).strip()
        words = [w for w in p.split() if w not in STOPWORDS]
        if words:
            tokens.append('_'.join(words))
    return ' '.join(tokens)


class CareCompassNLP:
    def __init__(self, model_dir="."):
        with open(os.path.join(model_dir, "metadata.json")) as f:
            meta = json.load(f)

        self.specialization_map = meta["specialization_map"]
        self.urgency_map        = meta["urgency_map"]
        self.use_bert           = False

        bert_path = os.path.join(model_dir, "bert_model")
        if meta.get("bert_available") and HAS_TORCH and os.path.exists(bert_path):
            self.device     = torch.device(
                "cuda" if torch.cuda.is_available() else
                "mps"  if torch.backends.mps.is_available() else "cpu"
            )
            self.tokenizer  = AutoTokenizer.from_pretrained(bert_path)
            self.bert       = AutoModelForSequenceClassification.from_pretrained(bert_path).to(self.device)
            self.bert.eval()
            self.label_list = sorted(meta["diseases"])
            self.use_bert   = True
            print(f"✅ CareCompassNLP — BERT loaded (device={self.device})")
        else:
            with open(os.path.join(model_dir, "model.pkl"), "rb") as f:
                bundle = pickle.load(f)
            self.tfidf_uni  = bundle["tfidf_uni"]
            self.tfidf_bi   = bundle["tfidf_bi"]
            self.tfidf_tri  = bundle["tfidf_tri"]
            self.classifier = bundle["classifier"]
            print("✅ CareCompassNLP — TF-IDF loaded")

    def _tfidf_predict(self, text, top_k):
        from scipy.sparse import hstack
        proc = preprocess(text)
        vec  = hstack([self.tfidf_uni.transform([proc]),
                       self.tfidf_bi.transform([proc]),
                       self.tfidf_tri.transform([proc])])
        probs   = self.classifier.predict_proba(vec)[0]
        classes = self.classifier.classes_
        top_idx = probs.argsort()[::-1][:top_k]
        return [{
            "disease":        classes[i],
            "confidence":     round(float(probs[i]), 4),
            "specialization": self.specialization_map.get(classes[i], "General Medicine"),
            "urgency":        self.urgency_map.get(classes[i], "Mild"),
        } for i in top_idx]

    def _bert_predict(self, text, top_k):
        enc = self.tokenizer(text, max_length=64, padding='max_length',
                             truncation=True, return_tensors='pt')
        with torch.no_grad():
            logits = self.bert(
                input_ids=enc['input_ids'].to(self.device),
                attention_mask=enc['attention_mask'].to(self.device)
            ).logits[0]
        probs   = torch.softmax(logits, dim=-1).cpu().numpy()
        top_idx = probs.argsort()[::-1][:top_k]
        return [{
            "disease":        self.label_list[i],
            "confidence":     round(float(probs[i]), 4),
            "specialization": self.specialization_map.get(self.label_list[i], "General Medicine"),
            "urgency":        self.urgency_map.get(self.label_list[i], "Mild"),
        } for i in top_idx]

    def predict(self, symptom_text: str, top_k: int = 3) -> dict:
        """
        Predict disease from free-text symptom description.

        Args:
            symptom_text : e.g. "fever and chest pain" or
                                "I've been having headaches with nausea"
            top_k        : number of top predictions to return (default 3)

        Returns:
            dict with predicted_disease, specialization, urgency,
            confidence, and top_predictions list
        """
        top_preds = self._bert_predict(symptom_text, top_k) if self.use_bert \
                    else self._tfidf_predict(symptom_text, top_k)
        best = top_preds[0]
        return {
            "input":             symptom_text,
            "predicted_disease": best["disease"],
            "specialization":    best["specialization"],
            "urgency":           best["urgency"],
            "confidence":        best["confidence"],
            "top_predictions":   top_preds,
        }


if __name__ == "__main__":
    nlp = CareCompassNLP(model_dir=".")
    tests = [
        "fever and chest pain",
        "runny nose, sneezing, sore throat",
        "tremors and muscle stiffness",
        "severe headache with nausea",
        "headache with nausea and light sensitivity",
        "cough, shortness of breath, fatigue",
        "joint pain and stiff joints in the morning",
        "excessive thirst and frequent urination",
        "persistent sadness and loss of interest",
        "itchy skin and red patches",
        "I have been experiencing chest tightness and wheezing",
        "feeling very tired, pale skin, and dizziness",
    ]
    print("\nCareCompass NLP — Test Predictions\n" + "="*55)
    for t in tests:
        r = nlp.predict(t)
        print(f"\nInput   : {r['input']}")
        print(f"→ {r['predicted_disease']}  ({r['confidence']*100:.1f}%)")
        print(f"  Dept  : {r['specialization']}  |  Urgency: {r['urgency']}")
        print("  Alts  :")
        for p in r["top_predictions"][1:]:
            print(f"    • {p['disease']:<28} {p['confidence']*100:5.1f}%  [{p['urgency']}]")
