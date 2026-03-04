# CareCompass NLP Module

Symptom → Disease classifier using TF-IDF + DistilBERT.

## Setup
```bash
cd nlp
python -m venv venv
source venv/bin/activate        # Mac/Linux
pip install -r requirements.txt
```

## Train the model
```bash
python train_model.py           # TF-IDF only (30 seconds) (can ignore this but use if the bert is taking too long this one is a backup incase bert doesnt function)

python train_model.py --bert    # TF-IDF + BERT (~15 min) -- TRAIN THIS ONE ITS MORE ACCURATE!!!!!
```

Model files are generated in `carecompass_model/` — not tracked by Git, run the above to regenerate.

## Test predictions
```bash
python test_model.py #test scenarios are included already
```



