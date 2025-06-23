import re
from datetime import datetime
from django.core.exceptions import ValidationError, ObjectDoesNotExist
from django.core.validators import validate_email
from django.db import IntegrityError, DatabaseError
from rest_framework import status, views, serializers, parsers
from rest_framework.generics import GenericAPIView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.exceptions import TokenError
from rest_framework_simplejwt.token_blacklist.models import (
    OutstandingToken,
    BlacklistedToken,
)
from drf_spectacular.utils import extend_schema
from .serializers import (
    UserRegistrationSerializer,
    EmailVerificationSerializer,
    LoginSerializer,
    ChangePasswordSerializer,
    ChangePasswordSerializer,
    LogoutSerializer,
    PasswordResetRequestSerializer,
    PasswordResetConfirmSerializer,
    UserDataSerializer,
    UserProfileDetailSerializer,
    AdminDashboardSerializer,
)
from .models import User, OneTimePassword
from utils import logging_config, utils, rate_throttle, permissions, custom_pagination

# Initialize logger from the provided logging setup
logger = logging_config.setup_logging()


class RegisterUserView(GenericAPIView):
    """
    API view for registering new users with enhanced security and validation.
    Creates a new user with default 'Student' role, performs comprehensive input
    validation, and sends a verification OTP via email.
    """

    serializer_class = UserRegistrationSerializer
    permission_classes = [AllowAny]

    def _sanitize_input(self, data):
        """
        Sanitize input data to prevent injection attacks and ensure data quality.
        """
        sanitized_data = data.copy()
        string_fields = ["email", "first_name", "middle_name", "last_name"]

        for field in string_fields:
            if field in sanitized_data and sanitized_data[field]:
                # Remove potentially dangerous characters and trim whitespace
                sanitized_data[field] = re.sub(
                    r"[<>;{}]", "", str(sanitized_data[field])
                ).strip()

        return sanitized_data

    def _validate_email_format(self, email):
        """
        Validate email format using Django's validator and additional checks.
        """
        try:
            validate_email(email)
            # Additional email validation rules
            if len(email) > 255:
                raise ValidationError("Email address is too long")

            if not re.match(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$", email):
                raise ValidationError("Invalid email format")

        except ValidationError as e:
            logger.error(f"Invalid email format: {email}. Error: {str(e)}")
            raise

    def post(self, request):
        """
        Handle POST requests to register a new user with comprehensive error handling.

        Args:
            request: HTTP request containing user registration data

        Returns:
            Response: JSON response with user data and success message or detailed error

        Raises:
            ValidationError: If input data validation fails
            IntegrityError: If database integrity constraints are violated
            Exception: For unexpected errors during processing
        """
        logger.info(
            f"Received registration request from IP: {request.META.get('REMOTE_ADDR')}"
        )

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data,
                fields=["email", "first_name", "middle_name", "last_name"],
                email_fields=["email"],
            )

            # Validate email format
            email = sanitized_data.get("email", "")
            if not email:
                logger.warning("Registration attempt with missing email")
                return Response(
                    {"error": "Email is email required"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            self._validate_email_format(email)

            # Check for existing user
            if User.objects.filter(email=email).exists():
                logger.warning(f"Registration attempt with existing email: {email}")
                return Response(
                    {
                        "error": "A user with this email already exists",
                        "error_code": "EMAIL_EXISTS",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Initialize serializer
            serializer = self.serializer_class(data=sanitized_data)
            if not serializer.is_valid():
                logger.warning(f"Invalid registration data: {serializer.errors}")
                return Response(
                    {
                        "error": "Invalid registration data",
                        "details": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Save user
            user = serializer.save()
            logger.info(f"User created successfully: {email}")

            # Send OTP
            try:
                utils.send_code_to_user(email, purpose="verification")
                logger.info(f"OTP sent successfully to {email}")

            except ObjectDoesNotExist:
                logger.error(f"User not found after creation: {email}")
                return Response(
                    {
                        "error": "Failed to send verification code",
                        "error_code": "USER_NOT_FOUND",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            except Exception as e:
                logger.error(f"Failed to send OTP to {email}: {str(e)}")
                # Delete the created user if OTP sending fails
                user.delete()
                return Response(
                    {
                        "error": "Failed to send verification code",
                        "error_code": "OTP_SEND_FAILED",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            # Prepare success response
            response_data = {
                "data": serializer.data,
                "message": (
                    f"Hi {user.first_name}, thank you for signing up. "
                    "A verification code has been sent to your email. Use it to verify your account."
                ),
                "error_code": None,
            }

            logger.info(f"Successful registration for {email}")
            return Response(response_data, status=status.HTTP_201_CREATED)

        except ValidationError as e:
            logger.error(f"Validation error during registration: {str(e)}")
            return Response(
                {"error": str(e), "error_code": "VALIDATION_ERROR"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        except IntegrityError as e:
            logger.error(f"Database integrity error during registration: {str(e)}")
            return Response(
                {"error": "Database error occurred", "error_code": "DATABASE_ERROR"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except Exception as e:
            logger.exception(f"Unexpected error during registration: {str(e)}")
            return Response(
                {
                    "error": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class VerifyEmail(views.APIView):
    """
    API view for verifying user email addresses using a one-time passcode (OTP).
    Validates the OTP, marks the user as verified, deletes the OTP, and handles errors with comprehensive logging.
    """

    serializer_class = EmailVerificationSerializer
    permission_classes = [AllowAny]

    def post(self, request):
        """
        Handle POST requests to verify a user's email using an OTP.

        Validates the provided OTP, marks the user as verified if valid,
        deletes the OTP record, and returns appropriate responses for success or failure.

        Args:
            request: HTTP request containing OTP data

        Returns:
            Response: JSON response with success message or detailed error

        Raises:
            serializers.ValidationError: If input data is invalid
            ObjectDoesNotExist: If OTP is not found
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.info(f"Email verification request received from IP: {client_ip}")

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=["otp"], otp_fields=["otp"]
            )

            # Initialize serializer
            serializer = self.serializer_class(data=sanitized_data)

            # Validate input data
            if not serializer.is_valid():
                logger.warning(f"Invalid verification data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            otp = serializer.validated_data["otp"]
            logger.debug(f"Processing OTP: {otp} for verification")

            # Retrieve OTP and user
            try:
                user_code_obj = OneTimePassword.objects.get(code=otp)
                user = user_code_obj.user
                logger.info(f"OTP matched for user: {user.email} (UUID: {user.id})")

                # Check verification status
                if user.is_verified:
                    logger.warning(
                        f"Verification attempt for already verified user: {user.email}"
                    )
                    # Delete OTP even if user is already verified
                    user_code_obj.delete()
                    logger.info(f"OTP {otp} deleted for already verified user")
                    return Response(
                        {
                            "message": "User is already verified",
                            "error_code": "ALREADY_VERIFIED",
                        },
                        status=status.HTTP_200_OK,
                    )

                # Mark user as verified and delete OTP
                user.is_verified = True
                user.save()
                user_code_obj.delete()

                logger.info(
                    f"User {user.email} verified successfully. OTP {otp} deleted"
                )
                return Response(
                    {
                        "message": f"Account email verified successfully for {user.email}",
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except OneTimePassword.DoesNotExist:
                logger.error(f"Invalid OTP provided: {otp}")
                return Response(
                    {"message": "Invalid or expired OTP", "error_code": "INVALID_OTP"},
                    status=status.HTTP_404_NOT_FOUND,
                )

            except DatabaseError as e:
                logger.error(f"Database error during verification: {str(e)}")
                return Response(
                    {
                        "message": "Database error occurred during verification",
                        "error_code": "DATABASE_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            logger.error(f"Validation error during email verification: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(f"Unexpected error during email verification: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LoginView(views.APIView):
    """
    API view for user login with email and password.
    Validates credentials, generates JWT access and refresh tokens,
    updates last login time, and handles errors with comprehensive logging.
    """

    serializer_class = LoginSerializer
    permission_classes = [AllowAny]
    throttle_classes = [rate_throttle.CustomAnonRateThrottle]

    def post(self, request):
        """
        Handle POST requests to authenticate users and issue JWT tokens.

        Args:
            request: HTTP request containing email and password

        Returns:
            Response: JSON response with access/refresh tokens or detailed error

        Raises:
            serializers.ValidationError: If input validation fails
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.info(f"Login request received from IP: {client_ip}")

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=["email", "password"], email_fields=["email"]
            )

            # Initialize serializer
            serializer = self.serializer_class(data=sanitized_data)

            # Validate credentials
            if not serializer.is_valid():
                logger.warning(f"Invalid login data: {serializer.errors}")
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = serializer.validated_data["user"]
            email = serializer.validated_data["email"]

            # Generate JWT tokens
            try:
                refresh = RefreshToken.for_user(user)
                access_token = str(refresh.access_token)
                refresh_token = str(refresh)

                # Update last login time
                user.last_login = datetime.now()
                user.save(update_fields=["last_login"])

                logger.info(f"Successful login for user: {email} (UUID: {user.id})")

                return Response(
                    {
                        "message": f"Login successful for {user.full_name}",
                        "data": {
                            "access_token": access_token,
                            "refresh_token": refresh_token,
                            "user": {
                                "id": str(user.id),
                                "email": user.email,
                                "full_name": user.full_name,
                                "role": user.role,
                            },
                        },
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except DatabaseError as e:
                logger.error(f"Database error during login for {email}: {str(e)}")
                return Response(
                    {
                        "message": "Database error occurred during login",
                        "error_code": "DATABASE_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            except Exception as e:
                logger.error(f"Error generating tokens for {email}: {str(e)}")
                return Response(
                    {
                        "message": "Failed to generate authentication tokens",
                        "error_code": "TOKEN_GENERATION_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            logger.error(f"Validation error during login: {str(e)}")
            return Response(
                {
                    "message": "Invalid login credentials",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(f"Unexpected error during login: {str(e)}")
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class ChangePasswordView(views.APIView):
    """
    API view for authenticated users to change their password.
    Validates old password, new password, and confirmation, then updates the user's password.
    """

    serializer_class = ChangePasswordSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [rate_throttle.CustomUserRateThrottle]

    def post(self, request):
        """
        Handle POST requests to change a user's password.

        Args:
            request: HTTP request containing old_password, new_password, and new_password_confirm

        Returns:
            Response: JSON response with success message or detailed error

        Raises:
            serializers.ValidationError: If input validation fails
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"Password change request received from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data,
                fields=["old_password", "new_password", "new_password_confirm"],
            )

            # Initialize serializer with user context
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            # Validate input
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid password change data for user: {user.email}. Errors: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Update password
            user = serializer.validated_data["user"]
            new_password = serializer.validated_data["new_password"]

            try:
                user.set_password(new_password)
                user.save()
                logger.info(f"Password changed successfully for user: {user.email}")

                return Response(
                    {
                        "message": f"Password changed successfully for {user.full_name}",
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except DatabaseError as e:
                logger.error(
                    f"Database error during password change for {user.email}: {str(e)}"
                )
                return Response(
                    {
                        "message": "Database error occurred during password change",
                        "error_code": "DATABASE_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            except ValidationError as e:
                logger.error(
                    f"Validation error during password save for {user.email}: {str(e)}"
                )
                return Response(
                    {
                        "message": "Invalid password format",
                        "error_code": "INVALID_PASSWORD_FORMAT",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

        except serializers.ValidationError as e:
            logger.error(
                f"Validation error during password change for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during password change for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class LogoutView(views.APIView):
    """
    API view for authenticated users to log out by blacklisting all their refresh tokens.
    Validates the provided refresh token and blacklists all outstanding tokens for the user.
    """

    serializer_class = LogoutSerializer
    permission_classes = [IsAuthenticated]
    throttle_classes = [rate_throttle.CustomUserRateThrottle]

    def _blacklist_all_user_tokens(self, user):
        """
        Blacklist all outstanding refresh tokens for the given user.

        Args:
            user: User instance whose tokens need to be blacklisted

        Raises:
            DatabaseError: If database operations fail during blacklisting
        """
        logger.debug(
            f"Blacklisting all tokens for user: {user.email} (UUID: {user.id})"
        )

        try:
            # Fetch all outstanding tokens for the user
            tokens = OutstandingToken.objects.filter(user_id=user.id)
            token_count = tokens.count()

            for token in tokens:
                # Only blacklist if not already blacklisted
                if not BlacklistedToken.objects.filter(token=token).exists():
                    BlacklistedToken.objects.create(token=token)

            logger.info(f"Blacklisted {token_count} tokens for user: {user.email}")
            return token_count

        except DatabaseError as e:
            logger.error(
                f"Database error while blacklisting tokens for {user.email}: {str(e)}"
            )
            raise

    def post(self, request):
        """
        Handle POST requests to log out a user and blacklist all their refresh tokens.

        Args:
            request: HTTP request containing the refresh token

        Returns:
            Response: JSON response with success message or detailed error

        Raises:
            serializers.ValidationError: If input validation fails
            TokenError: If the refresh token is invalid
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"Logout request received from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=["refresh_token"]
            )

            # Initialize serializer with user context
            serializer = self.serializer_class(
                data=sanitized_data, context={"request": request}
            )

            # Validate input
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid logout data for user: {user.email}. Errors: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            refresh_token = serializer.validated_data["refresh_token"]

            try:
                # Validate and blacklist the provided token
                token = RefreshToken(refresh_token)
                token.blacklist()
                logger.info(
                    f"Provided refresh token blacklisted for user: {user.email}"
                )

                # Blacklist all other outstanding tokens for the user
                token_count = self._blacklist_all_user_tokens(user)

                return Response(
                    {
                        "message": f"Logout successful for {user.full_name}. {token_count} token(s) blacklisted.",
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except TokenError as e:
                logger.error(
                    f"Error blacklisting provided token for user: {user.email}: {str(e)}"
                )
                return Response(
                    {
                        "message": "Invalid or already blacklisted token",
                        "error_code": "TOKEN_ERROR",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            except DatabaseError as e:
                logger.error(f"Database error during logout for {user.email}: {str(e)}")
                return Response(
                    {
                        "message": "Database error occurred during logout",
                        "error_code": "DATABASE_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            logger.error(f"Validation error during logout for {user.email}: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during logout for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetRequestView(views.APIView):
    """
    API view for users to request a password reset by providing their email.
    Sends a one-time passcode (OTP) to the user's email for verification.
    """

    serializer_class = PasswordResetRequestSerializer
    permission_classes = [AllowAny]
    throttle_classes = [rate_throttle.CustomAnonRateThrottle]

    def post(self, request):
        """
        Handle POST requests to initiate a password reset by sending an OTP.

        Args:
            request: HTTP request containing the email

        Returns:
            Response: JSON response with success message or detailed error

        Raises:
            serializers.ValidationError: If input validation fails
            ObjectDoesNotExist: If user or OTP issues occur
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.info(f"Password reset request received from IP: {client_ip}")

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data, fields=["email"], email_fields=["email"]
            )

            # Initialize serializer
            serializer = self.serializer_class(data=sanitized_data)

            # Validate input
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid password reset request data: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            email = serializer.validated_data["email"]

            try:
                user = User.objects.get(email=email)
                logger.info(
                    f"Password reset initiated for user: {email} (UUID: {user.id})"
                )

                # Delete any existing OTP for the user
                OneTimePassword.objects.filter(user=user).delete()
                logger.debug(f"Deleted existing OTP for user: {email}")

                # Send new OTP
                utils.send_code_to_user(email, purpose="password_reset")
                logger.info(f"OTP sent successfully to {email}")

                return Response(
                    {
                        "message": f"A password reset code has been sent to {email}",
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except ObjectDoesNotExist:
                logger.error(f"User not found for email: {email}")
                return Response(
                    {
                        "message": "No account found with this email",
                        "error_code": "EMAIL_NOT_FOUND",
                    },
                    status=status.HTTP_404_NOT_FOUND,
                )

            except Exception as e:
                logger.error(f"Error sending OTP to {email}: {str(e)}")
                return Response(
                    {
                        "message": "Failed to send password reset code",
                        "error_code": "OTP_SEND_FAILED",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            logger.error(f"Validation error during password reset request: {str(e)}")
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except DatabaseError as e:
            logger.error(f"Database error during password reset request: {str(e)}")
            return Response(
                {"message": "Database error occurred", "error_code": "DATABASE_ERROR"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during password reset request: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class PasswordResetConfirmView(views.APIView):
    """
    API view for users to confirm password reset using an OTP and new password.
    Validates the OTP and updates the user's password.
    """

    serializer_class = PasswordResetConfirmSerializer
    permission_classes = [AllowAny]
    throttle_classes = [rate_throttle.CustomAnonRateThrottle]

    def post(self, request):
        """
        Handle POST requests to confirm password reset and update the password.

        Args:
            request: HTTP request containing OTP, new_password, and new_password_confirm

        Returns:
            Response: JSON response with success message or detailed error

        Raises:
            serializers.ValidationError: If input validation fails
            DatabaseError: If database operations fail
            Exception: For unexpected errors
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.info(
            f"Password reset confirmation request received from IP: {client_ip}"
        )

        try:
            # Sanitize input data
            sanitized_data = utils.sanitize_input(
                request.data,
                fields=["otp", "new_password", "new_password_confirm"],
                otp_fields=["otp"],
            )

            # Initialize serializer
            serializer = self.serializer_class(data=sanitized_data)

            # Validate input
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid password reset confirmation data: {serializer.errors}"
                )
                return Response(
                    {
                        "message": "Invalid input data",
                        "errors": serializer.errors,
                        "error_code": "INVALID_DATA",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            user = serializer.validated_data["user"]
            new_password = serializer.validated_data["new_password"]
            otp = serializer.validated_data["otp"]

            try:
                # Update password
                user.set_password(new_password)
                user.save()
                logger.info(
                    f"Password reset successful for user: {user.email} (UUID: {user.id})"
                )

                # Delete the OTP
                OneTimePassword.objects.filter(code=otp).delete()
                logger.info(f"OTP {otp} deleted for user: {user.email}")

                return Response(
                    {
                        "message": f"Password reset successful for {user.full_name}",
                        "error_code": None,
                    },
                    status=status.HTTP_200_OK,
                )

            except ValidationError as e:
                logger.error(f"Invalid password format for {user.email}: {str(e)}")
                return Response(
                    {
                        "message": "Invalid password format",
                        "error_code": "INVALID_PASSWORD_FORMAT",
                    },
                    status=status.HTTP_400_BAD_REQUEST,
                )

            except DatabaseError as e:
                logger.error(
                    f"Database error during password reset for {user.email}: {str(e)}"
                )
                return Response(
                    {
                        "message": "Database error occurred during password reset",
                        "error_code": "DATABASE_ERROR",
                    },
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

        except serializers.ValidationError as e:
            logger.error(
                f"Validation error during password reset confirmation: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during password reset confirmation: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserDataView(views.APIView):
    """
    API view to view or update user data (excluding UserProfile data).
    Restricted to authenticated users accessing their own data.
    """

    permission_classes = [IsAuthenticated, permissions.IsOwnProfile]
    serializer_class = UserDataSerializer

    def get(self, request):
        """
        Handle GET requests to retrieve user data, including UserProfile data if available.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"User data GET request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            serializer = self.serializer_class(user)
            return Response(
                {
                    "message": "User data retrieved successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving user data for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

    def patch(self, request):
        """
        Handle PATCH requests to update user data (excluding UserProfile data).
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"User data PATCH request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            sanitized_data = utils.sanitize_input(
                request.data,
                fields=["username", "first_name", "middle_name", "last_name", "email"],
                email_fields=["email"],
            )

            serializer = self.serializer_class(user, data=sanitized_data, partial=True)
            if not serializer.is_valid():
                logger.warning(
                    f"Invalid user data update for {user.email}: {serializer.errors}"
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
            logger.info(f"User data updated successfully for user: {user.email}")

            return Response(
                {
                    "message": "User data updated successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            logger.error(
                f"Validation error updating user data for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error updating user data for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserProfileView(views.APIView):
    """
    API view to create or update UserProfile data for a specified user.
    Restricted to authenticated users modifying their own profile.
    """

    permission_classes = [IsAuthenticated, permissions.IsOwnProfile]
    serializer_class = UserProfileDetailSerializer
    parser_classes = [
        parsers.MultiPartParser,
        parsers.FormParser,
    ]  # Support file uploads and JSON

    def get_object(self, user_id: str) -> User:
        """
        Retrieve the User object for the given user_id and verify ownership.
        """
        client_ip = self.request.META.get("REMOTE_ADDR", "unknown")
        try:
            user = User.objects.get(id=user_id)

            # Check IsOwnProfile permission
            if user.id != self.request.user.id:
                logger.warning(
                    f"User {self.request.user.email} attempted to access profile of user {user.email}"
                )
                raise serializers.ValidationError(
                    {
                        "error": "You can only access your own profile",
                        "error_code": "UNAUTHORIZED_PROFILE_ACCESS",
                    }
                )
            return user

        except ValueError:
            logger.warning(
                f"Invalid UUID format for user_id: {user_id} from IP: {client_ip}"
            )
            raise serializers.ValidationError(
                {"error": "Invalid user ID format", "error_code": "INVALID_USER_ID"}
            )

        except ObjectDoesNotExist:
            logger.warning(
                f"User not found for user_id: {user_id} from IP: {client_ip}"
            )
            raise serializers.ValidationError(
                {"error": "User not found", "error_code": "USER_NOT_FOUND"}
            )

    @extend_schema(
        request={
            "multipart/form-data": {
                "type": "object",
                "properties": {
                    "bio": {"type": "string", "nullable": True},
                    "phone_number": {"type": "string", "nullable": True},
                    "dob": {"type": "string", "format": "date", "nullable": True},
                    "profile_picture": {"type": "string", "format": "binary"},
                    "language_preference": {"type": "string", "nullable": True},
                    "gender": {"type": "string", "nullable": True},
                    "education_level": {"type": "string", "nullable": True},
                    "camp": {"type": "string", "nullable": True},
                },
            }
        },
        responses={200: UserProfileDetailSerializer},
    )
    def patch(self, request, user_id: str):
        """
        Handle PATCH requests to create or update UserProfile data for the specified user.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.info(
            f"User profile PATCH request from IP: {client_ip} for user_id: {user_id}"
        )
        logger.debug(f"Request data: {dict(request.data)}")
        logger.debug(f"Request files: {dict(request.FILES)}")

        try:
            user = self.get_object(user_id)
            sanitized_data = utils.sanitize_input(
                request.data,
                fields=[
                    "bio",
                    "phone_number",
                    "language_preference",
                    "gender",
                    "education_level",
                    "camp",
                    "dob",
                ],
            )

            # Add profile_picture if present
            if "profile_picture" in request.FILES:
                sanitized_data["profile_picture"] = request.FILES["profile_picture"]

            user_profile = getattr(user, "user_profile", None)
            if user_profile:
                # Update existing UserProfile
                serializer = self.serializer_class(
                    user_profile, data=sanitized_data, partial=True
                )
                logger.debug(f"Updating existing UserProfile for user: {user.email}")
            else:
                # Create new UserProfile
                sanitized_data["user"] = user.id
                serializer = self.serializer_class(data=sanitized_data)
                logger.debug(f"Creating new UserProfile for user: {user.email}")

            if not serializer.is_valid():
                logger.warning(
                    f"Invalid profile data for {user.email}: {serializer.errors}"
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
            action = "updated" if user_profile else "created"
            logger.info(f"UserProfile {action} successfully for user: {user.email}")

            return Response(
                {
                    "message": f"User profile {action} successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except serializers.ValidationError as e:
            logger.error(
                f"Validation error updating profile for user_id {user_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid input data",
                    "errors": str(e),
                    "error_code": e.detail.get("error_code", "VALIDATION_ERROR"),
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error updating profile for user_id {user_id}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class UserListView(views.APIView):
    """
    API view to list all users with their profiles.
    Restricted to admin users only.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdmin]
    serializer_class = UserDataSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination

    @extend_schema(
        responses={
            200: UserDataSerializer(many=True),
            403: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request):
        """
        Handle GET requests to retrieve a paginated list of all users with their profiles.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"User list GET request from IP: {client_ip} for admin: {user.email} (UUID: {user.id})"
        )

        try:
            # Fetch all users
            queryset = (
                User.objects.all().select_related("user_profile").order_by("email")
            )
            paginator = self.pagination_class()
            paginated_users = paginator.paginate_queryset(queryset, request)

            serializer = self.serializer_class(paginated_users, many=True)
            logger.info(
                f"Successfully retrieved {len(paginated_users)} users for admin: {user.email}"
            )

            return paginator.get_paginated_response(serializer.data)

        except ValidationError as e:
            logger.error(
                f"Validation error retrieving user list for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid pagination parameters",
                    "errors": str(e),
                    "error_code": "INVALID_PAGINATION",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.error(
                f"Unexpected error retrieving user list for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class AdminDashboardView(GenericAPIView):
    """
    API view for admin users to access the admin dashboard.
    Restricted to users with the 'Admin' role.
    """

    permission_classes = [IsAuthenticated, permissions.IsAdmin]
    serializer_class = AdminDashboardSerializer

    def get(self, request):
        """
        Handle GET requests to access the admin dashboard.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.info(
            f"Admin dashboard GET request from IP: {client_ip} for user: {user.email} (UUID: {user.id})"
        )

        try:
            # Example dashboard data
            dashboard_data = {
                "total_users": User.objects.count(),
                "active_users": User.objects.filter(is_active=True).count(),
            }

            serializer = self.serializer_class(data=dashboard_data)
            serializer.is_valid(raise_exception=True)

            return Response(
                {
                    "message": "Admin dashboard retrieved successfully",
                    "data": serializer.data,
                    "error_code": None,
                },
                status=status.HTTP_200_OK,
            )

        except ValidationError as e:
            logger.error(
                f"Validation error retrieving admin dashboard for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "Invalid dashboard data",
                    "errors": str(e),
                    "error_code": "VALIDATION_ERROR",
                },
                status=status.HTTP_400_BAD_REQUEST,
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error retrieving admin dashboard for {user.email}: {str(e)}"
            )
            return Response(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )
