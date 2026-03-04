from carecompass_model.nlp_inference import CareCompassNLP

nlp = CareCompassNLP(model_dir="./carecompass_model")

tests = [
    "fever and chest pain",
    "runny nose and sneezing",
    "tremors and muscle stiffness",
    "severe headache with nausea",
    "excessive thirst and frequent urination",
    "persistent sadness and loss of interest",
    "itchy skin and red rash",
    "cough shortness of breath",
]

print("\nCareCompass NLP — Results\n" + "="*50)
for t in tests:
    r = nlp.predict(t)
    print(f"\nInput   : {t}")
    print(f"Disease : {r['predicted_disease']} ({r['confidence']*100:.1f}%)")
    print(f"Dept    : {r['specialization']}")
    print(f"Urgency : {r['urgency']}")