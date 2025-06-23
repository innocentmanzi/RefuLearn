import random
import uuid
import re
from datetime import datetime
import os
from django.conf import settings
from django.core.mail import EmailMessage
from django.core.exceptions import ObjectDoesNotExist, ValidationError
from authentication.models import User, OneTimePassword
from utils import logging_config

logger = logging_config.setup_logging()


def generate_otp():
    """
    Generate an 8-digit random one-time passcode (OTP).
    """
    logger.info("Generating an 8-digit OTP.")
    otp = "".join(str(random.randint(0, 9)) for _ in range(8))
    logger.debug(f"Generated OTP: {otp}")
    return otp


def send_code_to_user(email, purpose="verification"):
    """
    Send a one-time passcode (OTP) to the user's email for a specified purpose.

    Args:
        email (str): The email address of the user.
        purpose (str): The purpose of the OTP, e.g., 'verification' or 'password_reset'. Defaults to 'verification'.

    Raises:
        ObjectDoesNotExist: If no user is found with the provided email.
        ValueError: If an invalid purpose is provided.
        Exception: If an error occurs during the email sending process.
    """
    logger.info(f"Initiating OTP email for {email} with purpose: {purpose}")
    try:
        # Fetch user associated with the email
        user = User.objects.get(email=email)
        logger.info(f"User found for email {email}: {user.full_name}")

        # Generate OTP
        otp_code = generate_otp()

        # Define email content based on purpose
        if purpose == "password_reset":
            subject = "One-Time Passcode for Password Reset"
            email_body = (
                f"Dear {user.first_name},\n\n"
                f"You requested to reset your password for your E-Learning account. "
                f"Please use the following one-time passcode (OTP) to proceed:\n\n"
                f"OTP: {otp_code}\n\n"
                f"This code is valid for a limited time. If you did not request a password reset, "
                f"please contact our support team immediately.\n\n"
                f"Best regards,\nE-Learning Team"
            )

        elif purpose == "verification":
            subject = "One-Time Passcode for Email Verification"
            email_body = (
                f"Hi {user.first_name},\n\n"
                f"Thank you for signing up with E-Learning. Please verify your email address "
                f"using the following one-time passcode:\n\n"
                f"OTP: {otp_code}\n\n"
                f"If you did not sign up, please ignore this email or contact support.\n\n"
                f"Best regards,\nE-Learning Team"
            )

        else:
            logger.error(f"Invalid purpose provided: {purpose}")
            raise ValueError(f"Invalid purpose: {purpose}")

        # Send the email
        send_email = EmailMessage(
            subject=subject,
            body=email_body,
            from_email=settings.EMAIL_HOST_USER,
            to=[email],
        )
        send_email.send(fail_silently=False)
        logger.info(f"OTP email sent successfully to {email} for purpose: {purpose}")

        # Save OTP in the database only after email is successfully sent
        OneTimePassword.objects.create(user=user, code=otp_code)
        logger.info(f"OTP {otp_code} saved successfully for user: {email}")

    except ObjectDoesNotExist:
        logger.error(f"No user found with the email: {email}")
        raise

    except Exception as e:
        logger.exception(
            f"Error sending OTP to {email} for purpose {purpose}: {str(e)}"
        )
        raise


def send_normal_email(data):
    """
    Send a normal email with the provided subject, body, and recipient details.

    Args:
        data (dict): A dictionary containing email details with keys:
            - 'email_subject': Subject of the email.
            - 'email_body': Body of the email.
            - 'to_email': Recipient email address.

    Raises:
        Exception: If an error occurs while sending the email.
    """
    logger.info(f"Sending normal email to: {data['to_email']}")

    try:
        email = EmailMessage(
            subject=data["email_subject"],
            body=data["email_body"],
            from_email=settings.EMAIL_HOST_USER,
            to=[data["to_email"]],
        )
        email.send()
        logger.info(f"Email sent successfully to {data['to_email']}.")

    except Exception as e:
        logger.exception(f"Error sending email to {data['to_email']}: {str(e)}")
        raise


def sanitize_input(data, fields=None, email_fields=None, otp_fields=None):
    """
    Sanitize input data to prevent injection attacks and ensure data quality.

    Args:
        data (dict): Input data to sanitize.
        fields (list, optional): Specific fields to sanitize. If None, sanitizes all string fields.
        email_fields (list, optional): Fields to normalize as emails (lowercase).
        otp_fields (list, optional): Fields to ensure contain only digits.

    Returns:
        dict: Sanitized data.

    Raises:
        ValidationError: If input contains invalid characters or fails field-specific validation.
    """
    logger.debug(f"Sanitizing input data: {data}")
    sanitized_data = data.copy()

    # Determine fields to sanitize
    target_fields = fields if fields is not None else sanitized_data.keys()
    email_fields = email_fields or []
    otp_fields = otp_fields or []

    for field in target_fields:
        if field in sanitized_data and sanitized_data[field] is not None:
            value = str(sanitized_data[field]).strip()

            if field in otp_fields:
                # OTPs: only digits allowed
                sanitized_value = re.sub(r"[^\d]", "", value)
                if sanitized_value != value or not sanitized_value:
                    logger.warning(
                        f"Invalid OTP characters in field '{field}': {value}"
                    )
                    raise ValidationError(
                        {
                            "error": f"Field '{field}' must contain only digits",
                            "error_code": "INVALID_OTP",
                        }
                    )
            else:
                # General fields: remove dangerous characters
                sanitized_value = re.sub(r"[<>;{}]", "", value)

                if field in email_fields:
                    # Emails: normalize to lowercase
                    sanitized_value = sanitized_value.lower()

                if sanitized_value != value:
                    logger.warning(f"Invalid characters in field '{field}': {value}")
                    raise ValidationError(
                        {
                            "error": f"Field '{field}' contains invalid characters",
                            "error_code": "INVALID_INPUT",
                        }
                    )

            sanitized_data[field] = sanitized_value

    logger.debug(f"Sanitized data: {sanitized_data}")
    return sanitized_data


def get_module_upload_path(instance, filename):
    """
    Generate dynamic upload path based on file type and current date.
    Paths: courses/modules/{img|files|videos|audios}/YYYY/MM/DD/
    """
    # Get file extension
    ext = os.path.splitext(filename)[1].lower()

    # renaming file name to prevent collisions
    new_filename = f"{uuid.uuid4().hex}{ext}"

    # Determine file type directory
    if ext in [".jpg", ".jpeg", ".png", ".gif", ".webp"]:
        file_type_dir = "images"
    elif ext == ".pdf":
        file_type_dir = "files"
    elif ext in [".mp4", ".mov", ".avi", ".mkv"]:
        file_type_dir = "videos"
    elif ext in [".mp3", ".wav", ".ogg", ".m4a"]:
        file_type_dir = "audios"
    else:
        file_type_dir = "others"

    # Get current date parts
    now = datetime.now()
    year = now.strftime("%Y")
    month = now.strftime("%m")
    day = now.strftime("%d")

    # Construct the full path
    return os.path.join(
        "courses", "modules", file_type_dir, year, month, day, new_filename
    )
