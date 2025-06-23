import os
import json
from rest_framework import serializers
from drf_spectacular.utils import (
    extend_schema_field,
    OpenApiTypes,
    extend_schema_serializer,
    OpenApiExample,
)
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
from core.models import Language
from authentication.models import User
from utils import logging_config, choices

logger = logging_config.setup_logging()


class CourseCategorySerializer(serializers.ModelSerializer):
    """
    Serializer for CourseCategory model to handle serialization and validation.
    """

    class Meta:
        model = CourseCategory
        fields = ["id", "name"]
        extra_kwargs = {"name": {"required": True, "allow_blank": False}}

    def validate_name(self, value):
        """
        Validate the name field to ensure it is unique and not empty.
        """
        logger.debug(f"Validating CourseCategory name: {value}")

        if not value.strip():
            logger.warning("Empty CourseCategory name provided")
            raise serializers.ValidationError(
                {"error": "Name cannot be empty.", "error_code": "EMPTY_NAME"}
            )

        # Check uniqueness, excluding the current instance during updates
        queryset = CourseCategory.objects.filter(name__iexact=value)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            logger.warning(f"CourseCategory name already exists: {value}")
            raise serializers.ValidationError(
                {
                    "error": "A category with this name already exists.",
                    "error_code": "DUPLICATE_NAME",
                }
            )

        return value

    def create(self, validated_data):
        """
        Create a new CourseCategory instance.
        """
        logger.debug(f"Creating CourseCategory with data: {validated_data}")

        try:
            instance = super().create(validated_data)
            logger.info(f"CourseCategory '{instance.name}' created successfully")
            return instance

        except Exception as e:
            logger.error(f"Error creating CourseCategory: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create category due to an unexpected error.",
                    "error_code": "CATEGORY_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing CourseCategory instance.
        """
        logger.debug(
            f"Updating CourseCategory '{instance.name}' with data: {validated_data}"
        )

        try:
            instance = super().update(instance, validated_data)
            logger.info(f"CourseCategory '{instance.name}' updated successfully")
            return instance

        except Exception as e:
            logger.error(f"Error updating CourseCategory '{instance.name}': {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update category due to an unexpected error.",
                    "error_code": "CATEGORY_UPDATE_ERROR",
                }
            )


class CourseSerializer(serializers.ModelSerializer):
    """
    Serializer for Course model to handle serialization and validation, including file uploads.
    """

    course_profile_picture = serializers.ImageField(required=False, allow_null=True)

    class Meta:
        model = Course
        fields = [
            "id",
            "title",
            "language",
            "instructor",
            "requirements",
            "category",
            "duration",
            "difficult_level",
            "course_profile_picture",
            "is_active",
            "description",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "difficult_level": {"required": True, "allow_blank": False},
        }

    def validate_title(self, value):
        """
        Validate the title field to ensure it is unique and not empty.
        """
        logger.debug(f"Validating Course title: {value}")
        if not value.strip():
            logger.warning("Empty Course title provided")
            raise serializers.ValidationError(
                {"error": "Title cannot be empty.", "error_code": "EMPTY_TITLE"}
            )

        queryset = Course.objects.filter(title__iexact=value)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            logger.warning(f"Course title already exists: {value}")
            raise serializers.ValidationError(
                {
                    "error": "A course with this title already exists.",
                    "error_code": "DUPLICATE_TITLE",
                }
            )
        return value

    def validate(self, data):
        """
        Validate the instructor's role and file upload.
        """
        logger.debug(f"Validating Course data: {data.get('title', 'Untitled')}")
        instructor = data.get("instructor")

        if instructor and (
            not hasattr(instructor, "role") or instructor.role != "Instructor"
        ):
            logger.warning(f"Invalid instructor role for course: {instructor}")
            raise serializers.ValidationError(
                {
                    "error": "Instructor must have the role 'Instructor'.",
                    "error_code": "INVALID_INSTRUCTOR",
                }
            )

        profile_picture = data.get("course_profile_picture")
        if profile_picture:
            if not profile_picture.content_type.startswith("image/"):
                logger.warning(
                    f"Invalid file type for course profile picture: {profile_picture.content_type}"
                )
                raise serializers.ValidationError(
                    {
                        "error": "Course profile picture must be an image file.",
                        "error_code": "INVALID_IMAGE",
                    }
                )

            if profile_picture.size > 5 * 1024 * 1024:  # 5MB limit
                logger.warning(
                    f"Course profile picture too large: {profile_picture.size} bytes"
                )
                raise serializers.ValidationError(
                    {
                        "error": "Course profile picture must be less than 5MB.",
                        "error_code": "IMAGE_TOO_LARGE",
                    }
                )

        return data

    def create(self, validated_data):
        """
        Create a new Course instance.
        """
        logger.debug(f"Creating Course with data: {validated_data.get('title')}")

        try:
            instance = super().create(validated_data)
            logger.info(f"Course '{instance.title}' created successfully")
            return instance

        except Exception as e:
            logger.error(f"Error creating Course: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create course due to an unexpected error.",
                    "error_code": "COURSE_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing Course instance.
        """
        logger.debug(f"Updating Course '{instance.title}' with data: {validated_data}")

        try:
            instance = super().update(instance, validated_data)
            logger.info(f"Course '{instance.title}' updated successfully")
            return instance

        except Exception as e:
            logger.error(f"Error updating Course '{instance.title}': {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update course due to an unexpected error.",
                    "error_code": "COURSE_UPDATE_ERROR",
                }
            )


