from django.core.exceptions import ValidationError
from rest_framework import parsers, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from drf_spectacular.utils import extend_schema
from .models import (
    CourseCategory,
    Course,
    Module,
    Enrollment,
    UserProgress,
    Assessment,
    Question,
    UserAssessment,
    Certification,
    Discussion,
    DiscussionReply,
)
from .serializers import (
    CourseCategorySerializer,
    CourseSerializer,
    ModuleSerializer,
    EnrollmentSerializer,
    UserProgressSerializer,
    AssessmentSerializer,
    QuestionSerializer,
    UserAssessmentSerializer,
    CertificationSerializer,
    DiscussionSerializer,
    DiscussionReplySerializer,
)
from utils import logging_config, custom_pagination, generic_views, permissions, utils

logger = logging_config.setup_logging()


class CourseCategoryListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating course categories.
    Inherits from GenericListCreateView to handle GET and POST requests.
    """

    permission_classes = [IsAuthenticated]
    model = CourseCategory
    serializer_class = CourseCategorySerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["name"]
    resource_name = "CourseCategory"

    @extend_schema(
        responses={200: CourseCategorySerializer(many=True)},
        description="Retrieve a paginated list of course categories.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of course categories.
        """
        return super().get(request)

    @extend_schema(
        request=CourseCategorySerializer,
        responses={201: CourseCategorySerializer},
        description="Create a new course category.",
    )
    def post(self, request):
        """
        Create a new course category.
        """
        return super().post(request)

    def _get_log_message(self, data):
        """
        Generate a log message for course category operations.
        """
        if isinstance(data, dict):
            return data.get("name", str(data))

        return data.name


class CourseCategoryRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific course category.
    Inherits from GenericRetrieveUpdateDeleteView to handle GET, PATCH, and DELETE requests.
    """

    permission_classes = [IsAuthenticated]
    model = CourseCategory
    serializer_class = CourseCategorySerializer
    sanitize_fields = ["name"]
    resource_name = "CourseCategory"
    id_field = "id"

    @extend_schema(
        responses={200: CourseCategorySerializer},
        description="Retrieve a specific course category by ID.",
    )
    def get(self, request, instance_id: str):
        """
        Retrieve a specific course category by ID.
        """
        return super().get(request, instance_id)

    @extend_schema(
        request=CourseCategorySerializer,
        responses={200: CourseCategorySerializer},
        description="Update a specific course category by ID.",
    )
    def patch(self, request, instance_id: str):
        """
        Update a specific course category by ID.
        """
        return super().patch(request, instance_id)

    @extend_schema(
        responses={204: None}, description="Delete a specific course category by ID."
    )
    def delete(self, request, instance_id: str):
        """
        Delete a specific course category by ID.
        """
        return super().delete(request, instance_id)

    def _get_log_message(self, instance):
        """
        Generate a log message for course category operations.
        """
        if isinstance(instance, dict):
            return instance.get("name", str(instance))
        return instance.name


class CourseListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating courses.
    Supports file uploads for course profile pictures.
    """

    permission_classes = [IsAuthenticated, permissions.IsInstructor]
    model = Course
    serializer_class = CourseSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = [
        "title",
        "requirements",
        "duration",
        "difficult_level",
        "description",
    ]
    resource_name = "Course"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @extend_schema(
        responses={200: CourseSerializer(many=True)},
        description="Retrieve a paginated list of courses.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of courses.
        """
        return super().get(request)

    @extend_schema(
        request=CourseSerializer,
        responses={200: CourseSerializer},
        description="Create a new course with optional profile picture upload.",
    )
    def post(self, request):
        """
        Create a new course with optional profile picture upload.
        """
        return super().post(request)

    def _get_log_message(self, data):
        """
        Generate a log message for course operations.
        """
        return data.get("title", str(data)) if isinstance(data, dict) else data.title


class CourseRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific course.
    Supports file uploads for updating course profile pictures.
    """

    permission_classes = [IsAuthenticated, permissions.IsInstructor]
    model = Course
    serializer_class = CourseSerializer
    sanitize_fields = [
        "title",
        "requirements",
        "duration",
        "difficult_level",
        "description",
    ]
    resource_name = "Course"
    id_field = "id"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @extend_schema(
        responses={200: CourseSerializer},
        description="Retrieve a specific course by ID.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific course by ID.
        """
        return super().get(request, instance_id)

    @extend_schema(
        request=CourseSerializer,
        responses={200: CourseSerializer},
        description="Update a specific course by ID, including profile picture.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific course by ID, including profile picture.
        """
        return super().patch(request, instance_id)

    @extend_schema(
        responses={204: None},
        description="Delete a specific course by ID.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific course by ID.
        """
        return super().delete(request, instance_id)

    def _get_log_message(self, instance):
        """
        Generate a log message for course operations.
        """
        return (
            instance.get("title", str(instance))
            if isinstance(instance, dict)
            else instance.title
        )


class ModuleListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating modules.
    Supports file uploads for module media.
    """

    permission_classes = [IsAuthenticated, permissions.IsInstructor]
    model = Module
    serializer_class = ModuleSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = [
        "title",
        "content",
        "content_type",
        "duration",
    ]
    resource_name = "Module"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @extend_schema(
        responses={200: ModuleSerializer(many=True)},
        description="Retrieve a paginated list of modules.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of modules.
        """
        try:
            return super().get(request)

        except ValidationError as e:
            logger.error(f"Validation error retrieving module list: {str(e)}")
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error in module list retrieval: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=ModuleSerializer,
        responses={200: ModuleSerializer},
        description="Create a new module with optional media upload.",
    )
    def post(self, request):
        """
        Create a new module with optional media upload.
        """
        try:
            # Handle file upload
            data = request.data.copy()
            media_file = data.get("media", None)

            # Sanitize input, excluding file fields
            sanitized_data = utils.sanitize_input(
                {k: v for k, v in data.items() if k != "media"},
                fields=self.sanitize_fields,
            )

            if media_file:
                sanitized_data["media"] = media_file

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
            logger.error(f"Validation error creating module: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating module: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data):
        """
        Generate a log message for module operations.
        """
        return f"{data.get('title', str(data))} (Order: {data.get('order', 'N/A')})"


class ModuleRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific module.
    Supports file uploads for updating module media.
    """

    permission_classes = [IsAuthenticated, permissions.IsInstructor]
    model = Module
    serializer_class = ModuleSerializer
    sanitize_fields = [
        "title",
        "content",
        "content_type",
        "duration",
    ]
    resource_name = "Module"
    id_field = "id"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    @extend_schema(
        responses={200: ModuleSerializer},
        description="Retrieve a specific module by ID.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific module by ID.
        """
        try:
            return super().get(request, instance_id)

        except Exception as e:
            logger.error(f"Unexpected error in Module retrieval: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=ModuleSerializer,
        responses={200: ModuleSerializer},
        description="Update a specific module by ID, including media.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific module by ID, including media.
        """
        try:
            return super().patch(request, instance_id)

        except Exception as e:
            logger.error(f"Unexpected error in Module update: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific module by ID.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific module by ID.
        """
        try:
            return super().delete(request, instance_id)

        except Exception as e:
            logger.error(f"Unexpected error in Module deletion: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for module operations.
        """
        return f"{instance.title} (Order: {instance.order})"


class EnrollmentListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating enrollments.
    - GET: Lists enrollments based on user role (Admin: all, Instructor: their courses, Student: their enrollments).
    - POST: Allows any authenticated user to enroll in a course.
    """

    permission_classes = [IsAuthenticated]
    model = Enrollment
    serializer_class = EnrollmentSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["status"]
    resource_name = "Enrollment"

    @extend_schema(
        responses={200: EnrollmentSerializer(many=True)},
        description="Retrieve a paginated list of enrollments based on user role: Admins see all enrollments, Instructors see enrollments for their courses, Students see their own enrollments.",
    )
    def get(self, request):
        """
        Retrieve a paginated list of enrollments based on user role.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"{self.resource_name} list GET request from IP: {client_ip} for user: {user.email} (Role: {user.role})"
        )
        try:
            # Determine queryset based on user role
            if user.role == "Admin":
                queryset = self.model.objects.all()
                logger.debug("Admin user: Retrieving all enrollments")

            elif user.role == "Instructor":
                # Filter enrollments for courses created by the instructor
                queryset = self.model.objects.filter(course__instructor=user)
                logger.debug(
                    f"Instructor user: Retrieving enrollments for courses by {user.email}"
                )

            else:
                # Default to student or other roles: only their own enrollments
                queryset = self.model.objects.filter(user=user)
                logger.debug(f"Student user: Retrieving enrollments for {user.email}")

            queryset = queryset.order_by("enrolled_at")
            paginator = self.pagination_class()
            paginated_items = paginator.paginate_queryset(queryset, request)

            serializer = self.serializer_class(paginated_items, many=True)
            logger.info(
                f"Successfully retrieved {len(paginated_items)} enrollments for user: {user.email}"
            )
            return paginator.get_paginated_response(serializer.data)

        except ValidationError as e:
            logger.error(f"Validation error retrieving enrollment list: {str(e)}")
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error in enrollment list retrieval: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        # return super().get(request)

    @extend_schema(
        request=EnrollmentSerializer,
        responses={200: EnrollmentSerializer},
        description="Create a new Enrollment.",
    )
    def post(self, request):
        """
        Create a new Enrollment.
        """
        return super().post(request)

    def _get_log_message(self, data):
        """
        Generate a log message for enrollment operations.
        """
        course_id = data.get("course")
        try:
            course = Course.objects.get(id=course_id)
            return f"User {data.get('user')} in Course {course.title}"
        except Course.DoesNotExist:
            return f"User {data.get('user')} in Course ID {course_id}"


class EnrollmentRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific enrollment.
    """

    permission_classes = [
        IsAuthenticated,
        permissions.IsAdminOrInstructor,
    ]
    model = Enrollment
    serializer_class = EnrollmentSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["status"]
    resource_name = "Enrollment"
    id_field = "id"

    @extend_schema(
        responses={200: EnrollmentSerializer},
        description="Retrieve a specific enrollment by ID.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific enrollment by ID.
        """
        return super().get(request, instance_id)

    @extend_schema(
        request=EnrollmentSerializer,
        responses={200: EnrollmentSerializer},
        description="Update a specific enrollment by ID",
    )
    def patch(self, request, instance_id):
        """
        Update a specific enrollment by ID.
        """
        return super().patch(request, instance_id)

    @extend_schema(
        responses={204: None},
        description="Delete a specific enrollment by ID.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific enrollment by ID.
        """
        return super().delete(request, instance_id)

    def _get_log_message(self, instance):
        """
        Generate a log message for enrollment operations.
        """
        return f"Course {instance.course.title}"


class UserProgressListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating UserProgress records.
    Only authenticated users can access their own progress records.
    """

    permission_classes = [IsAuthenticated]
    model = UserProgress
    serializer_class = UserProgressSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["progress_percentage", "is_active"]
    resource_name = "UserProgress"

    def get_queryset(self):
        """
        Return only the current user's progress records.
        """
        return self.model.objects.filter(user=self.request.user).order_by(
            "-last_accessed"
        )

    @extend_schema(
        responses={200: UserProgressSerializer(many=True)},
        description="Retrieve a paginated list of the current user's course progress records.",
    )
    def get(self, request):
        """
        Retrieve the current user's progress records.
        """
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving UserProgress list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=UserProgressSerializer,
        responses={201: UserProgressSerializer},
        description="Create a new progress record for the current user.",
    )
    def post(self, request):
        """
        Create a new progress record for the current user.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Add context for serializer
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            if not serializer.is_valid():
                logger.warning(f"Invalid UserProgress data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Save the progress record
            progress = serializer.save()

            logger.info(
                f"UserProgress created successfully for user {request.user.username} "
                f"in course {progress.course.title}"
            )

            return Response(
                {
                    "message": "Progress record created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating UserProgress: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating UserProgress: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data: dict) -> str:
        """
        Generate a log message for UserProgress operations.
        """
        return f"User {data.get('user', 'unknown')} - Course {data.get('course', 'unknown')}"


class UserProgressRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific UserProgress record.
    Users can only access their own progress records.
    """

    permission_classes = [IsAuthenticated, permissions.IsStudent]
    model = UserProgress
    serializer_class = UserProgressSerializer
    sanitize_fields = ["progress_percentage", "is_active"]
    resource_name = "UserProgress"
    id_field = "id"

    def get_object(self, instance_id):
        """
        Retrieve the UserProgress instance, ensuring it belongs to the current user.
        """
        try:
            progress = super().get_object(instance_id)
            if progress.user != self.request.user:
                logger.warning(
                    f"User {self.request.user.username} attempted to access "
                    f"progress record {instance_id} belonging to another user"
                )
                raise ValidationError(
                    {
                        "error": "You can only access your own progress records",
                        "error_code": "PERMISSION_DENIED",
                    }
                )
            return progress

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving UserProgress {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve progress record",
                    "error_code": "PROGRESS_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: UserProgressSerializer},
        description="Retrieve a specific progress record belonging to the current user.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific progress record.
        """
        try:
            return super().get(request, instance_id)

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error retrieving UserProgress {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=UserProgressSerializer,
        responses={200: UserProgressSerializer},
        description="Update a specific progress record belonging to the current user.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific progress record.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Get the progress record
            progress = self.get_object(instance_id)

            # Validate and update
            serializer = self.serializer_class(
                progress,
                data=sanitized_data,
                partial=True,
                context={"request": request},
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid UserProgress update data for {instance_id}: "
                    f"{serializer.errors}"
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
                f"UserProgress {instance_id} updated successfully for user "
                f"{request.user.username}"
            )

            return Response(
                {
                    "message": "Progress record updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error updating UserProgress {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific progress record belonging to the current user.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific progress record.
        """
        try:
            progress = self.get_object(instance_id)
            progress.delete()

            logger.info(
                f"UserProgress {instance_id} deleted successfully for user "
                f"{request.user.username}"
            )

            return Response(
                {"message": "Progress record deleted successfully", "error_code": None},
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )
        except Exception as e:
            logger.error(f"Error deleting UserProgress {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for UserProgress operations.
        """
        return f"{instance.user.username} - {instance.course.title}: {instance.progress_percentage}%"


class AssessmentListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating Assessments.
    Only admins and instructors (for their own courses) can access.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdminOrInstructor]
    model = Assessment
    serializer_class = AssessmentSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["title", "description"]
    resource_name = "Assessment"

    def get_queryset(self):
        """
        Return assessments based on user role:
        - Admins see all assessments
        - Instructors only see assessments for their own courses
        """
        queryset = super().get_queryset()

        if hasattr(self.request.user, "is_admin") and self.request.user.is_admin:
            return queryset

        # For instructors, filter by their courses
        return queryset.filter(module__course__instructor=self.request.user)

    @extend_schema(
        responses={200: AssessmentSerializer(many=True)},
        description="Retrieve a paginated list of assessments. Admins see all, instructors only see their own.",
    )
    def get(self, request):
        """
        Retrieve assessments based on user permissions.
        """
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving Assessment list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=AssessmentSerializer,
        responses={201: AssessmentSerializer},
        description="Create a new assessment. Admins can create for any module, instructors only for their own courses.",
    )
    def post(self, request):
        """
        Create a new assessment with permission checks.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Add context for serializer
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            if not serializer.is_valid():
                logger.warning(f"Invalid Assessment data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Save the assessment
            assessment = serializer.save()

            logger.info(
                f"Assessment created successfully: {assessment.title} "
                f"by user {request.user.username}"
            )

            return Response(
                {
                    "message": "Assessment created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating Assessment: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating Assessment: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data: dict) -> str:
        """
        Generate a log message for Assessment operations.
        """
        return f"{data.get('title', 'Untitled Assessment')} for module {data.get('module', 'unknown')}"


class AssessmentRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific Assessment.
    Only admins and instructors (for their own courses) can access.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdminOrInstructor]
    model = Assessment
    serializer_class = AssessmentSerializer
    sanitize_fields = ["title", "description"]
    resource_name = "Assessment"
    id_field = "id"

    def get_object(self, instance_id):
        """
        Retrieve the Assessment instance with permission checks.
        """
        try:
            assessment = super().get_object(instance_id)

            # Admins can access any assessment
            if hasattr(self.request.user, "is_admin") and self.request.user.is_admin:
                return assessment

            # Instructors can only access their own course assessments
            if assessment.module.course.instructor != self.request.user:
                logger.warning(
                    f"User {self.request.user.username} attempted to access "
                    f"assessment {instance_id} from another instructor's course"
                )
                raise ValidationError(
                    {
                        "error": "You can only access assessments in your own courses",
                        "error_code": "PERMISSION_DENIED",
                    }
                )

            return assessment

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving Assessment {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve assessment",
                    "error_code": "ASSESSMENT_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: AssessmentSerializer},
        description="Retrieve a specific assessment. Admins can access any, instructors only their own.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific assessment with permission checks.
        """
        try:
            return super().get(request, instance_id)

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error retrieving Assessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=AssessmentSerializer,
        responses={200: AssessmentSerializer},
        description="Update a specific assessment. Admins can update any, instructors only their own.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific assessment with permission checks.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Get the assessment with permission check
            assessment = self.get_object(instance_id)

            # Validate and update
            serializer = self.serializer_class(
                assessment,
                data=sanitized_data,
                partial=True,
                context={"request": request},
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid Assessment update data for {instance_id}: "
                    f"{serializer.errors}"
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
                f"Assessment {instance_id} updated successfully by "
                f"{request.user.username}"
            )

            return Response(
                {
                    "message": "Assessment updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error updating Assessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific assessment. Admins can delete any, instructors only their own.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific assessment with permission checks.
        """
        try:
            assessment = self.get_object(instance_id)
            title = assessment.title
            assessment.delete()

            logger.info(
                f"Assessment '{title}' (ID: {instance_id}) deleted successfully by "
                f"{request.user.username}"
            )

            return Response(
                {"message": "Assessment deleted successfully", "error_code": None},
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error deleting Assessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for Assessment operations.
        """
        return f"{instance.title} (Module: {instance.module.title})"


class QuestionListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating Questions.
    Only admins and instructors (for their own courses) can access.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdminOrInstructor]
    model = Question
    serializer_class = QuestionSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["question", "correct_answer"]
    resource_name = "Question"

    def get_queryset(self):
        """
        Return questions based on user role:
        - Admins see all questions
        - Instructors only see questions for their own courses
        """
        queryset = super().get_queryset()

        if hasattr(self.request.user, "is_admin") and self.request.user.is_admin:
            return queryset

        # For instructors, filter by their courses
        return queryset.filter(assessment__module__course__instructor=self.request.user)

    @extend_schema(
        responses={200: QuestionSerializer(many=True)},
        description="Retrieve a paginated list of questions. Admins see all, instructors only see their own.",
    )
    def get(self, request):
        """
        Retrieve questions based on user permissions.
        """
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving Question list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=QuestionSerializer,
        responses={201: QuestionSerializer},
        description="Create a new question. Admins can create for any assessment, instructors only for their own courses.",
    )
    def post(self, request):
        """
        Create a new question with permission checks.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Add context for serializer
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            if not serializer.is_valid():
                logger.warning(f"Invalid Question data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Save the question
            question = serializer.save()

            logger.info(
                f"Question created successfully by user {request.user.username}"
            )

            return Response(
                {
                    "message": "Question created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating Question: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating Question: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data: dict) -> str:
        """
        Generate a log message for Question operations.
        """
        return f"Question for assessment {data.get('assessment', 'unknown')}"


class QuestionRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific Question.
    Only admins and instructors (for their own courses) can access.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdminOrInstructor]
    model = Question
    serializer_class = QuestionSerializer
    sanitize_fields = ["question", "correct_answer"]
    resource_name = "Question"
    id_field = "id"

    def get_object(self, instance_id):
        """
        Retrieve the Question instance with permission checks.
        """
        try:
            question = super().get_object(instance_id)

            # Admins can access any question
            if hasattr(self.request.user, "is_admin") and self.request.user.is_admin:
                return question

            # Instructors can only access their own course questions
            if question.assessment.module.course.instructor != self.request.user:
                logger.warning(
                    f"User {self.request.user.username} attempted to access "
                    f"question {instance_id} from another instructor's course"
                )
                raise ValidationError(
                    {
                        "error": "You can only access questions in your own courses",
                        "error_code": "PERMISSION_DENIED",
                    }
                )

            return question

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving Question {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve question",
                    "error_code": "QUESTION_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: QuestionSerializer},
        description="Retrieve a specific question. Admins can access any, instructors only their own.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific question with permission checks.
        """
        try:
            return super().get(request, instance_id)

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error retrieving Question {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=QuestionSerializer,
        responses={200: QuestionSerializer},
        description="Update a specific question. Admins can update any, instructors only their own.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific question with permission checks.
        """
        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )

            # Get the question with permission check
            question = self.get_object(instance_id)

            # Validate and update
            serializer = self.serializer_class(
                question,
                data=sanitized_data,
                partial=True,
                context={"request": request},
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid Question update data for {instance_id}: "
                    f"{serializer.errors}"
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
                f"Question {instance_id} updated successfully by "
                f"{request.user.username}"
            )

            return Response(
                {
                    "message": "Question updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error updating Question {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific question. Admins can delete any, instructors only their own.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific question with permission checks.
        """
        try:
            question = self.get_object(instance_id)
            question_text = question.question
            question.delete()

            logger.info(
                f"Question '{question_text}' (ID: {instance_id}) deleted successfully by "
                f"{request.user.username}"
            )

            return Response(
                {"message": "Question deleted successfully", "error_code": None},
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error deleting Question {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for Question operations.
        """
        return f"{instance.question} (Assessment: {instance.assessment.title})"
