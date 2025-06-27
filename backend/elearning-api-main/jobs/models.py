from django.db import models
from django.utils import timezone
from django.core.exceptions import ValidationError
from course.models import Course
from authentication.models import User
from utils import logging_config, choices, uuid

logger = logging_config.setup_logging()


class JobOpportunity(models.Model):
    """
    Represents a job opportunity for refugees.
    Linked to User (posted_by) and Course (required_certificates).
    """

    id = models.BigIntegerField(
        primary_key=True,
        default=uuid.generate_short_numeric_uuid,
        editable=False,
        unique=True,
        null=False,
    )
    title = models.CharField(max_length=255, null=False, blank=False)
    description = models.TextField(null=False, blank=False)
    location = models.CharField(max_length=255, null=False, blank=False)
    job_type = models.CharField(
        max_length=50,
        choices=choices.JOB_TYPES,
        null=False,
        blank=False,
    )
    required_skills = models.JSONField(default=list, blank=True)
    required_certificates = models.ManyToManyField(
        Course, blank=True, related_name="job_opportunities"
    )
    salary_range = models.CharField(max_length=100, null=True, blank=True)
    application_deadline = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    remote_work = models.BooleanField(default=False)
    posted_by = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="posted_jobs",
        help_text="User who posted the job (Admin, Employer, Instructor, Mentor, NGO_partner only).",
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.title} ({self.location})"

    def clean(self):
        """
        Validate posted_by role and log errors.
        """
        allowed_roles = ["Admin", "Employer", "Instructor", "Mentor", "NGO_Partner"]
        try:
            # Validate posted_by role
            if self.posted_by and self.posted_by.role not in allowed_roles:
                logger.warning(f"Invalid role for posted_by: {self.posted_by.role}")
                raise ValidationError(
                    {
                        "error": "Posted_by user must have role Admin, Employer, Instructor, Mentor, or NGO_partner.",
                        "error_code": "INVALID_POSTED_BY_ROLE",
                    }
                )

            # Validate application_deadline
            if self.application_deadline < timezone.now():
                logger.warning(
                    f"Application deadline in the past: {self.application_deadline}"
                )
                raise ValidationError(
                    {
                        "error": "Application deadline must be in the future.",
                        "error_code": "INVALID_DEADLINE",
                    }
                )

            # Validate required_skills
            if not isinstance(self.required_skills, list):
                logger.warning(
                    f"Invalid required_skills format: {self.required_skills}"
                )
                raise ValidationError(
                    {
                        "error": "Required skills must be a list.",
                        "error_code": "INVALID_SKILLS_FORMAT",
                    }
                )

        except Exception as e:
            logger.error(f"Validation error for JobOpportunity {self.title}: {str(e)}")
            raise ValidationError(
                {
                    "error": f"Validation failed: {str(e)}",
                    "error_code": "VALIDATION_ERROR",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the JobOpportunity instance, logging the operation.

        Raises:
            ValidationError: If saving fails due to invalid data.
        """
        logger.debug(f"Saving JobOpportunity: {self.title}")
        try:
            self.clean()
            super().save(*args, **kwargs)
            logger.info(f"JobOpportunity '{self.title}' saved successfully")

        except ValidationError as e:
            logger.error(
                f"Validation error saving JobOpportunity {self.title}: {str(e)}"
            )
            raise

        except Exception as e:
            logger.error(
                f"Unexpected error saving JobOpportunity {self.title}: {str(e)}"
            )
            raise ValidationError(
                {
                    "error": "Failed to save job opportunity due to an unexpected error.",
                    "error_code": "JOB_OPPORTUNITY_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Job Opportunity"
        verbose_name_plural = "Job Opportunities"
        ordering = ["-created_at"]


class JobApplication(models.Model):
    """
    Represents a job application from a user.
    Linked to User and JobOpportunity.
    """

    id = models.BigIntegerField(
        primary_key=True,
        default=uuid.generate_short_numeric_uuid,
        editable=False,
        unique=True,
        null=False,
    )
    user = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name="job_applications",
    )
    job = models.ForeignKey(
        JobOpportunity, on_delete=models.CASCADE, related_name="applications"
    )

    cover_letter = models.TextField(null=True, blank=True)
    resume_file = models.FileField(
        upload_to="job_applications/resumes/", null=True, blank=True
    )
    application_status = models.CharField(
        max_length=20, choices=choices.APPLICATION_STATUS_CHOICES, default="Submitted"
    )
    applied_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.user.email} - {self.job.title}"

    def clean(self):
        """
        Validate application and log errors.
        """
        try:
            # Validate unique application per user and job
            if (
                JobApplication.objects.filter(user=self.user, job=self.job)
                .exclude(id=self.id)
                .exists()
            ):
                logger.warning(
                    f"Duplicate application by {self.user.username} for job {self.job.title}"
                )
                raise ValidationError(
                    {
                        "error": "User has already applied for this job.",
                        "error_code": "DUPLICATE_APPLICATION",
                    }
                )

            # Validate job is active
            if not self.job.is_active:
                logger.warning(f"Job {self.job.title} is not active")
                raise ValidationError(
                    {
                        "error": "Cannot apply to an inactive job.",
                        "error_code": "INACTIVE_JOB",
                    }
                )

            # Validate application deadline
            if self.job.application_deadline < timezone.now():
                logger.warning(f"Job {self.job.title} application deadline has passed")
                raise ValidationError(
                    {
                        "error": "Application deadline has passed.",
                        "error_code": "DEADLINE_PASSED",
                    }
                )

        except Exception as e:
            logger.error(f"Validation error for JobApplication {self}: {str(e)}")
            raise ValidationError(
                {
                    "error": f"Validation failed: {str(e)}",
                    "error_code": "VALIDATION_ERROR",
                }
            )

    def save(self, *args, **kwargs):
        """
        Save the JobApplication instance, logging the operation.

        Raises:
            ValidationError: If saving fails due to invalid data.
        """
        logger.debug(f"Saving JobApplication: {self}")
        try:
            self.clean()
            super().save(*args, **kwargs)
            logger.info(f"JobApplication '{self}' saved successfully")

        except ValidationError as e:
            logger.error(f"Validation error saving JobApplication {self}: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error saving JobApplication {self}: {str(e)}")
            raise ValidationError(
                {
                    "error": "Failed to save job application due to an unexpected error.",
                    "error_code": "JOB_APPLICATION_SAVE_ERROR",
                }
            )

    class Meta:
        verbose_name = "Job Application"
        verbose_name_plural = "Job Applications"
        ordering = ["-applied_at"]
        unique_together = ["user", "job"]
