import json
from openai import OpenAI
import os
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def generate_linkedin_summary(structured):
    prompt = f"""
You are a professional resume assistant.

Based on the provided structured resume data, generate a compelling and professional 'About' section suitable for a LinkedIn profile.

Guidelines:
- Focus on strengths, interests, and aspirations.
- Highlight experience and technical proficiencies naturally.
- Use a conversational yet professional tone.
- Limit to 3-5 concise, well-formed sentences.
- Do NOT copy content directly from the resume summary.
- Do NOT format the output as JSON or code.

Resume JSON:
{json.dumps(structured, indent=2)}
"""

    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.5,
        max_tokens=300
    )

    return response.choices[0].message.content.strip()
