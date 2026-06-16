"""add quick scans tables

Revision ID: 7d5bc95c40b4
Revises: 66601a500e3d
Create Date: 2026-06-16 22:27:21.856288

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '7d5bc95c40b4'
down_revision: Union[str, Sequence[str], None] = '66601a500e3d'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""
    op.create_table('quick_scans',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('recruiter_id', sa.String(), nullable=True),
    sa.Column('title', sa.String(), nullable=True),
    sa.Column('description', sa.Text(), nullable=True),
    sa.Column('keywords', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['recruiter_id'], ['users.id'], ),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('quick_scan_results',
    sa.Column('id', sa.String(), nullable=False),
    sa.Column('scan_id', sa.String(), nullable=True),
    sa.Column('resume_id', sa.String(), nullable=True),
    sa.Column('match_score', sa.Integer(), nullable=True),
    sa.Column('match_summary', sa.Text(), nullable=True),
    sa.Column('created_at', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['resume_id'], ['resumes.id'], ),
    sa.ForeignKeyConstraint(['scan_id'], ['quick_scans.id'], ),
    sa.PrimaryKeyConstraint('id')
    )


def downgrade() -> None:
    """Downgrade schema."""
    op.drop_table('quick_scan_results')
    op.drop_table('quick_scans')
