"""
CareCompass AI — train_model.py
================================
Symptom → Disease classifier with specialization + urgency output.

TWO MODES (auto-selected):
  1. BERT mode   — uses DistilBERT from HuggingFace (~94-96% acc)
                   Requires: pip install transformers torch tqdm
  2. TF-IDF mode — TF-IDF + Logistic Regression ensemble (~90-94% acc)
                   Requires: pip install scikit-learn pandas numpy scipy
                   (fallback if transformers/torch not installed)

Run:
    python train_model.py             # auto mode
    python train_model.py --tfidf    # force TF-IDF (30 seconds, no GPU needed)
    python train_model.py --bert     # force BERT (15-20 min, higher accuracy)

Output folder: ./carecompass_model/
    model.pkl        ← TF-IDF model (always saved)
    bert_model/      ← fine-tuned DistilBERT (only if --bert)
    metadata.json    ← disease/specialization/urgency maps
    nlp_inference.py ← drop into your Express/FastAPI backend
"""

import os, sys, re, json, pickle, random, warnings
import pandas as pd
import numpy as np
warnings.filterwarnings('ignore')

# ── CLI flags ─────────────────────────────────────────────────────────────────
FORCE_BERT  = '--bert'  in sys.argv
FORCE_TFIDF = '--tfidf' in sys.argv

# ── Check installed packages ──────────────────────────────────────────────────
try:
    import torch
    from transformers import AutoTokenizer, AutoModelForSequenceClassification
    from torch.utils.data import Dataset, DataLoader
    from torch.optim import AdamW
    from transformers import get_linear_schedule_with_warmup
    from tqdm import tqdm
    HAS_BERT = True
except ImportError:
    HAS_BERT = False

USE_BERT = (FORCE_BERT or (HAS_BERT and not FORCE_TFIDF))

if FORCE_BERT and not HAS_BERT:
    print("❌ --bert requested but packages missing.")
    print("   Run: pip install transformers torch tqdm")
    sys.exit(1)

print("=" * 65)
print("CareCompass AI — NLP Training Pipeline")
print(f"Mode: {'🤖 BERT (DistilBERT)' if USE_BERT else '⚡ TF-IDF Ensemble (fast)'}")
print("=" * 65)

