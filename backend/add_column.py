from sqlalchemy import text
from app.db.database import engine

def add_column():
    with engine.connect() as conn:
        conn.execute(text("ALTER TABLE recipes ADD COLUMN IF NOT EXISTS image_url VARCHAR"))
        conn.commit()
        print("Column image_url added to recipes table.")

if __name__ == "__main__":
    add_column()
