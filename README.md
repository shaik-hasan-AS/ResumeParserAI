# ResumeIQ (ResumeParserAI)

![ResumeIQ](https://img.shields.io/badge/Status-Active-brightgreen)
![Next.js](https://img.shields.io/badge/Frontend-Next.js-black?logo=next.js)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?logo=fastapi)
![Gemini](https://img.shields.io/badge/AI-Gemini_2.5_Flash-blue)

ResumeIQ is an advanced AI-powered Applicant Tracking System (ATS) simulator and resume parsing platform. It helps candidates optimize their resumes by accurately parsing data (even from images using OCR) and leveraging Google's Gemini AI to provide actionable, strict ATS-level feedback tailored to specific job roles.

## ✨ Features

- **Google OAuth Integration:** Secure and seamless user authentication.
- **Advanced Resume Parsing:** Upload resumes in PDF or Image formats.
- **Built-in OCR Engine:** Uses Tesseract OCR to accurately read text from scanned PDFs and image-based resumes.
- **AI-Powered ATS Scoring:** Simulates a strict ATS and recruiter review process using `gemini-2.5-flash`.
- **Actionable Insights:** Get a detailed Action Plan, including Keyword Match Rates and "Before & After" rewrites for weak bullet points.
- **Responsive & Modern UI:** Built with Next.js, Tailwind CSS, and Shadcn UI components for a premium user experience.

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
   # Add other required variables as needed
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

## 🛠️ Tech Stack

**Frontend:**
- Next.js (React)
- Tailwind CSS
- Lucide React (Icons)
- Shadcn UI (Components)

**Backend:**
- Python 3.11
- FastAPI
- PyMuPDF (`fitz`) - PDF processing
- Pytesseract - OCR Engine
- Google GenAI SDK (`gemini-2.5-flash`) - AI Parsing & Feedback
- SQLModel / SQLite - Database