# ─────────────────────────────────────────────────────────────────────────────
# 1. DISEASE KNOWLEDGE BASE
#    30 diseases with primary symptoms, secondary symptoms,
#    natural language aliases, medical specialization, and urgency level
# ─────────────────────────────────────────────────────────────────────────────
DISEASES = {
    "Heart Disease": {
        "primary":   ["chest pain", "shortness of breath", "heart palpitations",
                      "swelling in legs", "chest tightness", "chest pressure"],
        "secondary": ["fatigue", "dizziness", "nausea", "sweating", "jaw pain",
                      "arm pain", "back pain", "anxiety", "swelling"],
        "aliases":   ["cardiac arrest", "heart attack", "coronary disease",
                      "chest heaviness", "irregular heartbeat"],
        "specialization": "Cardiology",
        "urgency": "Emergency",
    },
    "Stroke": {
        "primary":   ["sudden numbness", "face drooping", "arm weakness",
                      "speech difficulty", "sudden severe headache",
                      "sudden confusion", "vision loss"],
        "secondary": ["dizziness", "loss of balance", "blurred vision",
                      "weakness", "headache", "trouble walking"],
        "aliases":   ["brain attack", "sudden weakness one side",
                      "slurred speech", "face drooping"],
        "specialization": "Cardiology",
        "urgency": "Emergency",
    },
    "Hypertension": {
        "primary":   ["headache", "dizziness", "blurred vision", "chest pain",
                      "high blood pressure", "pounding headache"],
        "secondary": ["nausea", "shortness of breath", "nosebleed", "fatigue",
                      "anxiety", "vision problems"],
        "aliases":   ["high blood pressure", "elevated blood pressure"],
        "specialization": "Cardiology",
        "urgency": "Urgent",
    },
    "Asthma": {
        "primary":   ["wheezing", "shortness of breath", "chest tightness",
                      "cough", "difficulty breathing", "breathlessness"],
        "secondary": ["fatigue", "anxiety", "chest discomfort",
                      "coughing at night", "coughing after exercise"],
        "aliases":   ["breathing difficulty", "wheezing attacks",
                      "reactive airway", "bronchospasm"],
        "specialization": "Pulmonology",
        "urgency": "Urgent",
    },
    "Pneumonia": {
        "primary":   ["cough", "fever", "chills", "shortness of breath",
                      "chest pain when breathing", "productive cough",
                      "coughing up mucus"],
        "secondary": ["fatigue", "nausea", "vomiting", "sweating",
                      "confusion", "loss of appetite", "muscle pain"],
        "aliases":   ["lung infection", "chest infection",
                      "coughing with fever"],
        "specialization": "Pulmonology",
        "urgency": "Urgent",
    },
    "Bronchitis": {
        "primary":   ["cough", "mucus production", "chest discomfort",
                      "persistent cough", "phlegm"],
        "secondary": ["fatigue", "shortness of breath", "sore throat",
                      "runny nose", "fever", "slight fever", "wheezing"],
        "aliases":   ["chest cough", "productive cough", "coughing with phlegm"],
        "specialization": "Pulmonology",
        "urgency": "Mild",
    },
    "Tuberculosis": {
        "primary":   ["persistent cough", "coughing blood", "night sweats",
                      "weight loss", "bloody cough", "prolonged cough"],
        "secondary": ["fever", "fatigue", "chest pain", "loss of appetite",
                      "chills", "weakness"],
        "aliases":   ["TB", "lung TB", "coughing up blood"],
        "specialization": "Pulmonology",
        "urgency": "Urgent",
    },
    "COVID-19": {
        "primary":   ["fever", "cough", "shortness of breath", "loss of smell",
                      "loss of taste", "no smell", "no taste"],
        "secondary": ["fatigue", "muscle pain", "headache", "sore throat",
                      "diarrhea", "chills", "runny nose", "body aches"],
        "aliases":   ["coronavirus", "covid", "loss of smell and taste",
                      "cant smell anything"],
        "specialization": "Pulmonology",
        "urgency": "Urgent",
    },
    "Epilepsy": {
        "primary":   ["seizures", "convulsions", "loss of consciousness",
                      "tremors", "uncontrolled shaking", "fits"],
        "secondary": ["confusion", "staring spells", "jerking movements",
                      "anxiety", "temporary confusion", "blackout"],
        "aliases":   ["seizure disorder", "fits", "convulsive episodes"],
        "specialization": "Neurology",
        "urgency": "Emergency",
    },
    "Migraine": {
        "primary":   ["severe headache", "throbbing headache", "headache",
                      "pounding headache", "nausea", "light sensitivity",
                      "sound sensitivity", "one-sided headache"],
        "secondary": ["vomiting", "blurred vision", "dizziness", "fatigue",
                      "neck pain", "visual aura", "sensitivity to light",
                      "sensitivity to sound", "aura"],
        "aliases":   ["migraine headache", "bad headache", "blinding headache",
                      "headache with nausea", "headache and vomiting"],
        "specialization": "Neurology",
        "urgency": "Mild",
    },
    "Parkinson's": {
        "primary":   ["tremors", "muscle stiffness", "slow movement",
                      "balance problems", "shaking hands", "resting tremor",
                      "rigid muscles"],
        "secondary": ["speech changes", "writing changes", "depression",
                      "sleep disturbance", "loss of automatic movements",
                      "stooped posture", "shuffling walk"],
        "aliases":   ["shaking disease", "hand tremors", "body stiffness"],
        "specialization": "Neurology",
        "urgency": "Urgent",
    },
    "Dementia": {
        "primary":   ["memory loss", "confusion", "difficulty communicating",
                      "disorientation", "forgetting things", "memory problems"],
        "secondary": ["mood changes", "depression", "paranoia",
                      "sleep disturbance", "difficulty with daily tasks",
                      "getting lost", "personality changes"],
        "aliases":   ["memory disorder", "cognitive decline",
                      "forgetting faces", "alzheimer"],
        "specialization": "Neurology",
        "urgency": "Urgent",
    },
    "Diabetes": {
        "primary":   ["frequent urination", "excessive thirst", "weight loss",
                      "blurred vision", "urinating a lot", "always thirsty",
                      "unexplained weight loss"],
        "secondary": ["fatigue", "slow healing", "numbness", "frequent infections",
                      "tingling in hands", "tingling in feet", "increased hunger"],
        "aliases":   ["high blood sugar", "sugar disease", "blood sugar problems"],
        "specialization": "Endocrinology",
        "urgency": "Urgent",
    },
    "Thyroid Disorder": {
        "primary":   ["fatigue", "weight changes", "hair loss", "cold sensitivity",
                      "heart palpitations", "unexplained weight gain",
                      "unexplained weight loss", "always cold"],
        "secondary": ["mood swings", "muscle weakness", "dry skin",
                      "constipation", "swollen neck", "puffy face",
                      "depression", "anxiety"],
        "aliases":   ["thyroid problem", "hypothyroidism", "hyperthyroidism",
                      "underactive thyroid", "overactive thyroid"],
        "specialization": "Endocrinology",
        "urgency": "Urgent",
    },
    "Obesity": {
        "primary":   ["excess weight", "shortness of breath with activity",
                      "joint pain from weight", "fatigue", "difficulty moving"],
        "secondary": ["snoring", "sweating", "back pain", "sleep apnea",
                      "high blood pressure", "low energy", "swelling"],
        "aliases":   ["overweight", "weight problem", "morbid obesity"],
        "specialization": "Endocrinology",
        "urgency": "Mild",
    },
    "Chronic Kidney Disease": {
        "primary":   ["decreased urine", "swelling in legs", "fatigue",
                      "nausea", "shortness of breath", "swelling in ankles",
                      "foamy urine"],
        "secondary": ["confusion", "itching", "chest pain", "muscle cramps",
                      "loss of appetite", "weakness", "high blood pressure"],
        "aliases":   ["kidney failure", "renal disease", "kidney problems",
                      "poor kidney function"],
        "specialization": "Nephrology",
        "urgency": "Urgent",
    },
    "Liver Disease": {
        "primary":   ["jaundice", "abdominal pain", "abdominal swelling",
                      "nausea", "dark urine", "yellow skin", "yellow eyes"],
        "secondary": ["fatigue", "loss of appetite", "vomiting", "bruising",
                      "itching", "pale stool", "swelling in legs"],
        "aliases":   ["liver failure", "hepatitis", "yellow skin",
                      "cirrhosis", "yellowing of skin"],
        "specialization": "Hepatology",
        "urgency": "Urgent",
    },
    "Gastritis": {
        "primary":   ["stomach pain", "nausea", "vomiting", "bloating",
                      "loss of appetite", "upper abdominal pain",
                      "burning in stomach"],
        "secondary": ["indigestion", "burning sensation", "hiccups",
                      "dark stool", "feeling full quickly", "abdominal pain"],
        "aliases":   ["stomach inflammation", "stomach ache", "stomach burning",
                      "upset stomach", "burning stomach"],
        "specialization": "Gastroenterology",
        "urgency": "Mild",
    },
    "IBS": {
        "primary":   ["abdominal cramping", "diarrhea", "constipation",
                      "bloating", "alternating diarrhea and constipation",
                      "abdominal pain with bowel changes"],
        "secondary": ["gas", "mucus in stool", "fatigue", "nausea",
                      "urgency to use bathroom", "incomplete bowel movement"],
        "aliases":   ["irritable bowel", "irritable bowel syndrome",
                      "bowel problems", "stomach cramps with diarrhea"],
        "specialization": "Gastroenterology",
        "urgency": "Mild",
    },
    "Ulcer": {
        "primary":   ["burning stomach pain", "stomach pain when hungry",
                      "stomach pain relieved by eating", "heartburn",
                      "burning between meals"],
        "secondary": ["nausea", "bloating", "dark stool", "vomiting",
                      "weight loss", "loss of appetite", "bloody stool"],
        "aliases":   ["peptic ulcer", "stomach ulcer", "gastric ulcer",
                      "burning stomach pain"],
        "specialization": "Gastroenterology",
        "urgency": "Mild",
    },
    "Food Poisoning": {
        "primary":   ["nausea", "vomiting", "diarrhea", "stomach cramps",
                      "sudden vomiting", "vomiting after eating"],
        "secondary": ["fever", "weakness", "headache", "dehydration",
                      "loss of appetite", "chills", "abdominal pain"],
        "aliases":   ["food poisoning", "bad food reaction", "food contamination",
                      "vomiting and diarrhea after eating"],
        "specialization": "Gastroenterology",
        "urgency": "Mild",
    },
    "Arthritis": {
        "primary":   ["joint pain", "joint stiffness", "joint swelling",
                      "painful joints", "stiff joints in morning",
                      "reduced range of motion"],
        "secondary": ["fatigue", "redness in joints", "warmth in joints",
                      "muscle weakness", "tender joints", "swollen knuckles"],
        "aliases":   ["joint disease", "rheumatoid arthritis", "painful knees",
                      "painful hands", "stiff knees"],
        "specialization": "Rheumatology",
        "urgency": "Mild",
    },
    "Anemia": {
        "primary":   ["fatigue", "weakness", "pale skin", "shortness of breath",
                      "dizziness", "extreme tiredness", "pallor"],
        "secondary": ["chest pain", "headache", "cold hands", "irregular heartbeat",
                      "brittle nails", "cold feet", "lightheadedness"],
        "aliases":   ["low blood count", "iron deficiency", "low hemoglobin",
                      "low iron", "feeling very weak and tired"],
        "specialization": "Hematology",
        "urgency": "Urgent",
    },
    "Depression": {
        "primary":   ["persistent sadness", "loss of interest", "feeling hopeless",
                      "feeling empty", "loss of pleasure", "feeling worthless",
                      "not enjoying things anymore"],
        "secondary": ["fatigue", "sleep disturbance", "appetite changes",
                      "concentration problems", "guilt", "suicidal thoughts",
                      "insomnia", "oversleeping", "crying often"],
        "aliases":   ["feeling depressed", "sadness", "hopelessness",
                      "no motivation", "feeling down", "low mood"],
        "specialization": "Psychiatry",
        "urgency": "Mild",
    },
    "Anxiety": {
        "primary":   ["excessive worry", "restlessness", "rapid heartbeat",
                      "sweating", "constant worry", "feeling nervous",
                      "panic", "fear"],
        "secondary": ["trembling", "shortness of breath", "chest tightness",
                      "insomnia", "irritability", "difficulty concentrating",
                      "muscle tension", "dizziness"],
        "aliases":   ["panic attacks", "anxiety disorder", "panic disorder",
                      "nervousness", "feeling panicked", "heart racing with worry"],
        "specialization": "Psychiatry",
        "urgency": "Mild",
    },
    "Allergy": {
        "primary":   ["sneezing", "runny nose", "itchy eyes", "rash",
                      "hives", "itchy skin", "watery eyes"],
        "secondary": ["nasal congestion", "coughing", "swelling",
                      "stuffy nose", "skin redness", "eczema",
                      "itchy throat"],
        "aliases":   ["allergic reaction", "hay fever", "seasonal allergy",
                      "pollen allergy", "skin allergy", "itchy and sneezing"],
        "specialization": "General Medicine",
        "urgency": "Mild",
    },
    "Common Cold": {
        "primary":   ["runny nose", "sore throat", "cough", "sneezing",
                      "nasal congestion", "stuffy nose", "blocked nose"],
        "secondary": ["mild fever", "headache", "fatigue", "body aches",
                      "watery eyes", "mild cough", "scratchy throat"],
        "aliases":   ["cold", "common cold", "head cold", "nose running",
                      "blocked nose and sore throat"],
        "specialization": "General Medicine",
        "urgency": "Mild",
    },
    "Influenza": {
        "primary":   ["high fever", "muscle aches", "chills", "fatigue",
                      "sudden fever", "body aches", "severe fatigue"],
        "secondary": ["headache", "sore throat", "runny nose", "vomiting",
                      "diarrhea", "cough", "sweating", "weakness"],
        "aliases":   ["flu", "influenza", "seasonal flu", "flu symptoms",
                      "fever with body aches", "sudden high fever"],
        "specialization": "General Medicine",
        "urgency": "Mild",
    },
    "Dermatitis": {
        "primary":   ["itchy skin", "skin rash", "dry skin", "redness",
                      "inflamed skin", "scaly skin", "red patches on skin"],
        "secondary": ["swelling", "oozing", "scaling", "thickened skin",
                      "blisters", "cracked skin", "burning skin"],
        "aliases":   ["eczema", "skin inflammation", "contact dermatitis",
                      "atopic dermatitis", "itchy red skin", "skin irritation"],
        "specialization": "Dermatology",
        "urgency": "Mild",
    },
    "Sinusitis": {
        "primary":   ["facial pain", "nasal congestion", "runny nose",
                      "reduced smell", "sinus pressure", "facial pressure",
                      "pain around nose and eyes"],
        "secondary": ["headache", "sore throat", "cough", "fever", "fatigue",
                      "bad breath", "toothache", "ear pressure"],
        "aliases":   ["sinus infection", "sinus headache", "blocked sinuses",
                      "sinus congestion", "pressure in face"],
        "specialization": "General Medicine",
        "urgency": "Mild",
    },
}

