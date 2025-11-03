# /mentormind-backend/app/db/base.py
import contextvars
from peewee import PostgresqlDatabase, Model
from app.config import settings

# Thread-safe connection handling
db_state_default = {"closed": None, "conn": None, "ctx": None, "transactions": None}
db_state = contextvars.ContextVar("db_state", default=db_state_default.copy())

class PeeweeConnectionState:
    def __init__(self, **kwargs):
        super().__setattr__("_state", db_state)
        for key, value in kwargs.items():
            self._state.get()[key] = value

    def __getattr__(self, name):
        return self._state.get()[name]

    def __setattr__(self, name, value):
        self._state.get()[name] = value

    def reset(self):
        """Reset Peewee connection state (compatible with Peewee internals)."""
        self._state.set(db_state_default.copy())

    def set(self, new_state):
        """Explicitly replace current state."""
        self._state.set(new_state)

# Initialize the PostgreSQL database
database = PostgresqlDatabase(
    settings.DATABASE_URL.split('/')[-1],  # db name
    user=settings.DATABASE_URL.split('//')[1].split(':')[0],
    password=settings.DATABASE_URL.split(':')[2].split('@')[0],
    host=settings.DATABASE_URL.split('@')[1].split(':')[0],
    port=settings.DATABASE_URL.split(':')[-1].split('/')[0]
)

database._state = PeeweeConnectionState()

class BaseModel(Model):
    class Meta:
        database = database
