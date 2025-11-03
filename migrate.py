#!/usr/bin/env python
# /mentormind-backend/migrate.py
import os
from peewee_migrate import Router
from app.db.base import database

# Set the migrations directory
MIGRATIONS_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'migrations')

if __name__ == "__main__":
    router = Router(database, migrate_dir=MIGRATIONS_DIR)
    
    # Run the migration router
    router.run()
