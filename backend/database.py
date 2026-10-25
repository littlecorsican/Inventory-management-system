import os
from sqlalchemy import create_engine, inspect, text
from sqlalchemy.orm import sessionmaker, declarative_base
from setting.config import Config

os.makedirs(Config.dataDir, exist_ok=True)

SQLALCHEMY_DATABASE_URL = f"sqlite:///{Config.databasePath}"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def migrate():
    """Create tables and add any columns that were introduced after the DB was first created.

    create_all() only creates missing tables, so older inventory.db files need the new
    columns added by hand. This keeps existing data without needing Alembic.
    """
    Base.metadata.create_all(bind=engine)

    inspector = inspect(engine)
    with engine.begin() as conn:
        for table in Base.metadata.sorted_tables:
            existing = {c["name"] for c in inspector.get_columns(table.name)}
            for column in table.columns:
                if column.name not in existing:
                    col_type = column.type.compile(dialect=engine.dialect)
                    conn.execute(text(f'ALTER TABLE {table.name} ADD COLUMN "{column.name}" {col_type}'))

        # Normalise Windows-style image paths saved by older versions ("media\\abc.png")
        for table in ("items", "containers"):
            conn.execute(text(f"UPDATE {table} SET image_path = REPLACE(image_path, '\\', '/') WHERE image_path LIKE '%\\%'"))
            conn.execute(text(f"UPDATE {table} SET image_path = NULL WHERE image_path = ''"))
        conn.execute(text("UPDATE items SET quantity = 1 WHERE quantity IS NULL"))
