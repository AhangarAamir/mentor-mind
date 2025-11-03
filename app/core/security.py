from passlib.context import CryptContext

# Use bcrypt for password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

MAX_BCRYPT_BYTES = 72  # bcrypt can only handle up to 72 bytes

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verifies a plain password against a hashed one.
    Truncates to 72 bytes to match bcrypt limits.
    """
    plain_password = plain_password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", "ignore")
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """
    Hashes a plain password.
    Truncates to 72 bytes to avoid bcrypt errors.
    """
    password = password.encode("utf-8")[:MAX_BCRYPT_BYTES].decode("utf-8", "ignore")
    return pwd_context.hash(password)