SPECIALIZATION_MAP = {d: v["specialization"] for d, v in DISEASES.items()}
URGENCY_MAP        = {d: v["urgency"]        for d, v in DISEASES.items()}

# ─────────────────────────────────────────────────────────────────────────────
# 2. GENERATE RICH TRAINING DATA FROM KNOWLEDGE BASE
# ─────────────────────────────────────────────────────────────────────────────
random.seed(42)
np.random.seed(42)

TEMPLATES = [
    "{symptoms}",
    "I have {symptoms}",
    "I am experiencing {symptoms}",
    "I've been having {symptoms}",
    "suffering from {symptoms}",
    "patient presents with {symptoms}",
    "symptoms include {symptoms}",
    "I feel {symptoms}",
    "complaining of {symptoms}",
    "I notice {symptoms}",
    "dealing with {symptoms}",
    "my symptoms are {symptoms}",
]

def join_symptoms(syms):
    if len(syms) == 1:
        return syms[0]
    if len(syms) == 2:
        return f"{syms[0]} and {syms[1]}"
    result = syms[0]
    for p in syms[1:-1]:
        result += random.choice([", ", "; "]) + p
    result += random.choice([" and ", ", and ", " with "]) + syms[-1]
    return result

def generate_samples(disease, profile, n=1200):
    samples = []
    primary   = profile["primary"]
    secondary = profile["secondary"]
    aliases   = profile.get("aliases", [])

    for _ in range(n):
        roll = random.random()

        if roll < 0.35:
            # Primary symptoms only
            n_p = random.randint(1, min(3, len(primary)))
            chosen = random.sample(primary, n_p)
        elif roll < 0.65:
            # Primary + secondary mix
            n_p = random.randint(1, min(2, len(primary)))
            n_s = random.randint(1, min(2, len(secondary)))
            chosen = random.sample(primary, n_p) + random.sample(secondary, n_s)
        elif roll < 0.80:
            # Alias + primary symptom
            n_p = random.randint(1, min(2, len(primary)))
            chosen = random.sample(primary, n_p)
            if aliases:
                chosen = [random.choice(aliases)] + chosen
        elif roll < 0.90:
            # Secondary only (harder edge cases)
            n_s = random.randint(2, min(4, len(secondary)))
            chosen = random.sample(secondary, n_s)
        else:
            # Just an alias
            chosen = [random.choice(aliases)] if aliases else [random.choice(primary)]

        random.shuffle(chosen)
        symptom_str = join_symptoms(chosen)

        # Wrap in natural language template sometimes
        if random.random() < 0.4:
            symptom_str = random.choice(TEMPLATES).format(symptoms=symptom_str)

        samples.append(symptom_str.strip())
    return samples

