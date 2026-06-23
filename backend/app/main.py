from fastapi import FastAPI
from app.routes import ingredients, recipes, images, auth
from app.db.database import engine, Base
from app.config import settings

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title=f"{settings.APP_NAME} Backend")

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(ingredients.router, prefix="/ingredients", tags=["Ingredients"])
app.include_router(recipes.router, prefix="/recipes", tags=["Recipes"])
app.include_router(images.router, prefix="/images", tags=["Images"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])

@app.get("/")
def read_root():
    return {"message": f"Welcome to {settings.APP_NAME} API"}
