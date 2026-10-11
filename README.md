# Virtual HR - AI Interview Preparation Platform

Virtual HR is a full-stack MERN application that helps candidates prepare for jobs using AI-powered resume analysis, mock interviews, voice/video interview simulation, resume building, and progress tracking.

The project is built as a multi-service application:

- React + Vite frontend for the user interface.
- Node.js + Express backend for authentication, APIs, AI orchestration, and database operations.
- MongoDB for storing users, resume feedback history, and interview history.
- Google Gemini AI for resume analysis, interview question generation, interview evaluation, and video/body-language feedback.
- Optional Python Flask AI service for frame/video emotion analysis experiments.

## Project Goal

The main goal of this project is to simulate a real HR interview preparation environment. A user can register, verify their email, upload a resume, receive ATS-style feedback, practice interviews in chat/voice/video mode, and track improvement over time.

In an interview, you can explain the project like this:

> Virtual HR is an AI-driven interview preparation platform. It allows users to upload resumes, get ATS feedback, build resumes, take mock interviews through chat, voice, or video, and then view performance trends. The backend uses Express and MongoDB, while Gemini AI generates resume insights and adaptive interview questions. The video interview flow also captures frames and full recordings to analyze confidence and body language.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- Tailwind CSS
- Axios
- PDF.js for extracting text from uploaded PDF resumes
- html2pdf.js for downloading generated resumes
- Recharts for progress graphs
- Framer Motion for animations
- Browser Web Speech APIs for voice recognition and text-to-speech
- MediaRecorder and getUserMedia APIs for video interview recording

### Backend

- Node.js
- Express 5
- MongoDB with Mongoose
- JWT authentication
- Cookie-based and bearer-token authentication
- bcrypt for password hashing
- Nodemailer for OTP emails
- Passport Google OAuth
- Multer for video upload handling
- Google Generative AI SDK for Gemini

### Python AI Service

- Flask
- Flask-CORS
- Google Generative AI
- OpenCV
- FER emotion recognition

## Folder Structure

```text
Virtual-Hr/
  client/                 React frontend
    src/
      Pages/              Main application pages
      components/         Landing page and UI components
      context/            Auth/user context
      config/             API URL config
      services/           Axios API helper
      utils/              PDF extraction helper

  server/                 Express backend
    app.js                Backend entry point
    router/               Route definitions
    controller/           Request handlers
    models/               Mongoose schemas
    middleware/           Auth middleware
    services/             Gemini client helpers
    utils/                JWT, OTP, mail utilities
    config/               Database and Passport config

  python_ai/              Optional Flask AI service
    app.py                Frame/video emotion analysis service
```

## Main Features

### 1. Authentication

The project supports normal email/password authentication and Google OAuth.

Email/password flow:

1. User signs up with name, email, and password.
2. Backend hashes the password using bcrypt.
3. Backend generates a 6-digit OTP.
4. OTP is sent through Nodemailer.
5. User verifies OTP.
6. User logs in.
7. Backend creates a JWT and sends it in both response body and HTTP-only cookie.
8. Frontend stores the token in localStorage and also sends cookies using `withCredentials`.

Important files:

- `server/controller/authController.js`
- `server/router/authRoutes.js`
- `server/models/userModel.js`
- `server/middleware/auth.js`
- `client/src/context/AppContext.jsx`
- `client/src/apiClient.js`

### 2. Resume Upload and ATS Feedback

The user uploads a PDF resume. The frontend extracts text from the PDF using PDF.js, then sends that text to the backend.

Flow:

1. User uploads a PDF from `ResumeUpload`.
2. `extractTextFromPdf` reads all PDF pages and extracts text.
3. Frontend sends resume text to `POST /resume/feedback`.
4. Backend checks the latest resume feedback for that user.
5. Backend sends the resume text and previous context to Gemini.
6. Gemini returns a structured JSON response.
7. Backend saves the analysis in MongoDB.
8. Frontend displays ATS score, strengths, weaknesses, suggestions, extracted skills, and summary.

Important files:

- `client/src/Pages/ResumeUpload.jsx`
- `client/src/utils/pdf.js`
- `server/controller/resumeFeedbackController.js`
- `server/models/resumeModel.js`
- `server/router/resumeValidate.js`

Gemini response structure:

