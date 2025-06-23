from rest_framework import throttling


class CustomAnonRateThrottle(throttling.AnonRateThrottle):
    """Custom rate limiting for login attempts."""

    rate = "20/hour"


class CustomUserRateThrottle(throttling.UserRateThrottle):
    """Custom rate limiting for password change attempts"""

    rate = "5/hour"
