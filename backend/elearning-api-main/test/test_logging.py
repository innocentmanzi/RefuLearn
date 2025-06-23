import os
import sys

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from utils.logging_config import (
    set_request_context,
    setup_logging,
    clear_request_context,
)

# Setup logging
logger = setup_logging()

# Simulate a request
set_request_context(None)
logger.debug("This is a debug message")
logger.info("This is an info message")
logger.warning("This is a warning message")
logger.error("This is an error message")
clear_request_context()

# Simulate another request
set_request_context(None)
logger.info("This is another request's info message")
clear_request_context()
