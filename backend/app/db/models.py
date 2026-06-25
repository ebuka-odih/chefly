from sqlalchemy import Column, String, DateTime, ForeignKey, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.sql import func
from app.db.database import Base
import uuid

# Use real JSONB on Postgres (the production DB), but fall back to generic JSON
# on SQLite so the app can also boot for local development / tests.
JSONBType = JSONB().with_variant(JSON(), "sqlite")


class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    email = Column(String, unique=True, index=True)
    password_hash = Column(String)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class AuthOtp(Base):
    __tablename__ = "auth_otps"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True)
    code_hash = Column(String)
    expires_at = Column(DateTime(timezone=True))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class IngredientSnapshot(Base):
    __tablename__ = "ingredient_snapshots"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ingredients = Column(JSONBType)
    image_url = Column(String, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class Recipe(Base):
    __tablename__ = "recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String)
    description = Column(String)
    image_url = Column(String, nullable=True)
    payload = Column(JSONBType)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserSavedRecipe(Base):
    __tablename__ = "user_saved_recipes"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    recipe_id = Column(UUID(as_uuid=True), ForeignKey("recipes.id"))
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class UserHistory(Base):
    __tablename__ = "user_history"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    ingredients = Column(JSONBType)
    recipe = Column(JSONBType)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
