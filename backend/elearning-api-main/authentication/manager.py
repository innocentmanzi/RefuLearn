from django.utils.text import slugify
from django.contrib.auth.models import BaseUserManager
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.utils.translation import gettext_lazy as _
from utils import logging_config

# Initialize logger from the provided logging setup
logger = logging_config.setup_logging()


class UserManager(BaseUserManager):
    """
    Custom user manager class that extends BaseUserManager to handle
    user creation and validation for regular users and superusers.

    This class provides custom methods for creating users with email
    and password validation and includes specialized logic for
    creating superusers with elevated permissions.
    """

    def email_validator(self, email):
        """
        Validate the provided email format using Django's validate_email.
        """
        try:
            validate_email(email)
            logger.debug(f"Email {email} successfully validated")

        except ValidationError:
            logger.error(f"Invalid email address: {email}")
            raise ValueError(_("Please enter a valid email address"))

    def generate_unique_username(self, first_name, last_name):
        """
        Generate a unique username using the user's first and last names.
        If the username is not unique, append a random number to it.
        """
        logger.info(f"Generating unique username for user: {first_name} {last_name}")
        base_username = slugify(f"{first_name}{last_name}")
        unique_username = base_username

        # Check if the username exists
        counter = 1
        while self.model.objects.filter(username=unique_username).exists():
            unique_username = f"{base_username}{counter}"
            counter += 1

        logger.info(
            f"Generated a unique username: {unique_username} for user: {first_name} {last_name}"
        )
        return unique_username

    def create_user(self, email, first_name, last_name, password=None, **extra_fields):
        """
        Create and return a regular user with the provided details.
        """
        if email:
            # Normalize and validate the email
            logger.info(f"Normalizing the email {email}")
            email = self.normalize_email(email)
            logger.info(f"Email {email} normalized, now validating the email")
            self.email_validator(email)

        else:
            logger.error("Email is missing")
            raise ValueError(_("Please provide an email address"))

        # Validate first name, and last name
        if not first_name:
            logger.error("First name is missing")
            raise ValueError(_("First name is required"))

        if not last_name:
            logger.error("Last name is missing")
            raise ValueError(_("Last name is required"))

        # Generate unique username
        username = self.generate_unique_username(first_name, last_name)

        # Create user instance with provided data
        user = self.model(
            email=self.normalize_email(email),
            first_name=first_name,
            last_name=last_name,
            username=username,
            **extra_fields,
        )

        # Set password and save user
        user.set_password(password)
        user.save(using=self._db)
        logger.info(f"User {username} was created successfully with email {email}")
        return user

    def create_superuser(
        self, email, first_name, last_name, password=None, **extra_fields
    ):
        """
        Create and return a superuser with elevated permissions.
        """
        # Set default values for superuser permissions
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_active", True)
        extra_fields.setdefault("is_verified", True)

        # Ensure user's role is set to Admin
        extra_fields.setdefault("role", "Admin")

        # Check for missing password
        if password is None:
            logger.error("Superuser password is missing")
            raise ValueError(_("Superuser must have a password"))

        if first_name is None:
            logger.error("Superuser first name is missing")
            raise ValueError(_("Superuser must have a first name"))

        if last_name is None:
            logger.error("Superuser last name is missing")
            raise ValueError(_("Superuser must have a last name"))

        # Validate that permission fields are set correctly
        if extra_fields.get("is_staff") is not True:
            logger.error("Superuser must have is_staff set to True")
            raise ValueError(_("Superuser must have is_staff set to True"))

        if extra_fields.get("is_superuser") is not True:
            logger.error("Superuser must have is_superuser set to True")
            raise ValueError(_("Superuser must be set to True"))

        if extra_fields.get("is_active") is not True:
            logger.error("Superuser must have is_active set to True")
            raise ValueError(_("Superuser must be active"))

        if extra_fields.get("is_verified") is not True:
            logger.error("Superuser must have is_verified set to True")
            raise ValueError(_("Superuser must be verified"))

        # Create superuser using create_user method and save
        user = self.create_user(email, first_name, last_name, password, **extra_fields)
        user.save(using=self._db)
        logger.info(f"Superuser {first_name} was created successfully with email {email}")
        return user
