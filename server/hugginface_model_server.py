from flask import Flask, request, jsonify
from transformers import pipeline

app = Flask(__name__)
# Load the Flan-T5 model
model = pipeline("text2text-generation", model="google/flan-t5-large")

@app.route('/getAdvice', methods=['POST'])
def get_advice():
    data = request.get_json()
    age = data.get("age", 12)  # Default age 12
    name = data.get("name", "Gurpinder")  # Default name Gurpinder
    behavior = data.get("behavior", "smoking")  # Default behavior smoking

    input_text = (
        f"As a health advisor, please provide three specific health tips for "
        f"{name}, a {age}-year-old who is currently smoking. "
        "Focus on diet, exercise, and stress management."
    )

    # Generate advice using Flan-T5
    advice = model(input_text, max_length=150, do_sample=True, temperature=0.5, top_k=40, top_p=0.85)[0]["generated_text"]
    
    return jsonify({"advice": advice})

if __name__ == "__main__":
    app.run(port=5001)
