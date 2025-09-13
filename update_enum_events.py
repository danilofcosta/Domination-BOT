import asyncio
from DB.database import Session
from sqlalchemy import text

async def update_enum_events():
    async with Session() as session:
        # Primeiro, adicionar os novos valores ao enum
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'SEM_EVENTO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'HALLOWEEN';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'PRIMAVERA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'VERAO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'INVERNO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'OUTONO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ANO_NOVO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'NATAL';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'DIAS_DOS_NAMORADOS';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'INFANTIL';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'PASCOA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'CARNAVAL';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'EMPREGADA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ANJO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ESPORTE';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'KIMONO';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'GALA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'GALA_MASCULINA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ANO_NOVO_LUNAR';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ENFERMEIRA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'ESCOLA';
        """))
        
        await session.execute(text("""
            ALTER TYPE tipoevento ADD VALUE IF NOT EXISTS 'GAME';
        """))
        
        await session.commit()
        print("✅ Enum tipoevento atualizado com sucesso!")

if __name__ == "__main__":
    asyncio.run(update_enum_events())