```json
{
  "ATS Score": 85,
  "Strengths": ["Good project descriptions"],
  "Weaknesses": ["Missing measurable impact"],
  "Suggestions": ["Add quantified achievements"],
  "Extracted Skills": ["React", "Node.js", "MongoDB"],
  "Summary": "Short professional summary"
}
```

### 3. Resume Builder

The resume builder is a frontend-only feature that lets users enter personal details, education, experience, projects, and skills. It supports multiple templates and exports the final resume as a PDF.

Important file:

- `client/src/Pages/ResumeBuilder.jsx`

Key logic:

- Uses React state to manage resume sections.
- Uses template selection to render different resume designs.
- Uses `html2pdf.js` to generate a downloadable PDF.

### 4. Chat Interview

The chat interview mode allows the user to upload a resume and answer AI-generated questions in text form.

Flow:

1. User uploads a resume PDF.
2. Frontend extracts resume text.
3. User starts interview.
4. Backend creates a Gemini chat session and stores it in an in-memory `Map`.
5. Gemini asks one question at a time based on the resume.
6. User replies.
7. Gemini adapts next questions based on previous answers.
8. When enough questions are asked, Gemini returns `[END_INTERVIEW]` with JSON evaluation.
9. Backend parses the JSON and stores final interview analysis in MongoDB.

Important files:

- `client/src/Pages/ChatPage.jsx`
- `server/controller/interviewController.js`
- `server/models/interviewModel.js`

### 5. Voice Interview

Voice interview adds browser speech recognition and text-to-speech to the normal interview flow.

Flow:

1. AI question is spoken using `SpeechSynthesisUtterance`.
2. User clicks microphone.
3. Browser SpeechRecognition converts speech to text.
4. Text is sent to backend as the answer.
5. AI response is displayed and spoken.

Important file:

- `client/src/Pages/VoiceInterviewPage.jsx`

Browser requirement:

- Chrome or Edge is recommended because SpeechRecognition support is browser-dependent.

### 6. Video Interview

Video interview simulates a live interview experience with camera, microphone, speech recognition, frame capture, and final video analysis.

Flow:

1. User uploads resume.
2. Browser requests camera and microphone access.
3. Frontend starts video stream and MediaRecorder.
4. AI asks a question using text-to-speech.
5. User speaks the answer.
6. During the answer, the frontend captures up to 3 image frames.
7. Text answer and frames are sent to Gemini through the backend.
8. Gemini uses both answer text and images to generate the next response.
9. When interview ends, frontend uploads recorded video.
10. Backend uploads video to Gemini File Manager.
11. Gemini analyzes confidence, emotion, and eye contact.
12. Backend saves body-language feedback in MongoDB.

Important files:

- `client/src/Pages/VideoInterviewPage.jsx`
- `server/controller/interviewController.js`
- `server/router/interviewRoutes.js`

### 7. Progress Tracker

The progress tracker displays resume and interview score trends.

Flow:

1. Frontend calls `GET /resume/history`.
2. Frontend calls `GET /api/interview/history`.
3. Data is rendered using Recharts line charts.
4. User can see improvement across multiple resume analyses and interviews.

Important file:

- `client/src/Pages/ProgressTracker.jsx`

## Backend API Endpoints

### Auth Routes

Base path: `/auth`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/register` | Register user and send verification OTP |
| POST | `/verify-otp` | Verify email OTP |
| POST | `/login` | Login and receive JWT |
| POST | `/logout` | Clear auth cookie |
| GET | `/google` | Start Google OAuth |
| GET | `/google/callback` | Google OAuth callback |
| POST | `/forgot/request` | Send password reset OTP |
| POST | `/forgot/reset` | Reset password using OTP |
| GET | `/me` | Get logged-in user |

### Resume Routes

Base path: `/resume`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/feedback` | Analyze resume and save feedback |
| GET | `/history` | Get user's resume feedback history |

### Interview Routes