class ModuleSerializer(serializers.ModelSerializer):
    """
    Serializer for Module model to handle serialization and validation, including file uploads.
    """

    media = serializers.FileField(required=False, allow_null=True)
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=True, allow_null=False
    )

    class Meta:
        model = Module
        fields = "__all__"
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]

    def validate_title(self, value):
        """
        Validate the title field to ensure it is unique and not empty.
        """
        logger.debug(f"Validating Module title: {value}")
        if not value.strip():
            logger.warning("Empty Module title provided")
            raise serializers.ValidationError(
                {"error": "Title cannot be empty.", "error_code": "EMPTY_TITLE"}
            )

        queryset = Module.objects.filter(title__iexact=value)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)

        if queryset.exists():
            logger.warning(f"Module title already exists: {value}")
            raise serializers.ValidationError(
                {
                    "error": "A module with this title already exists.",
                    "error_code": "DUPLICATE_TITLE",
                }
            )
        return value

    def validate_order(self, value):
        """
        Validate the order field to ensure it is positive and unique per course.
        """
        logger.debug(f"Validating Module order: {value}")
        if value <= 0:
            logger.warning("Non-positive Module order provided")
            raise serializers.ValidationError(
                {
                    "error": "Order must be a positive integer.",
                    "error_code": "INVALID_ORDER",
                }
            )

        course = self.initial_data.get("course")
        if course:
            queryset = Module.objects.filter(course=course, order=value)
            if self.instance:
                queryset = queryset.exclude(id=self.instance.id)

            if queryset.exists():
                logger.warning(
                    f"Module order {value} already exists for course {course}"
                )
                raise serializers.ValidationError(
                    {
                        "error": "A module with this order already exists for the course.",
                        "error_code": "DUPLICATE_ORDER",
                    }
                )
        return value

    def validate_media(self, value):
        """
        Validate the media file, if provided, for type and size.
        """
        if not value:
            return value

        # Get file extension
        ext = os.path.splitext(value.name)[1].lower()

        # Define allowed extensions
        allowed_image_ext = [".jpg", ".jpeg", ".png", ".gif", ".webp"]
        allowed_pdf_ext = [".pdf"]
        allowed_video_ext = [".mp4", ".mov", ".avi", ".mkv"]
        allowed_audio_ext = [".mp3", ".wav", ".ogg", ".m4a"]

        logger.debug(f"Validating Module media: {value.name}")
        allowed_ext = (
            allowed_image_ext + allowed_pdf_ext + allowed_video_ext + allowed_audio_ext
        )

        if ext not in allowed_ext:
            raise serializers.ValidationError(
                f"Unsupported file extension. Allowed extensions: {', '.join(allowed_ext)}"
            )

        # Validate file size (e.g., 10MB limit)
        max_size = 10 * 1024 * 1024  # 10MB
        if value.size > max_size:
            raise serializers.ValidationError(
                f"File too large. Size should not exceed {max_size/1024/1024}MB."
            )

        return value

    def validate(self, data):
        """
        Perform object-level validation.
        """
        logger.debug(f"Validating Module data: {data.get('title', 'Untitled')}")
        content_type = data.get("content_type")
        content = data.get("content")
        media = data.get("media")

        # Ensure content or media is provided for non-quiz content types
        if content_type != "Quiz" and not (content or media):
            logger.warning(f"Missing content or media for module: {data.get('title')}")
            raise serializers.ValidationError(
                {
                    "error": "Content or media must be provided for non-quiz modules.",
                    "error_code": "MISSING_CONTENT",
                }
            )

        return data

    def create(self, validated_data):
        """
        Create a new Module instance.
        """
        logger.debug(f"Creating Module with data: {validated_data.get('title')}")
        try:
            # Handle file separately
            media_file = validated_data.pop("media", None)

            instance = super().create(validated_data)
            if media_file:
                instance.media.save(media_file.name, media_file, save=True)

            logger.info(f"Module '{instance.title}' created successfully")
            return instance

        except Exception as e:
            logger.error(f"Error creating Module: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create module due to an unexpected error.",
                    "error_code": "MODULE_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing Module instance.
        """
        logger.debug(f"Updating Module '{instance.title}' with data: {validated_data}")
        try:
            # Handle file separately
            media_file = validated_data.pop("media", None)

            instance = super().update(instance, validated_data)
            if media_file:
                instance.media.save(media_file.name, media_file, save=True)

            logger.info(f"Module '{instance.title}' updated successfully")
            return instance

        except Exception as e:
            logger.error(f"Error updating Module '{instance.title}': {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update module due to an unexpected error.",
                    "error_code": "MODULE_UPDATE_ERROR",
                }
            )


class EnrollmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Enrollment model to handle serialization and validation.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), required=True, allow_null=False
    )
    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=True, allow_null=False
    )
    status = serializers.ChoiceField(choices=choices.STATUS_CHOICES, required=True)

    class Meta:
        model = Enrollment
        fields = [
            "id",
            "user",
            "course",
            "status",
            "enrolled_at",
        ]
        read_only_fields = [
            "id",
            "enrolled_at",
        ]
        extra_kwargs = {
            "status": {"required": True, "allow_blank": False},
        }

    def validate_course(self, value):
        """
        Validate that the course exists.
        """
        logger.debug(f"Validating Enrollment course: {value.title}")
        return value

    def validate_status(self, value):
        """
        Validate that the status is one of the allowed choices.
        """
        logger.debug(f"Validating Enrollment status: {value}")
        if value not in [choice[0] for choice in choices.STATUS_CHOICES]:
            logger.warning(f"Invalid status provided: {value}")
            raise serializers.ValidationError(
                {
                    "error": f"Status must be one of: {', '.join([choice[0] for choice in choices.STATUS_CHOICES])}.",
                    "error_code": "INVALID_STATUS",
                }
            )
        return value

    def validate(self, data):
        """
        Perform object-level validation to prevent duplicate enrollments.
        """
        logger.debug(f"Validating Enrollment data")
        user = data.get("user")
        course = data.get("course")
        if Enrollment.objects.filter(user=user, course=course).exists():
            logger.warning(
                f"Duplicate enrollment for user {user.username} in course {course.title}"
            )
            raise serializers.ValidationError(
                {
                    "error": "User is already enrolled in this course.",
                    "error_code": "DUPLICATE_ENROLLMENT",
                }
            )
        return data

    def create(self, validated_data):
        """
        Create a new Enrollment instance.
        """
        logger.debug(
            f"Creating Enrollment for user: {validated_data['user'].username}, course: {validated_data['course'].title}"
        )
        try:
            instance = Enrollment.objects.create(**validated_data)
            logger.info(f"Enrollment '{instance}' created successfully")
            return instance

        except Exception as e:
            logger.error(f"Error creating Enrollment: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create enrollment due to an unexpected error.",
                    "error_code": "ENROLLMENT_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing Enrollment instance.
        """
        logger.debug(f"Updating Enrollment '{instance}' with data: {validated_data}")
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            logger.info(f"Enrollment '{instance}' updated successfully")
            return instance

        except Exception as e:
            logger.error(f"Error updating Enrollment '{instance}': {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update enrollment due to an unexpected error.",
                    "error_code": "ENROLLMENT_UPDATE_ERROR",
                }
            )


class UserProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProgress model to handle serialization and validation.
    """

    course = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(), required=True, allow_null=False
    )
    current_module = serializers.PrimaryKeyRelatedField(
        queryset=Module.objects.all(), required=False, allow_null=True
    )
    progress_percentage = serializers.FloatField(
        min_value=0.0, max_value=100.0, required=True
    )

    class Meta:
        model = UserProgress
        fields = [
            "id",
            "user",
            "course",
            "current_module",
            "progress_percentage",
            "is_active",
            "started_at",
            "completed_at",
            "last_accessed",
        ]
        read_only_fields = ["id", "started_at", "last_accessed", "user"]
        extra_kwargs = {
            "progress_percentage": {"required": True},
            "is_active": {"required": False},
        }

    def validate_course(self, value):
        """
        Validate that the course exists.
        """
        logger.debug(f"Validating UserProgress course: {value.title}")
        return value

    def validate_current_module(self, value):
        """
        Validate that the module exists and belongs to the course.
        """
        if value is None:
            return value
        logger.debug(f"Validating UserProgress current_module: {value.title}")
        course = self.initial_data.get("course")
        if course:
            try:
                course_obj = Course.objects.get(id=course)
                if value.course != course_obj:
                    logger.warning(
                        f"Module {value.title} does not belong to course {course_obj.title}"
                    )
                    raise serializers.ValidationError(
                        {
                            "error": "Module must belong to the specified course.",
                            "error_code": "INVALID_MODULE",
                        }
                    )
            except Course.DoesNotExist:
                logger.warning(f"Course ID {course} does not exist")
                raise serializers.ValidationError(
                    {
                        "error": "Course does not exist.",
                        "error_code": "INVALID_COURSE",
                    }
                )
        return value

    def validate_progress_percentage(self, value):
        """
        Validate that progress_percentage is between 0.0 and 100.0.
        """
        logger.debug(f"Validating UserProgress progress_percentage: {value}")
        if not 0.0 <= value <= 100.0:
            logger.warning(f"Invalid progress_percentage provided: {value}")
            raise serializers.ValidationError(
                {
                    "error": "Progress percentage must be between 0.0 and 100.0.",
                    "error_code": "INVALID_PROGRESS_PERCENTAGE",
                }
            )
        return value

    def validate(self, data):
        """
        Perform object-level validation.
        """
        logger.debug(f"Validating UserProgress data: {data}")
        user = self.context.get("request").user if self.context.get("request") else None
        course = data.get("course")
        if user and course:
            if UserProgress.objects.filter(user=user, course=course).exists():
                logger.warning(
                    f"Duplicate progress for user {user.username} in course {course.title}"
                )
                raise serializers.ValidationError(
                    {
                        "error": "User already has a progress record for this course.",
                        "error_code": "DUPLICATE_PROGRESS",
                    }
                )
        return data

    def create(self, validated_data):
        """
        Create a new UserProgress instance.
        """
        user = self.context["request"].user
        logger.debug(
            f"Creating UserProgress for user: {user.username}, course: {validated_data['course'].title}"
        )
        try:
            validated_data["user"] = user
            instance = UserProgress.objects.create(**validated_data)
            logger.info(f"UserProgress '{instance}' created successfully")
            return instance

        except Exception as e:
            logger.error(f"Error creating UserProgress: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create user progress due to an unexpected error.",
                    "error_code": "PROGRESS_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing UserProgress instance.
        """
        logger.debug(f"Updating UserProgress '{instance}' with data: {validated_data}")
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)
            instance.save()
            logger.info(f"UserProgress '{instance}' updated successfully")
            return instance

        except Exception as e:
            logger.error(f"Error updating UserProgress '{instance}': {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update user progress due to an unexpected error.",
                    "error_code": "PROGRESS_UPDATE_ERROR",
                }
            )


