from sqlalchemy.ext.asyncio import (
    create_async_engine,
    AsyncEngine,
)
from sqlalchemy.engine import URL
from dotenv import load_dotenv
import os
import re
import ssl

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

# DATABASE_URL = URL.create(
#     drivername="postgresql+asyncpg",
#     username=DB_USER,
#     password=DB_PASSWORD,
#     host=DB_HOST,
#     port=final_port,
#     database=DB_NAME,
# )


# engine: AsyncEngine = create_async_engine(
#     DATABASE_URL,
#     echo=False,
#     pool_size=10,
#     max_overflow=20,
# )][]
DATABASE_URL = os.getenv("DATABASE_URL")


database_url = re.sub(r"^postgresql:", "postgresql+asyncpg:", DATABASE_URL)

database_url = re.sub(r"[?&](sslmode|channel_binding)=[^&]+", "", database_url)

ssl_context = ssl.create_default_context()

engine = create_async_engine(
    database_url,
    echo=False,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True
    connect_args={"ssl": ssl_context}
)