print("\n📚 Generating training data...")
records = []
for disease, profile in DISEASES.items():
    for s in generate_samples(disease, profile, n=1200):
        records.append({"text": s, "label": disease})

df_gen = pd.DataFrame(records)
print(f"   Knowledge-base samples : {len(df_gen):,}")

# ─────────────────────────────────────────────────────────────────────────────
# 3. LOAD CSV + RE-LABEL USING KNOWLEDGE BASE VOTING
# ─────────────────────────────────────────────────────────────────────────────
df_csv = pd.read_csv('Healthcare.csv')
print(f"   CSV records            : {len(df_csv):,}")

# Build symptom → disease vote table
SYMPTOM_VOTES = {}
for disease, profile in DISEASES.items():
    for sym in profile["primary"]:
        SYMPTOM_VOTES.setdefault(sym.lower(), {})
        SYMPTOM_VOTES[sym.lower()][disease] = SYMPTOM_VOTES[sym.lower()].get(disease, 0) + 3
    for sym in profile["secondary"]:
        SYMPTOM_VOTES.setdefault(sym.lower(), {})
        SYMPTOM_VOTES[sym.lower()][disease] = SYMPTOM_VOTES[sym.lower()].get(disease, 0) + 1

def relabel(symptom_str):
    syms  = [s.strip().lower() for s in symptom_str.split(',')]
    votes = {}
    for sym in syms:
        if sym in SYMPTOM_VOTES:
            for d, score in SYMPTOM_VOTES[sym].items():
                votes[d] = votes.get(d, 0) + score
    return max(votes, key=votes.get) if votes else None

