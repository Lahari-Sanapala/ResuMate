# 💼 ResuMate - AI-Powered Resume Enhancer

ResuMate is an AI-driven resume analysis and enhancement tool designed to improve the quality and relevance of your resume. It provides bullet point suggestions, LinkedIn summaries, and keyword matching against job descriptions to help job seekers optimize their resumes for better opportunities.

---

## 🚀 Features

✅ **Resume Bullet Point Improvements**  
- Click any bullet to get AI-generated improvements  
- Apply or ignore suggestions  
- See detailed feedback for each point

✅ **LinkedIn Summary Generator**  
- One-click generation of a professional LinkedIn "About Me" section  
- Tailored to your resume's content

✅ **Keyword Matching**  
- Paste a job description  
- Identify missing keywords in your resume  
- Improve chances of passing ATS (Applicant Tracking Systems)

✅ **Download Enhanced Resume**  
- All applied suggestions are saved  
- Download a clean PDF of your updated resume with improved content

---

## 🛠️ Tech Stack

| Frontend | Backend | AI | Other |
|----------|---------|----|-------|
| React.js | Flask   | OpenAI GPT | ReportLab (PDF generation)|

---


## 🧑‍💻 Folder Structure

ResuMate/
│
├── backend/ # Flask Backend
│ ├── app.py # App runner
│ ├── requirements.txt
│ ├── routes/
│ │ ├── improve.py
│ │ ├── summary.py
│ │ ├── keyword_matcher.py
│ │ ├── download.py
│ │ └── upload.py
│ └── utils/
│ ├── bullet_improver.py
│ ├── summary_generator.py
│ ├── keyword_matcher.py
│ └── structured_extractor.py
│
├── frontend/ # React Frontend
│ ├── public/
│ └── src/
│ ├── App.js
│ ├── App.css
│ ├── index.js
│ └── components/
│ ├── FileUpload.js
│ └── ReviewPage.js
│
└── README.md

