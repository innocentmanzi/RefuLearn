import re
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework import serializers
from course.models import Course
from .models import JobOpportunity, JobApplication
from authentication.models import User
from utils import logging_config

logger = logging_config.setup_logging()


class JobOpportunitySerializer(serializers.ModelSerializer):
    """
    Serializer for JobOpportunity model, handling validation and creation/update logic.
    """

    required_skills = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
        error_messages={
            "not_a_list": "Required skills must be a list of strings (e.g., ['Python', 'Django'])."
        },
    )
    required_certificates_ids = serializers.PrimaryKeyRelatedField(
        queryset=Course.objects.all(),
        many=True,
        write_only=True,
        source="required_certificates",
        required=False,
    )

    class Meta:
        model = JobOpportunity
        fields = [
            "id",
            "title",
            "description",
            "location",
            "job_type",
            "required_skills",
            "required_certificates",
            "required_certificates_ids",
            "salary_range",
            "application_deadline",
            "is_active",
            "remote_work",
            "posted_by",
            "created_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
            "posted_by",
            "required_certificates",
        ]

    def validate(self, data):
        """
        Validate job opportunity data.
        """
        logger.debug(f"Validating JobOpportunity data: {data.get('title', 'Untitled')}")
        try:
            # Validate application_deadline is in the future
            deadline = data.get("application_deadline")
            if deadline and deadline < timezone.now():
                logger.warning(f"Application deadline in the past: {deadline}")
                raise serializers.ValidationError(
                    {
                        "error": "Application deadline must be in the future.",
                        "error_code": "INVALID_DEADLINE",
                    }
                )

            # Validate job_type
            job_type = data.get("job_type")
            valid_job_types = [
                choice[0]
                for choice in JobOpportunity._meta.get_field("job_type").choices
            ]

            if job_type and job_type not in valid_job_types:
                logger.warning(f"Invalid job_type: {job_type}")
                raise serializers.ValidationError(
                    {
                        "error": f"Job type must be one of {valid_job_types}.",
                        "error_code": "INVALID_JOB_TYPE",
                    }
                )

            return data

        except Exception as e:
            logger.error(f"Unexpected validation error for JobOpportunity: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": f"Validation failed: {str(e)}",
                    "error_code": "VALIDATION_ERROR",
                }
            )

    def validate_required_skills(self, value):
        """
        Validate that required_skills is a list of strings and sanitize each string.
        """
        logger.debug(f"Validating required_skills: {value}")
        try:
            if not isinstance(value, list):
                logger.warning(f"Invalid required_skills type: {type(value)}")
                raise serializers.ValidationError(
                    {
                        "error": "Required skills must be a list of strings.",
                        "error_code": "INVALID_SKILLS_FORMAT",
                    }
                )

            # Validate and sanitize each skill
            sanitized_skills = []
            for skill in value:
                if not isinstance(skill, str):
                    logger.warning(f"Invalid skill type: {skill} ({type(skill)})")
                    raise serializers.ValidationError(
                        {
                            "error": f"Skill '{skill}' must be a string.",
                            "error_code": "INVALID_SKILL_TYPE",
                        }
                    )

                # Sanitize skill string
                cleaned_skill = re.sub(r"[<>;{}]", "", skill.strip())
                if cleaned_skill != skill.strip():
                    logger.warning(f"Invalid characters in skill: {skill}")
                    raise serializers.ValidationError(
                        {
                            "error": f"Skill '{skill}' contains invalid characters.",
                            "error_code": "INVALID_SKILL_CHARACTERS",
                        }
                    )

                if not cleaned_skill:
                    logger.warning(f"Empty skill provided: {skill}")
                    raise serializers.ValidationError(
                        {
                            "error": "Skills cannot be empty strings.",
                            "error_code": "EMPTY_SKILL",
                        }
                    )

                sanitized_skills.append(cleaned_skill)

            return sanitized_skills

        except serializers.ValidationError as e:
            logger.error(f"Validation error for required_skills: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error validating required_skills: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": f"Failed to validate required skills: {str(e)}",
                    "error_code": "SKILLS_VALIDATION_ERROR",
                }
            )

    def validate_required_certificates(self, value):
        """
        Validate that required certificates exist.
        """
        logger.debug(f"Validating required_certificates: {value}")
        if value and not all(isinstance(course, Course) for course in value):
            logger.warning(f"Invalid required_certificates: {value}")
            raise serializers.ValidationError(
                {
                    "error": "All required certificates must be valid Course IDs.",
                    "error_code": "INVALID_CERTIFICATES",
                }
            )
        return value

    def create(self, validated_data):
        """
        Create a new JobOpportunity instance.
        """
        request = self.context.get("request")
        logger.debug(f"Creating JobOpportunity with data: {validated_data}")
        try:
            # Validate posted_by role
            allowed_roles = ["Admin", "Employer", "Instructor", "Mentor", "NGO_Partner"]

            if request.user.role not in allowed_roles:
                logger.warning(f"Invalid role for posted_by: {request.user.role}")
                raise serializers.ValidationError(
                    {
                        "error": "User must have role Admin, Employer, Instructor, Mentor, or NGO_Partner.",
                        "error_code": "INVALID_POSTED_BY_ROLE",
                    }
                )

            # Extract required_certificates
            required_certificates = validated_data.pop("required_certificates", [])

            # Create job opportunity
            job = JobOpportunity.objects.create(
                posted_by=request.user, **validated_data
            )

            # Set many-to-many relationship
            if required_certificates:
                job.required_certificates.set(required_certificates)

            logger.info(f"JobOpportunity '{job.title}' created by {request.user.email}")
            return job

        except ValidationError as e:
            logger.error(f"Validation error creating JobOpportunity: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error creating JobOpportunity: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create job opportunity due to an unexpected error.",
                    "error_code": "CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing JobOpportunity instance.
        """
        logger.debug(
            f"Updating JobOpportunity '{instance.title}' with data: {validated_data}"
        )
        try:
            # Extract required_certificates
            required_certificates = validated_data.pop("required_certificates", None)

            # Update fields
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            # Update many-to-many if provided
            if required_certificates is not None:
                instance.required_certificates.set(required_certificates)

            instance.save()
            logger.info(f"JobOpportunity '{instance.title}' updated successfully")
            return instance

        except ValidationError as e:
            logger.error(f"Validation error updating JobOpportunity: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error updating JobOpportunity: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update job opportunity due to an unexpected error.",
                    "error_code": "UPDATE_ERROR",
                }
            )


class JobApplicationSerializer(serializers.ModelSerializer):
    """
    Serializer for JobApplication model, handling validation and creation/update logic.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(),
        write_only=True,
        required=True,
    )
    job = serializers.PrimaryKeyRelatedField(
        queryset=JobOpportunity.objects.all(),
        write_only=True,
        required=True,
    )
    resume_file = serializers.FileField(required=False, allow_null=True)

    class Meta:
        model = JobApplication
        fields = [
            "id",
            "user",
            "job",
            "cover_letter",
            "resume_file",
            "application_status",
            "applied_at",
            "updated_at",
        ]
        read_only_fields = [
            "id",
            "applied_at",
            "updated_at",
        ]

    def validate(self, data):
        """
        Validate job application data.
        """
        logger.debug(f"Validating JobApplication data for user: {data.get('user')}")
        try:
            # Validate job is active
            job = data.get("job")
            if job and not job.is_active:
                logger.warning(f"Job {job.title} is not active")
                raise serializers.ValidationError(
                    {
                        "error": "Cannot apply to an inactive job.",
                        "error_code": "INACTIVE_JOB",
                    }
                )

            # Validate application deadline
            if job and job.application_deadline < timezone.now():
                logger.warning(f"Job {job.title} application deadline has passed")
                raise serializers.ValidationError(
                    {
                        "error": "Application deadline has passed.",
                        "error_code": "DEADLINE_PASSED",
                    }
                )

            # Validate unique application
            user = data.get("user")
            if (
                user
                and job
                and JobApplication.objects.filter(user=user, job=job).exists()
            ):
                logger.warning(
                    f"Duplicate application by {user.email} for job {job.title}"
                )
                raise serializers.ValidationError(
                    {
                        "error": "User has already applied for this job.",
                        "error_code": "DUPLICATE_APPLICATION",
                    }
                )

            # Validate application_status
            application_status = data.get("application_status", "Submitted")
            valid_statuses = [
                choice[0]
                for choice in JobApplication._meta.get_field(
                    "application_status"
                ).choices
            ]
            if application_status and application_status not in valid_statuses:
                logger.warning(f"Invalid application_status: {application_status}")
                raise serializers.ValidationError(
                    {
                        "error": f"Application status must be one of {valid_statuses}.",
                        "error_code": "INVALID_APPLICATION_STATUS",
                    }
                )

            return data
        except Exception as e:
            logger.error(f"Unexpected validation error for JobApplication: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": f"Validation failed: {str(e)}",
                    "error_code": "VALIDATION_ERROR",
                }
            )

    def validate_cover_letter(self, value):
        """
        Sanitize and validate cover_letter.
        """
        if value:
            logger.debug(f"Validating cover_letter: {value[:50]}...")
            cleaned_value = re.sub(r"[<>;{}]", "", value.strip())

            if cleaned_value != value.strip():
                logger.warning(f"Invalid characters in cover_letter: {value}")
                raise serializers.ValidationError(
                    {
                        "error": "Cover letter contains invalid characters.",
                        "error_code": "INVALID_COVER_LETTER_CHARACTERS",
                    }
                )

            return cleaned_value
        return value

    def validate_resume_file(self, value):
        """
        Validate resume_file.
        """
        if value:
            logger.debug(f"Validating resume_file: {value.name}")
            allowed_extensions = [".pdf", ".doc", ".docx"]
            file_extension = value.name.lower()[-4:]

            if file_extension not in allowed_extensions:
                logger.warning(f"Invalid file extension for resume: {value.name}")
                raise serializers.ValidationError(
                    {
                        "error": f"Resume file must be one of {allowed_extensions}.",
                        "error_code": "INVALID_RESUME_FILE",
                    }
                )

            max_size = 5 * 1024 * 1024  # 5MB
            if value.size > max_size:
                logger.warning(f"Resume file too large: {value.size} bytes")
                raise serializers.ValidationError(
                    {
                        "error": "Resume file size must not exceed 5MB.",
                        "error_code": "RESUME_FILE_TOO_LARGE",
                    }
                )

        return value

    def create(self, validated_data):
        """
        Create a new JobApplication instance.
        """
        request = self.context.get("request")
        logger.debug(f"Creating JobApplication with data: {validated_data}")

        try:
            # Create job application
            job_application = JobApplication.objects.create(**validated_data)
            logger.info(
                f"JobApplication '{job_application}' created by {request.user.email}"
            )
            return job_application

        except ValidationError as e:
            logger.error(f"Validation error creating JobApplication: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error creating JobApplication: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to create job application due to an unexpected error.",
                    "error_code": "CREATE_ERROR",
                }
            )

    def update(self, instance, validated_data):
        """
        Update an existing JobApplication instance.
        """
        logger.debug(
            f"Updating JobApplication '{instance}' with data: {validated_data}"
        )
        try:
            for attr, value in validated_data.items():
                setattr(instance, attr, value)

            instance.save()
            logger.info(f"JobApplication '{instance}' updated successfully")
            return instance

        except ValidationError as e:
            logger.error(f"Validation error updating JobApplication: {str(e)}")
            raise

        except Exception as e:
            logger.error(f"Unexpected error updating JobApplication: {str(e)}")
            raise serializers.ValidationError(
                {
                    "error": "Failed to update job application due to an unexpected error.",
                    "error_code": "UPDATE_ERROR",
                }
            )
