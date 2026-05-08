import logging
import os
import time
import uuid

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from api.db import has_supabase
from api.routers import listings, score, benefits, trends

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
logger = logging.getLogger("shakuf")

app = FastAPI(
    title="Rental Scout API",
    description="Israeli rental affordability API — deal scores, listing search, government benefits",
    version="0.1.0",
)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.getenv("ALLOWED_ORIGINS", "https://shakuf.vercel.app,http://localhost:3000").split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_methods=["GET"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    rid = str(uuid.uuid4())[:8]
    t0 = time.monotonic()
    response = await call_next(request)
    ms = int((time.monotonic() - t0) * 1000)
    logger.info(
        "[%s] %s %s params=%s → %s (%dms)",
        rid, request.method, request.url.path,
        dict(request.query_params), response.status_code, ms,
    )
    return response


app.include_router(listings.router, prefix="/api")
app.include_router(score.router, prefix="/api")
app.include_router(benefits.router, prefix="/api")
app.include_router(trends.router, prefix="/api")


@app.get("/health")
def health():
    data_source = "supabase" if has_supabase() else "json_files"
    return {"status": "ok", "data_source": data_source}
