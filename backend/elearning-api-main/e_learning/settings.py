from pathlib import Path
from datetime import timedelta
from decouple import config
from csp.constants import SELF, UNSAFE_INLINE, UNSAFE_EVAL, NONCE

# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent

# SECURITY WARNING: keep the secret key used in production secret!
SECRET_KEY = config("SECRET_KEY")

# SECURITY WARNING: don't run with debug turned on in production!
DEBUG = config("DEBUG", default=False, cast=bool)

# ALLOWED_HOSTS from the environment, defaulting to an empty string to prevent NoneType errors
ALLOWED_HOSTS = config("ALLOWED_HOSTS").split(",")

# Remove any accidental empty strings in case of trailing commas
ALLOWED_HOSTS = [host.strip() for host in ALLOWED_HOSTS if host.strip()]

# Application definition
DJANGO_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",
]

# Third-party apps
THIRD_PARTY_APPS = [
    "rest_framework",
    "rest_framework_simplejwt",
    "rest_framework_simplejwt.token_blacklist",
    "drf_spectacular",
    "corsheaders",
    "django_filters",
    "csp",
]

# Local apps
LOCAL_APPS = [
    "authentication",
    "core",
    "course",
]

# Combine all apps into INSTALLED_APPS
INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + LOCAL_APPS

# Middleware configuration
MIDDLEWARE = [
    "django.middleware.security.SecurityMiddleware",
    # Content Security Policy (CSP) middleware
    "csp.middleware.CSPMiddleware",  # CSP middleware
    "django.contrib.sessions.middleware.SessionMiddleware",
    # corsheaders
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.common.CommonMiddleware",
    "django.middleware.csrf.CsrfViewMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

# Content Security Policy Settings
CONTENT_SECURITY_POLICY = {
    "EXCLUDE_URL_PREFIXES": ["/admin"],  # Add any URLs you want to exclude
    "DIRECTIVES": {
        "default-src": [SELF],
        "script-src": [
            SELF,
            UNSAFE_INLINE,  # Needed for Django admin and dev tools
            UNSAFE_EVAL,  # Needed for some dev tools
            "https://cdn.jsdelivr.net",
            "blob:",  # Allow blob: for Web Workers
            NONCE,
        ],
        "worker-src": [  # Add this new directive
            SELF,
            "blob:",  # Allow blob URLs for workers
        ],
        "style-src": [
            SELF,
            UNSAFE_INLINE,  # Needed for Django admin
            "https://cdn.jsdelivr.net",
            NONCE,
        ],
        "img-src": [SELF, "data:", "https://*"],
        "font-src": [SELF, "https://cdn.jsdelivr.net"],
        "connect-src": [SELF, "https://*"],
        "object-src": ["'none'"],
        "base-uri": ["'none'"],
        "frame-ancestors": ["'none'"],
        "form-action": [SELF],
    },
}

# For production, you might want to tighten these rules
if not DEBUG:
    CONTENT_SECURITY_POLICY["DIRECTIVES"].update(
        {
            "default-src": [SELF],
            "script-src": [SELF, NONCE, "https://cdn.jsdelivr.net"],
            "worker-src": [SELF, "blob:"],
            "style-src": [SELF, NONCE],
            "img-src": [SELF, "data:"],
            "font-src": [SELF],
            "connect-src": [SELF],
        }
    )

# Security Settings
SECURE_HSTS_SECONDS = 300 if DEBUG else 31536000  # 5 min in dev, 1 year in prod
SECURE_HSTS_INCLUDE_SUBDOMAINS = True  # Protect all subdomains
SECURE_HSTS_PRELOAD = True  # Submit for inclusion in browser preload lists
SECURE_SSL_REDIRECT = not DEBUG  # Redirect all HTTP to HTTPS in production
SESSION_COOKIE_SECURE = not DEBUG  # Only send session cookie over HTTPS in production
CSRF_COOKIE_SECURE = not DEBUG  # Only send CSRF cookie over HTTPS in production
SECURE_BROWSER_XSS_FILTER = True  # Enable XSS filtering
SECURE_CONTENT_TYPE_NOSNIFF = True  # Prevent browsers from MIME-sniffing
X_FRAME_OPTIONS = "DENY"  # Prevent clickjacking by disallowing framing of the site

# If running behind a reverse proxy (e.g., Nginx or Heroku):
USE_X_FORWARDED_HOST = True
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Session Security
SESSION_COOKIE_AGE = 3600  # 1 hour
SESSION_EXPIRE_AT_BROWSER_CLOSE = True
SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SAMESITE = "Strict"

# CSRF Protection
CSRF_COOKIE_HTTPONLY = True
CSRF_COOKIE_SAMESITE = "Strict"
CSRF_TRUSTED_ORIGINS = ["https://yourdomain.com"]  # Adjust to your domain

# URL configuration
ROOT_URLCONF = "e_learning.urls"

# Template configuration
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [],  # Add your template directories here if needed
        "APP_DIRS": True,  # Enable app directories for templates
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

# WSGI application
WSGI_APPLICATION = "e_learning.wsgi.application"

# Database configuration
# https://docs.djangoproject.com/en/5.2/ref/settings/#databases
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.sqlite3",
        "NAME": BASE_DIR / "db.sqlite3",
    }
}

