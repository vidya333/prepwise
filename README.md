# PrepWise — AI Interview Prep Platform

> Drop any PDF or topic. Get questions, roadmap, mindmap, MCQs, tasks, keywords, and web refs — instantly.

Built with **MERN + TypeScript + Python + Go ** · Deployed on Vercel 

## Stack

| Service | Tech | Deploy |
|---|---|---|
| `client/` | React + TypeScript + Vite + Tailwind | Vercel (free) |
| `server/` | Node + Express + TypeScript + MongoDB | Render (free) |
| `py-service/` | Python + FastAPI + PyMuPDF + Groq AI | Render (free) |
| `go-service/` | Go + Gin MCQ engine | Render (free) |

## Quick start

```bash
cd client && npm install && npm run dev        # :5173
cd server && npm install && npm run dev        # :4000
cd py-service && pip install -r requirements.txt && uvicorn main:app --reload  # :8000
cd go-service && go run main.go               # :9000
```

## Free deployment
1. MongoDB Atlas free M0 cluster
2. Render for server + py-service + go-service
3. Vercel for client

MIT License — free for all students