Base path: `/api/interview`

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/start` | Start mock interview from resume text |
| POST | `/reply` | Continue interview with user's answer |
| POST | `/analyze-video` | Upload and analyze final interview video |
| GET | `/history` | Get user's interview history |

## Database Models

### User

Stores authentication and verification information.

Fields:

- `name`
- `email`
- `password`
- `googleId`
- `isVerified`
- `otp`
- `otpExpiry`
- timestamps

### ResumeAnalysis

Stores every resume analysis result.

Fields:

- `userId`
- `resumeText`
- `score`
- `strengths`
- `weaknesses`
- `suggestions`
- `extractedSkills`
- `summary`
- timestamps

### InterviewAnalysis

Stores completed interview reports.

Fields:

- `userId`
- `resumeText`
- `conversationHistory`
- `score`
- `strengths`
- `weaknesses`
- `improvementsFromLast`
- `bodyLanguage.score`
- `bodyLanguage.feedback`
- timestamps

## Environment Variables

Create a `.env` file inside `server/`.

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
GEMINI_API_KEY=your_gemini_api_key
EMAIL_USER=your_gmail_address
EMAIL_PASS=your_gmail_app_password
CLIENT_URL=http://localhost:5173
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:5000/auth/google/callback
NODE_ENV=development
```

Create a `.env` file inside `client/` if you want to override the backend URL.

```env
VITE_API_URL=http://localhost:5000
```

For `python_ai/`, set:

```env
GEMINI_API_KEY=your_gemini_api_key
```

## How to Run Locally

### 1. Install backend dependencies

```bash
cd server
npm install
```

### 2. Start backend

```bash
npm run dev
```

Backend runs on:

```text
http://localhost:5000
```

### 3. Install frontend dependencies

```bash
cd client
npm install
```

### 4. Start frontend

```bash
npm run dev
```

Frontend runs on:

```text
http://localhost:5173
```

### 5. Optional Python AI service

```bash
cd python_ai
pip install -r requirements.txt
python app.py
```

Python service runs on:

```text
http://localhost:5001
```

Note: `python_ai/requirements.txt` is currently empty in this repository. If using this service, add packages such as Flask, flask-cors, google-generativeai, opencv-python, numpy, and fer.

## Important Implementation Details

### Why JWT is used

JWT allows stateless authentication. After login, the backend signs a token with the user's id and email. Protected routes verify the token before allowing access.

### Why both cookies and localStorage are used

The backend sends an HTTP-only cookie for browser requests, and also returns the token in JSON. The frontend stores the token in localStorage and attaches it as a bearer token. This makes the app flexible across same-site cookie auth and API token auth.

### How protected routes work on frontend

`ProtectedRoute` checks `isLoggedIn` and `userData` from React context. If the user is not logged in, they are redirected to `/login`.

### How protected routes work on backend

The `auth` middleware reads the token from either:

- `req.cookies.token`
- `Authorization: Bearer <token>`

Then it verifies the JWT and attaches the decoded user to `req.user`.

### How Gemini is used

Gemini is used for:

- ATS resume scoring
- Resume strengths and weaknesses
- Interview question generation
- Adaptive follow-up questions
- Final interview evaluation
- Body language and confidence analysis from video

### How AI response reliability is improved

For resume analysis, the backend uses Gemini's structured response configuration with `responseMimeType: "application/json"` and `responseSchema`. This reduces the chance of invalid AI output.

For interview completion, the backend asks Gemini to return a special marker:

```text
[END_INTERVIEW]
```

Then it parses the JSON evaluation that follows.

## Interview Explanation: End-to-End User Journey

You can explain the complete user journey like this:

1. A new user creates an account.
2. The backend hashes the password and sends an OTP to the user's email.
3. After OTP verification, the user logs in.
4. The backend returns a JWT token and sets an auth cookie.
5. The frontend stores login state in React context.
6. The user uploads a resume PDF.
7. The frontend extracts text from the PDF using PDF.js.
8. The text is sent to the backend.
9. The backend sends it to Gemini for ATS analysis.
10. Gemini returns structured feedback.
11. The result is saved in MongoDB.
12. The user can start an interview based on the same resume.
13. Gemini asks adaptive questions one by one.
14. In video mode, camera frames and full recording are also analyzed.
15. At the end, the interview report is saved.
16. The progress dashboard fetches historical scores and displays improvement trends.

## Architecture Explanation

This project follows a layered architecture:

- The frontend handles user interaction, PDF extraction, browser APIs, and visual feedback.
- The backend handles authentication, authorization, database operations, AI prompts, and API responses.
- MongoDB stores persistent user and analysis data.
- Gemini handles intelligent evaluation and natural-language generation.
- The optional Python service is separated because computer vision and frame-level emotion analysis often require Python ML libraries.

This separation is useful because it keeps responsibilities clean. The frontend does not directly call Gemini, so API keys remain protected on the server.

