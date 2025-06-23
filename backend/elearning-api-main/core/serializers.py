from rest_framework import serializers
from .models import Language, Camp
from utils import logging_config
import re

logger = logging_config.setup_logging()


class LanguageSerializer(serializers.ModelSerializer):
    """
    Serializer for Language model.
    Handles serialization and validation for language creation and updates.
    """

    class Meta:
        model = Language
        fields = ["id", "code", "name"]
        read_only_fields = ["id"]

    def validate_code(self, value: str) -> str:
        """
        Validate language code format (e.g., 'en', 'fr').

        Args:
            value: The language code to validate.

        Returns:
            str: The validated, lowercase code.

        Raises:
            ValidationError: If the code format is invalid or already exists.
        """
        logger.debug(f"Validating language code: {value}")
        value = value.lower().strip()
        if not re.match(r"^[a-z]{2,10}$", value):
            logger.warning(f"Invalid language code format: {value}")
            raise serializers.ValidationError(
                {
                    "error": "Language code must be 2-10 lowercase letters (e.g., 'en', 'fr').",
                    "error_code": "INVALID_LANGUAGE_CODE",
                }
            )
        instance = self.instance

        if (
            Language.objects.filter(code=value)
            .exclude(id=instance.id if instance else None)
            .exists()
        ):
            logger.warning(f"Language code already in use: {value}")
            raise serializers.ValidationError(
                {
                    "error": "This language code is already in use.",
                    "error_code": "LANGUAGE_CODE_EXISTS",
                }
            )
        return value

    def validate_name(self, value: str) -> str:
        """
        Validate language name.

        Args:
            value: The language name to validate.

        Returns:
            str: The validated name.

        Raises:
            ValidationError: If the name is too short or already exists.
        """
        logger.debug(f"Validating language name: {value}")
        value = value.strip()
        if len(value) < 2:
            logger.warning(f"Language name too short: {value}")
            raise serializers.ValidationError(
                {
                    "error": "Language name must be at least 2 characters long.",
                    "error_code": "INVALID_LANGUAGE_NAME",
                }
            )

        instance = self.instance
        if (
            Language.objects.filter(name=value)
            .exclude(id=instance.id if instance else None)
            .exists()
        ):
            logger.warning(f"Language name already in use: {value}")
            raise serializers.ValidationError(
                {
                    "error": "This language name is already in use.",
                    "error_code": "LANGUAGE_NAME_EXISTS",
                }
            )
        return value


class CampSerializer(serializers.ModelSerializer):
    """
    Serializer for Camp model.
    Handles serialization and validation for Camp creation and updates.
    """

    class Meta:
        model = Camp
        fields = ["id", "name", "location"]
        read_only_fields = ["id"]

    def validate_name(self, value: str) -> str:
        """
        Validate camp name.

        Args:
            value: The camp name to validate.

        Returns:
            str: The validated name.

        Raises:
            ValidationError: If the name is too short or already exists.
        """
        logger.debug(f"Validating camp name: {value}")
        value = value.strip()
        if len(value) < 2:
            logger.warning(f"Camp name too short: {value}")
            raise serializers.ValidationError(
                {
                    "error": "Camp name must be at least 2 characters long.",
                    "error_code": "INVALID_CAMP_NAME",
                }
            )

        instance = self.instance
        if (
            Camp.objects.filter(name=value)
            .exclude(id=instance.id if instance else None)
            .exists()
        ):
            logger.warning(f"Camp name already in use: {value}")
            raise serializers.ValidationError(
                {
                    "error": "This Camp name is already in use.",
                    "error_code": "CAMP_NAME_EXISTS",
                }
            )
        return value

    def validate_location(self, value: str) -> str:
        """
        Validate camp location.
        """
        logger.debug(f"Validating camp location: {value}")
        value = value.strip()
        if len(value) < 2:
            logger.warning(f"Camp location too short: {value}")
            raise serializers.ValidationError(
                {
                    "error": "Camp location must be at least 2 characters long.",
                    "error_code": "INVALID_CAMP_LOCATION",
                }
            )
        return value
