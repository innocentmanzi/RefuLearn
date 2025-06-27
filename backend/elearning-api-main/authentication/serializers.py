import re
from typing import Optional
from django.contrib.auth import authenticate
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from rest_framework import serializers
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from .models import User, UserProfile, OneTimePassword
from utils import logging_config

logger = logging_config.setup_logging()


class UserRegistrationSerializer(serializers.ModelSerializer):
    """
    Serializer for user registration. Ensures that users are created as Students by default.
    """

    password = serializers.CharField(max_length=70, min_length=6, write_only=True)
    password2 = serializers.CharField(max_length=70, min_length=6, write_only=True)

    class Meta:
        model = User
        fields = [
            "id",
            "email",
            "first_name",
            "middle_name",
            "last_name",
            "password",
            "password2",
        ]
        read_only_fields = [
            "id",
            "date",
            "last_login",
        ]

    # Validate method to ensure password confirmation matches and email is provided
    def validate(self, attrs):
        """
        Validate the user data.

        Args:
            attrs (dict): The data to validate.

        Returns:
            dict: The validated data.

        Raises:
            serializers.ValidationError: If validation fails.
        """
        email = attrs.get("email", "")
        password = attrs.get("password", "")
        password2 = attrs.get("password2", "")

        if not email:
            logger.warning("Validation failed: Email field is required.")
            raise serializers.ValidationError("Email field is required")

        if password != password2:
            logger.warning("Validation failed: Passwords do not match.")
            raise serializers.ValidationError("Password does'nt match.")

        logger.debug("Validation successful for user data.")
        return attrs

    def create(self, validated_data):
        """
        Create a new user instance with default role as Student.

        Args:
            validated_data (dict): The validated user data.

        Returns:
            User: The created user instance.
        """
        logger.info("Creating a new user with Student role by default.")
        try:
            user = User.objects.create_user(
                email=validated_data["email"],
                first_name=validated_data.get("first_name"),
                last_name=validated_data.get("last_name"),
                middle_name=validated_data.get("middle_name", ""),
                password=validated_data.get("password"),
                role="Student",  # Ensure the default role is Student
            )
            logger.info(f"User {user.email} created successfully as Student.")
            return user

        except Exception as e:
            logger.exception(f"Error occurred while creating user: {e}")
            raise serializers.ValidationError(
                "An error occurred while creating the user. Please try again."
            )


class EmailVerificationSerializer(serializers.Serializer):
    """
    Serializer for validating email verification OTPs.
    Ensures OTP is properly formatted and contains only valid characters.
    """

    otp = serializers.CharField(max_length=8, min_length=8, required=True)

    def validate_otp(self, value):
        """
        Validate the OTP field for format and content.

        Args:
            value (str): The OTP to validate

        Returns:
            str: The validated OTP

        Raises:
            serializers.ValidationError: If OTP is invalid or improperly formatted
        """
        logger.debug(f"Validating OTP: {value}")

        if not value:
            logger.warning("OTP validation failed: No OTP provided")
            raise serializers.ValidationError("The OTP field is required")

        if len(value) != 8:
            logger.warning(f"Invalid OTP length: {len(value)} characters")
            raise serializers.ValidationError(
                "The OTP must be exactly 8 characters long"
            )

        if not value.isdigit():
            logger.warning(f"Invalid OTP format: {value} contains non-digit characters")
            raise serializers.ValidationError("The OTP must contain only digits")

        logger.debug("OTP validated successfully")
        return value


class LoginSerializer(serializers.Serializer):
    """
    Serializer for validating login credentials.
    Ensures email and password are properly formatted and valid.
    """

    email = serializers.EmailField(required=True)
    password = serializers.CharField(max_length=128, write_only=True, required=True)

    def validate(self, attrs):
        """
        Validate login credentials and authenticate the user.

        Args:
            attrs (dict): Dictionary containing email and password

        Returns:
            dict: Validated attributes with authenticated user object

        Raises:
            serializers.ValidationError: If credentials are invalid or user is not verified
        """
        email = attrs.get("email").lower().strip()
        password = attrs.get("password")

        logger.debug(f"Validating login credentials for email: {email}")

        if not email or not password:
            logger.warning("Missing email or password in login attempt")
            raise serializers.ValidationError(
                {
                    "error": "Email and password are required",
                    "error_code": "MISSING_CREDENTIALS",
                }
            )

        # Authenticate user
        user = authenticate(email=email, password=password)
        if not user:
            logger.error(f"Authentication failed for email: {email}")
            raise serializers.ValidationError(
                {
                    "error": "Invalid email or password",
                    "error_code": "INVALID_CREDENTIALS",
                }
            )

        # Check if user is verified
        if not user.is_verified:
            logger.warning(f"Login attempt by unverified user: {email}")
            raise serializers.ValidationError(
                {"error": "Account is not verified", "error_code": "UNVERIFIED_ACCOUNT"}
            )

        # Check if user is active
        if not user.is_active:
            logger.warning(f"Login attempt by inactive user: {email}")
            raise serializers.ValidationError(
                {"error": "Account is deactivated", "error_code": "INACTIVE_ACCOUNT"}
            )

        attrs["user"] = user
        logger.debug(f"Credentials validated successfully for user: {email}")
        return attrs


