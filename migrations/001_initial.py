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
    
    @migrator.create_model
    class User(pw.Model):
        id = pw.AutoField()
        name = pw.CharField(max_length=255)
        email = pw.CharField(max_length=255, unique=True, index=True)
        password_hash = pw.CharField(max_length=255)
        role = pw.CharField(max_length=255)
        created_at = pw.DateTimeField()

    @migrator.create_model
    class StudentProfile(pw.Model):
        user = pw.ForeignKeyField(User, backref='student_profile', primary_key=True)
        grade = pw.IntegerField()
        syllabus = pw.CharField(max_length=255, null=True)

    @migrator.create_model
    class ParentStudentMap(pw.Model):
        parent = pw.ForeignKeyField(User, backref='linked_students')
        student = pw.ForeignKeyField(User, backref='linked_parents')

        class Meta:
            indexes = (
                (('parent', 'student'), True),
            )

    @migrator.create_model
    class Lesson(pw.Model):
        id = pw.AutoField()
        title = pw.CharField(max_length=255)
        grade = pw.IntegerField()
        subject = pw.CharField(max_length=255)
        source = pw.CharField(max_length=255, null=True)
        created_at = pw.DateTimeField()

    @migrator.create_model
    class Quiz(pw.Model):
        id = pw.AutoField()
        lesson = pw.ForeignKeyField(Lesson, backref='quizzes')
        questions = pw.TextField()
        
    @migrator.create_model
    class StudentQuizAttempt(pw.Model):
        id = pw.AutoField()
        student = pw.ForeignKeyField(User, backref='quiz_attempts')
        topic = pw.CharField(max_length=255)
        grade = pw.IntegerField()
        questions = pw.TextField()
        answers = pw.TextField()
        score = pw.FloatField()
        attempted_at = pw.DateTimeField()

    @migrator.create_model
    class WeakTopic(pw.Model):
        student = pw.ForeignKeyField(User, backref='weak_topics')
        topic = pw.CharField(max_length=255)
        accuracy_score = pw.FloatField()

    @migrator.create_model
    class IngestionJob(pw.Model):
        id = pw.AutoField()
        filename = pw.CharField(max_length=255)
        grade = pw.IntegerField()
        subject = pw.CharField(max_length=255)
        chapter = pw.CharField(max_length=255)
        status = pw.CharField(max_length=255)
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

    @migrator.create_model
    class Conversation(pw.Model):
        id = pw.AutoField()
        student = pw.ForeignKeyField(User, backref='conversations')
        created_at = pw.DateTimeField()
        updated_at = pw.DateTimeField()

    @migrator.create_model
    class Message(pw.Model):
        id = pw.AutoField()
        conversation = pw.ForeignKeyField(Conversation, backref='messages')
        sender = pw.CharField(max_length=255)
        content = pw.TextField()
        created_at = pw.DateTimeField()

    @migrator.create_model
    class Badge(pw.Model):
        id = pw.AutoField()
        student = pw.ForeignKeyField(User, backref='badges')
        name = pw.CharField(max_length=255)
        description = pw.TextField()
        awarded_at = pw.DateTimeField()


def rollback(migrator: Migrator, database: pw.Database, fake=False, **kwargs):
    """Write your rollback migrations here."""
    migrator.remove_model('Badge')
    migrator.remove_model('Message')
    migrator.remove_model('Conversation')
    migrator.remove_model('IngestionJob')
    migrator.remove_model('WeakTopic')
    migrator.remove_model('StudentQuizAttempt')
    migrator.remove_model('Quiz')
    migrator.remove_model('Lesson')
    migrator.remove_model('ParentStudentMap')
    migrator.remove_model('StudentProfile')
    migrator.remove_model('User')