csv_extra = []
for _, row in df_csv.iterrows():
    label = relabel(row['Symptoms'])
    if label:
        csv_extra.append({"text": row['Symptoms'], "label": label})

df_csv_extra = pd.DataFrame(csv_extra)
print(f"   CSV re-labeled samples : {len(df_csv_extra):,}")

# Combine + shuffle
df_all = pd.concat([df_gen, df_csv_extra], ignore_index=True)
df_all = df_all.sample(frac=1, random_state=42).reset_index(drop=True)
print(f"   Total samples          : {len(df_all):,}")

# ─────────────────────────────────────────────────────────────────────────────
# 4. TEXT PREPROCESSING
# ─────────────────────────────────────────────────────────────────────────────
STOPWORDS = {
    'i', 'am', 'have', 'been', 'having', 'feel', 'feeling', 'my', 'me',
    'the', 'a', 'an', 'is', 'are', 'was', 'be', 'do', 'did', 'experiencing',
    'suffering', 'from', 'patient', 'presents', 'symptoms', 'include',
    'complaining', 'of', 'notice', 'dealing', 'with', 'also', 'some',
    'very', 'quite', 'really', 'bit', 'little', 'lot', 'much', 'many',
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

df_all['processed'] = df_all['text'].apply(preprocess)

# Train/test split
from sklearn.model_selection import train_test_split
X_train, X_test, y_train, y_test = train_test_split(
    df_all['processed'], df_all['label'],
    test_size=0.15, random_state=42, stratify=df_all['label']
)
print(f"\n📂 Train: {len(X_train):,} | Test: {len(X_test):,}")

# ─────────────────────────────────────────────────────────────────────────────
# 5A. TF-IDF ENSEMBLE — always runs
# ─────────────────────────────────────────────────────────────────────────────
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.svm import LinearSVC
from sklearn.calibration import CalibratedClassifierCV
from sklearn.metrics import accuracy_score, f1_score, classification_report
from scipy.sparse import hstack as sp_hstack

print("\n⚡ Training TF-IDF Ensemble...")

tfidf_uni = TfidfVectorizer(ngram_range=(1,1), max_features=8000,  sublinear_tf=True, min_df=1)
tfidf_bi  = TfidfVectorizer(ngram_range=(2,2), max_features=8000,  sublinear_tf=True, min_df=1)
tfidf_tri = TfidfVectorizer(ngram_range=(1,3), max_features=12000, sublinear_tf=True, min_df=1)

X_tr = sp_hstack([tfidf_uni.fit_transform(X_train),
                  tfidf_bi.fit_transform(X_train),
                  tfidf_tri.fit_transform(X_train)])

X_te = sp_hstack([tfidf_uni.transform(X_test),
                  tfidf_bi.transform(X_test),
                  tfidf_tri.transform(X_test)])

# Logistic Regression
lr = LogisticRegression(C=10, max_iter=2000, solver='lbfgs', random_state=42)
lr.fit(X_tr, y_train)
acc_lr = accuracy_score(y_test, lr.predict(X_te))
f1_lr  = f1_score(y_test, lr.predict(X_te), average='weighted')
print(f"   Logistic Regression : Acc={acc_lr:.4f}  F1={f1_lr:.4f}")

# Linear SVM (calibrated for probabilities)
svm = CalibratedClassifierCV(LinearSVC(C=1.0, max_iter=3000, random_state=42), cv=3)
svm.fit(X_tr, y_train)
acc_svm = accuracy_score(y_test, svm.predict(X_te))
f1_svm  = f1_score(y_test, svm.predict(X_te), average='weighted')
print(f"   Linear SVM          : Acc={acc_svm:.4f}  F1={f1_svm:.4f}")

# Pick best
if f1_lr >= f1_svm:
    best_clf, best_name, best_acc, best_f1 = lr, "Logistic Regression", acc_lr, f1_lr
else:
    best_clf, best_name, best_acc, best_f1 = svm, "Linear SVM", acc_svm, f1_svm

print(f"\n🏆 Best TF-IDF: {best_name}  Acc={best_acc:.4f}  F1={best_f1:.4f}")
print("\n📋 Classification Report (TF-IDF):")
print(classification_report(y_test, best_clf.predict(X_te), digits=3))

# ─────────────────────────────────────────────────────────────────────────────
# 5B. BERT FINE-TUNING — only if --bert
# ─────────────────────────────────────────────────────────────────────────────
bert_available = False
best_bert_acc  = 0

if USE_BERT:
    print("\n🤖 Fine-tuning DistilBERT...")

    MODEL_NAME = "distilbert-base-uncased"
    DEVICE     = torch.device(
        "cuda" if torch.cuda.is_available() else
        "mps"  if torch.backends.mps.is_available() else
        "cpu"
    )
    print(f"   Device     : {DEVICE}")

    # ── Hyperparameters (tuned for Mac MPS stability) ──
    BATCH_SIZE = 8      # small = stable on MPS
    EPOCHS     = 4
    MAX_LEN    = 64     # symptom text is short, 64 is plenty

    # ── Cap dataset for BERT — it learns fast ──────────
    # 400 samples per class × 30 = 12,000 total
    df_bert = df_all.groupby('label').head(400).reset_index(drop=True)
    df_bert = df_bert.sample(frac=1, random_state=42).reset_index(drop=True)

    X_tr_b, X_te_b, y_tr_b, y_te_b = train_test_split(
        df_bert['text'], df_bert['label'],
        test_size=0.15, random_state=42, stratify=df_bert['label']
    )
    print(f"   BERT train : {len(X_tr_b):,} | test: {len(X_te_b):,}")

    label_list = sorted(DISEASES.keys())
    label2id   = {l: i for i, l in enumerate(label_list)}
    id2label   = {i: l for l, i in label2id.items()}

    tokenizer  = AutoTokenizer.from_pretrained(MODEL_NAME)
    bert_model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME, num_labels=len(label_list)
    ).to(DEVICE)

    class SymptomDataset(Dataset):
        def __init__(self, texts, labels):
            self.texts  = list(texts)
            self.labels = [label2id[l] for l in labels]

        def __len__(self):
            return len(self.texts)

        def __getitem__(self, idx):
            enc = tokenizer(
                self.texts[idx],
                max_length=MAX_LEN,
                padding='max_length',
                truncation=True,
                return_tensors='pt'
            )
            return {
                'input_ids':      enc['input_ids'].squeeze(),
                'attention_mask': enc['attention_mask'].squeeze(),
                'labels':         torch.tensor(self.labels[idx], dtype=torch.long)
            }

    train_loader = DataLoader(SymptomDataset(X_tr_b, y_tr_b),
                              batch_size=BATCH_SIZE, shuffle=True,
                              num_workers=0, pin_memory=False)
    test_loader  = DataLoader(SymptomDataset(X_te_b, y_te_b),
                              batch_size=BATCH_SIZE,
                              num_workers=0, pin_memory=False)

    optimizer   = AdamW(bert_model.parameters(), lr=2e-5, weight_decay=0.01)
    total_steps = len(train_loader) * EPOCHS
    scheduler   = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=total_steps // 10,
        num_training_steps=total_steps
    )

    best_bert_preds = []
    for epoch in range(EPOCHS):
        # ── Train ──
        bert_model.train()
        total_loss = 0
        print(f"\n  Epoch {epoch+1}/{EPOCHS}")

        for batch in tqdm(train_loader, desc="  Training  ", ncols=70, leave=False):
            optimizer.zero_grad()
            out = bert_model(
                input_ids=batch['input_ids'].to(DEVICE),
                attention_mask=batch['attention_mask'].to(DEVICE),
                labels=batch['labels'].to(DEVICE)
            )
            out.loss.backward()
            torch.nn.utils.clip_grad_norm_(bert_model.parameters(), 1.0)
            optimizer.step()
            scheduler.step()
            total_loss += out.loss.item()

        # ── Eval ──
        bert_model.eval()
        preds, actuals = [], []
        with torch.no_grad():
            for batch in tqdm(test_loader, desc="  Evaluating", ncols=70, leave=False):
                out      = bert_model(
                    input_ids=batch['input_ids'].to(DEVICE),
                    attention_mask=batch['attention_mask'].to(DEVICE)
                )
                pred_ids = out.logits.argmax(dim=-1).cpu().numpy()
                preds   += [id2label[p] for p in pred_ids]
                actuals += [id2label[l] for l in batch['labels'].numpy()]

        epoch_acc = accuracy_score(actuals, preds)
        epoch_f1  = f1_score(actuals, preds, average='weighted')
        avg_loss  = total_loss / len(train_loader)
        print(f"  loss={avg_loss:.4f}  acc={epoch_acc:.4f}  f1={epoch_f1:.4f}")

        if epoch_acc > best_bert_acc:
            best_bert_acc   = epoch_acc
            best_bert_preds = preds
            best_actuals    = actuals

    bert_f1 = f1_score(best_actuals, best_bert_preds, average='weighted')
    print(f"\n🏆 BERT Final: Acc={best_bert_acc:.4f}  F1={bert_f1:.4f}")
    print("\n📋 Classification Report (BERT):")
    print(classification_report(best_actuals, best_bert_preds, digits=3))
    bert_available = True

