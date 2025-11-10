import json
from peewee import Model, TextField
from playhouse.db_url import connect
from app.config import settings
from peewee_migrate import Router


class JSONField(TextField):
    def db_value(self, value):
        return json.dumps(value)

    def python_value(self, value):
        if value is not None:
            return json.loads(value)
        
database = connect(settings.DATABASE_URL)
print(f"Connected to a {database.__class__.__name__} database.")
router = Router(
    database,
    migrate_dir=settings.BACKEND_DIR,
    # logger=log,
)
# router.run() # Commented out to prevent circular import during app startup

database.connect(reuse_if_open=True)

class BaseModel(Model):
    class Meta:
        database = database