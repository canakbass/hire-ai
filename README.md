# HireAI - Autonomous AI Recruiter & ATS

HireAI is a next-generation Applicant Tracking System (ATS) powered by Google Gemini 1.5 Flash. It autonomously screens CVs, evaluates candidates against strict job rubrics, and enforces bias protection (Blind Assessment) to ensure fair and purely merit-based hiring.

Built natively on the modern Next.js App Router and Supabase, it features a 100% serverless architecture designed for zero maintenance and infinite scalability on Vercel.

---

## ✨ Key Features

- **🤖 Autonomous AI Screening:** Gemini 1.5 Flash instantly parses and scores uploaded CVs against the specific Job Rubric.
- **🛡️ Bias Protection (Blind Assessment):** AI is strictly prompted to ignore demographic details (name, age, gender, ethnicity) and evaluate solely on skills and experience.
- **⚡ 100% Serverless Architecture:** No Docker, no n8n, no complex background workers. The entire AI orchestration runs natively within Next.js API routes on Vercel.
- **🏢 Multi-Tenant (B2B Ready):** Secure row-level security (RLS) ensures data isolation across different organizations.
- **リアル Time Updates:** Real-time Supabase channels push live AI analysis updates to the recruiter dashboard without page reloads.

---

## 🏗️ Architecture

- **Frontend:** Next.js 14 (App Router), React, Tailwind CSS, shadcn/ui.
- **Backend/API:** Next.js Serverless Route Handlers (`app/api/webhooks/cv-analyze/route.ts`).
- **Database & Storage:** Supabase (PostgreSQL, pg_net, Supabase Storage).
- **AI Engine:** Google Gemini (`@google/generative-ai`).

---

## 🚀 Quick Setup & Deployment

The beauty of HireAI is its simplicity. You can deploy this entire AI system in minutes.

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Run the SQL migrations found in `supabase/migrations/` in your Supabase SQL Editor.
3. Configure the `app_config` table:
   - Run: `UPDATE app_config SET value = 'https://YOUR_VERCEL_APP.vercel.app/api/webhooks/cv-analyze' WHERE key = 'n8n_webhook_url';`
   - Set `n8n_webhook_secret` to a secure random string (e.g., `whsec_hireai_secure_secret`).

### 2. Environment Variables
Create a `.env.local` file (for local development) or set these in your Vercel Project Settings:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# AI & Webhooks
GEMINI_API_KEY=your-gemini-api-key
N8N_WEBHOOK_SECRET=the-secret-string-you-put-in-app_config
```

### 3. Deploy to Vercel
1. Push this repository to GitHub.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Paste the Environment Variables.
4. Click **Deploy**. 

That's it! Your AI recruiter is now alive 24/7. 

---

## 🛠️ How it Works (The Workflow)

1. **Candidate Applies:** Candidate uploads their CV via the Next.js Career Portal.
2. **Supabase Storage:** CV is securely uploaded to the `cv-files` bucket.
3. **Database Trigger:** Supabase `pg_net` trigger detects the new CV and fires a secure webhook to your Vercel API.
4. **Serverless AI (Next.js):**
   - The `/api/webhooks/cv-analyze` route receives the trigger.
   - It validates the webhook secret.
   - Downloads the PDF CV directly into memory.
   - Prompts Gemini 1.5 Flash with the CV and the strict Job Rubric.
5. **Score & Verdict:** The AI responds with a structured JSON score (Strengths, Gaps, Match Score, Verdict).
6. **Dashboard:** The Recruiter Dashboard instantly updates via Supabase Realtime to show the analyzed candidate.

---

## 👨‍💻 Local Development

If you want to run the project locally on your machine:

```bash
# 1. Install dependencies
npm install

# 2. Run the development server
npm run dev
```

Visit `http://localhost:3000` to see the app. For the webhook to work locally, you can use ngrok or Cloudflare Tunnels to expose your `localhost:3000` to the internet, and update the `app_config` webhook URL accordingly.

---

## 📄 License
MIT License