class ChangePasswordSerializer(serializers.Serializer):
    """
    Serializer for validating password change requests.
    Ensures old password, new password, and confirmation are valid and meet requirements.
    """

    old_password = serializers.CharField(max_length=128, write_only=True, required=True)
    new_password = serializers.CharField(
        max_length=128, min_length=6, write_only=True, required=True
    )
    new_password_confirm = serializers.CharField(
        max_length=128, write_only=True, required=True
    )

    def validate(self, attrs):
        """
        Validate password change inputs and authenticate the user.

        Args:
            attrs (dict): Dictionary containing old_password, new_password, and new_password_confirm

        Returns:
            dict: Validated attributes with authenticated user

        Raises:
            serializers.ValidationError: If validation fails or passwords don't match
        """
        old_password = attrs.get("old_password")
        new_password = attrs.get("new_password")
        new_password_confirm = attrs.get("new_password_confirm")
        user = self.context["request"].user

        logger.debug(
            f"Validating password change for user: {user.email} (UUID: {user.id})"
        )

        # Check if all fields are provided
        if not all([old_password, new_password, new_password_confirm]):
            logger.warning(f"Missing required fields for password change: {user.email}")
            raise serializers.ValidationError(
                {
                    "error": "All password fields are required",
                    "error_code": "MISSING_FIELDS",
                }
            )

        # Verify old password
        if not user.check_password(old_password):
            logger.error(f"Invalid old password for user: {user.email}")
            raise serializers.ValidationError(
                {"error": "Invalid old password", "error_code": "INVALID_OLD_PASSWORD"}
            )

        # Check if new passwords match
        if new_password != new_password_confirm:
            logger.warning(f"New passwords do not match for user: {user.email}")
            raise serializers.ValidationError(
                {
                    "error": "New passwords do not match",
                    "error_code": "PASSWORD_MISMATCH",
                }
            )

        # Validate new password strength
        if len(new_password) < 6:
            logger.warning(f"New password too short for user: {user.email}")
            raise serializers.ValidationError(
                {
                    "error": "New password must be at least 6 characters long",
                    "error_code": "PASSWORD_TOO_SHORT",
                }
            )

        if new_password == old_password:
            logger.warning(f"New password same as old password for user: {user.email}")
            raise serializers.ValidationError(
                {
                    "error": "New password cannot be the same as the old password",
                    "error_code": "SAME_PASSWORD",
                }
            )

        # Basic password strength check (e.g., contains letters and numbers)
        if not re.search(r"[A-Za-z]", new_password) or not re.search(
            r"[0-9]", new_password
        ):
            logger.warning(f"Weak password attempted for user: {user.email}")
            raise serializers.ValidationError(
                {
                    "error": "New password must contain both letters and numbers",
                    "error_code": "WEAK_PASSWORD",
                }
            )

        attrs["user"] = user
        logger.debug(f"Password change validation successful for user: {user.email}")
        return attrs


