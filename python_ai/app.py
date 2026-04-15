from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import google.generativeai as genai

app = Flask(__name__)
CORS(app)

# Replace with logic fetching from env vars securely
API_KEY = os.environ.get("GEMINI_API_KEY", "YOUR_GEMINI_KEY")
genai.configure(api_key=API_KEY)

@app.route('/analyze-video', methods=['POST'])
def analyze_video():
    """
    This endpoint serves as your Python Interview Brain.
    Currently it uses Gemini to process the video for emotions.
    You can replace the contents of this function with your custom
    OpenCV + PyTorch/TensorFlow emotion detection logic later!
    """
    if 'video' not in request.files:
        return jsonify({"error": "No video file part"}), 400
        
    file = request.files['video']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400

    # Save temp video
    temp_path = f"temp_{file.filename}"
    file.save(temp_path)

    try:
        # 1. Upload video to Gemini server (or pass to your custom model)
        video_file = genai.upload_file(path=temp_path)
        
        # 2. Setup the Interview Brain AI
        model = genai.GenerativeModel(model_name="gemini-1.5-flash")
        
        # 3. Prompt the model to act as the visual Interview Brain
        prompt = """
        You are an advanced HR Emotion & Body Language Analyzer.
        Watch the candidate's interview responses.
        Identify their primary emotion, confidence level, and eye contact.
        Reply ONLY with valid JSON in this exact format:
        {
          "score": <number 0-100 indicating visual confidence>,
          "feedback": "<detailed string analyzing body language and emotions>"
        }
        """
        
        response = model.generate_content([video_file, prompt])
        
        # Cleanup Gemini remote file
        genai.delete_file(video_file.name)
        
        # Cleanup local file
        os.remove(temp_path)
        
        # Return parsed JSON back to Node.js
        output = response.text.strip().replace("```json", "").replace("```", "")
        import json
        return jsonify(json.parse(output))

    except Exception as e:
        if os.path.exists(temp_path):
            os.remove(temp_path)
        return jsonify({"error": str(e), "score": 50, "feedback": "Could not analyze body language due to an error."}), 500

if __name__ == '__main__':
    # Run Python AI Server on port 5001
    print("🚀 Python AI Brain starting on port 5001")
    app.run(host='0.0.0.0', port=5001, debug=True)
