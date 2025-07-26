from flask import Blueprint, request, jsonify
from utils.bullet_improver import improve_bullets

improve_bp = Blueprint('improve', __name__)

@improve_bp.route('/improve-bullets', methods=['POST'])
def improve_bullet_points():
    data = request.json
    bullets = data.get('bullets', [])

    if not bullets or not isinstance(bullets, list):
        return jsonify({'error': 'Invalid bullet list'}), 400

    suggestions = improve_bullets(bullets)
    return jsonify({'results': suggestions}), 200
