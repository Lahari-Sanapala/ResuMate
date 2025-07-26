from flask import Blueprint, request, jsonify
import os
import fitz  # PyMuPDF
from utils.structured_extractor import extract_structured_resume

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume']
    os.makedirs('static', exist_ok=True)
    filepath = os.path.join("static", file.filename)
    file.save(filepath)

    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    print("\n📝 Extracted Resume Text:\n", text)

    try:
        structured_json = extract_structured_resume(text)
        print("\n✅ Structured JSON Returned:\n", structured_json)
        return jsonify({'structured': structured_json}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
from flask import Blueprint, request, jsonify
import os
import fitz  # PyMuPDF
from utils.structured_extractor import extract_structured_resume

upload_bp = Blueprint('upload', __name__)

@upload_bp.route('/upload', methods=['POST'])
def upload_resume():
    if 'resume' not in request.files:
        return jsonify({'error': 'No file uploaded'}), 400

    file = request.files['resume']
    os.makedirs('static', exist_ok=True)
    filepath = os.path.join("static", file.filename)
    file.save(filepath)

    doc = fitz.open(filepath)
    text = ""
    for page in doc:
        text += page.get_text()
    doc.close()

    print("\n📝 Extracted Resume Text:\n", text)

    try:
        structured_json = extract_structured_resume(text)
        print("\n✅ Structured JSON Returned:\n", structured_json)
        return jsonify({'structured': structured_json}), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    finally:
        if os.path.exists(filepath):
            os.remove(filepath)
