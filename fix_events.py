import asyncio
from DB.database import Session
from sqlalchemy import text

async def fix_events():
    async with Session() as session:
        # Atualizar VALENTINA para DIAS_DOS_NAMORADOS
        await session.execute(text("UPDATE e_eventos SET cod = 'DIAS_DOS_NAMORADOS' WHERE cod = 'VALENTINA'"))
        
        # Adicionar novos eventos se não existirem
        await session.execute(text("""
            INSERT INTO e_eventos (cod, nome_traduzido, emoji, descricao) 
            VALUES 
                ('SEM_EVENTO', 'Sem Evento', '📅', 'Personagem sem evento especial'),
                ('HALLOWEEN', 'Halloween', '🎃', 'Evento de Halloween'),
                ('PRIMAVERA', 'Primavera', '🌸', 'Evento de Primavera'),
                ('VERAO', 'Verão', '☀️', 'Evento de Verão'),
                ('INVERNO', 'Inverno', '❄️', 'Evento de Inverno'),
                ('OUTONO', 'Outono', '🍂', 'Evento de Outono'),
                ('ANO_NOVO', 'Ano Novo', '🎊', 'Evento de Ano Novo'),
                ('NATAL', 'Natal', '🎄', 'Evento de Natal'),
                ('DIAS_DOS_NAMORADOS', 'Dia dos Namorados', '💕', 'Evento de Dia dos Namorados'),
                ('INFANTIL', 'Infantil', '🧸', 'Evento Infantil'),
                ('PASCOA', 'Páscoa', '🐰', 'Evento de Páscoa'),
                ('CARNAVAL', 'Carnaval', '🎭', 'Evento de Carnaval'),
                ('EMPREGADA', 'Empregada', '👗', 'Evento de Empregada'),
                ('ANJO', 'Anjo', '👼', 'Evento de Anjo'),
                ('ESPORTE', 'Esporte', '⚽', 'Evento Esportivo'),
                ('KIMONO', 'Kimono', '👘', 'Evento de Kimono'),
                ('GALA', 'Gala', '👑', 'Evento de Gala'),
                ('GALA_MASCULINA', 'Gala Masculina', '🤵', 'Evento de Gala Masculina'),
                ('ANO_NOVO_LUNAR', 'Ano Novo Lunar', '🐉', 'Evento de Ano Novo Lunar'),
                ('ENFERMEIRA', 'Enfermeira', '👩‍⚕️', 'Evento de Enfermeira'),
                ('ESCOLA', 'Escola', '🎓', 'Evento Escolar'),
                ('GAME', 'Game', '🎮', 'Evento de Game')
            ON CONFLICT (cod) DO NOTHING
        """))
        
        await session.commit()
        print("✅ Eventos atualizados com sucesso!")

if __name__ == "__main__":
    asyncio.run(fix_events())
