from flask import Blueprint, request, send_file
from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import simpleSplit
import io

download_bp = Blueprint('download', __name__)

@download_bp.route('/download-resume', methods=['POST'])
def download_resume():
    data = request.json
    resume_data = data.get('resume', {})
    modifications = data.get('modifications', [])

    mod_map = {item['original'].strip(): item['improved'].strip() for item in modifications}

    buffer = io.BytesIO()
    p = canvas.Canvas(buffer, pagesize=letter)
    width, height = letter
    y_position = height - 50

    def draw_text(text, indent=70, style="normal"):
        nonlocal y_position
        lines = simpleSplit(text, "Helvetica", 10, width - indent - 20)
        for line in lines:
            if y_position < 50:
                p.showPage()
                y_position = height - 50
            if style == "bold":
                p.setFont("Helvetica-Bold", 10)
            elif style == "italic":
                p.setFont("Helvetica-Oblique", 10)
            else:
                p.setFont("Helvetica", 10)
            p.drawString(indent, y_position, line)
            y_position -= 15

    def process_content(content, indent=70):
        nonlocal y_position

        if isinstance(content, str):
            text = content.strip()
            draw_text(f"• {text}", indent)
            # If modified version exists, show it below
            improved = mod_map.get(text)
            if improved and improved != text:
                draw_text(f"  ↳ Improved: {improved}", indent + 20, style="italic")

        elif isinstance(content, list):
            for item in content:
                process_content(item, indent)

        elif isinstance(content, dict):
            for key, value in content.items():
                if y_position < 60:
                    p.showPage()
                    y_position = height - 50
                p.setFont("Helvetica-Bold", 11)
                p.drawString(indent, y_position, key)
                y_position -= 18
                process_content(value, indent + 20)
                y_position -= 5

    # 🔄 Main resume content
    for section, content in resume_data.items():
        if y_position < 100:
            p.showPage()
            y_position = height - 50

        p.setFont("Helvetica-Bold", 14)
        p.drawString(50, y_position, section.upper())
        y_position -= 25

        process_content(content)
        y_position -= 15

    p.save()
    buffer.seek(0)

    return send_file(
        buffer,
        as_attachment=True,
        download_name='modified_resume.pdf',
        mimetype='application/pdf'
    )
