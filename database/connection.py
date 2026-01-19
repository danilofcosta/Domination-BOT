from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncEngine,
)
from sqlalchemy.engine import URL
from dotenv import load_dotenv
import os

load_dotenv()

# Captura as variáveis
DB_HOST = os.getenv("POSTGRES_HOST")
DB_PORT = os.getenv("POSTGRES_PORT")
DB_USER = os.getenv("POSTGRES_USER")
DB_PASSWORD = os.getenv("POSTGRES_PASSWORD")
DB_NAME = os.getenv("POSTGRES_DATABASE")

if not DB_PORT or str(DB_PORT).lower() == "none":
    final_port = None
else:
    try:
        final_port = int(DB_PORT)
    except ValueError:
        final_port = None

DATABASE_URL = URL.create(
    drivername="postgresql+asyncpg",
    username=DB_USER,
    password=DB_PASSWORD,
    host=DB_HOST,
    port=final_port,
    database=DB_NAME,
)

engine: AsyncEngine = create_async_engine(
    DATABASE_URL,
    echo=False,
    pool_size=10,
    max_overflow=20,
)