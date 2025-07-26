from flask import Blueprint, request, jsonify
from utils.keyword_matcher import match_keywords

matcher_bp = Blueprint('matcher', __name__)

@matcher_bp.route('/match-keywords', methods=['POST'])
def match_keywords_route():
    data = request.json
    structured = data.get('structured', {})
    jd = data.get('jd', '')

    if not structured or not jd:
        return jsonify({'error': 'Missing structured data or job description'}), 400

    try:
        missing_keywords = match_keywords(structured, jd)
        return jsonify({'missing': missing_keywords})
    except Exception as e:
        return jsonify({'error': str(e)}), 500
