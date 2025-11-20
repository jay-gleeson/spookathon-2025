import os
import json
import google.generativeai as genai
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from google.generativeai.types import GenerationConfig

# Flask app setup. Connect frontend to backend with CORS.
app = Flask(__name__)
CORS(app)

# Default Pomodoro durations in minutes.
DEFAULT_DURATIONS = {
    "focus_duration": 25,
    "break_duration": 5,
    "long_break_duration": 15
}

genai.configure(api_key=os.getenv('GEMINI_API_KEY')) # Configure the API key in a .env file.
model = genai.GenerativeModel('gemini-1.5-flash')

# Durations endpoint.
@app.route('/api/durations', methods=['POST'])

# API Function to handle POST requests for durations calculation.
def get_durations():

    data = request.get_json()

    try:
        session_length = int(data.get('session_length', 1))
        exam_distance = int(data.get('exam_distance', 1))
    except (TypeError, ValueError):
        return jsonify({"error": "session_length and exam_distance must be integers."}), 400
    
    # Construct prompt for the AI model.
    system_instruction = "You are an API that calculates Pomodoro durations. Your ONLY response MUST be a valid JSON object with integer values for focus_duration, break_duration, and long_break_duration."
    prompt = (
        f"{system_instruction} Calculate the optimal Pomodoro durations in minutes for a study session of {session_length} hours "
        f"with an exam in {exam_distance} days."
    )

    # Call the Generative AI model.
    try:
        response = model.generate_content(
            prompt,
            generation_config=GenerationConfig( 
                max_output_tokens=2048, # Token limit, default is 2048.
                temperature=0.1, # Low temperature for more consistent output.
            ),
        )

        # Parse the model's response.
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

                # Validate that all required fields are present.
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
    
@app.route('/')
def serve_index():
    return send_from_directory('', 'index.html')

@app.route('/<path:path>')
def serve_static(path):
    return send_from_directory('', path)

if __name__ == '__main__':
    app.run(debug=True)