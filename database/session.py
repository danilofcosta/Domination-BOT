from sqlalchemy.orm import sessionmaker
from .connection import engine

SessionLocal = sessionmaker(bind=engine)

def get_session():
    return SessionLocal()