class LogoutSerializer(serializers.Serializer):
    """
    Serializer for validating logout requests.
    Ensures a valid refresh token is provided.
    """

    refresh_token = serializers.CharField(required=True)

    def validate(self, attrs):
        """
        Validate the refresh token provided in the logout request.

        Args:
            attrs (dict): Dictionary containing the refresh token

        Returns:
            dict: Validated attributes with the refresh token

        Raises:
            serializers.ValidationError: If the refresh token is invalid or missing
        """
        refresh_token = attrs.get("refresh_token")
        user = self.context["request"].user

        logger.debug(
            f"Validating logout request for user: {user.email} (UUID: {user.id})"
        )

        if not refresh_token:
            logger.warning(
                f"Missing refresh token in logout attempt for user: {user.email}"
            )
            raise serializers.ValidationError(
                {"error": "Refresh token is required", "error_code": "MISSING_TOKEN"}
            )

        try:
            # Validate the refresh token
            token = RefreshToken(refresh_token)

            # Ensure the token belongs to the authenticated user
            if str(token.payload.get("user_id")) != str(user.id):
                logger.error(f"Invalid refresh token for user: {user.email}")
                raise serializers.ValidationError(
                    {"error": "Invalid refresh token", "error_code": "INVALID_TOKEN"}
                )

        except TokenError as e:
            logger.error(
                f"Invalid refresh token format for user: {user.email}: {str(e)}"
            )
            raise serializers.ValidationError(
                {
                    "error": "Invalid or expired refresh token",
                    "error_code": "INVALID_TOKEN",
                }
            )

        attrs["refresh_token"] = refresh_token
        logger.debug(f"Refresh token validated successfully for user: {user.email}")
        return attrs


class PasswordResetRequestSerializer(serializers.Serializer):
    """
    Serializer for validating password reset request inputs.
    Ensures a valid email is provided.
    """

    email = serializers.EmailField(required=True)

    def validate_email(self, value):
        """
        Validate the email field.

        Args:
            value (str): The email address provided

        Returns:
            str: The validated email

        Raises:
            serializers.ValidationError: If the email is invalid or not registered
        """
        email = value.lower().strip()
        logger.debug(f"Validating email for password reset: {email}")

        try:
            validate_email(email)

        except ValidationError:
            logger.warning(f"Invalid email format: {email}")
            raise serializers.ValidationError(
                {"error": "Invalid email format", "error_code": "INVALID_EMAIL"}
            )

        if not User.objects.filter(email=email).exists():
            logger.warning(f"Password reset requested for non-existent email: {email}")
            raise serializers.ValidationError(
                {
                    "error": "No account found with this email",
                    "error_code": "EMAIL_NOT_FOUND",
                }
            )

        return email


class PasswordResetConfirmSerializer(serializers.Serializer):
    """
    Serializer for validating password reset confirmation inputs.
    Ensures OTP, new password, and confirmation are valid.
    """

    otp = serializers.CharField(max_length=8, min_length=8, required=True)
    new_password = serializers.CharField(
        max_length=128, min_length=6, write_only=True, required=True
    )
    new_password_confirm = serializers.CharField(
        max_length=128, write_only=True, required=True
    )

    def validate(self, attrs):
        """
        Validate OTP and password inputs.

        Args:
            attrs (dict): Dictionary containing OTP, new_password, and new_password_confirm

        Returns:
            dict: Validated attributes with user

        Raises:
            serializers.ValidationError: If validation fails
        """
        otp = attrs.get("otp")
        new_password = attrs.get("new_password")
        new_password_confirm = attrs.get("new_password_confirm")

        logger.debug(f"Validating password reset confirmation with OTP: {otp}")

        # Validate OTP format
        if not otp.isdigit():
            logger.warning(f"Invalid OTP format: {otp}")
            raise serializers.ValidationError(
                {"error": "OTP must contain only digits", "error_code": "INVALID_OTP"}
            )

        # Check if passwords match
        if new_password != new_password_confirm:
            logger.warning("New passwords do not match")
            raise serializers.ValidationError(
                {
                    "error": "New passwords do not match",
                    "error_code": "PASSWORD_MISMATCH",
                }
            )

        # Validate password strength
        if not re.search(r"[A-Za-z]", new_password) or not re.search(
            r"[0-9]", new_password
        ):
            logger.warning("Weak password attempted")
            raise serializers.ValidationError(
                {
                    "error": "Password must contain both letters and numbers",
                    "error_code": "WEAK_PASSWORD",
                }
            )

        # Fetch user by OTP
        try:
            otp_obj = OneTimePassword.objects.get(code=otp)
            attrs["user"] = otp_obj.user
            logger.debug(f"OTP validated for user: {otp_obj.user.email}")

        except OneTimePassword.DoesNotExist:
            logger.error(f"Invalid OTP provided: {otp}")
            raise serializers.ValidationError(
                {"error": "Invalid or expired OTP", "error_code": "INVALID_OTP"}
            )

        return attrs


