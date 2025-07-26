import os
import json
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
client = OpenAI(api_key=OPENAI_API_KEY)

def improve_bullets(bullets):
    improved = []

    for bullet in bullets:
        prompt = f"""
You are an expert resume writing assistant.

Please evaluate the following resume bullet point:

"{bullet}"

Your tasks:
1. Suggest an improved version of the bullet point if necessary.
2. If the original is already strong and clear, you may return it as-is.
3. Provide a short sentence of feedback explaining your reasoning.
4. Provide a score (1 to 10) for:
   - Clarity
   - Impact
   - Conciseness

Return the result in JSON format like this:
{{
  "suggested": "<your suggestion>",
  "feedback": "<short explanation>",
  "scores": {{
    "clarity": <1-10>,
    "impact": <1-10>,
    "conciseness": <1-10>
  }}
}}

Only return the JSON. No markdown, code blocks, or explanation.
"""
        try:
            response = client.chat.completions.create(
                model="gpt-3.5-turbo",
                messages=[{"role": "user", "content": prompt}],
                temperature=0.3,
                max_tokens=300
            )

            raw = response.choices[0].message.content.strip()

            # Default fallback values
            feedback = "No feedback available."
            scores = {
                "clarity": "-",
                "impact": "-",
                "conciseness": "-"
            }

            try:
                parsed = json.loads(raw)
                feedback = parsed.get("feedback", feedback)
                scores = parsed.get("scores", scores)
                suggestion = parsed.get("suggested", bullet)  # fallback to original
            except json.JSONDecodeError:
                suggestion = raw  # treat raw as the suggestion if parsing fails

            improved.append({
                "original": bullet,
                "suggested": suggestion,
                "feedback": feedback,
                "scores": scores
            })

        except Exception as e:
            improved.append({
                "original": bullet,
                "suggested": bullet,
                "feedback": f"⚠️ OpenAI API error: {str(e)}",
                "scores": {
                    "clarity": "-",
                    "impact": "-",
                    "conciseness": "-"
                }
            })

    return improved
