from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response
from urllib.parse import urlparse, parse_qs, urlencode
from rest_framework.exceptions import ValidationError
from django.core.exceptions import ImproperlyConfigured
from utils import logging_config

# Initialize logger from the provided logging setup
logger = logging_config.setup_logging()


class CustomPageNumberPagination(PageNumberPagination):
    """
    Custom pagination class that extends Django REST Framework's PageNumberPagination.
    Allows dynamic page sizes via query parameters and provides enriched pagination metadata.
    Includes error handling and logging for robustness.
    """

    # Allow clients to specify page size via query parameter (e.g., ?page_size=10)
    page_size_query_param = "page_size"

    # Optional: Set a maximum page size to prevent performance issues
    max_page_size = 100

    def get_page_size(self, request):
        """
        Retrieves the page size from the request, ensuring it is valid and within bounds.
        """
        try:
            page_size = super().get_page_size(request)
            if page_size is None:
                # Use default page size from settings if not specified
                page_size = self.page_size or 50

            # Validate the page size
            if page_size <= 0:
                logger.error(
                    "Invalid page size requested: %s. Must be positive.", page_size
                )
                raise ValidationError("Page size must be a positive integer.")

            if self.max_page_size and page_size > self.max_page_size:
                logger.warning(
                    "Requested page size %s exceeds maximum allowed %s. Using max_page_size.",
                    page_size,
                    self.max_page_size,
                )
                page_size = self.max_page_size

            return page_size

        except ValueError as e:
            logger.error("Error parsing page size: %s", str(e))
            raise ValidationError("Invalid page size format.")

    def get_next_link(self):
        """
        Generates a relative URL for the next page, preserving query parameters.
        """
        try:
            if not self.page.has_next():
                return None

            url = self.request.build_absolute_uri()
            page_number = self.page.next_page_number()
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            query_params["page"] = [str(page_number)]

            # Ensure page_size is included in the link if specified
            if self.page_size_query_param in query_params:
                query_params[self.page_size_query_param] = [
                    str(self.page.paginator.per_page)
                ]

            return f"{parsed_url.path}?{urlencode(query_params, doseq=True)}"

        except Exception as e:
            logger.error("Error generating next link: %s", str(e))
            return None

    def get_previous_link(self):
        """
        Generates a relative URL for the previous page, preserving query parameters.
        """
        try:
            if not self.page.has_previous():
                return None

            # Build the URL for the previous page
            url = self.request.build_absolute_uri()
            page_number = self.page.previous_page_number()
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            query_params["page"] = [str(page_number)]

            # Ensure page_size is included in the link if specified
            if self.page_size_query_param in query_params:
                query_params[self.page_size_query_param] = [
                    str(self.page.paginator.per_page)
                ]

            return f"{parsed_url.path}?{urlencode(query_params, doseq=True)}"

        except Exception as e:
            logger.error("Error generating previous link: %s", str(e))
            return None

    def get_first_link(self):
        """
        Generates a relative URL for the first page, preserving query parameters.
        """
        try:
            if self.page.number == 1:
                return None

            # Build the URL for the first page
            # This ensures that the first page link always resets to page 1
            url = self.request.build_absolute_uri()
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            query_params["page"] = ["1"]

            # Ensure page_size is included in the link if specified
            if self.page_size_query_param in query_params:
                query_params[self.page_size_query_param] = [
                    str(self.page.paginator.per_page)
                ]

            return f"{parsed_url.path}?{urlencode(query_params, doseq=True)}"

        except Exception as e:
            logger.error("Error generating first link: %s", str(e))
            return None

    def get_last_link(self):
        """
        Generates a relative URL for the last page, preserving query parameters.
        """
        try:
            if self.page.number == self.page.paginator.num_pages:
                return None

            # Build the URL for the last page
            # This ensures that the last page link always points to the last page number
            url = self.request.build_absolute_uri()
            parsed_url = urlparse(url)
            query_params = parse_qs(parsed_url.query)
            query_params["page"] = [str(self.page.paginator.num_pages)]

            # Ensure page_size is included in the link if specified
            if self.page_size_query_param in query_params:
                query_params[self.page_size_query_param] = [
                    str(self.page.paginator.per_page)
                ]

            return f"{parsed_url.path}?{urlencode(query_params, doseq=True)}"

        except Exception as e:
            logger.error("Error generating last link: %s", str(e))
            return None

    def get_paginated_response(self, data):
        """
        Constructs a paginated response with enriched metadata.
        """
        try:
            # Verify that pagination attributes are available
            if not hasattr(self, "page") or not hasattr(self.page, "paginator"):
                logger.error("Pagination attributes not properly initialized.")
                raise ImproperlyConfigured("Pagination is not properly configured.")

            # Calculate item range for the current page
            start_index = self.page.start_index()
            end_index = self.page.end_index()
            total_items = self.page.paginator.count
            item_range = f"Items {start_index}-{end_index} of {total_items}"

            response_data = {
                "count": total_items,  # Total number of items in the dataset
                "num_pages": self.page.paginator.num_pages,  # Total number of pages
                "current_page": self.page.number,  # Current page number
                "page_size": self.page.paginator.per_page,  # Number of items on the current page
                "has_next": self.page.has_next(),  # Boolean indicating if a next page exists
                "has_previous": self.page.has_previous(),  # Boolean indicating if a previous page exists
                "next": self.get_next_link(),  # Relative URL to the next page, if available
                "previous": self.get_previous_link(),  # Relative URL to the previous page, if available
                "first": self.get_first_link(),  # Relative URL to the first page
                "last": self.get_last_link(),  # Relative URL to the last page
                "item_range": item_range,  # Range of items (e.g., "Items 1-10 of 50")
                "per_page_options": [10, 25, 50, 100],  # Example options for page size
                "results": data,  # The actual data for the current page
            }

            # Log successful pagination response
            logger.debug(
                "Generated paginated response: page=%s, page_size=%s, total_items=%s",
                self.page.number,
                self.page.paginator.per_page,
                total_items,
            )

            return Response(response_data)

        except Exception as e:
            logger.error("Error generating paginated response: %s", str(e))
            raise
