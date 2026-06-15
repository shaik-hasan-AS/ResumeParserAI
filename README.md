# MyAIProfile (ResumeParserAI)

![MyAIProfile](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-blue)

MyAIProfile is an advanced AI-powered Applicant Tracking System (ATS) simulator and resume parsing platform. It helps candidates optimize their resumes by accurately parsing data (even from images using OCR) and leveraging Google's Gemini AI to provide actionable, strict ATS-level feedback tailored to specific job roles.

## ✨ Features

- **Google OAuth Integration:** Secure and seamless user authentication.
- **Advanced Resume Parsing:** Robust parsing of PDF, DOCX, and image-based resumes.
- **Built-in OCR Engine:** Uses Tesseract OCR to accurately read text from scanned PDFs and image-based resumes.
- **AI-Powered ATS Scoring & Dashboard:** Visual ATS score analytics dashboard powered by `gemini-2.5-flash`.
- **Actionable Insights:** Detailed Action Plan, Keyword Match Rates, and "Before & After" bullet point rewrites.
- **AI Mock Interview Generator:** Get 5-7 tailored technical and behavioral interview questions based on your resume.
- **AI Cover Letter Generator:** Generate a professional, tailored cover letter in one click and export it as a PDF.
- **Live PDF Preview:** Real-time side-by-side preview of your resume PDF as you edit contact details.
- **Resume Builder & PDF Export:** Export optimized resumes in 'Modern', 'Harvard', and 'Executive' templates.
- **Responsive & Modern UI:** Next.js, Tailwind CSS v4, and Shadcn UI — full dark/light mode support.
- **Database Migrations:** Alembic-powered schema migrations for safe production database updates.
- **Docker Support:** Boot the entire stack (Backend, Frontend, PostgreSQL) with a single command.

---

## 🐳 Quick Start with Docker

The fastest way to run the full stack locally. No need to install Python, Node.js, or PostgreSQL separately.

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed and running.

```bash
# 1. Clone the repository
git clone https://github.com/shaik-hasan-AS/ResumeParserAI.git
cd ResumeParserAI

# 2. Set up your environment variables
cp backend/.env.example backend/.env
# Edit backend/.env and add your GEMINI_API_KEY

# 3. Boot the entire stack
docker compose up --build
```

The app will be available at:
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000
- **API Docs:** http://localhost:8000/docs

> **Note:** On the first run, Docker will build images and download dependencies. This takes ~3-5 minutes. Subsequent starts are instant.

---


## 🏗️ Architecture

The project is split into a separated frontend and backend architecture:

- **`/frontend`**: Next.js 15 application (App Router) styled with Tailwind CSS. Deployed on Vercel.
- **`/backend`**: Python FastAPI application using SQLModel/SQLite for database management. Deployed on Railway.

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18+)
- Python (3.11+)
- Tesseract OCR installed on your system (for local backend development)
  - Ubuntu/Debian: `sudo apt-get install tesseract-ocr tesseract-ocr-eng`
  - macOS: `brew install tesseract`

### 1. Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables. Create a `.env` file in the `backend` folder:
   ```env
   GEMINI_API_KEY=your_gemini_api_key
   SECRET_KEY=your_jwt_secret_key
   ALGORITHM=HS256
   ACCESS_TOKEN_EXPIRE_MINUTES=30
   GOOGLE_CLIENT_ID=your_google_client_id
   DATABASE_URL=sqlite:///./sqlite.db
   ```
5. Run the server:
   ```bash
   uvicorn main:app --reload --port 8000
   ```

### 2. Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create a `.env.local` file in the `frontend` folder:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_client_id
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📦 Deployment

### Backend (Railway)
The backend is configured to be deployed on Railway. It utilizes the root `Aptfile` and `nixpacks.toml` (or the included Dockerfile) to ensure that `tesseract-ocr` system dependencies are installed in the production environment. Set your root directory to `/backend` or configure the deployment command to run from the root.

### Frontend (Vercel)
The frontend is optimized for deployment on Vercel. Connect your repository to Vercel, set the Root Directory to `frontend`, and ensure the `NEXT_PUBLIC_API_URL` environment variable points to your production Railway backend URL.

---

## 🗺️ Roadmap & Future Features

Here are some upcoming features and architectural improvements planned for VinentoAI:

- **Full DOCX Support:** Implement robust `.docx` parsing utilizing `python-docx` to compliment the existing PDF/Image support.
- **Dedicated Cover Letter UI:** The backend currently supports AI cover letter generation (`generate_cover_letter`). A dedicated frontend builder will be added to export ATS-optimized cover letters.
- **Asynchronous Task Queue (Celery/Redis):** Migrate the blocking OCR/NLP tasks from simple threadpools to a dedicated Celery worker queue to prevent HTTP timeouts on massive, image-heavy PDFs.
- **Database Migrations:** Integrate `Alembic` to handle SQLAlchemy database schema migrations safely in production.
- **LinkedIn Profile Import:** Allow users to instantly generate a base resume by scraping their public LinkedIn profile URL.

---

## 🛠️ Tech Stack

**Frontend:**
- Next.js 15 (React 19)
- Tailwind CSS v4
- Lucide React (Icons)
- Shadcn UI (Components)
- Framer Motion (Animations)
- React PDF Renderer (Resume Export)

**Backend:**
- Python 3.11
- FastAPI
- PyMuPDF (`fitz`), `pdfplumber`, `pdfminer.six` - PDF processing
- Pytesseract - OCR Engine
- spaCy - NLP Processing
- Google GenAI SDK (`gemini-2.5-flash`) - AI Parsing & Feedback
- SQLModel / SQLite & PostgreSQL - Database
