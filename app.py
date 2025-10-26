
import os
import google.generativeai as genai
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

genai.configure(api_key=os.getenv('GEMINI_API_KEY'))
model = genai.GenerativeModel('gemini-2.5-flash')

@app.route('/api/durations', methods=['POST'])
def get_durations():
    data = request.json
    session_length = int(data.get('session_length', 1))
    exam_distance = int(data.get('exam_distance', 1))

    prompt = (
        f"Create a study schedule for a student who has {session_length} hour(s) available for pomodoro study sessions, "
        f"with an exam in {exam_distance} day(s). "
        "Provide recommended durations in minutes for: focus sessions, short breaks, and long breaks. "
        "Respond only with a JSON object containing focus_duration, break_duration, and long_break_duration as numbers."
    )

    try:
        response = model.generate_content(
            prompt,
            generation_config=genai.types.GenerationConfig(
                max_output_tokens=150,
                temperature=0.1,
                candidate_count=1,
            ),
            safety_settings=[
                {"category": "HARM_CATEGORY_HARASSMENT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_HATE_SPEECH", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_SEXUALLY_EXPLICIT", "threshold": "BLOCK_NONE"},
                {"category": "HARM_CATEGORY_DANGEROUS_CONTENT", "threshold": "BLOCK_NONE"},
            ]
        )

        if not response.text:
            default_durations = {
                "focus_duration": 25,
                "break_duration": 5,
                "long_break_duration": 15
            }
            return jsonify(default_durations)

        import json
        import re
        content = response.text
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            durations = json.loads(match.group(0))
        else:
            durations = json.loads(content)
        return jsonify(durations)
    except Exception as e:
        default_durations = {
            "focus_duration": 25,
            "break_duration": 5,
            "long_break_duration": 15
        }
        return jsonify(default_durations)

if __name__ == '__main__':
    app.run(port=5000, debug=True)
