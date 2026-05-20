from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import analyze
import uvicorn, os
from dotenv import load_dotenv

load_dotenv()
app = FastAPI(title="PrepWise Python Service", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(analyze.router, prefix="/analyze")

@app.get("/health")
def health():
    return {"status": "ok", "service": "py-service"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=int(os.getenv("PORT", 8000)), reload=True)
