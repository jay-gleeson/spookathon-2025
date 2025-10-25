
import os
import openai
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

@app.route('/api/durations', methods=['POST'])
def get_durations():
    data = request.json
    session_length = int(data.get('session_length', 1))
    exam_distance = int(data.get('exam_distance', 1))

    prompt = (
        f"A student has {session_length} hour(s) to study using pomodoro cycles, "
        f"and their exam is in {exam_distance} day(s). "
        "Suggest appropriate durations (in minutes) for focus sessions, short breaks, and long breaks. "
        "Return the answer as a JSON object with keys: focus_duration, break_duration, long_break_duration."
    )

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a helpful assistant for study planning."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=100,
            temperature=0.2,
        )

        import json
        import re
        content = response.choices[0].message.content
        match = re.search(r'\{.*\}', content, re.DOTALL)
        if match:
            durations = json.loads(match.group(0))
        else:
            durations = json.loads(content)
        return jsonify(durations)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(port=5000, debug=True)
