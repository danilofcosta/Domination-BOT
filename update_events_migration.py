"""update_tipo_evento_enum_manual

Revision ID: manual_update_events
Revises: 746b3e8d9014
Create Date: 2025-09-12 23:55:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'manual_update_events'
down_revision: Union[str, Sequence[str], None] = '746b3e8d9014'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    # Atualizar os tipos de evento na tabela e_eventos
    op.execute("""
        UPDATE e_eventos 
        SET cod = 'DIAS_DOS_NAMORADOS' 
        WHERE cod = 'VALENTINA'
    """)
    
    # Adicionar novos tipos de evento se não existirem
    op.execute("""
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
    """)


def downgrade() -> None:
    """Downgrade schema."""
    # Reverter para os valores antigos se necessário
    op.execute("""
        UPDATE e_eventos 
        SET cod = 'VALENTINA' 
        WHERE cod = 'DIAS_DOS_NAMORADOS'
    """)
