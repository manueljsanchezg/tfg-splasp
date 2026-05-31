from slowapi import Limiter
from slowapi.util import get_remote_address
from app.env import RATE_LIMIT_ENABLED, RATE_LIMIT_REQUESTS_PER_MINUTE

limiter = Limiter(
    key_func=get_remote_address,
    default_limits=[f"{RATE_LIMIT_REQUESTS_PER_MINUTE}/minute"],
    enabled=RATE_LIMIT_ENABLED,
)
