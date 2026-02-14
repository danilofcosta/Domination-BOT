import os, asyncio
from sqlalchemy import text

from database.connection import engine


async def test_connection():
    async with engine.connect() as conn:
        result = await conn.execute(text("SELECT 1"))
        print("DB OK ->", result.scalar())


async def list_databases():
    async with engine.connect() as conn:
        result = await conn.execute(
            text("SELECT datname FROM pg_database WHERE datistemplate = false;")
        )
        databases = result.scalars().all()
        print("Databases:", databases)
        return databases
from sqlalchemy import text

async def create_database(db_name: str):
    async with engine.connect() as conn:
        conn = await conn.execution_options(
            isolation_level="AUTOCOMMIT"
        )

        await conn.execute(text(f'CREATE DATABASE "{db_name}"'))
        print(f"Database '{db_name}' criada com sucesso")

from sqlalchemy import text

async def drop_database(db_name: str):
    async with engine.connect() as conn:
        conn = await conn.execution_options(
            isolation_level="AUTOCOMMIT"
        )

        # Encerra conexões ativas
        await conn.execute(text("""
            SELECT pg_terminate_backend(pid)
            FROM pg_stat_activity
            WHERE datname = :db_name
              AND pid <> pg_backend_pid();
        """), {"db_name": db_name})

        # Drop database
        await conn.execute(
            text(f'DROP DATABASE IF EXISTS "{db_name}"')
        )

        print(f"Database '{db_name}' apagada com sucesso")
