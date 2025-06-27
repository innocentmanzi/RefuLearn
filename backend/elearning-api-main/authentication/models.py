from django.db import models
from django.contrib.auth.models import AbstractBaseUser, PermissionsMixin
from .manager import UserManager
from utils import choices, logging_config, uuid

# Initialize logger from the provided logging setup
logger = logging_config.setup_logging()


class User(AbstractBaseUser, PermissionsMixin):
    """
    Custom User model extending AbstractBaseUser and PermissionsMixin.
    Uses email for authentication and supports additional user fields with UUID primary key.
    """

    id = models.BigIntegerField(
        primary_key=True,
        default=uuid.generate_short_numeric_uuid,
        editable=False,
        unique=True,
        null=False,
    )

    username = models.CharField(max_length=255, unique=True)
    first_name = models.CharField(max_length=255, null=False, blank=False)
    middle_name = models.CharField(max_length=255, null=True, blank=True)
    last_name = models.CharField(max_length=255, null=False, blank=False)
    email = models.EmailField(max_length=255, unique=True)

    role = models.CharField(
        max_length=50, choices=choices.ROLES, default="Student", null=False, blank=False
    )

    # User permissions and status fields
    is_superuser = models.BooleanField(default=False)
    is_staff = models.BooleanField(default=False)
    is_active = models.BooleanField(default=True)
    is_verified = models.BooleanField(default=False)

    # Timestamps
    date = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(auto_now=True)

    # Define the field to use for authentication (usually 'email' or 'username', email in this case)
    USERNAME_FIELD = "email"

    # Define additional fields required when creating a user
    REQUIRED_FIELDS = [
        "first_name",
        "last_name",
    ]

    # Use the custom UserManager class to handle user creation and management
    objects = UserManager()

    def __str__(self):
        """
        String representation of the user model, which returns the user's email.
        """
        return self.email

    @property
    def full_name(self):
        """
        Return the full name of the user, combining first_name and last_name.
        """
        return f"{self.first_name} {self.last_name}".strip()

    def save(self, *args, **kwargs):
        """
        Overrides the default save method to log user creation or updates.
        """
        if not self.pk:
            logger.info(f"Creating user: {self.email} with UUID: {self.id}")
        else:
            logger.info(f"Updating user: {self.email} with UUID: {self.id}")

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "User"
        verbose_name_plural = "Users"


class UserProfile(models.Model):
    """
    Model representing a user's profile with additional personal information.
    Uses UUID as primary key and maintains a one-to-one relationship with User.
    """

    id = models.BigIntegerField(
        primary_key=True,
        default=uuid.generate_short_numeric_uuid,
        editable=False,
        unique=True,
        null=False,
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="user_profile",
        null=False,
        blank=False,
    )
    bio = models.TextField(null=True, blank=True)
    phone_number = models.CharField(max_length=20, null=True, blank=True)
    dob = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(
        upload_to="users/profiles/", null=True, blank=True
    )
    language_preference = models.CharField(
        max_length=20,
        choices=choices.LANGUAGES,
        default="English",
        null=True,
        blank=True,
    )
    gender = models.CharField(
        max_length=20,
        choices=[("Male", "Male"), ("Female", "Female"), ("Other", "Other")],
        null=True,
        blank=True,
    )
    education_level = models.CharField(
        max_length=50,
        choices=choices.DEGREES,
        null=True,
        blank=True,
    )
    camp = models.CharField(max_length=255, null=True, blank=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        String representation of the user profile.
        """
        return f"{self.user.full_name} Profile"

    def save(self, *args, **kwargs):
        """
        Overrides the default save method to log profile creation or updates.
        """
        if not self.pk:
            logger.info(
                f"Creating user profile for {self.user.email} with UUID: {self.id}"
            )
        else:
            logger.info(
                f"Updating user profile for {self.user.email} with UUID: {self.id}"
            )

        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "UserProfile"
        verbose_name_plural = "UserProfiles"


class OneTimePassword(models.Model):
    """
    Model to store one-time passcodes for user verification.
    Uses UUID as primary key and maintains a one-to-one relationship with User.
    """

    id = models.BigIntegerField(
        primary_key=True,
        default=uuid.generate_short_numeric_uuid,
        editable=False,
        unique=True,
        null=False,
    )
    user = models.OneToOneField(
        User,
        on_delete=models.CASCADE,
        related_name="user_passcode",
        null=False,
        blank=False,
    )
    code = models.CharField(max_length=15, unique=True, null=False, blank=False)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        """
        String representation of the one-time passcode.
        """
        return f"{self.user.username}-passcode"

    class Meta:
        verbose_name = "OneTimePasscode"
        verbose_name_plural = "OneTimePasscode"
