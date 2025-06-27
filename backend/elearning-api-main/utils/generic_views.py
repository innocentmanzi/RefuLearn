from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, parsers
from rest_framework.permissions import IsAuthenticated
from utils import logging_config, utils
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from drf_spectacular.utils import extend_schema

logger = logging_config.setup_logging()


class GenericListCreateView(APIView):
    """
    Generic API view for listing and creating model instances.
    Subclasses must define `model`, `serializer_class`, `pagination_class`, and `sanitize_fields`.
    and `resource_name`.
    Optionally, `parser_classes` can be defined for file uploads.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = None
    pagination_class = None
    model = None
    sanitize_fields = []
    parser_classes = [parsers.JSONParser]  # Default to JSONParser if not overridden
    resource_name = "Item"  # Default name for logging and messages

    def __init__(self, *args, **kwargs):
        """
        Initialize the view and validate required attributes.
        Set parser_classes if defined in the subclass, otherwise use default.
        """
        super().__init__(*args, **kwargs)
        if not self.model:
            raise ValueError("`model` must be defined in the subclass.")

        if not self.serializer_class:
            raise ValueError("`serializer_class` must be defined in the subclass.")

        if not self.pagination_class:
            raise ValueError("`pagination_class` must be defined in the subclass.")

        if not self.sanitize_fields:
            raise ValueError("`sanitize_fields` must be defined in the subclass.")

        # Apply parser_classes if defined in subclass
        if (
            hasattr(self, "parser_classes")
            and self.parser_classes is not None
            and self.parser_classes != [parsers.JSONParser]
        ):
            logger.debug(f"Applying custom parser_classes: {self.parser_classes}")
        else:
            self.parser_classes = [parsers.JSONParser]
            logger.debug("Using default parser_classes: [JSONParser]")

        if not self.resource_name:
            self.resource_name = self.model.__name__

    def get_queryset(self):
        """
        Return the queryset for list view. Subclasses should override for role-based filtering.
        """
        return self.model.objects.all().order_by("id")

    @extend_schema(
        responses={
            200: None,  # Subclasses should override with serializer_class(many=True)
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request):
        """
        Handle GET requests to retrieve a paginated list of model instances.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} list GET request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            queryset = self.get_queryset()
            paginator = self.pagination_class()
            paginated_items = paginator.paginate_queryset(queryset, request)

            serializer = self.serializer_class(paginated_items, many=True)
            logger.info(
                f"Successfully retrieved {len(paginated_items)} {self.resource_name.lower()}s for user: {user.email}"
            )

            return paginator.get_paginated_response(serializer.data)

        except ValidationError as e:
            logger.error(
                f"Validation error retrieving {self.resource_name.lower()} list for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving {self.resource_name.lower()} list for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=None,  # Subclasses should override with serializer_class
        responses={
            201: None,  # Subclasses should override with serializer_class
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def post(self, request):
        """
        Handle POST requests to create a new model instance.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} create POST request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )
        logger.debug(f"Request data: {dict(request.data)}")

        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            serializer = self.serializer_class(data=sanitized_data)
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid {self.resource_name.lower()} creation data: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer.save()
            logger.info(
                f"{self.resource_name} created successfully: {self._get_log_message(sanitized_data)}"
            )

            return Response(
                {
                    "message": f"{self.resource_name} created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(
                f"Validation error creating {self.resource_name.lower()} for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error creating {self.resource_name.lower()} for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data: dict) -> str:
        """
        Generate a log message for successful creation based on sanitized data.
        """
        if "name" in data and "code" in data:
            return f"{data['name']} ({data['code']})"

        elif "name" in data and "location" in data:
            return f"{data['name']} ({data['location']})"

        elif "title" in data:
            return data["title"]

        return str(data)


class GenericRetrieveUpdateDeleteView(APIView):
    """
    Generic API view for retrieving, updating, or deleting a specific model instance.
    Subclasses must define `model`, `serializer_class`, `sanitize_fields`, and `resource_name`.
    Optionally, `parser_classes` can be defined for file uploads.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = None
    model = None
    sanitize_fields = []
    parser_classes = [parsers.JSONParser]  # Default to JSONParser if not overridden
    resource_name = "Item"  # Default name for logging and messages
    id_field = "id"  # Default field for identifying instances

    def __init__(self, *args, **kwargs):
        """
        Initialize the view and validate required attributes.
        Set parser_classes if defined in the subclass, otherwise use default.
        """
        super().__init__(*args, **kwargs)
        if not self.model:
            raise ValueError("`model` must be defined in the subclass.")

        if not self.serializer_class:
            raise ValueError("`serializer_class` must be defined in the subclass.")

        if not self.sanitize_fields:
            raise ValueError("`sanitize_fields` must be defined in the subclass.")

        # Apply parser_classes if defined in subclass
        if (
            hasattr(self, "parser_classes")
            and self.parser_classes is not None
            and self.parser_classes != [parsers.JSONParser]
        ):
            logger.debug(f"Applying custom parser_classes: {self.parser_classes}")
        else:
            self.parser_classes = [parsers.JSONParser]
            logger.debug("Using default parser_classes: [JSONParser]")

        if not self.resource_name:
            self.resource_name = self.model.__name__

    def get_object(self, instance_id: str):
        """
        Retrieve the model instance for the given ID.
        """
        client_ip = self.request.META.get("REMOTE_ADDR", "unknown")

        try:
            return self.model.objects.get(**{self.id_field: instance_id})

        except ValueError:
            logger.warning(
                f"Invalid UUID format for {self.resource_name.lower()}_id: {instance_id} from IP: {client_ip}"
            )
            raise ValidationError(
                {
                    "error": f"Invalid {self.resource_name.lower()} ID format",
                    "error_code": f"INVALID_{self.resource_name.upper()}_ID",
                }
            )

        except self.model.DoesNotExist:
            logger.warning(
                f"{self.resource_name} not found for {self.resource_name.lower()}_id: {instance_id} from IP: {client_ip}"
            )

            raise ValidationError(
                {
                    "error": f"{self.resource_name} not found",
                    "error_code": f"{self.resource_name.upper()}_NOT_FOUND",
                }
            )

        except ObjectDoesNotExist:
            logger.warning(
                f"{self.resource_name} not found for {self.resource_name.lower()}_id: {instance_id} from IP: {client_ip}"
            )
            raise ValidationError(
                {
                    "error": f"{self.resource_name} not found",
                    "error_code": f"{self.resource_name.upper()}_NOT_FOUND",
                }
            )

    @extend_schema(
        responses={
            200: None,  # Subclasses should override with serializer_class
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request, instance_id: str):
        """
        Handle GET requests to retrieve a specific instance by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} detail GET request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            instance = self.get_object(instance_id)
            serializer = self.serializer_class(instance)
            logger.info(
                f"{self.resource_name} retrieved successfully: {self._get_log_message(instance)}"
            )

            return Response(
                {
                    "message": f"{self.resource_name} retrieved successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            error_message = str(e) if hasattr(e, "message") else str(e)
            error_code = "VALIDATION_ERROR"

            # If it's a custom ValidationError with dict format
            if hasattr(e, "error_dict") and e.error_dict:
                error_details = e.error_dict
                error_code = error_details.get("error_code", "VALIDATION_ERROR")

            elif hasattr(e, "error_list") and e.error_list:
                error_details = e.error_list

            else:
                error_details = error_message

            return Response(
                {
                    "message": "Invalid request",
                    "errors": error_details,
                    "error_code": error_code,
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving {self.resource_name.lower()} {instance_id} for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=None,  # Subclasses should override with serializer_class
        responses={
            200: None,  # Subclasses should override with serializer_class
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def patch(self, request, instance_id: str):
        """
        Handle PATCH requests to update a specific instance by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} update PATCH request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )
        logger.debug(f"Request data: {dict(request.data)}")

        try:
            instance = self.get_object(instance_id)
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            serializer = self.serializer_class(
                instance, data=sanitized_data, partial=True
            )
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid {self.resource_name.lower()} update data for {instance_id}: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            serializer.save()
            logger.info(
                f"{self.resource_name} updated successfully: {self._get_log_message(instance)}"
            )

            return Response(
                {
                    "message": f"{self.resource_name} updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error updating {self.resource_name.lower()} {instance_id} for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={
            204: None,
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def delete(self, request, instance_id: str):
        """
        Handle DELETE requests to delete a specific instance by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} delete DELETE request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            instance = self.get_object(instance_id)
            log_message = self._get_log_message(instance)
            instance.delete()
            logger.info(f"{self.resource_name} deleted successfully: {log_message}")

            return Response(
                {
                    "message": f"{self.resource_name} deleted successfully",
                    "error_code": None,
                },
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error deleting {self.resource_name.lower()} {instance_id} for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for the instance based on its attributes.
        """
        if hasattr(instance, "name") and hasattr(instance, "code"):
            return f"{instance.name} ({instance.code})"

        elif hasattr(instance, "name") and hasattr(instance, "location"):
            return f"{instance.name} ({instance.location})"

        elif hasattr(instance, "title"):
            return instance.title

        return str(instance)