## Security Points

Security features:

- Passwords are hashed with bcrypt.
- JWT is signed using `JWT_SECRET`.
- Protected APIs use auth middleware.
- Auth cookie is HTTP-only.
- Production cookies use `secure: true` and `sameSite: "none"` for HTTPS deployments.
- CORS is restricted to configured frontend URLs.
- Gemini API key stays on backend, not frontend.

Areas to improve:

- OTPs are stored as plain text; they could be hashed before saving.
- Add rate limiting for login and OTP endpoints.
- Add password strength validation.
- Add request-size and file-type validation for video uploads.
- Move active interview sessions from in-memory `Map` to Redis for scalable deployments.

## Known Issues and Improvement Areas

- `server/controller/ResumeValidatcontroller.js` appears to be an older unused controller and contains a duplicate `const model` declaration. The active route imports `resumeFeedbackController.js`, so the app uses the correct controller.
- `python_ai/requirements.txt` is empty even though `app.py` imports Flask, OpenCV, NumPy, FER, and Google Generative AI.
- Active interview sessions are stored in memory, so sessions are lost when the server restarts.
- The frontend has both `src/apiClient.js` and `src/services/api.js` with similar Axios setup. This can be consolidated.
- There are no automated tests currently.
- Video uploads are stored temporarily in `uploads/`; production should use safer cleanup and storage policies.

## Strengths of This Project

- Full-stack implementation with real user authentication.
- AI integration is not superficial; it powers resume analysis, adaptive interviews, and body-language review.
- Resume and interview history allow real progress tracking.
- Uses browser-native APIs for voice and video interaction.
- Uses structured AI outputs for more reliable parsing.
- Clean separation between frontend, backend, database, and optional Python AI service.
- Practical product idea with real-world use case for students and job seekers.

## Possible Interview Questions and Answers

### 1. What problem does this project solve?

It helps job seekers prepare for interviews by combining resume feedback, mock interviews, voice/video simulation, and progress tracking in one platform.

### 2. Why did you choose the MERN stack?

MERN allows fast full-stack development using JavaScript across frontend and backend. React is good for interactive UI, Express is lightweight for APIs, and MongoDB is flexible for storing user profiles, resume analysis, and interview reports.

### 3. How does authentication work?

Users can register with email and password. The password is hashed using bcrypt, an OTP is sent for verification, and after login the backend creates a JWT. Protected APIs verify this token using middleware.

### 4. How is email verification implemented?

When a user registers, the backend generates a 6-digit OTP and expiry time. The OTP is sent using Nodemailer. During verification, the backend checks whether the OTP matches and has not expired, then marks the user as verified.

### 5. How does Google OAuth work in this project?

Passport Google OAuth redirects the user to Google login. After successful login, the callback checks whether the email already exists. If not, it creates a verified user. Then it signs a JWT and redirects the user back to the frontend.

### 6. How does the frontend know if the user is logged in?

`AppProvider` calls `/auth/me` when the app loads. If the request succeeds, it stores user data in React context and sets `isLoggedIn` to true.

### 7. How does resume analysis work?

The frontend extracts text from the uploaded PDF using PDF.js. The backend sends this text to Gemini with an ATS-analysis prompt and expects structured JSON containing score, strengths, weaknesses, suggestions, skills, and summary.

### 8. Why extract PDF text on frontend instead of uploading the file to backend?

It simplifies backend file handling for resume analysis. The backend only receives plain text, which is easier to send to Gemini and avoids storing unnecessary resume files.

### 9. How is interview flow managed?

When an interview starts, the backend creates a Gemini chat session and stores it in an in-memory `Map` keyed by user id. Each user reply is sent to the same chat session so Gemini has conversation context.

### 10. How does the AI know when to end the interview?

The system instruction tells Gemini to ask around 5 to 7 questions and then return a special `[END_INTERVIEW]` marker followed by JSON evaluation. The backend detects that marker, parses the JSON, saves the report, and ends the session.

### 11. How does video interview analysis work?

The browser records video using MediaRecorder. After the interview ends, the frontend uploads the video to the backend. The backend uploads it to Gemini File Manager, waits for processing, asks Gemini to analyze confidence and body language, then stores the result.

### 12. How are real-time frames used in video interviews?

While the user answers, the frontend captures a few frames from the webcam canvas. These base64 images are sent along with the text answer so Gemini can consider facial expression and body language while generating the next question.

