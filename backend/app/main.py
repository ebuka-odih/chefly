import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy import text

from app.config import settings
from app.db.database import engine, Base
from app.routes import ingredients, recipes, images, auth, history

# Create tables on startup. Guarded so a transient DB hiccup doesn't crash boot
# (the /health probe will report the real DB status either way).
try:
    Base.metadata.create_all(bind=engine)
except Exception as e:  # noqa: BLE001
    print(f"[startup] Could not create tables yet: {e}")

app = FastAPI(title=f"{settings.APP_NAME} API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve generated dish/step images.
STATIC_DIR = os.path.join(os.path.dirname(__file__), "static")
os.makedirs(os.path.join(STATIC_DIR, "images"), exist_ok=True)
app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

app.include_router(ingredients.router, prefix="/ingredients", tags=["Ingredients"])
app.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(history.router, prefix="/history", tags=["History"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])


@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME} API", "docs": "/docs"}


@app.get("/health")
def health():
    """Liveness + dependency check used by Docker/Dokploy."""
    db_ok = True
    try:
        with engine.connect() as conn:
            conn.execute(text("SELECT 1"))
    except Exception as e:  # noqa: BLE001
        print(f"[health] DB check failed: {e}")
        db_ok = False

    return {
        "status": "ok" if db_ok else "degraded",
        "app": settings.APP_NAME,
        "database": "ok" if db_ok else "unavailable",
        "ai_configured": settings.ai_enabled,
    }
