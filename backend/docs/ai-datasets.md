# Recommended Datasets for Symptom → Specialization

Primary (classification-ready):
- "Healthcare Symptoms Disease Classification Dataset" (Kaggle) — use for mapping symptom text to likely disease/specialization. Good for supervised classification.

Secondary (robustness):
- "Symptom Disease Dataset (Prashant Singh)" (Kaggle) — contains ~132 symptoms and ~41 diseases; useful to expand vocabulary and edge cases.

Notes:
- For a lightweight hackathon demo, start with a keyword-based stub (already included in `services/aiService.js`). Replace with a fine-tuned classifier or an LLM prompting approach when you have time.
- If using HuggingFace models, consider sentence-transformers for semantic matching or a small text-classifier like `distilbert` fine-tuned on symptom→specialty labels.
