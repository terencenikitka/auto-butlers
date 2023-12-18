"""remove date from 

Revision ID: 1cf282b9c706
Revises: 
Create Date: 2023-12-13 10:30:24.829609

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1cf282b9c706'
down_revision = None
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('strengths',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('against', sa.String(length=255), nullable=True),
    sa.Column('modificator', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('users',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('login', sa.String(length=255), nullable=True),
    sa.Column('password', sa.String(length=255), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id'),
    sa.UniqueConstraint('login')
    )
    op.create_table('weaknesses',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('against', sa.String(length=255), nullable=True),
    sa.Column('modificator', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('creatures',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('cost', sa.Integer(), nullable=True),
    sa.Column('attack', sa.Integer(), nullable=True),
    sa.Column('health', sa.Integer(), nullable=True),
    sa.Column('class_', sa.String(length=255), nullable=True),
    sa.Column('weakness_id', sa.Integer(), nullable=True),
    sa.Column('strength_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['strength_id'], ['strengths.id'], name=op.f('fk_creatures_strength_id_strengths')),
    sa.ForeignKeyConstraint(['weakness_id'], ['weaknesses.id'], name=op.f('fk_creatures_weakness_id_weaknesses')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('decks',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=255), nullable=True),
    sa.Column('user_id', sa.Integer(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['user_id'], ['users.id'], name=op.f('fk_decks_user_id_users')),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('decks_creatures',
    sa.Column('id', sa.Integer(), autoincrement=True, nullable=False),
    sa.Column('deck_id', sa.Integer(), nullable=False),
    sa.Column('creature_id', sa.Integer(), nullable=False),
    sa.ForeignKeyConstraint(['creature_id'], ['creatures.id'], name=op.f('fk_decks_creatures_creature_id_creatures')),
    sa.ForeignKeyConstraint(['deck_id'], ['decks.id'], name=op.f('fk_decks_creatures_deck_id_decks')),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('decks_creatures')
    op.drop_table('decks')
    op.drop_table('creatures')
    op.drop_table('weaknesses')
    op.drop_table('users')
    op.drop_table('strengths')
    # ### end Alembic commands ###
