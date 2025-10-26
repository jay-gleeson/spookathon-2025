import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS
from google.generativeai.types import GenerationConfig

app = Flask(__name__)
CORS(app)

DEFAULT_DURATIONS = {
    "focus_duration": 25,
    "break_duration": 5,
    "long_break_duration": 15
}

genai.configure(api_key=os.getenv('GEMINI_API_KEY')) # Configure the API key in a .env file.
model = genai.GenerativeModel('gemini-2.5-pro')

@app.route('/api/durations', methods=['POST'])
def get_durations():
    data = request.json
    try:
        session_length = int(data.get('session_length', 1))
        exam_distance = int(data.get('exam_distance', 1))
    except (TypeError, ValueError):
        return jsonify({"error": "session_length and exam_distance must be integers."}), 400
    
    system_instruction = "You are an API that calculates Pomodoro durations. Your ONLY response MUST be a valid JSON object with integer values for focus_duration, break_duration, and long_break_duration."
    
    prompt = (
        f"{system_instruction} Calculate the optimal Pomodoro durations in minutes for a study session of {session_length} hours "
        f"with an exam in {exam_distance} days."
    )

    response = None 
    
    try:
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig( 
                max_output_tokens=2048, # Token limit, default is 2048.
                temperature=0.1, # Low temperature for more consistent output.
            ),
        )

        if response.text:
            raw_text = response.text.strip()

            # Remove code block markers if present.
            if raw_text.startswith('```'):
                first_newline = raw_text.find('\n')
                if first_newline != -1:
                    raw_text = raw_text[first_newline + 1:].strip()
                
                if raw_text.endswith('```'):
                    raw_text = raw_text[:-3].strip()

            try:
                durations = json.loads(raw_text)

                if all(key in durations for key in ['focus_duration', 'break_duration', 'long_break_duration']):
                    return jsonify(durations)
                else:
                    # If AI response is missing required fields, use defaults.
                    return jsonify(DEFAULT_DURATIONS)
            except json.JSONDecodeError:
                # If JSON parsing fails, use defaults.
                return jsonify(DEFAULT_DURATIONS)
        
        else:
            # If model returns an empty response, use defaults.
            return jsonify(DEFAULT_DURATIONS)

    except Exception as e:
        # If any API call error occurs, use default durations.
        return jsonify(DEFAULT_DURATIONS)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
