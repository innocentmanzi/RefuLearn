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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
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

    def get_queryset(self):
        """
        Return courses based on user role:
        - Admin: all courses
        - Instructor: only their own courses
        - Student: all courses (read-only)
        """
        user = self.request.user
        if user.role == "Admin":
            logger.info(f"Admin {user.email} retrieving all courses")
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            logger.info(f"Instructor {user.email} retrieving their own courses")
            return self.model.objects.filter(instructor=user).order_by("-created_at")

        else:
            logger.info(f"Student {user.email} retrieving all courses (read-only)")
            return self.model.objects.all().order_by("-created_at")

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
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

    def get_queryset(self):
        """
        Return modules based on user role:
        - Admin: all modules
        - Instructor: only the modules under their own courses
        - Student: all modules (read-only)
        """
        user = self.request.user
        if user.role == "Admin":
            logger.info(f"Admin {user.email} retrieving all modules")
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            logger.info(
                f"Instructor {user.email} retrieving the modules under their own courses"
            )
            return self.model.objects.filter(course__instructor=user).order_by(
                "-created_at"
            )

        else:
            logger.info(f"Student {user.email} retrieving all modules (read-only)")
            return self.model.objects.all().order_by("-created_at")

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
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
        user = self.request.user
        if user.role == "Admin":
            return self.model.objects.all().order_by("-last_accessed")

        elif user.role == "Instructor":
            return self.model.objects.filter(course__instructor=user).order_by(
                "-last_accessed"
            )

        else:
            return self.model.objects.filter(user=user).order_by("-last_accessed")

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
    model = Assessment
    serializer_class = AssessmentSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["title", "description"]
    resource_name = "Assessment"

    def get_queryset(self):
        """
        Return assessments based on user role:
        - Admin: all assessments
        - Instructor: only assessments under their courses
        - Student/Other: only assessments under courses they are enrolled in
        """
        user = self.request.user
        if user.role == "Admin":
            logger.info(f"Admin {user.email} retrieving all assessments")
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            logger.info(
                f"Instructor {user.email} retrieving assessments under their courses"
            )
            return self.model.objects.filter(module__course__instructor=user).order_by(
                "-created_at"
            )

        else:
            logger.info(
                f"Student {user.email} retrieving assessments under enrolled courses"
            )
            # Get all course IDs the student is enrolled in
            enrolled_course_ids = user.student_enrollment.values_list(
                "course_id", flat=True
            )
            return self.model.objects.filter(
                module__course__id__in=enrolled_course_ids
            ).order_by("-created_at")

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
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
            user = self.request.user

            # Admins can access any assessment
            if user.role == "Admin":
                return assessment

            # Instructors can access assessments under their courses
            if user.role == "Instructor":
                if assessment.module.course.instructor == user:
                    return assessment

                logger.warning(
                    f"Instructor {user.username} attempted to access assessment {instance_id} not under their course"
                )
                raise ValidationError(
                    {
                        "error": "You can only access assessments in your own courses",
                        "error_code": "PERMISSION_DENIED",
                    }
                )

            # Students/Other: can only retrieve if enrolled, but not update/delete
            if user.role == "Student":
                enrolled_course_ids = user.student_enrollment.values_list(
                    "course_id", flat=True
                )
                if assessment.module.course.id in enrolled_course_ids:
                    # Only allow safe methods (GET, HEAD, OPTIONS)
                    if self.request.method in ("GET", "HEAD", "OPTIONS"):
                        return assessment
                    logger.warning(
                        f"Student {user.username} attempted to modify assessment {instance_id} (not allowed)"
                    )
                    raise ValidationError(
                        {
                            "error": "You do not have permission to modify this assessment",
                            "error_code": "PERMISSION_DENIED",
                        }
                    )
                logger.warning(
                    f"Student {user.username} attempted to access assessment {instance_id} not in enrolled courses"
                )
                raise ValidationError(
                    {
                        "error": "You can only access assessments in your enrolled courses",
                        "error_code": "PERMISSION_DENIED",
                    }
                )

            # Other roles: deny
            logger.warning(
                f"User {user.username} with role {user.role} attempted to access assessment {instance_id} without permission"
            )
            raise ValidationError(
                {
                    "error": "You do not have permission to access this assessment",
                    "error_code": "PERMISSION_DENIED",
                }
            )

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
    model = Question
    serializer_class = QuestionSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["question", "correct_answer"]
    resource_name = "Question"

    def get_queryset(self):
        """
        Return questions based on user role:
        - Admins: all questions
        - Instructors: all questions for their own courses
        - Student: all questions (read-only)
        """
        user = self.request.user
        if user.role == "Admin":
            logger.info(f"Admin {user.email} retrieving all questions")
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            logger.info(
                f"Instructor {user.email} retrieving questions under their own courses"
            )
            return self.model.objects.filter(
                assessment__module__course__instructor=user
            ).order_by("-created_at")

        else:
            logger.info(f"Student {user.email} retrieving all questions (read-only)")
            return self.model.objects.all().order_by("-created_at")

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

    permission_classes = [
        IsAuthenticated,
        permissions.IsCourseAdminInstructorOrReadOnly,
    ]
    model = Question
    serializer_class = QuestionSerializer
    sanitize_fields = ["question", "correct_answer"]
    resource_name = "Question"
    id_field = "id"

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


class UserAssessmentListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating UserAssessment records.
    - GET: Lists user assessments based on user role (Admin: all, Instructor: their courses, Student: their own).
    - POST: Allows authenticated users to submit assessment attempts.
    """

    permission_classes = [IsAuthenticated]
    model = UserAssessment
    serializer_class = UserAssessmentSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["attempt_number", "answers", "score", "passed", "time_taken"]
    resource_name = "UserAssessment"

    def get_queryset(self):
        """
        Return user assessments based on user role.
        """
        user = self.request.user
        if user.role == "Admin":
            return self.model.objects.all().order_by("-started_at")

        elif user.role == "Instructor":
            return self.model.objects.filter(
                assessment__module__course__instructor=user
            ).order_by("-started_at")

        else:
            return self.model.objects.filter(user=user).order_by("-started_at")

    @extend_schema(
        responses={200: UserAssessmentSerializer(many=True)},
        description="Retrieve a paginated list of user assessments. Admins see all, instructors see their courses, students see their own.",
    )
    def get(self, request):
        """
        Retrieve user assessments based on user permissions.
        """
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving UserAssessment list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=UserAssessmentSerializer,
        responses={201: UserAssessmentSerializer},
        description="Submit a new user assessment attempt.",
    )
    def post(self, request):
        """
        Submit a new user assessment attempt.
        """
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            # Always set user to the authenticated user
            sanitized_data["user"] = request.user.id
            serializer = self.serializer_class(data=sanitized_data)

            if not serializer.is_valid():
                logger.warning(f"Invalid UserAssessment data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            assessment = serializer.save()
            logger.info(
                f"UserAssessment created for user {request.user.username} on assessment {assessment.assessment.title}"
            )

            return Response(
                {
                    "message": "Assessment attempt submitted successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating UserAssessment: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating UserAssessment: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data):
        """
        Generate a log message for UserAssessment operations.
        """
        return f"User {data.get('user', 'unknown')} - Assessment {data.get('assessment', 'unknown')} (Attempt {data.get('attempt_number', '?')})"


class UserAssessmentRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific UserAssessment record.
    Only the owner, instructors (for their courses), or admins can access.
    """

    permission_classes = [IsAuthenticated]
    model = UserAssessment
    serializer_class = UserAssessmentSerializer
    sanitize_fields = ["attempt_number", "answers", "score", "passed", "time_taken"]
    resource_name = "UserAssessment"
    id_field = "id"

    def get_object(self, instance_id):
        """
        Retrieve the UserAssessment instance with permission checks.
        """
        try:
            assessment = super().get_object(instance_id)
            user = self.request.user
            if user.role == "Admin":
                return assessment

            if user.role == "Instructor":
                if assessment.assessment.module.course.instructor == user:
                    return assessment

            if assessment.user == user:
                return assessment

            logger.warning(
                f"User {user.username} attempted to access UserAssessment {instance_id} without permission"
            )
            raise ValidationError(
                {
                    "error": "You do not have permission to access this assessment attempt",
                    "error_code": "PERMISSION_DENIED",
                }
            )

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving UserAssessment {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve user assessment",
                    "error_code": "USER_ASSESSMENT_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: UserAssessmentSerializer},
        description="Retrieve a specific user assessment attempt.",
    )
    def get(self, request, instance_id):
        """
        Retrieve a specific user assessment attempt.
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
            logger.error(f"Error retrieving UserAssessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=UserAssessmentSerializer,
        responses={200: UserAssessmentSerializer},
        description="Update a specific user assessment attempt.",
    )
    def patch(self, request, instance_id):
        """
        Update a specific user assessment attempt.
        """
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            assessment = self.get_object(instance_id)
            serializer = self.serializer_class(
                assessment, data=sanitized_data, partial=True
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid UserAssessment update data for {instance_id}: {serializer.errors}"
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
                f"UserAssessment {instance_id} updated successfully by {request.user.username}"
            )
            return Response(
                {
                    "message": "Assessment attempt updated successfully",
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
            logger.error(f"Error updating UserAssessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific user assessment attempt.",
    )
    def delete(self, request, instance_id):
        """
        Delete a specific user assessment attempt.
        """
        try:
            assessment = self.get_object(instance_id)
            assessment.delete()
            logger.info(
                f"UserAssessment {instance_id} deleted successfully by {request.user.username}"
            )

            return Response(
                {
                    "message": "Assessment attempt deleted successfully",
                    "error_code": None,
                },
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
            logger.error(f"Error deleting UserAssessment {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        """
        Generate a log message for UserAssessment operations.
        """
        return f"{instance.user.username} - {instance.assessment.title} (Attempt {instance.attempt_number})"


class CertificationListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating Certification records.
    - GET: Lists certifications (admins see all, instructors see their courses, students see their own).
    - POST: Allows creation of new certifications.
    """

    permission_classes = [IsAuthenticated]
    model = Certification
    serializer_class = CertificationSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["certificate_type", "title", "description"]
    resource_name = "Certification"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_queryset(self):
        user = self.request.user
        if user.role == "Admin":
            return self.model.objects.all().order_by("-issued_at")

        elif user.role == "Instructor":
            return self.model.objects.filter(course__instructor=user).order_by(
                "-issued_at"
            )

        else:
            return self.model.objects.filter(user=user).order_by("-issued_at")

    @extend_schema(
        responses={200: CertificationSerializer(many=True)},
        description="Retrieve a paginated list of certifications. Admins see all, instructors see their courses, students see their own.",
    )
    def get(self, request):
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving Certification list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=CertificationSerializer,
        responses={201: CertificationSerializer},
        description="Create a new certification.",
    )
    def post(self, request):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            sanitized_data["user"] = request.user.id
            serializer = self.serializer_class(data=sanitized_data)

            if not serializer.is_valid():
                logger.warning(f"Invalid Certification data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            certification = serializer.save()
            logger.info(
                f"Certification created for user {request.user.username} in course {certification.course.title}"
            )

            return Response(
                {
                    "message": "Certification created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating Certification: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating Certification: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data):
        return f"User {data.get('user', 'unknown')} - Course {data.get('course', 'unknown')} ({data.get('certificate_type', '?')})"


class CertificationRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific Certification record.
    Only the owner, instructors (for their courses), or admins can access.
    """

    permission_classes = [IsAuthenticated]
    model = Certification
    serializer_class = CertificationSerializer
    sanitize_fields = ["certificate_type", "title", "description"]
    resource_name = "Certification"
    id_field = "id"
    parser_classes = [parsers.MultiPartParser, parsers.FormParser]

    def get_object(self, instance_id):
        try:
            cert = super().get_object(instance_id)
            user = self.request.user

            if user.role == "Admin":
                return cert

            if user.role == "Instructor" and cert.course.instructor == user:
                return cert

            if cert.user == user:
                return cert

            logger.warning(
                f"User {user.username} attempted to access Certification {instance_id} without permission"
            )
            raise ValidationError(
                {
                    "error": "You do not have permission to access this certification",
                    "error_code": "PERMISSION_DENIED",
                }
            )

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving Certification {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve certification",
                    "error_code": "CERTIFICATION_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: CertificationSerializer},
        description="Retrieve a specific certification.",
    )
    def get(self, request, instance_id):
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
            logger.error(f"Error retrieving Certification {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=CertificationSerializer,
        responses={200: CertificationSerializer},
        description="Update a specific certification.",
    )
    def patch(self, request, instance_id):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            cert = self.get_object(instance_id)
            serializer = self.serializer_class(cert, data=sanitized_data, partial=True)

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid Certification update data for {instance_id}: {serializer.errors}"
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
                f"Certification {instance_id} updated successfully by {request.user.username}"
            )
            return Response(
                {
                    "message": "Certification updated successfully",
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
            logger.error(f"Error updating Certification {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific certification.",
    )
    def delete(self, request, instance_id):
        try:
            cert = self.get_object(instance_id)
            cert.delete()
            logger.info(
                f"Certification {instance_id} deleted successfully by {request.user.username}"
            )
            return Response(
                {"message": "Certification deleted successfully", "error_code": None},
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
            logger.error(f"Error deleting Certification {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        return f"{instance.user.username} - {instance.course.title} ({instance.certificate_type})"


class DiscussionListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating Discussion records.
    - GET: Lists discussions (admins see all, instructors see their courses, students see their own or all).
    - POST: Allows creation of new discussions.
    """

    permission_classes = [IsAuthenticated]
    model = Discussion
    serializer_class = DiscussionSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["title", "category", "content", "status"]
    resource_name = "Discussion"

    def get_queryset(self):
        user = self.request.user
        if user.role == "Admin":
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            return self.model.objects.filter(course__instructor=user).order_by(
                "-created_at"
            )

        else:
            # Students see all discussions or only their own, adjust as needed
            return self.model.objects.all().order_by("-created_at")

    @extend_schema(
        responses={200: DiscussionSerializer(many=True)},
        description="Retrieve a paginated list of discussions.",
    )
    def get(self, request):
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving Discussion list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=DiscussionSerializer,
        responses={201: DiscussionSerializer},
        description="Create a new discussion.",
    )
    def post(self, request):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            sanitized_data["author"] = request.user.id
            serializer = self.serializer_class(data=sanitized_data)

            if not serializer.is_valid():
                logger.warning(f"Invalid Discussion data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            discussion = serializer.save()
            logger.info(
                f"Discussion created by user {request.user.username} with title '{discussion.title}'"
            )
            return Response(
                {
                    "message": "Discussion created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating Discussion: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating Discussion: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data):
        return f"Discussion '{data.get('title', 'unknown')}' by user {data.get('author', 'unknown')}"


class DiscussionRetrieveUpdateDeleteView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view for retrieving, updating, or deleting a specific Discussion record.
    Only the author, instructors (for their courses), or admins can access.
    """

    permission_classes = [IsAuthenticated]
    model = Discussion
    serializer_class = DiscussionSerializer
    sanitize_fields = ["title", "category", "content", "status"]
    resource_name = "Discussion"
    id_field = "id"

    def get_object(self, instance_id):
        try:
            discussion = super().get_object(instance_id)
            user = self.request.user

            if user.role == "Admin":
                return discussion
            if (
                user.role == "Instructor"
                and discussion.course
                and discussion.course.instructor == user
            ):
                return discussion

            if discussion.author == user:
                return discussion

            logger.warning(
                f"User {user.username} attempted to access Discussion {instance_id} without permission"
            )
            raise ValidationError(
                {
                    "error": "You do not have permission to access this discussion",
                    "error_code": "PERMISSION_DENIED",
                }
            )

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving Discussion {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve discussion",
                    "error_code": "DISCUSSION_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: DiscussionSerializer},
        description="Retrieve a specific discussion.",
    )
    def get(self, request, instance_id):
        try:
            return super().get(request, instance_id)

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error retrieving Discussion {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=DiscussionSerializer,
        responses={200: DiscussionSerializer},
        description="Update a specific discussion.",
    )
    def patch(self, request, instance_id):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            discussion = self.get_object(instance_id)
            serializer = self.serializer_class(
                discussion, data=sanitized_data, partial=True
            )

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid Discussion update data for {instance_id}: {serializer.errors}"
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
                f"Discussion {instance_id} updated successfully by {request.user.username}"
            )
            return Response(
                {
                    "message": "Discussion updated successfully",
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
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error updating Discussion {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific discussion.",
    )
    def delete(self, request, instance_id):
        try:
            discussion = self.get_object(instance_id)
            discussion.delete()
            logger.info(
                f"Discussion {instance_id} deleted successfully by {request.user.username}"
            )

            return Response(
                {"message": "Discussion deleted successfully", "error_code": None},
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error deleting Discussion {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        return f"{instance.title} by {instance.author.username}"


class DiscussionReplyListCreateView(generic_views.GenericListCreateView):
    """
    API view for listing and creating DiscussionReply records.
    - GET: Lists replies (admins see all, instructors see their courses, students see their own or all).
    - POST: Allows creation of new replies.
    """

    permission_classes = [IsAuthenticated]
    model = DiscussionReply
    serializer_class = DiscussionReplySerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    sanitize_fields = ["content", "is_solution"]
    resource_name = "DiscussionReply"

    def get_queryset(self):
        user = self.request.user
        if user.role == "Admin":
            return self.model.objects.all().order_by("-created_at")

        elif user.role == "Instructor":
            return self.model.objects.filter(
                discussion__course__instructor=user
            ).order_by("-created_at")

        else:
            # Students see all replies or only their own, adjust as needed
            return self.model.objects.all().order_by("-created_at")

    @extend_schema(
        responses={200: DiscussionReplySerializer(many=True)},
        description="Retrieve a paginated list of discussion replies.",
    )
    def get(self, request):
        try:
            return super().get(request)

        except Exception as e:
            logger.error(f"Error retrieving DiscussionReply list: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=DiscussionReplySerializer,
        responses={201: DiscussionReplySerializer},
        description="Create a new discussion reply.",
    )
    def post(self, request):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            sanitized_data["author"] = request.user.id
            serializer = self.serializer_class(data=sanitized_data)

            if not serializer.is_valid():
                logger.warning(f"Invalid DiscussionReply data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            reply = serializer.save()
            logger.info(
                f"DiscussionReply created by user {request.user.username} for discussion {reply.discussion.id}"
            )
            return Response(
                {
                    "message": "Discussion reply created successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_201_CREATED,
            )

        except ValidationError as e:
            logger.error(f"Validation error creating DiscussionReply: {str(e)}")
            return Response(
                {
                    "message": "Validation error",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(f"Unexpected error creating DiscussionReply: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, data):
        return f"Reply by user {data.get('author', 'unknown')} to discussion {data.get('discussion', 'unknown')}"


class DiscussionReplyRetrieveUpdateDeleteView(
    generic_views.GenericRetrieveUpdateDeleteView
):
    """
    API view for retrieving, updating, or deleting a specific DiscussionReply record.
    Only the author, instructors (for their courses), or admins can access.
    """

    permission_classes = [IsAuthenticated]
    model = DiscussionReply
    serializer_class = DiscussionReplySerializer
    sanitize_fields = ["content", "is_solution"]
    resource_name = "DiscussionReply"
    id_field = "id"

    def get_object(self, instance_id):
        try:
            reply = super().get_object(instance_id)
            user = self.request.user
            if user.role == "Admin":
                return reply

            if (
                user.role == "Instructor"
                and reply.discussion.course
                and reply.discussion.course.instructor == user
            ):
                return reply

            if reply.author == user:
                return reply

            logger.warning(
                f"User {user.username} attempted to access DiscussionReply {instance_id} without permission"
            )
            raise ValidationError(
                {
                    "error": "You do not have permission to access this reply",
                    "error_code": "PERMISSION_DENIED",
                }
            )

        except ValidationError as e:
            raise e

        except Exception as e:
            logger.error(f"Error retrieving DiscussionReply {instance_id}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to retrieve discussion reply",
                    "error_code": "DISCUSSION_REPLY_RETRIEVAL_ERROR",
                }
            )

    @extend_schema(
        responses={200: DiscussionReplySerializer},
        description="Retrieve a specific discussion reply.",
    )
    def get(self, request, instance_id):
        try:
            return super().get(request, instance_id)

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error retrieving DiscussionReply {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        request=DiscussionReplySerializer,
        responses={200: DiscussionReplySerializer},
        description="Update a specific discussion reply.",
    )
    def patch(self, request, instance_id):
        try:
            sanitized_data = utils.sanitize_input(
                request.data, fields=self.sanitize_fields
            )
            reply = self.get_object(instance_id)
            serializer = self.serializer_class(reply, data=sanitized_data, partial=True)

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid DiscussionReply update data for {instance_id}: {serializer.errors}"
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
                f"DiscussionReply {instance_id} updated successfully by {request.user.username}"
            )
            return Response(
                {
                    "message": "Discussion reply updated successfully",
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
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error updating DiscussionReply {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    @extend_schema(
        responses={204: None},
        description="Delete a specific discussion reply.",
    )
    def delete(self, request, instance_id):
        try:
            reply = self.get_object(instance_id)
            reply.delete()
            logger.info(
                f"DiscussionReply {instance_id} deleted successfully by {request.user.username}"
            )

            return Response(
                {
                    "message": "Discussion reply deleted successfully",
                    "error_code": None,
                },
                status=status.HTTP_204_NO_CONTENT,
            )

        except ValidationError as e:
            return Response(
                {
                    "message": "Invalid request",
                    "errors": str(e),
                    "error_code": getattr(e, "error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_404_NOT_FOUND,
            )

        except Exception as e:
            logger.error(f"Error deleting DiscussionReply {instance_id}: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def _get_log_message(self, instance):
        return f"Reply by {instance.author.username} to discussion {instance.discussion.id}"
