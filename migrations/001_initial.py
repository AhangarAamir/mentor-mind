# /mentormind-backend/migrations/001_initial.py
"""Peewee migration: 001_initial.py

Some examples (model - class or model name)::

    > Model = migrator.orm['model_name']            # get model from storage
    > Model.create_table()                          # create table
    > Model.drop_table(if_exists=True)              # drop table
    > Model.rename_table('new_name')                # rename table
    > Model.create_index('fields', unique=True)     # create index
    > Model.drop_index('fields')                    # drop index
    > migrator.execute_sql('SQL')                   # execute SQL query
    > migrator.rename_column('table', 'old', 'new') # rename column
    > migrator.add_column('table', 'column', 'INT') # add column
    > migrator.drop_column('table', 'column')       # drop column
    > migrator.add_not_null('table', 'column')      # add not null constraint
    > migrator.drop_not_null('table', 'column')     # drop not null constraint
    > migrator.add_default('table', 'column', 0)    # add default value
    > migrator.drop_default('table', 'column')      # drop default value

"""

import datetime as dt
import peewee as pw
from peewee_migrate import Migrator

def migrate(migrator: Migrator, database: pw.Database, fake=False, **kwargs):
    """Write your migrations here."""
    # This is a placeholder for the initial migration.
    # The tables are created by the main application on startup,
    # but this file establishes a migration baseline.
    pass

def rollback(migrator: Migrator, database: pw.Database, fake=False, **kwargs):
    """Write your rollback migrations here."""
    pass