class AssessmentSerializer(serializers.ModelSerializer):
    """
    Serializer for Assessment model with validation and permission checks.
    """

    class Meta:
        model = Assessment
        fields = [
            "id",
            "module",
            "title",
            "description",
            "assessment_type",
            "max_attempts",
            "passing_score",
            "duration",
            "is_active",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "title": {"required": True, "allow_blank": False},
            "assessment_type": {"required": True, "allow_blank": False},
            "max_attempts": {"min_value": 1},
            "passing_score": {"min_value": 0, "max_value": 100},
            "duration": {"min_value": 1, "required": False},
        }

    def validate(self, data):
        """
        Validate assessment data at the object level.
        """
        request = self.context.get("request")
        module = data.get("module") or getattr(self.instance, "module", None)

        # For instructors, verify they own the course this module belongs to
        if (
            request
            and hasattr(request.user, "is_instructor")
            and request.user.is_instructor
        ):
            if module.course.instructor != request.user:
                raise serializers.ValidationError(
                    {
                        "error": "You can only create assessments for modules in your own courses",
                        "error_code": "MODULE_OWNERSHIP_ERROR",
                    }
                )

        # Validate passing score if provided
        passing_score = data.get("passing_score")
        if passing_score is not None and (passing_score < 0 or passing_score > 100):
            raise serializers.ValidationError(
                {
                    "error": "Passing score must be between 0 and 100",
                    "error_code": "INVALID_PASSING_SCORE",
                }
            )

        # Validate duration if provided
        duration = data.get("duration")
        if duration is not None and duration <= 0:
            raise serializers.ValidationError(
                {
                    "error": "Duration must be a positive number",
                    "error_code": "INVALID_DURATION",
                }
            )

        return data

    def create(self, validated_data):
        """
        Create a new Assessment instance with permission checks.
        """
        try:
            instance = super().create(validated_data)
            logger.info(
                f"Assessment '{instance.title}' created successfully for module "
                f"'{instance.module.title}' in course '{instance.module.course.title}'"
            )
            return instance

        except Exception as e:
            logger.error(f"Error creating Assessment: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create assessment",
                    "error_code": "ASSESSMENT_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an Assessment instance with permission checks.
        """
        try:
            updated_instance = super().update(instance, validated_data)
            logger.info(f"Assessment '{updated_instance.title}' updated successfully")
            return updated_instance

        except Exception as e:
            logger.error(f"Error updating Assessment {instance.id}: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update assessment",
                    "error_code": "ASSESSMENT_UPDATE_ERROR",
                }
            )


@extend_schema_serializer(
    examples=[
        OpenApiExample(
            "Multiple Choice Question",
            value={
                "assessment": 1,
                "question": "What is the capital of France?",
                "question_type": "Multiple Choice",
                "options": ["London", "Paris", "Berlin", "Madrid"],
                "correct_answer": "Paris",
                "points": 1.0,
                "order": 1,
            },
            request_only=True,
            response_only=False,
        ),
        OpenApiExample(
            "True/False Question",
            value={
                "assessment": 1,
                "question": "The Earth is flat.",
                "question_type": "True/False",
                "correct_answer": "False",
                "points": 1.0,
                "order": 2,
            },
            request_only=True,
            response_only=False,
        ),
    ]
)
class QuestionSerializer(serializers.ModelSerializer):
    """
    Serializer for Question model with validation and permission checks.
    """

    options = serializers.JSONField(
        binary=False,
        help_text="List of options for multiple choice questions (JSON array)",
        required=False,
        allow_null=True,
    )

    class Meta:
        model = Question
        fields = [
            "id",
            "assessment",
            "question",
            "question_type",
            "options",
            "correct_answer",
            "points",
            "order",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["id", "created_at", "updated_at"]
        extra_kwargs = {
            "question": {
                "required": True,
                "allow_blank": False,
                "help_text": "The text of the question",
            },
            "question_type": {
                "required": True,
                "allow_blank": False,
                "help_text": "Type of question (Multiple Choice, True/False, etc.)",
            },
            "correct_answer": {
                "required": True,
                "allow_blank": False,
                "help_text": "The correct answer to the question",
            },
            "points": {
                "min_value": 0.0,
                "help_text": "Points awarded for correct answer",
            },
            "order": {
                "min_value": 0,
                "help_text": "Order of the question within the assessment",
            },
        }

    @extend_schema_field(OpenApiTypes.OBJECT)
    def get_options(self, obj):
        """
        Returns the options field with proper OpenAPI schema documentation.
        """
        return obj.options

    def to_internal_value(self, data):
        """
        Convert options from JSON string to Python list if needed.
        """
        if "options" in data and isinstance(data["options"], str):
            try:
                data["options"] = json.loads(data["options"])

            except json.JSONDecodeError:
                raise serializers.ValidationError(
                    {"options": "Must be a valid JSON array"}
                )

        return super().to_internal_value(data)

    def validate(self, data):
        """
        Validate question data at the object level.
        """
        request = self.context.get("request")
        assessment = data.get("assessment") or getattr(
            self.instance, "assessment", None
        )

        # For instructors, verify they own the course this assessment belongs to
        if (
            request
            and hasattr(request.user, "is_instructor")
            and request.user.is_instructor
        ):
            if assessment.module.course.instructor != request.user:
                raise serializers.ValidationError(
                    {
                        "error": "You can only create questions for assessments in your own courses",
                        "error_code": "ASSESSMENT_OWNERSHIP_ERROR",
                    }
                )

        # Validate question type specific requirements
        question_type = data.get(
            "question_type", getattr(self.instance, "question_type", None)
        )
        options = data.get("options", getattr(self.instance, "options", None))
        correct_answer = data.get(
            "correct_answer", getattr(self.instance, "correct_answer", None)
        )

        if question_type == "Multiple Choice":
            if not options or not isinstance(options, list) or len(options) < 2:
                raise serializers.ValidationError(
                    {
                        "error": "Multiple Choice questions must have at least 2 options",
                        "error_code": "INVALID_OPTIONS",
                    }
                )

            if correct_answer not in options:
                raise serializers.ValidationError(
                    {
                        "error": "Correct answer must be one of the provided options",
                        "error_code": "INVALID_CORRECT_ANSWER",
                    }
                )

        elif question_type == "True/False":
            if correct_answer.lower() not in ["true", "false"]:
                raise serializers.ValidationError(
                    {
                        "error": "Correct answer must be either 'True' or 'False'",
                        "error_code": "INVALID_CORRECT_ANSWER",
                    }
                )

        # Validate points
        points = data.get("points")
        if points is not None and points < 0:
            raise serializers.ValidationError(
                {
                    "error": "Points must be a positive number",
                    "error_code": "INVALID_POINTS",
                }
            )

        return data

    def create(self, validated_data):
        """
        Create a new Question instance with permission checks.
        """
        try:
            instance = super().create(validated_data)
            logger.info(
                f"Question created successfully for assessment "
                f"'{instance.assessment.title}'"
            )
            return instance

        except Exception as e:
            logger.error(f"Error creating Question: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create question",
                    "error_code": "QUESTION_CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update a Question instance with permission checks.
        """
        try:
            updated_instance = super().update(instance, validated_data)
            logger.info(f"Question {instance.id} updated successfully")
            return updated_instance

        except Exception as e:
            logger.error(f"Error updating Question {instance.id}: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update question",
                    "error_code": "QUESTION_UPDATE_ERROR",
                }
            )


class UserAssessmentSerializer(serializers.ModelSerializer):
    pass


class CertificationSerializer(serializers.ModelSerializer):
    pass


class DiscussionSerializer(serializers.ModelSerializer):
    pass


class DiscussionReplySerializer(serializers.ModelSerializer):
    pass