### 13. What is the role of MongoDB?

MongoDB stores users, resume analysis history, and interview analysis history. This allows users to view progress over time.

### 14. How does the progress tracker work?

It fetches resume history and interview history from the backend and displays score trends using Recharts line charts.

### 15. What challenges did you face?

Main challenges include getting AI to return valid JSON, handling browser speech APIs, managing video recording and upload, and keeping interview state consistent across multiple turns.

### 16. How did you make AI responses easier to parse?

For resume feedback, the backend uses Gemini's JSON response schema. For interview evaluation, the prompt forces Gemini to return a specific marker and JSON block.

### 17. Why is the Gemini API called from the backend?

Calling Gemini from the backend protects the API key and allows the server to validate requests, add user context, save responses, and control prompts.

### 18. What would happen if the server restarts during an interview?

Currently, the active interview session would be lost because sessions are stored in memory. A production improvement would be to store session state in Redis or persist conversation context in MongoDB.

### 19. What are the main security risks and fixes?

Risks include plain OTP storage, lack of rate limiting, and large file uploads. Fixes include hashing OTPs, adding rate limits, validating file size/type, and adding stricter input validation.

### 20. How would you scale this project?

I would move chat sessions to Redis, store uploaded media in cloud storage, add a job queue for video analysis, add caching where needed, and deploy frontend/backend separately with environment-based configuration.

### 21. What is the difference between chat, voice, and video interview modes?

Chat mode uses typed answers. Voice mode uses speech recognition and text-to-speech. Video mode adds camera recording, frame capture, and body-language analysis.

### 22. Why use bcrypt?

bcrypt hashes passwords with salt, making it much harder to recover original passwords even if the database is leaked.

### 23. Why use Mongoose?

Mongoose provides schemas, validation, model methods, and easier querying for MongoDB documents.

### 24. How does CORS work here?

The backend allows requests only from configured frontend origins like local Vite URL and deployed frontend URL. It also enables credentials so cookies can be sent.

### 25. What are your future enhancements?

Future enhancements include role-specific interview templates, admin dashboard, better analytics, downloadable reports, Redis-based session storage, automated tests, better video scoring, and more resume templates.

## Short Interview Pitch

Virtual HR is an AI-powered job preparation platform. I built it using React, Node.js, Express, MongoDB, and Gemini AI. Users can sign up with OTP verification, upload resumes for ATS feedback, build resumes, practice mock interviews through chat, voice, or video, and track improvement over time. The backend protects routes using JWT, stores analysis history in MongoDB, and uses Gemini to generate structured feedback and adaptive interview questions.

## Longer Interview Pitch

Virtual HR is a full-stack MERN application designed to help candidates prepare for interviews in a realistic way. The application has authentication with OTP verification and Google OAuth. After login, users can upload a resume PDF. The frontend extracts the text using PDF.js and sends it to the backend, where Gemini AI analyzes it and returns ATS score, strengths, weaknesses, suggestions, extracted skills, and a summary.

The interview module uses Gemini chat sessions to ask resume-based questions one by one. The system adapts based on the user's answers and produces a final evaluation with strengths, weaknesses, score, and improvement notes. I also implemented voice and video interview modes using browser APIs. Voice mode uses speech recognition and text-to-speech. Video mode records the candidate, captures frames during answers, and sends the final recording to Gemini for body-language and confidence feedback.

All resume and interview reports are saved in MongoDB, and the progress dashboard visualizes improvement trends using Recharts. This makes the project more than a simple chatbot because it has persistent analytics, multimodal interview simulation, and real user flows.

## What To Emphasize In Interviews

- This is a real end-to-end product, not only a UI demo.
- You handled auth, AI integration, file parsing, database history, and browser media APIs.
- You used structured AI output to reduce parsing errors.
- You understand the limitations and can clearly explain production improvements.
- You can explain each feature through user flow, frontend logic, backend API, database storage, and AI role.

## Suggested Demo Flow

1. Open the home page.
2. Sign up and verify OTP.
3. Log in.
4. Upload resume for ATS feedback.
5. Show score, strengths, weaknesses, and suggestions.
6. Start a chat interview.
7. Answer a few questions.
8. Show final interview report.
9. Open progress tracker and show history charts.
10. If permissions work, demonstrate voice or video interview.