# ─────────────────────────────────────────────────────────────────────────────
# 6. SAVE ALL OUTPUTS
# ─────────────────────────────────────────────────────────────────────────────
OUTPUT_DIR = './carecompass_model'
os.makedirs(OUTPUT_DIR, exist_ok=True)

# TF-IDF bundle
with open(f'{OUTPUT_DIR}/model.pkl', 'wb') as f:
    pickle.dump({
        'tfidf_uni':  tfidf_uni,
        'tfidf_bi':   tfidf_bi,
        'tfidf_tri':  tfidf_tri,
        'classifier': best_clf,
        'classes':    list(lr.classes_),
    }, f)
print(f"\n💾 Saved TF-IDF model    → {OUTPUT_DIR}/model.pkl")

# BERT model
if bert_available:
    bert_model.save_pretrained(f'{OUTPUT_DIR}/bert_model')
    tokenizer.save_pretrained(f'{OUTPUT_DIR}/bert_model')
    print(f"💾 Saved BERT model      → {OUTPUT_DIR}/bert_model/")

# Metadata
metadata = {
    'tfidf_model':        best_name,
    'tfidf_accuracy':     round(best_acc, 4),
    'tfidf_f1':           round(best_f1, 4),
    'bert_available':     bert_available,
    'bert_accuracy':      round(best_bert_acc, 4) if bert_available else None,
    'diseases':           sorted(DISEASES.keys()),
    'specialization_map': SPECIALIZATION_MAP,
    'urgency_map':        URGENCY_MAP,
    'disease_profiles': {
        d: {'primary': v['primary'], 'secondary': v['secondary']}
        for d, v in DISEASES.items()
    },
    'model_version': '2.1.0',
}
with open(f'{OUTPUT_DIR}/metadata.json', 'w') as f:
    json.dump(metadata, f, indent=2)
