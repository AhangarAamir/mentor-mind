# /mentormind-backend/app/tasks/celery_app.py
from celery import Celery
from app.config import settings

celery = Celery(
    "mentormind_worker",
    broker=settings.REDIS_URL,
    backend=settings.REDIS_URL,
    include=["app.tasks.tasks"] # List of modules to import when the worker starts
)

celery.conf.update(
    task_track_started=True,
    broker_connection_retry_on_startup=True,
)

# Optional: Add Celery Beat schedule for periodic tasks
celery.conf.beat_schedule = {
    'generate-weekly-reports-every-sunday': {
        'task': 'app.tasks.tasks.generate_weekly_reports',
        'schedule': 3600.0, # crontab(minute=0, hour=0, day_of_week='sun'), For testing, run every hour
    },
}
celery.conf.timezone = 'UTC'
