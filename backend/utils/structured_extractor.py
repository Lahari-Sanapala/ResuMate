import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

# Use the OpenAI client from v1+
client = OpenAI(api_key=OPENAI_API_KEY)

def extract_structured_resume(text):
    prompt = f"""
You are an intelligent resume parser.

Your job is to analyze the following resume content and return a structured JSON of its contents.

Instructions:
- Detect all section headings dynamically (e.g., SUMMARY, EDUCATION, SKILLS, AREA OF INTEREST, etc.).
- If a section has subheadings (like project titles, institutions), group bullets under them.
- If no subheadings exist, use "" as the subheading.
- Each section must include bullet points that end in full stops.
- STRICTLY PRESERVE the order of sections exactly as they appear in the resume. Do not rearrange them.
- Output the JSON sections in the same sequence as their original order in the resume text.


Return ONLY the JSON object — no explanation, no code blocks.

Resume:
\"\"\"{text}\"\"\"
"""

    try:
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",  # or gpt-4 if available
            messages=[
                {"role": "system", "content": "You are a helpful resume parsing assistant. Ensure that the output JSON strictly preserves the order of sections as they appear in the resume."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.2,
            max_tokens=2048
        )

        content = response.choices[0].message.content.strip()

        try:
            structured_json = json.loads(content)
        except json.JSONDecodeError:
            structured_json = {
                "error": "Failed to parse JSON from OpenAI response.",
                "raw_response": content
            }

    except Exception as e:
        structured_json = {
            "error": f"OpenAI API Error: {str(e)}"
        }

    return structured_json
