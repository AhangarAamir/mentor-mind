# migrations/002_add_quiz_models.py
from app.db.base import database
from app.db.models import StudentQuizAttempt, Quiz

def upgrade():
    """
    Upgrade the database schema.
    Drops the old Quiz and QuizAttempt tables and creates the new StudentQuizAttempt table.
    """
    # The old models need to be defined here temporarily for the migration
    # This is a simplified approach. In a more complex system, you might
    # want to preserve data.
    database.execute_sql('DROP TABLE IF EXISTS quizattempt;')
    database.execute_sql('DROP TABLE IF EXISTS quiz;')
    
    if not StudentQuizAttempt.table_exists():
        StudentQuizAttempt.create_table()
        print("Created table: studentquizattempt")

def downgrade():
    """
    Downgrade the database schema.
    This will drop the new table. Recreating the old ones would require
    defining their structure here again.
    """
    if StudentQuizAttempt.table_exists():
        StudentQuizAttempt.drop_table()
        print("Dropped table: studentquizattempt")
    # To fully revert, you would recreate the old Quiz and QuizAttempt tables here.
    # For this project, we'll just drop the new one.
