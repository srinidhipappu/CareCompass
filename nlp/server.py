"""
CareCompass NLP server — Flask microservice
Wraps the trained local model and exposes POST /predict
Run: python server.py  (defaults to port 5001)
"""

import os, sys
from flask import Flask, request, jsonify

MODEL_DIR = os.path.join(os.path.dirname(__file__), 'carecompass_model')
sys.path.insert(0, MODEL_DIR)

from nlp_inference import CareCompassNLP

app = Flask(__name__)
nlp = CareCompassNLP(model_dir=MODEL_DIR)

@app.route('/predict', methods=['POST'])
def predict():
    data = request.get_json(force=True)
    text = (data.get('symptoms') or '').strip()
    if not text:
        return jsonify({'error': 'symptoms field required'}), 400

    result = nlp.predict(text, top_k=3)
    return jsonify({
        'predictedSpecialization': result['specialization'],
        'predictedDisease':        result['predicted_disease'],
        'urgency':                 result['urgency'],
        'confidence':              result['confidence'],
        'topPredictions':          result['top_predictions'],
    })

@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok'})

if __name__ == '__main__':
    port = int(os.environ.get('NLP_PORT', 5001))
    print(f'CareCompass NLP server running on port {port}')
    app.run(host='0.0.0.0', port=port)
