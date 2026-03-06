const axios = require('axios');

const NLP_SERVER_URL = process.env.NLP_SERVER_URL || 'http://localhost:5001';

// Map NLP model specializations → our DB specializations
// (model knows: Cardiology, Dermatology, Endocrinology, Gastroenterology,
//  General Medicine, Hematology, Hepatology, Nephrology, Neurology,
//  Psychiatry, Pulmonology, Rheumatology)
const MODEL_SPEC_MAP = {
  'Cardiology':      'Cardiology',
  'Dermatology':     'Dermatology',
  'Endocrinology':   'Endocrinology',
  'Gastroenterology':'Gastroenterology',
  'General Medicine':'General Medicine',
  'Hematology':      'Oncology',       // blood disorders → oncology
  'Hepatology':      'Gastroenterology', // liver → digestive
  'Nephrology':      'Urology',         // kidney/urinary
  'Neurology':       'Neurology',
  'Psychiatry':      'Psychiatry',
  'Pulmonology':     'General Medicine', // no pulmonology in DB
  'Rheumatology':    'Orthopedics',      // joint/muscle → orthopedics
};

const EMERGENCY_KEYWORDS = [
  'chest pain', 'heart attack', 'stroke', 'unconscious', 'not breathing',
  'severe bleeding', 'seizure', 'paralysis', 'sudden numbness', 'loss of consciousness',
];
const URGENT_KEYWORDS = [
  'shortness of breath', 'difficulty breathing', 'high fever', 'severe pain',
  'vomiting blood', 'broken bone', 'fracture', 'dislocation', 'deep wound', 'severe headache',
];

const detectUrgency = (text) => {
  const t = text.toLowerCase();
  for (const kw of EMERGENCY_KEYWORDS) if (t.includes(kw)) return 'Emergency';
  for (const kw of URGENT_KEYWORDS) if (t.includes(kw)) return 'Urgent';
  return 'Normal';
};

// Scoring-based keyword classifier — each hit adds weight, highest score wins
const SPEC_KEYWORDS = {
  'Cardiology':      ['chest', 'heart', 'cardiac', 'palpitation', 'arrhythmia', 'angina', 'blood pressure', 'hypertension', 'cholesterol', 'coronary', 'chest tightness', 'tight chest', 'tightness in chest', 'racing heart', 'fast heartbeat', 'irregular heartbeat'],
  'Neurology':       ['headache', 'migraine', 'brain', 'nerve', 'numbness', 'tingling', 'seizure', 'tremor', 'dizziness', 'vertigo', 'memory', 'alzheimer', 'parkinson', 'epilepsy', 'stroke', 'confusion', 'sensitivity to light', 'light sensitivity', 'aura', 'blurred vision headache', 'neck stiffness', 'balancing', 'loss of balance', 'trouble walking', 'blurry vision headache'],
  'Orthopedics':     ['bone', 'joint', 'fracture', 'sprain', 'back pain', 'knee', 'hip', 'shoulder', 'arthritis', 'spine', 'ligament', 'tendon', 'muscle pain', 'swollen joint', 'neck pain', 'ankle', 'wrist', 'elbow', 'foot pain', 'leg pain', 'arm pain', 'stiff joint', 'swollen ankle', 'twisted', 'back hurts', 'back ache', 'backache', 'sore back', 'lower back'],
  'Dermatology':     ['rash', 'itch', 'skin', 'acne', 'eczema', 'psoriasis', 'hive', 'blister', 'mole', 'hair loss', 'nail', 'dry skin', 'wound', 'burn', 'sunburn'],
  'General Medicine':['fever', 'cold', 'flu', 'cough', 'fatigue', 'tired', 'weakness', 'weight loss', 'weight gain', 'appetite', 'malaise', 'body ache', 'chills', 'persistent cough', 'mild fever', 'low grade fever', 'runny nose', 'sore throat', 'congestion', 'wheezing', 'shortness of breath'],
  'Obstetrics':      ['pregnant', 'pregnancy', 'birth', 'labor', 'menstrual', 'period', 'gynec', 'ovarian', 'uterus', 'vaginal', 'fertility', 'miscarriage', 'breastfeed', 'prenatal', 'morning sickness', 'trimester', 'fetus', 'gestation', 'contractions', 'postpartum'],
  'Dentistry':       ['tooth', 'teeth', 'dental', 'gum', 'mouth', 'jaw', 'cavity', 'toothache', 'oral', 'denture', 'wisdom tooth', 'root canal', 'braces'],
  'Psychiatry':      ['anxiety', 'depression', 'mental', 'mood', 'stress', 'panic', 'hallucination', 'bipolar', 'schizophrenia', 'insomnia', 'sleep', 'phobia', 'ocd', 'ptsd', 'suicidal', 'addiction'],
  'Ophthalmology':   ['eye', 'vision', 'blind', 'blurry', 'cataract', 'glaucoma', 'retina', 'contact lens', 'glasses', 'eyelid', 'conjunctivitis', 'pink eye', 'itchy eyes'],
  'Gastroenterology':['stomach', 'abdomen', 'nausea', 'vomit', 'diarrhea', 'constipation', 'bowel', 'colon', 'rectal', 'bloating', 'gas', 'acid reflux', 'heartburn', 'liver', 'gallbladder', 'pancreas', 'ibs', 'crohn', 'after eating', 'after meals', 'indigestion', 'stomach cramp', 'abdominal cramp'],
  'ENT':             ['ear', 'nose', 'throat', 'sinus', 'hearing', 'tonsil', 'snoring', 'hoarse', 'nasal', 'stuffy', 'runny nose', 'earache', 'tinnitus', 'larynx', 'voice'],
  'Pediatrics':      ['child', 'infant', 'baby', 'toddler', 'pediatric', 'kid', 'newborn', 'vaccination', 'growth', 'developmental'],
  'Urology':         ['urine', 'urinary', 'kidney', 'bladder', 'prostate', 'frequent urination', 'burning urination', 'burning urine', 'uti', 'kidney stone', 'testicular', 'erectile', 'burning when urinating'],
  'Endocrinology':   ['diabetes', 'thyroid', 'hormone', 'insulin', 'sugar', 'metabolic', 'adrenal', 'pituitary', 'hyperthyroid', 'hypothyroid', 'glucose'],
  'Oncology':        ['cancer', 'tumor', 'lump', 'mass', 'chemotherapy', 'radiation', 'biopsy', 'malignant', 'lymphoma', 'leukemia'],
};