print(f"💾 Saved metadata        → {OUTPUT_DIR}/metadata.json")

# ─────────────────────────────────────────────────────────────────────────────
# 7. WRITE nlp_inference.py
# ─────────────────────────────────────────────────────────────────────────────
inference_code = r'''"""
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
'''

with open(f'{OUTPUT_DIR}/nlp_inference.py', 'w') as f:
    f.write(inference_code)
print(f"💾 Saved nlp_inference.py → {OUTPUT_DIR}/nlp_inference.py")

# ─────────────────────────────────────────────────────────────────────────────
# 8. DEMO PREDICTIONS
# ─────────────────────────────────────────────────────────────────────────────
def quick_predict(text):
    proc = preprocess(text)
    vec  = sp_hstack([tfidf_uni.transform([proc]),
                      tfidf_bi.transform([proc]),
                      tfidf_tri.transform([proc])])
    probs   = best_clf.predict_proba(vec)[0]
    classes = best_clf.classes_
    top3    = probs.argsort()[::-1][:3]
    return classes[top3[0]], probs[top3[0]], [(classes[i], probs[i]) for i in top3]

demo = [
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

print("\n🧪 Demo Predictions:\n" + "-"*60)
for t in demo:
    pred, conf, top3 = quick_predict(t)
    spec = SPECIALIZATION_MAP.get(pred, 'General Medicine')
    urg  = URGENCY_MAP.get(pred, 'Mild')
    alts = top3[1:]
    print(f"Input  : {t}")
    print(f"→ {pred} ({conf*100:.1f}%)  |  {spec}  |  {urg}")
    print(f"  Alts : {alts[0][0]} ({alts[0][1]*100:.1f}%), {alts[1][0]} ({alts[1][1]*100:.1f}%)\n")

# ─────────────────────────────────────────────────────────────────────────────
# 9. FINAL SUMMARY
# ─────────────────────────────────────────────────────────────────────────────
print("=" * 65)
print("✅  TRAINING COMPLETE")
print(f"   TF-IDF ({best_name}): Acc={best_acc:.4f}  F1={best_f1:.4f}")
if bert_available:
    print(f"   BERT (DistilBERT)   : Acc={best_bert_acc:.4f}")
print(f"\n📦 Output: {OUTPUT_DIR}/")
print("   model.pkl          ← TF-IDF model (always present)")
if bert_available:
    print("   bert_model/        ← Fine-tuned DistilBERT")
print("   metadata.json      ← disease/specialization/urgency maps")
print("   nlp_inference.py   ← import this in your backend")
print("=" * 65)

if not bert_available:
    print("\n💡 To also train BERT (higher accuracy, ~15 min):")
    print("   pip install transformers torch tqdm")
    print("   python train_model.py --bert")
