import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

DEFAULT_DURATIONS = {
    "focus_duration": 25,
    "break_duration": 5,
    "long_break_duration": 15
}

API_KEY = os.getenv('GEMINI_API_KEY')

# Gemini API endpoint.
GEMINI_URL = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key={API_KEY}"

@app.route('/api/durations', methods=['POST'])
def get_durations():
    data = request.get_json()
    
    try:
        session_length = int(data.get('session_length', 1))
        exam_distance = int(data.get('exam_distance', 1))
    except (TypeError, ValueError):
        return jsonify({"error": "Inputs must be integers."}), 400

    # Construct the Gemini API request payload.
    payload = {
        "contents": [{
            "parts": [{
                "text": (
                    "You are an API that calculates Pomodoro durations. "
                    "Return ONLY a raw JSON object (no markdown formatting) with integer keys: "
                    "focus_duration, break_duration, long_break_duration. "
                    f"Calculate for a session of {session_length} hours with exam in {exam_distance} days."
                )
            }]
        }],
        "generationConfig": {
            "response_mime_type": "application/json"
        }
    }

    try:
        # Make the API request to Gemini.
        response = requests.post(GEMINI_URL, json=payload)
        response.raise_for_status() # Check for HTTP errors
        
        result = response.json()
        
        # Extract the text response.
        text_response = result['candidates'][0]['content']['parts'][0]['text']
        
        # Parse the JSON from the text response.
        import json
        clean_text = text_response.replace('```json', '').replace('```', '').strip()
        durations = json.loads(clean_text)

        return jsonify(durations)

    except Exception as e:
        print(f"API Error: {e}")
        return jsonify(DEFAULT_DURATIONS)

if __name__ == '__main__':
    app.run(debug=True)