const keywordScore = (text) => {
  const t = text.toLowerCase();
  const scores = {};
  for (const [spec, keywords] of Object.entries(SPEC_KEYWORDS)) {
    scores[spec] = 0;
    for (const kw of keywords) {
      if (t.includes(kw)) scores[spec] += 1;
    }
  }
  const best = Object.entries(scores).sort((a, b) => b[1] - a[1])[0];
  if (best[1] === 0) return { predictedSpecialization: 'General Medicine', confidence: 0.5 };
  const total = Object.values(scores).reduce((s, v) => s + v, 0);
  return {
    predictedSpecialization: best[0],
    confidence: Math.min(0.95, 0.5 + (best[1] / total) * 0.8),
  };
};

const callLocalModel = async (symptomsText) => {
  const response = await axios.post(
    `${NLP_SERVER_URL}/predict`,
    { symptoms: symptomsText },
    { timeout: 15000 }
  );
  const { predictedSpecialization: raw, urgency, confidence } = response.data;
  const predictedSpecialization = MODEL_SPEC_MAP[raw] || raw;
  return { predictedSpecialization, urgency, confidence };
};

const analyzeSymptoms = async (symptomsText) => {
  const urgency = detectUrgency(symptomsText);
  const t = symptomsText.toLowerCase();

  // Count keyword hits per specialization
  const hitCounts = {};
  for (const [spec, keywords] of Object.entries(SPEC_KEYWORDS)) {
    hitCounts[spec] = keywords.filter(kw => t.includes(kw)).length;
  }
  const bestSpec = Object.entries(hitCounts).sort((a, b) => b[1] - a[1])[0];
  const keywordHits = bestSpec[1];

  // If keywords give any specific signal (≥1 non-generic hit), trust keyword scorer over model
  if (keywordHits >= 1) {
    const { predictedSpecialization, confidence } = keywordScore(symptomsText);
    if (predictedSpecialization !== 'General Medicine') {
      return { predictedSpecialization, confidence, urgency };
    }
  }

  // No specific keyword hit — try the NLP model
  try {
    const result = await callLocalModel(symptomsText);
    if (result.confidence >= 0.5) {
      return { ...result, urgency };
    }
    console.log(`NLP low confidence (${result.confidence.toFixed(2)}), using keyword scorer`);
  } catch (err) {
    console.warn('Local NLP model unavailable, using keyword fallback:', err.message);
  }

  // Final fallback — keyword scorer (may return General Medicine)
  const { predictedSpecialization, confidence } = keywordScore(symptomsText);
  return { predictedSpecialization, confidence, urgency };
};

module.exports = { analyzeSymptoms };
