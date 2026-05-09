from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes.policies import router as policies_router
from routes.chat import router as chat_router
from routes.timeline import router as timeline_router
from routes.brewing import router as brewing_router

app = FastAPI(title="BillMe API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(policies_router, prefix="/api")
app.include_router(chat_router, prefix="/api")
app.include_router(timeline_router, prefix="/api")
app.include_router(brewing_router, prefix="/api")


@app.get("/api/health")
async def health():
    return {"status": "ok", "service": "BillMe API"}
