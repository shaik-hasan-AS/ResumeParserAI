"""
One-time database reset script.
Drops ALL tables and recreates them with the latest schema.
Run this ONCE on Railway, then you can delete this file.

Usage:
  python reset_db.py
"""
from app.database import engine, Base
from app.models import models  # noqa: F401 — ensures all models are registered

print("⚠️  Dropping all tables...")
Base.metadata.drop_all(bind=engine)
print("✅  All tables dropped.")

print("🔨  Recreating tables with latest schema...")
Base.metadata.create_all(bind=engine)
print("✅  All tables recreated. You're good to go!")
