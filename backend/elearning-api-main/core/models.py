import uuid
from django.db import models
from utils import logging_config

logger = logging_config.setup_logging()


class Language(models.Model):
    """
    Model representing supported languages for multilingual content.
    Used to manage language options for UserProfile and Course models.
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True, null=False
    )
    code = models.CharField(max_length=10, unique=True, null=False, blank=False)
    name = models.CharField(max_length=100, null=False, blank=False)

    def __str__(self) -> str:
        """
        String representation of the Language model.

        Returns:
            str: Language name and code (e.g., 'English (en)').
        """
        return f"{self.name} ({self.code})"

    def save(self, *args, **kwargs) -> None:
        """
        Overrides the default save method to log language creation or updates.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        if not self.pk:
            logger.info(
                f"Creating language: {self.name} with code: {self.code} (UUID: {self.id})"
            )
        else:
            logger.info(
                f"Updating language: {self.name} with code: {self.code} (UUID: {self.id})"
            )
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Language"
        verbose_name_plural = "Languages"
        ordering = ["name"]


class Camp(models.Model):
    """
    Model representing refugee camps where users reside.
    Used to associate users with their camp location in UserProfile.
    """

    id = models.UUIDField(
        primary_key=True, default=uuid.uuid4, editable=False, unique=True, null=False
    )
    name = models.CharField(max_length=255, unique=True, null=False, blank=False)
    location = models.CharField(max_length=255, null=False, blank=False)

    def __str__(self) -> str:
        """
        String representation of the Camp model.

        Returns:
            str: Camp name and location (e.g., 'Mahama (Rwanda, Eastern Province)').
        """
        return f"{self.name} ({self.location})"

    def save(self, *args, **kwargs) -> None:
        """
        Overrides the default save method to log camp creation or updates.

        Args:
            *args: Variable length argument list.
            **kwargs: Arbitrary keyword arguments.
        """
        if not self.pk:
            logger.info(
                f"Creating camp: {self.name} at location: {self.location} (UUID: {self.id})"
            )
        else:
            logger.info(
                f"Updating camp: {self.name} at location: {self.location} (UUID: {self.id})"
            )
        super().save(*args, **kwargs)

    class Meta:
        verbose_name = "Camp"
        verbose_name_plural = "Camps"
        ordering = ["name"]