class UserProfileDetailSerializer(serializers.ModelSerializer):
    """
    Serializer for UserProfile data.
    Handles serialization and validation for user profile details, including file uploads.
    """

    user = serializers.PrimaryKeyRelatedField(
        queryset=User.objects.all(), write_only=True, required=True
    )

    class Meta:
        model = UserProfile
        fields = [
            "user",
            "bio",
            "phone_number",
            "dob",
            "profile_picture",
            "language_preference",
            "gender",
            "education_level",
            "camp",
            "created_at",
            "updated_at",
        ]
        read_only_fields = ["created_at", "updated_at"]

    def validate_phone_number(self, value: Optional[str]) -> Optional[str]:
        """
        Validate phone number format if provided.
        """
        if value:
            logger.debug(f"Validating phone number: {value}")

            # Basic phone number validation (e.g., +1234567890 or 123-456-7890)
            if not re.match(r"^\+?[\d\s\-\(\)]{7,20}$", value):
                logger.warning(f"Invalid phone number format: {value}")
                raise serializers.ValidationError(
                    {
                        "error": "Invalid phone number format",
                        "error_code": "INVALID_PHONE_NUMBER",
                    }
                )
        return value

    def validate_dob(self, value: Optional[str]) -> Optional[str]:
        """
        Validate date of birth if provided.
        """
        if value:
            logger.debug(f"Validating DOB: {value}")
            from datetime import date

            if value > date.today():
                logger.warning(f"Future DOB provided: {value}")
                raise serializers.ValidationError(
                    {
                        "error": "Date of birth cannot be in the future",
                        "error_code": "INVALID_DOB",
                    }
                )
        return value

    def validate_profile_picture(self, value: Optional[object]) -> Optional[object]:
        """
        Validate profile picture file (type and size).
        """
        if value:
            logger.debug(f"Validating profile picture: {value.name}")

            # Allowed file types
            allowed_types = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
            if value.content_type not in allowed_types:
                logger.warning(
                    f"Invalid file type for profile picture: {value.content_type}"
                )
                raise serializers.ValidationError(
                    {
                        "error": f"Invalid file type. Allowed types: {', '.join(allowed_types)}",
                        "error_code": "INVALID_FILE_TYPE",
                    }
                )

            # Max size (5MB)
            max_size = 10 * 1024 * 1024  # 10MB
            if value.size > max_size:
                logger.warning(f"File too large: {value.size} bytes")
                raise serializers.ValidationError(
                    {
                        "error": f"File size exceeds limit of {max_size / 1024 / 1024}MB",
                        "error_code": "FILE_TOO_LARGE",
                    }
                )
        return value


class UserDataSerializer(serializers.ModelSerializer):
    """
    Serializer for User data, including read-only UserProfile details.
    Handles serialization and validation for user fields only.
    """

    profile = UserProfileDetailSerializer(
        source="user_profile", read_only=False, allow_null=True
    )

    class Meta:
        model = User
        fields = [
            "id",
            "username",
            "email",
            "first_name",
            "middle_name",
            "last_name",
            "role",
            "profile",
        ]
        read_only_fields = ["id", "role", "profile"]

    def validate_email(self, value: str) -> str:
        """
        Validate email to ensure uniqueness (excluding the current user).
        """
        logger.debug(f"Validating email: {value}")
        user = self.instance

        if User.objects.filter(email=value.lower()).exclude(id=user.id).exists():
            logger.warning(f"Email {value} already in use")
            raise serializers.ValidationError(
                {"error": "This email is already in use", "error_code": "EMAIL_EXISTS"}
            )
        return value.lower()

    def validate_username(self, value: str) -> str:
        """
        Validate username to ensure uniqueness (excluding the current user).
        """
        logger.debug(f"Validating username: {value}")
        user = self.instance

        if User.objects.filter(username=value).exclude(id=user.id).exists():
            logger.warning(f"Username {value} already in use")
            raise serializers.ValidationError(
                {
                    "error": "This username is already in use",
                    "error_code": "USERNAME_EXISTS",
                }
            )
        return value

    def update(self, instance: User, validated_data: dict) -> User:
        """
        Update User fields with validated data.
        """
        logger.info(f"Updating user data for: {instance.email} (UUID: {instance.id})")

        # Update User fields
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance


class AdminDashboardSerializer(serializers.Serializer):
    """
    Serializer for admin dashboard data.
    Defines the structure of the dashboard response.
    """

    total_users = serializers.IntegerField()
    active_users = serializers.IntegerField()
