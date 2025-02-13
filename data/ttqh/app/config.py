import os

class Config:
    """Configuration class for the application."""
    DB_HOST = os.environ.get("DB_HOST", "localhost")
    DB_NAME = os.environ.get("DB_NAME", "tthq")
    DB_USER = os.environ.get("DB_USER", "postgres")
    DB_PASSWORD = os.environ.get("DB_PASSWORD", "postgres")
    API_URL = "https://sqhkt-qlqh.tphcm.gov.vn/computing/930/api/v3.1/a-z/all"
    DEFAULT_MATHUADAT = "267970100011"
    DEBUG = os.environ.get("DEBUG", False) #Set default to false