from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.db import has_supabase
from api.routers import listings, score, benefits, trends

app = FastAPI(
    title="Rental Scout API",
    description="Israeli rental affordability API — deal scores, listing search, government benefits",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["GET"],
    allow_headers=["*"],
)

app.include_router(listings.router, prefix="/api")
app.include_router(score.router, prefix="/api")
app.include_router(benefits.router, prefix="/api")
app.include_router(trends.router, prefix="/api")


@app.get("/health")
def health():
    data_source = "supabase" if has_supabase() else "json_files"
    return {"status": "ok", "data_source": data_source}
