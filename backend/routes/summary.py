from flask import Blueprint, request, jsonify
from utils.summary_generator import generate_linkedin_summary

summary_bp = Blueprint('summary', __name__)

@summary_bp.route('/generate-linkedin-summary', methods=['POST'])
def linkedin_summary_route():
    data = request.get_json()
    structured = data.get("structured", {})
    linkedin_summary = generate_linkedin_summary(structured)
    return jsonify({"linkedin_summary": linkedin_summary})
