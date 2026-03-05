// Simple AI stub: maps keywords to specializations. Replace with real model call.
const analyzeSymptoms = async (symptomsText) => {
  const text = symptomsText.toLowerCase();
  const mapping = [
    { keywords: ['chest', 'pain', 'cardiac'], spec: 'Cardiology' },
    { keywords: ['fever', 'cough', 'cold', 'flu'], spec: 'General Medicine' },
    { keywords: ['rash', 'itch', 'derma', 'skin'], spec: 'Dermatology' },
    { keywords: ['preg', 'birth', 'pregnancy'], spec: 'Obstetrics' },
    { keywords: ['tooth', 'dental', 'mouth'], spec: 'Dentistry' },
  ];

  for (const m of mapping) {
    for (const k of m.keywords) {
      if (text.includes(k)) return { predictedSpecialization: m.spec, confidence: 0.9, urgency: 'medium' };
    }
  }

  return { predictedSpecialization: 'General Medicine', confidence: 0.6, urgency: 'low' };
};

module.exports = { analyzeSymptoms };
