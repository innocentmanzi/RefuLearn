import logging
import os
import uuid
import sys
from logging.handlers import RotatingFileHandler
from datetime import datetime
import threading
from pathlib import Path

# Initialize logger for this module
logger = logging.getLogger(__name__)

# Thread-local storage to hold request-specific data, such as request_id
log_context = threading.local()


class ContextFilter(logging.Filter):
    """
    A custom logging filter that adds a request_id to log records for request-specific logging.
    """

    def filter(self, record):
        # Retrieve request_id from thread-local storage, default to 'Unknown' if not set
        record.request_id = getattr(log_context, "request_id", "Unknown")
        return True


class CustomFormatter(logging.Formatter):
    """
    A custom logging formatter that includes request_id and other metadata in log messages.
    """

    def format(self, record):
        try:
            # Format the timestamp
            record.asctime = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

            # Safely compute relative path
            try:
                record.relpath = os.path.relpath(
                    record.pathname, os.path.dirname(__file__)
                )

            except (ValueError, TypeError):
                record.relpath = record.pathname

            # Define the custom format string for log messages
            return f"{record.asctime} - [id:{record.request_id}] - {record.relpath} - line {record.lineno} - {record.levelname} - {record.getMessage()}"

        except Exception as e:
            logger.error("Error formatting log record: %s", str(e))
            return f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - [id:Unknown] - {record.pathname} - line {record.lineno} - {record.levelname} - {record.getMessage()}"


def set_request_context(request):
    """
    Sets the request_id in thread-local storage for the current request.
    """
    try:
        # Generate a unique 8-character request_id from UUID4
        request_id = str(uuid.uuid4().int.to_bytes(16, "big").hex()[:8])
        log_context.request_id = request_id
        logger.debug("Set request context with request_id: %s", request_id)

    except Exception as e:
        logger.error("Error setting request context: %s", str(e))

        # Set a fallback request_id to ensure logging continues
        log_context.request_id = "Error"


def clear_request_context():
    """
    Clears the request_id from thread-local storage.
    """
    try:
        log_context.request_id = None
        logger.debug("Cleared request context")

    except Exception as e:
        logger.error("Error clearing request context: %s", str(e))


def setup_logging():
    """
    Configures the logger with file and console handlers, custom formatter, and filter.
    """
    try:
        # Check if the logger has already been configured to avoid duplicate handlers
        if not logger.hasHandlers():
            logger.setLevel(logging.DEBUG)
            logger.propagate = False

            # Create a custom formatter and context filter
            custom_formatter = CustomFormatter()
            context_filter = ContextFilter()

            # Create logs directory if it doesn't exist
            BASE_DIR = Path(__file__).resolve().parent.parent
            log_dir = os.path.join(BASE_DIR, "logs")

            try:
                os.makedirs(log_dir, exist_ok=True)

                # Verify directory is writable
                test_file = os.path.join(log_dir, ".test_write")
                with open(test_file, "w") as f:
                    f.write("")
                os.remove(test_file)

            except (OSError, PermissionError) as e:
                logger.error(
                    "Cannot create or write to log directory %s: %s", log_dir, str(e)
                )
                raise

            # File handler with rotation (10 files of 1MB each)
            file_handler = RotatingFileHandler(
                filename=os.path.join(log_dir, "messages.log"),
                maxBytes=1024 * 1024,  # 1MB
                backupCount=10,
                encoding="utf-8",
            )
            file_handler.setFormatter(custom_formatter)
            file_handler.setLevel(logging.DEBUG)
            file_handler.addFilter(context_filter)

            # Console handler
            console_handler = logging.StreamHandler(sys.stdout)
            console_handler.setFormatter(custom_formatter)
            console_handler.setLevel(logging.INFO)  # Only INFO and above to console
            console_handler.addFilter(context_filter)

            # Add handlers to the logger
            logger.addHandler(file_handler)
            logger.addHandler(console_handler)

        return logger

    except Exception as e:
        logger.error("Error setting up logging: %s", str(e))
        raise
