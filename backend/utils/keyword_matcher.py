import os
import re
import json
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))


def match_keywords(structured, jd_text):
    prompt = f"""
You are an intelligent resume keyword matching assistant.

Your task is to:
1. Extract only the **most important technical skills, tools, frameworks, and programming languages** from the Job Description (JD).
2. Match these extracted keywords against the user's resume, which is provided in structured JSON format.
3. For each keyword, determine whether it is **clearly present or semantically covered** in **any of these resume sections**:
   - Skills
   - Projects
   - Experience
   - Certifications
   - Education (if technical courses/tools are mentioned)

Matching Guidelines:
- Match **semantically**, not just by spelling. For example:
   - React == React.js
   - Google Cloud Platform == GCP
   - scikit learn == scikit-learn
   - Python3 == Python
- Consider abbreviations, casing differences, spelling variations, and common short forms.
- A keyword is **considered covered** if it's present in any relevant context in the sections above.
- **Do not consider** soft skills like communication, collaboration, problem-solving, or vague phrases like “optimize performance” or “work with backend”.
- Do **not** include job titles or responsibilities like "Frontend Developer" or "team player".
- Return only technical keywords/tools that are **missing** or **very weakly represented**.

Output Instructions:
- Return a plain, valid JSON array.
- DO NOT wrap the output in markdown formatting or code blocks.
- Example: ["React.js", "Redux", "Webpack", "Docker"]

Resume JSON:
{json.dumps(structured, indent=2)}

Job Description:
\"\"\"{jd_text}\"\"\"
"""


    response = client.chat.completions.create(
        model="gpt-3.5-turbo",
        messages=[{"role": "user", "content": prompt}],
        temperature=0.3,
        max_tokens=400
    )

    raw = response.choices[0].message.content.strip()

    # Clean output: remove markdown-style code block if present
    cleaned = re.sub(r"^```(?:json)?|```$", "", raw).strip()

    try:
        keywords = json.loads(cleaned)
    except json.JSONDecodeError:
        keywords = ["Could not parse keyword list.", raw]

    return keywords
