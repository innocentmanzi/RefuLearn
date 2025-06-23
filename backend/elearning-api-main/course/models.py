import uuid
import random
from django.db import models
from django.core.exceptions import ValidationError
from django.core.validators import MinValueValidator, MaxValueValidator
from core.models import Language
from authentication.models import User
from utils import logging_config, choices, utils

logger = logging_config.setup_logging()


class CourseCategory(models.Model):
    """
    Represents categories for classifying courses (e.g., Programming, Language).
    Referenced by Course model.
    """

    id = models.BigAutoField(primary_key=True)
    name = models.CharField(max_length=100, unique=True, null=False, blank=False)

    def __str__(self):
        """
        String representation of course category.
        """
        return self.name

    def save(self, *args, **kwargs):
        """
        Save the category, logging the operation.
        """
        logger.debug(f"Saving CourseCategory: {self.name}")
        try:
            super().save(*args, **kwargs)
            logger.info(f"CourseCategory '{self.name}' saved successfully")

        except Exception as e:
            logger.error(f"Error saving CourseCategory '{self.name}': {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save category due to an unexpected error.",
                    "error_code": "CATEGORY_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Course Category"
        verbose_name_plural = "Course Categories"
        ordering = ["name"]


class Course(models.Model):
    """
    Represents an educational course with multilingual support.
    References Language, User (instructor), and CourseCategory.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    title = models.CharField(max_length=255, unique=True, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    language = models.ForeignKey(
        Language,
        on_delete=models.CASCADE,
        related_name="course_language",
        null=True,
        blank=True,
    )
    instructor = models.ForeignKey(
        User, on_delete=models.SET_NULL, null=True, related_name="course_instructor"
    )
    requirements = models.CharField(max_length=500, null=True, blank=True)
    category = models.ForeignKey(
        CourseCategory,
        on_delete=models.SET_NULL,
        null=True,
        related_name="course_category",
    )
    duration = models.CharField(max_length=50, null=True, blank=True)
    difficult_level = models.CharField(
        max_length=20,
        choices=choices.DIFFICULTY_LEVELS,
        default="Intermediate",
        null=False,
        blank=False,
    )
    course_profile_picture = models.ImageField(
        upload_to="courses/profiles/", null=True, blank=True
    )
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        String representation of the course.
        """
        return self.title

    def clean(self):
        """
        Validate the instructor's role and required fields.
        """
        logger.debug(f"Validating Course: {self.title}")

        if (
            self.instructor
            and not hasattr(self.instructor, "role")
            or self.instructor.role != "Instructor"
        ):
            logger.warning(
                f"Invalid user role for course '{self.title}': {self.instructor}"
            )
            raise ValidationError(
                {
                    "error": "User must have the role 'Instructor'.",
                    "error_code": "INVALID_INSTRUCTOR",
                }
            )

        if not self.difficult_level.strip():
            logger.warning(f"Empty difficult_level for course '{self.title}'")
            raise ValidationError(
                {
                    "error": "Difficult level cannot be empty.",
                    "error_code": "EMPTY_DIFFICULT_LEVEL",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the course, performing full validation and logging.
        """
        logger.debug(f"Saving Course: {self.title}")

        try:
            self.full_clean()  # Run clean() to validate
            super().save(*args, **kwargs)
            logger.info(f"Course '{self.title}' saved successfully")

        except ValidationError as e:
            logger.error(f"Validation error saving Course '{self.title}': {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving Course '{self.title}': {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save course due to an unexpected error.",
                    "error_code": "COURSE_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Course"
        verbose_name_plural = "Courses"
        ordering = ["title"]


class Module(models.Model):
    """
    Represents individual units within a course, such as lessons or quizzes.
    """

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="course_module"
    )
    order = models.PositiveIntegerField(null=False, blank=False)
    title = models.CharField(max_length=255, null=False, blank=False)
    content = models.TextField(null=True, blank=True)
    content_type = models.CharField(
        max_length=50, choices=choices.CONTENT_TYPES, default="Text Content"
    )
    duration = models.CharField(max_length=50, null=True, blank=True)
    is_mandatory = models.BooleanField(default=True)
    media = models.FileField(
        upload_to=utils.get_module_upload_path, null=True, blank=True
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} (Order: {self.order})"

    def save(self, *args, **kwargs):
        """
        Save the module, logging the operation.

        Raises:
            ValidationError: If saving fails due to invalid data.
        """
        logger.debug(f"Saving Module: {self.title} (Order: {self.order})")
        try:
            super().save(*args, **kwargs)
            if self.media:
                # Ensure the file is properly saved
                self.media.close()

            logger.info(f"Module '{self.title}' saved successfully")

        except Exception as e:
            logger.error(f"Error saving Module '{self.title}': {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save module due to an unexpected error.",
                    "error_code": "MODULE_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Module"
        verbose_name_plural = "Modules"
        ordering = ["course", "order"]
        unique_together = ["course", "order"]  # Ensure unique order per course


class Enrollment(models.Model):
    """
    Tracks user enrollment in courses, including status.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="student_enrollment",
        null=False,
        blank=False,
    )
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        related_name="course_enrollment",
        null=False,
        blank=False,
    )
    status = models.CharField(
        max_length=20, choices=choices.STATUS_CHOICES, default="Active"
    )
    enrolled_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.user.full_name} - {self.course.title}"

    def clean(self):
        """
        Validate that the user has a valid role ('Student').
        """
        if self.user and (
            not hasattr(self.user, "role") or self.user.role not in ["Student"]
        ):
            raise ValidationError(
                {
                    "error": "User must have role 'Student'.",
                    "error_code": "INVALID_USER_ROLE",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the enrollment, performing validation and logging.

        Raises:
            ValidationError: If validation fails or saving encounters an error.
        """
        logger.debug(
            f"Saving Enrollment for user: {self.user.username}, course: {self.course.title}"
        )
        try:
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(
                f"Enrollment for '{self.user.username}' in '{self.course.title}' saved successfully"
            )

        except ValidationError as e:
            logger.error(f"Validation error saving Enrollment: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving Enrollment: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save enrollment due to an unexpected error.",
                    "error_code": "ENROLLMENT_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Enrollment"
        verbose_name_plural = "Enrollments"
        ordering = ["enrolled_at"]
        unique_together = ["user", "course"]  # Prevent duplicate enrollments


class UserProgress(models.Model):
    """
    Records user progress within course modules.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_progress"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="user_course_progress"
    )

    current_module = models.ForeignKey(
        Module,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="current_module_progress",
    )
    progress_percentage = models.FloatField(
        default=0.0, validators=[MinValueValidator(0.0), MaxValueValidator(100.0)]
    )
    is_active = models.BooleanField(default=True)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    last_accessed = models.DateTimeField(auto_now=True)

    def __str__(self):
        return (
            f"{self.user.full_name} - {self.course.title}: {self.progress_percentage}%"
        )

    def save(self, *args, **kwargs):
        """
        Save the user progress, logging the operation.

        Raises:
            ValidationError: If saving fails due to invalid data.
        """
        logger.debug(
            f"Saving UserProgress for user: {self.user.username}, course: {self.course.title}"
        )
        try:
            super().save(*args, **kwargs)
            logger.info(
                f"UserProgress for '{self.user.username}' in '{self.course.title}' saved successfully"
            )

        except Exception as e:
            logger.error(f"Error saving UserProgress: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save user progress due to an unexpected error.",
                    "error_code": "PROGRESS_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "User Progress"
        verbose_name_plural = "User Progress"
        ordering = ["last_accessed"]
        unique_together = [
            "user",
            "course",
        ]  # Ensure one progress record per user per course


class Assessment(models.Model):
    """
    Stores assessments tied to course modules, such as quizzes or assignments.
    """

    id = models.BigAutoField(primary_key=True)
    module = models.ForeignKey(
        Module, on_delete=models.CASCADE, related_name="assessment_module"
    )
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=True, blank=True)
    assessment_type = models.CharField(
        max_length=50, choices=choices.ASSESSMENT_TYPES, null=False, blank=False
    )
    max_attempts = models.PositiveIntegerField(default=3, null=False, blank=False)
    passing_score = models.FloatField(default=70.0, null=True, blank=True)
    duration = models.PositiveIntegerField(null=True, blank=True)  # Duration in minutes
    is_active = models.BooleanField(default=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.assessment_type})"

    def save(self, *args, **kwargs):
        """
        Save the assessment, logging the operation.

        Raises:
            ValidationError: If saving fails due to invalid data.
        """
        logger.debug(f"Saving Assessment: {self.title}")
        try:
            super().save(*args, **kwargs)
            logger.info(f"Assessment '{self.title}' saved successfully")

        except Exception as e:
            logger.error(f"Error saving Assessment '{self.title}': {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save assessment due to an unexpected error.",
                    "error_code": "ASSESSMENT_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Assessment"
        verbose_name_plural = "Assessments"
        ordering = ["created_at"]


class Question(models.Model):
    """
    Stores questions tied to an assessment, such as multiple-choice or essay questions.
    """

    id = models.BigAutoField(primary_key=True)
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name="assessment_questions"
    )
    question = models.TextField(null=False, blank=False)
    question_type = models.CharField(
        max_length=50, choices=choices.QUESTION_TYPES, null=False, blank=False
    )
    options = models.JSONField(default=list, null=True, blank=True)
    correct_answer = models.TextField(null=False, blank=False)
    points = models.FloatField(default=1.0, validators=[MinValueValidator(0.0)])
    order = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.question} ({self.question_type})"

    def clean(self):
        """
        Validate question fields, ensuring required fields are not empty and options match question type.

        Raises:
            ValidationError: If validation fails.
        """
        logger.debug(f"Validating Question: {self.question}")
        if not self.question.strip():
            logger.warning("Empty question text")
            raise ValidationError(
                {
                    "error": "Question text cannot be empty.",
                    "error_code": "EMPTY_QUESTION",
                }
            )
        if not self.correct_answer.strip():
            logger.warning("Empty correct answer")
            raise ValidationError(
                {
                    "error": "Correct answer cannot be empty.",
                    "error_code": "EMPTY_CORRECT_ANSWER",
                }
            )

        if self.question_type == "Multiple Choice" and (
            not self.options or not isinstance(self.options, list)
        ):
            logger.warning(
                f"Invalid options for Multiple Choice question: {self.options}"
            )
            raise ValidationError(
                {
                    "error": "Multiple Choice questions must have a non-empty list of options.",
                    "error_code": "INVALID_OPTIONS",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the question, performing validation and logging.

        Raises:
            ValidationError: If validation fails or saving encounters an error.
        """
        logger.debug(f"Saving Question: {self.question}")
        try:
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(f"Question '{self.question}' saved successfully")

        except ValidationError as e:
            logger.error(f"Validation error saving Question: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving Question: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save question due to an unexpected error.",
                    "error_code": "QUESTION_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Question"
        verbose_name_plural = "Questions"
        ordering = ["order"]
        unique_together = ["assessment", "order"]  # Ensure unique order per assessment


class UserAssessment(models.Model):
    """
    Tracks user responses and scores for assessments.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_assessments"
    )
    assessment = models.ForeignKey(
        Assessment, on_delete=models.CASCADE, related_name="assessments"
    )
    attempt_number = models.PositiveIntegerField(default=1)
    answers = models.JSONField(default=dict)
    score = models.FloatField(null=True, blank=True)
    passed = models.BooleanField(default=False)
    started_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    time_taken = models.FloatField(null=True, blank=True)  # Time in minutes

    def __str__(self):
        return f"{self.user.username} - {self.assessment.title} (Attempt {self.attempt_number})"

    def clean(self):
        """
        Validate attempt number and answers.

        Raises:
            ValidationError: If validation fails.
        """
        logger.debug(
            f"Validating UserAssessment for user: {self.user.username}, assessment: {self.assessment.title}"
        )

        if self.attempt_number < 1:
            logger.warning(f"Invalid attempt number: {self.attempt_number}")
            raise ValidationError(
                {
                    "error": "Attempt number must be at least 1.",
                    "error_code": "INVALID_ATTEMPT_NUMBER",
                }
            )

        if not isinstance(self.answers, dict):
            logger.warning(f"Invalid answers format: {self.answers}")
            raise ValidationError(
                {
                    "error": "Answers must be a dictionary.",
                    "error_code": "INVALID_ANSWERS",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the user assessment, performing validation and logging.

        Raises:
            ValidationError: If validation fails or saving encounters an error.
        """
        logger.debug(
            f"Saving UserAssessment for user: {self.user.username}, assessment: {self.assessment.title}"
        )

        try:
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(
                f"UserAssessment for '{self.user.username}' in '{self.assessment.title}' saved successfully"
            )

        except ValidationError as e:
            logger.error(f"Validation error saving UserAssessment: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving UserAssessment: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save user assessment due to an unexpected error.",
                    "error_code": "USER_ASSESSMENT_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "User Assessment"
        verbose_name_plural = "User Assessments"
        ordering = ["started_at"]
        unique_together = [
            "user",
            "assessment",
            "attempt_number",
        ]  # Unique per user, assessment, attempt


class Certification(models.Model):
    """
    Manages certificates awarded to users for course completion or achievements.
    """

    id = models.BigAutoField(primary_key=True)
    user = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="user_certificates"
    )
    course = models.ForeignKey(
        Course, on_delete=models.CASCADE, related_name="course_certificates"
    )
    certificate_type = models.CharField(
        max_length=50, choices=choices.CERTIFICATE_TYPES
    )
    title = models.CharField(max_length=255)
    description = models.TextField()
    issued_at = models.DateTimeField(auto_now_add=True)
    verification_code = models.CharField(max_length=10, unique=True)
    is_verified = models.BooleanField(default=False)
    pdf_file = models.FileField(upload_to="certifications/pdfs/", null=True, blank=True)

    def __str__(self):
        return f"{self.title} - {self.user.username}"

    def generate_verification_code(self):
        """
        Generate a unique 10-digit verification code.
        """
        logger.debug("Generating verification code")
        attempts = 0
        max_attempts = 100

        while attempts < max_attempts:
            code = "".join(str(random.randint(0, 9)) for _ in range(10))

            if not Certification.objects.filter(verification_code=code).exists():
                logger.debug(f"Generated unique verification code: {code}")
                return code

            attempts += 1
            logger.debug(
                f"Verification code {code} already exists, retrying ({attempts}/{max_attempts})"
            )
        logger.error(
            "Failed to generate unique verification code after maximum attempts"
        )
        raise ValidationError(
            {
                "error": "Unable to generate a unique verification code. Please try again.",
                "error_code": "VERIFICATION_CODE_GENERATION_FAILED",
            }
        )

    def clean(self):
        """
        Validate required fields and verification code.

        Raises:
            ValidationError: If validation fails.
        """
        logger.debug(f"Validating Certification: {self.title}")

        if not self.title.strip():
            logger.warning("Empty certification title")
            raise ValidationError(
                {
                    "error": "Certification title cannot be empty.",
                    "error_code": "EMPTY_TITLE",
                }
            )

        if not self.description.strip():
            logger.warning("Empty certification description")
            raise ValidationError(
                {
                    "error": "Certification description cannot be empty.",
                    "error_code": "EMPTY_DESCRIPTION",
                }
            )

        if self.verification_code and not self.verification_code.strip():
            logger.warning("Empty verification code")
            raise ValidationError(
                {
                    "error": "Verification code cannot be empty.",
                    "error_code": "EMPTY_VERIFICATION_CODE",
                }
            )

        if self.verification_code and not (
            self.verification_code.isdigit() and len(self.verification_code) == 10
        ):
            logger.warning(
                f"Invalid verification code format: {self.verification_code}"
            )
            raise ValidationError(
                {
                    "error": "Verification code must be a 10-digit number.",
                    "error_code": "INVALID_VERIFICATION_CODE",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the certification, generating a verification code if none provided, performing validation, and logging.
        """
        logger.debug(f"Saving Certification: {self.title}")

        try:
            if not self.verification_code:
                self.verification_code = self.generate_verification_code()
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(
                f"Certification '{self.title}' for '{self.user.username}' saved successfully"
            )

        except ValidationError as e:
            logger.error(f"Validation error saving Certification: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving Certification: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save certification due to an unexpected error.",
                    "error_code": "CERTIFICATION_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Certification"
        verbose_name_plural = "Certifications"
        ordering = ["issued_at"]
        unique_together = [
            "user",
            "course",
            "certificate_type",
        ]  # Unique per user, course, type


class Discussion(models.Model):
    """
    Represents community discussions and forums under a course.
    """

    id = models.BigAutoField(primary_key=True)
    title = models.CharField(max_length=255)
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="discussion_author"
    )
    category = models.CharField(max_length=50, choices=choices.DISCUSSION_CATEGORIES)
    content = models.TextField(null=True, blank=True)
    course = models.ForeignKey(
        Course,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="course_discussion",
    )
    status = models.CharField(
        max_length=20, choices=choices.DISCUSSION_STATUS, default="Submitted"
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} by {self.author.username}"

    def clean(self):
        """
        Validate required fields.

        Raises:
            ValidationError: If validation fails.
        """
        logger.debug(f"Validating Discussion: {self.title}")

        if not self.title.strip():
            logger.warning("Empty discussion title")
            raise ValidationError(
                {
                    "error": "Discussion title cannot be empty.",
                    "error_code": "EMPTY_TITLE",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the discussion, performing validation and logging.

        Raises:
            ValidationError: If validation fails or saving encounters an error.
        """
        logger.debug(f"Saving Discussion: {self.title}")

        try:
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(
                f"Discussion '{self.title}' by '{self.author.username}' saved successfully"
            )

        except ValidationError as e:
            logger.error(f"Validation error saving Discussion: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving Discussion: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save discussion due to an unexpected error.",
                    "error_code": "DISCUSSION_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Discussion"
        verbose_name_plural = "Discussions"
        ordering = ["created_at"]


class DiscussionReply(models.Model):
    """
    Represents replies to discussions, supporting nested replies.
    """

    id = models.BigAutoField(primary_key=True)
    discussion = models.ForeignKey(
        Discussion, on_delete=models.CASCADE, related_name="discussion_replies"
    )
    author = models.ForeignKey(
        User, on_delete=models.CASCADE, related_name="discussion_replies_author"
    )
    content = models.TextField()
    parent_reply = models.ForeignKey(
        "self",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="child_replies",
    )
    is_solution = models.BooleanField(default=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Reply by {self.author.username} to {self.discussion.title}"

    def clean(self):
        """
        Validate required fields and parent reply.

        Raises:
            ValidationError: If validation fails.
        """
        logger.debug(f"Validating DiscussionReply by {self.author.username}")

        if not self.content.strip():
            logger.warning("Empty reply content")
            raise ValidationError(
                {
                    "error": "Reply content cannot be empty.",
                    "error_code": "EMPTY_CONTENT",
                }
            )

        if self.parent_reply and self.parent_reply.discussion != self.discussion:
            logger.warning(
                f"Parent reply does not belong to discussion: {self.discussion.title}"
            )
            raise ValidationError(
                {
                    "error": "Parent reply must belong to the same discussion.",
                    "error_code": "INVALID_PARENT_REPLY",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the discussion reply, performing validation and logging.

        Raises:
            ValidationError: If validation fails or saving encounters an error.
        """
        logger.debug(f"Saving DiscussionReply by {self.author.username}")

        try:
            self.full_clean()
            super().save(*args, **kwargs)
            logger.info(
                f"DiscussionReply by '{self.author.username}' to '{self.discussion.title}' saved successfully"
            )

        except ValidationError as e:
            logger.error(f"Validation error saving DiscussionReply: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving DiscussionReply: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save discussion reply due to an unexpected error.",
                    "error_code": "DISCUSSION_REPLY_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Discussion Reply"
        verbose_name_plural = "Discussion Replies"
        ordering = ["created_at"]
