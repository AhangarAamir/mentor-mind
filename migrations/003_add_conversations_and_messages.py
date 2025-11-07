import datetime
from peewee import *
from app.db.base import database
from app.db.models import User, Conversation # Import actual models

def migrate(migrator, database, **kwargs):
    @migrator.create_table
    class Conversation(Model):
        id = AutoField()
        student = ForeignKeyField(
            User,
            backref='conversations',
            on_delete='CASCADE'
        )
        created_at = DateTimeField(default=datetime.datetime.now)
        updated_at = DateTimeField(default=datetime.datetime.now)

        class Meta:
            database = database

    @migrator.create_table
    class Message(Model):
        id = AutoField()
        conversation = ForeignKeyField(
            Conversation,
            backref='messages',
            on_delete='CASCADE'
        )
        sender = CharField()
        content = TextField()
        created_at = DateTimeField(default=datetime.datetime.now)

        class Meta:
            database = database

def rollback(migrator, database, **kwargs):
    migrator.drop_table('message')
    migrator.drop_table('conversation')
