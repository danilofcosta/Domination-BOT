import asyncio
from DB.database import DATABASE
from DB.models import Evento_Midia
from sqlalchemy import select

async def check_events():
    stmt = select(Evento_Midia)
    eventos = await DATABASE.get_info_all(stmt)
    print('Eventos atuais no banco:')
    for evento in eventos:
        print(f'- {evento.cod.value}: {evento.nome_traduzido}')

if __name__ == "__main__":
    asyncio.run(check_events())