# Authentication settings
AUTH_USER_MODEL = "authentication.User"

# REST Framework settings
REST_FRAMEWORK = {
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework_simplejwt.authentication.JWTAuthentication",  # JWT authentication
        "rest_framework.authentication.SessionAuthentication",  # Session authentication
    ],
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.IsAuthenticated",  # Default permission class
    ],
    "DEFAULT_PARSER_CLASSES": [
        "rest_framework.parsers.JSONParser",  # Default parser for JSON requests
        "rest_framework.parsers.MultiPartParser",  # For file uploads
        "rest_framework.parsers.FormParser",  # For form data
    ],
    "DEFAULT_SCHEMA_CLASS": "drf_spectacular.openapi.AutoSchema",
    "DEFAULT_FILTER_BACKENDS": [
        "django_filters.rest_framework.DjangoFilterBackend",  # For filtering
        "rest_framework.filters.SearchFilter",  # For search functionality
        "rest_framework.filters.OrderingFilter",  # For ordering results
    ],
    "DEFAULT_PAGINATION_CLASS": "utils.custom_pagination.CustomPageNumberPagination",  # Custom pagination class
    "PAGE_SIZE": 50,  # Default page size if not specified
    "NON_FIELD_ERRORS_KEY": "error",  # Custom key for non-field errors in responses
    "DEFAULT_THROTTLE_CLASSES": [
        "rest_framework.throttling.AnonRateThrottle",  # Throttle for anonymous users
        "rest_framework.throttling.UserRateThrottle",  # Throttle for authenticated users
    ],
    "DEFAULT_THROTTLE_RATES": {  # These are example rates, adjust as needed
        "anon": "100/hour",
        "user": "1000/hour",
        "premium": "5000/hour",
    },
    "DEFAULT_RENDERER_CLASSES": [
        "rest_framework.renderers.JSONRenderer",  # Default renderer
        "rest_framework.renderers.BrowsableAPIRenderer",
    ],
    # 'EXCEPTION_HANDLER': 'apps.core.exceptions.custom_exception_handler',
}

# Settings for drf-spectacular
SPECTACULAR_SETTINGS = {
    "TITLE": "E-Learning API",
    "DESCRIPTION": "This E-Learning API is aimed to empower refugees in Rwanda through education and economic opportunities. It provides a platform for learning, skill development, and access to resources.",
    "VERSION": "1.0.0",  # Version of the API
    "SERVE_INCLUDE_SCHEMA": True,  # Include schema in the Swagger UI
}

# Settings for Simple JWT
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(minutes=180),  # Access token lifetime
    "REFRESH_TOKEN_LIFETIME": timedelta(days=2),  # Refresh token lifetime
    "ROTATE_REFRESH_TOKENS": True,  # Rotate refresh tokens on each use
    "BLACKLIST_AFTER_ROTATION": True,  # Blacklist old refresh tokens after rotation
    "UPDATE_LAST_LOGIN": True,  # Update last login on token refresh
    "ALLOWED_TOKEN_TYPES": ("access", "refresh"),  # Allowed token types
    "ALGORITHM": "HS256",  # JWT signing algorithm
    "SIGNING_KEY": SECRET_KEY,  # Secret key for signing tokens
    "VERIFYING_KEY": "",
    "AUDIENCE": None,
    "ISSUER": None,
    "JSON_ENCODER": None,
    "JWK_URL": None,
    "LEEWAY": 0,  # Leeway for token expiration checks
    "AUTH_HEADER_TYPES": ("Bearer",),  # Authentication header types
    "AUTH_HEADER_NAME": "HTTP_AUTHORIZATION",  # Name of the authentication header
    "USER_ID_FIELD": "id",  # Field to use for user ID in tokens
    "USER_ID_CLAIM": "user_id",  # Claim to use for user ID in tokens
    "USER_AUTHENTICATION_RULE": "rest_framework_simplejwt.authentication.default_user_authentication_rule",
    "AUTH_TOKEN_CLASSES": ("rest_framework_simplejwt.tokens.AccessToken",),
    "TOKEN_TYPE_CLAIM": "token_type",
    "TOKEN_USER_CLASS": "rest_framework_simplejwt.models.TokenUser",
    "JTI_CLAIM": "jti",  # JWT ID claim
    "SLIDING_TOKEN_REFRESH_EXP_CLAIM": "refresh_exp",
    "SLIDING_TOKEN_LIFETIME": timedelta(minutes=180),
    "SLIDING_TOKEN_REFRESH_LIFETIME": timedelta(days=2),
    "TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainPairSerializer",
    "TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSerializer",
    "TOKEN_VERIFY_SERIALIZER": "rest_framework_simplejwt.serializers.TokenVerifySerializer",
    "TOKEN_BLACKLIST_SERIALIZER": "rest_framework_simplejwt.serializers.TokenBlacklistSerializer",
    "SLIDING_TOKEN_OBTAIN_SERIALIZER": "rest_framework_simplejwt.serializers.TokenObtainSlidingSerializer",
    "SLIDING_TOKEN_REFRESH_SERIALIZER": "rest_framework_simplejwt.serializers.TokenRefreshSlidingSerializer",
}

