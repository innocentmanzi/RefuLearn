from django.shortcuts import render
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import status, exceptions, parsers
from drf_spectacular.utils import extend_schema
from .models import JobOpportunity, JobApplication
from .serializers import JobOpportunitySerializer, JobApplicationSerializer
from utils import logging_config, custom_pagination, generic_views, permissions, utils

logger = logging_config.setup_logging()


class JobOpportunityListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating job opportunities.
    - GET: Students can list/retrieve; others see only their posted jobs or all (Admin).
    - POST: Only Admin, Employer, Instructor, Mentor, NGO_Partner can create.
    """

    permission_classes = [
        IsAuthenticated,
        permissions.IsJobOpportunityConnectedOrReadOnly,
    ]
    model = JobOpportunity
    serializer_class = JobOpportunitySerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = [
        "title",
        "description",
        "location",
        "job_type",
        "salary_range",
    ]
    resource_name = "JobOpportunity"

    def get_queryset(self):
        """
        Filter job opportunities based on user role.
        - Admins: All jobs
        - Employer, Instructor, Mentor, NGO_Partner: Only their posted jobs
        - Students: All active jobs
        """
        user = self.request.user
        logger.debug(
            f"Filtering JobOpportunity queryset for user: {user.email} (Role: {user.role})"
        )
        try:
            if user.role == "Admin":
                return self.model.objects.all()

            elif user.role == "Student":
                return self.model.objects.filter(is_active=True)

            else:
                # Employer, Instructor, Mentor, NGO_Partner
                return self.model.objects.filter(posted_by=user)

        except Exception as e:
            logger.error(f"Error filtering JobOpportunity queryset: {str(e)}")
            raise exceptions.ValidationError(
                {
                    "error": "Failed to filter job opportunities.",
                    "error_code": "FILTER_ERROR",
                }
            )

    @extend_schema(
        responses={200: JobOpportunitySerializer(many=True)},
        description="Retrieve a paginated list of job opportunities. Students see active jobs; Admins see all; others see their posted jobs.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of job opportunities based on user role.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} list GET request from IP: {client_ip} for user: {user.email} (Role: {user.role})"
        )

        try:
            queryset = self.get_queryset().order_by("-created_at")
            paginator = self.pagination_class()
            paginated_items = paginator.paginate_queryset(queryset, request)
            serializer = self.serializer_class(paginated_items, many=True)

            logger.info(
                f"Successfully retrieved {len(paginated_items)} job opportunities for user: {user.email}"
            )
            return paginator.get_paginated_response(serializer.data)

        except exceptions.ValidationError as e:
            logger.error(f"Validation error retrieving job opportunities: {str(e)}")
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error retrieving job opportunities: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=JobOpportunitySerializer,
        responses={201: JobOpportunitySerializer},
        description="Create a new job opportunity. Restricted to Admin, Employer, Instructor, Mentor, NGO_Partner.",
    )
    def post(self, request):
        """
        Create a new job opportunity for the authenticated user.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} create POST request from IP: {client_ip} for user: {user.email}"
        )

        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid job opportunity creation data: {serializer.errors}"
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
                f"JobOpportunity created successfully: {self._get_log_message(sanitized_data)}"
            )
            return Response(
                {
                    "message": "JobOpportunity created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except exceptions.ValidationError as e:
            logger.error(f"Validation error creating job opportunity: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except exceptions.PermissionDenied as e:
            logger.error(f"Permission denied creating job opportunity: {str(e)}")
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating job opportunity: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobOpportunityRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific job opportunity.
    - GET: Accessible to all authenticated users.
    - PATCH/DELETE: Restricted to Admins or the user who posted the job.
    """

    permission_classes = [
        IsAuthenticated,
        permissions.IsJobOpportunityConnectedOrReadOnly,
    ]
    model = JobOpportunity
    serializer_class = JobOpportunitySerializer
    sanitize_fields = [
        "title",
        "description",
        "location",
        "job_type",
        "salary_range",
    ]
    resource_name = "JobOpportunity"
    id_field = "id"

    @extend_schema(
        responses={200: JobOpportunitySerializer},
        description="Retrieve a specific job opportunity by ID.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific job opportunity by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} detail GET request from IP: {client_ip} for user: {user.email}"
        )
        try:
            instance = self.get_object(instance_id)
            serializer = self.serializer_class(instance)
            logger.info(
                f"JobOpportunity retrieved successfully: {self._get_log_message(instance)}"
            )
            return Response(
                {
                    "message": "JobOpportunity retrieved successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error retrieving job opportunity {instance_id}: {str(e)}"
            )
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
                f"Unexpected error retrieving job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=JobOpportunitySerializer,
        responses={200: JobOpportunitySerializer},
        description="Update a specific job opportunity by ID. Restricted to Admins or the user who posted the job.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific job opportunity by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} update PATCH request from IP: {client_ip} for user: {user.email}"
        )
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
                    f"Invalid job opportunity update data for {instance_id}: {serializer.errors}"
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
                f"JobOpportunity updated successfully: {self._get_log_message(instance)}"
            )
            return Response(
                {
                    "message": "JobOpportunity updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error updating job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except exceptions.PermissionDenied as e:
            logger.error(
                f"Permission denied updating job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error updating job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific job opportunity by ID. Restricted to Admins or the user who posted the job.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific job opportunity by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} delete DELETE request from IP: {client_ip} for user: {user.email}"
        )

        try:
            instance = self.get_object(instance_id)
            log_message = self._get_log_message(instance)
            instance.delete()
            logger.info(f"JobOpportunity deleted successfully: {log_message}")

            return Response(
                {
                    "message": "JobOpportunity deleted successfully",
                    "error_code": None,
                },
                status=status.HTTP_204_NO_CONTENT,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error deleting job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except exceptions.PermissionDenied as e:
            logger.error(
                f"Permission denied deleting job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error deleting job opportunity {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobApplicationListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating job applications.
    - GET: Admins see all; Students see their own; Others see applications for their jobs.
    - POST: Any authenticated user can create (apply for a job).
    """

    permission_classes = [
        IsAuthenticated,
        permissions.IsJobApplicationConnectedOrReadOnly,
    ]
    model = JobApplication
    serializer_class = JobApplicationSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    sanitize_fields = ["cover_letter"]
    resource_name = "JobApplication"

    def get_queryset(self):
        """
        Filter job applications based on user role:
        - Admins: All applications.
        - Students: Their own applications.
        - Mentor, Instructor, Employer, NGO_Partner: Applications for their jobs.
        """
        user = self.request.user
        logger.debug(
            f"Filtering JobApplication queryset for user: {user.email} (Role: {user.role})"
        )
        try:
            if user.role == "Admin":
                return self.model.objects.all()

            elif user.role == "Student":
                return self.model.objects.filter(user=user)

            else:  # Mentor, Instructor, Employer, NGO_Partner
                return self.model.objects.filter(job__posted_by=user)

        except Exception as e:
            logger.error(f"Error filtering JobApplication queryset: {str(e)}")
            raise exceptions.ValidationError(
                {
                    "error": "Failed to filter job applications.",
                    "error_code": "FILTER_ERROR",
                }
            )

    @extend_schema(
        responses={200: JobApplicationSerializer(many=True)},
        description="Retrieve a paginated list of job applications. Admins see all; Students see their own; Others see applications for their jobs.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of job applications based on user role.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} list GET request from IP: {client_ip} for user: {user.email} (Role: {user.role})"
        )
        try:
            queryset = self.get_queryset().order_by("-applied_at")
            paginator = self.pagination_class()
            paginated_items = paginator.paginate_queryset(queryset, request)
            serializer = self.serializer_class(paginated_items, many=True)

            logger.info(
                f"Successfully retrieved {len(paginated_items)} job applications for user: {user.email}"
            )
            return paginator.get_paginated_response(serializer.data)

        except exceptions.ValidationError as e:
            logger.error(f"Validation error retrieving job applications: {str(e)}")
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error retrieving job applications: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=JobApplicationSerializer,
        responses={201: JobApplicationSerializer},
        description="Create a new job application. Any authenticated user can apply.",
    )
    def post(self, request):
        """
        Create a new job application for the authenticated user.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} create POST request from IP: {client_ip} for user: {user.email}"
        )
        try:
            sanitized_data = self.request.data.copy()
            if "cover_letter" in sanitized_data:
                sanitized_data["cover_letter"] = utils.sanitize_input(
                    {"cover_letter": sanitized_data["cover_letter"]},
                    fields=["cover_letter"],
                )["cover_letter"]
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid job application creation data: {serializer.errors}"
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
                f"JobApplication created successfully for job: {sanitized_data.get('job_id')}"
            )
            return Response(
                {
                    "message": "JobApplication created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except exceptions.ValidationError as e:
            logger.error(f"Validation error creating job application: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except exceptions.PermissionDenied as e:
            logger.error(f"Permission denied creating job application: {str(e)}")
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating job application: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class JobApplicationRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific job application.
    - GET: Admins, Students (own applications), Others (for their jobs).
    - PATCH: Admins, Students (own applications), Others (for their jobs).
    - DELETE: Admins, Others (for their jobs). Students cannot delete.
    """

    permission_classes = [
        IsAuthenticated,
        permissions.IsJobApplicationConnectedOrReadOnly,
    ]
    model = JobApplication
    serializer_class = JobApplicationSerializer
    parser_classes = [parsers.MultiPartParser, parsers.JSONParser]
    sanitize_fields = ["cover_letter"]
    resource_name = "JobApplication"
    id_field = "id"

    @extend_schema(
        responses={200: JobApplicationSerializer},
        description="Retrieve a specific job application by ID.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific job application by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} detail GET request from IP: {client_ip} for user: {user.email}"
        )
        try:
            instance = self.get_object(instance_id)
            serializer = self.serializer_class(instance)
            logger.info(
                f"JobApplication retrieved successfully: {self._get_log_message(instance)}"
            )

            return Response(
                {
                    "message": "JobApplication retrieved successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error retrieving job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except exceptions.PermissionDenied as e:
            logger.error(
                f"Permission denied retrieving job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=JobApplicationSerializer,
        responses={200: JobApplicationSerializer},
        description="Update a specific job application by ID. Restricted to Admins, Students (own applications), or job posters.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific job application by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} update PATCH request from IP: {client_ip} for user: {user.email}"
        )
        try:
            instance = self.get_object(instance_id)
            sanitized_data = self.request.data.copy()

            if "cover_letter" in sanitized_data:
                sanitized_data["cover_letter"] = utils.sanitize_input(
                    {"cover_letter": sanitized_data["cover_letter"]},
                    fields=["cover_letter"],
                )["cover_letter"]
            serializer = self.serializer_class(
                instance, data=sanitized_data, partial=True
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid job application update data for {instance_id}: {serializer.errors}"
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
                f"JobApplication updated successfully: {self._get_log_message(instance)}"
            )
            return Response(
                {
                    "message": "JobApplication updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error updating job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except exceptions.PermissionDenied as e:
            logger.error(
                f"Permission denied updating job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error updating job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific job application by ID. Restricted to Admins or job posters.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific job application by ID.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} delete DELETE request from IP: {client_ip} for user: {user.email}"
        )
        try:
            instance = self.get_object(instance_id)
            log_message = self._get_log_message(instance)
            instance.delete()

            logger.info(f"JobApplication deleted successfully: {log_message}")
            return Response(
                {
                    "message": "JobApplication deleted successfully",
                    "error_code": None,
                },
                status=status.HTTP_204_NO_CONTENT,
            )

        except exceptions.ValidationError as e:
            logger.error(
                f"Validation error deleting job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid request",
                    "errors": e.detail,
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except exceptions.PermissionDenied as e:
            logger.error(
                f"Permission denied deleting job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": str(e),
                    "error_code": e.detail.get("error_code", "PERMISSION_DENIED"),
                },
                status=status.HTTP_403_FORBIDDEN,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error deleting job application {instance_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