# CORS Settings
# Alternatively, allow all origins (not recommended for production)
CORS_ALLOW_ALL_ORIGINS = (
    config("CORS_ALLOW_ALL_ORIGINS", "False").lower() == "false"
)  # Ensure this is False in production

# Split and strip URLs in CORS_ALLOWED_ORIGINS, ensuring no trailing slashes
CORS_ALLOWED_ORIGINS = [
    origin.strip().rstrip("/")
    for origin in config("CORS_ALLOWED_ORIGINS", "").split(",")
]

# Enable sending credentials (cookies, Authorization headers, etc.)
CORS_ALLOW_CREDENTIALS = True  # Only if we need credentials/cookies

# Allow specific HTTP methods
CORS_ALLOW_METHODS = [
    "GET",
    "POST",
    "PUT",
    "PATCH",
    "DELETE",
    "OPTIONS",
]

# Allow specific headers
CORS_ALLOW_HEADERS = [
    "accept",
    "authorization",
    "content-type",
    "accept-encoding",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "dnt",
    "origin",
]

# Cache configuration settings
CACHES = {
    "default": {
        "BACKEND": "django.core.cache.backends.locmem.LocMemCache",
        "LOCATION": "unique-snowflake",
    }
}

# Cache timeout settings
try:
    CACHE_TIMEOUT = int(config("CACHE_TIMEOUT", 3600))  # Default to 1 hour if not set
except (ValueError, TypeError):
    CACHE_TIMEOUT = 3600  # Fallback to default if conversion fails

# File Upload Settings
FILE_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB
DATA_UPLOAD_MAX_MEMORY_SIZE = 10 * 1024 * 1024  # 10MB

# Email Configuration
EMAIL_BACKEND = config(
    "EMAIL_BACKEND", default="django.core.mail.backends.smtp.EmailBackend"
)
EMAIL_HOST = config("EMAIL_HOST", default="smtp.gmail.com")
EMAIL_PORT = config("EMAIL_PORT", default=587, cast=int)
EMAIL_USE_TLS = config("EMAIL_USE_TLS", default=True, cast=bool)
EMAIL_HOST_USER = config("EMAIL_HOST_USER", default="")
EMAIL_HOST_PASSWORD = config("EMAIL_HOST_PASSWORD", default="")

# Password validation
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
        "OPTIONS": {"min_length": 8},
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]

# Internationalization
LANGUAGE_CODE = "en-us"
TIME_ZONE = "UTC"
USE_I18N = True
USE_TZ = True

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/5.2/howto/static-files/
STATIC_URL = "static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

MEDIA_URL = "/media/"
MEDIA_ROOT = BASE_DIR / "media"

# Default primary key field type
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"

# API Documentation
SWAGGER_SETTINGS = {
    "SECURITY_DEFINITIONS": {
        "Bearer": {"type": "apiKey", "name": "Authorization", "in": "header"}
    },
    "USE_SESSION_AUTH": False,
    "JSON_EDITOR": True,
    "SUPPORTED_SUBMIT_METHODS": ["get", "post", "put", "delete", "patch"],
}

# # Logging Configuration (for security monitoring)
# LOGGING = {
#     "version": 1,
#     "disable_existing_loggers": False,
#     "handlers": {
#         "security_file": {
#             "level": "WARNING",
#             "class": "logging.FileHandler",
#             "filename": os.path.join(BASE_DIR, "logs", "security.log"),
#         },
#     },
#     "loggers": {
#         "django.security": {
#             "handlers": ["security_file"],
#             "level": "WARNING",
#             "propagate": True,
#         },
#     },
# }
