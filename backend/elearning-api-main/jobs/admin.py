from django.contrib import admin
from .models import JobOpportunity, JobApplication


@admin.register(JobOpportunity)
class JobOpportunityAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing JobOpportunity model in Django Admin interface.
    """

    list_display = [
        "id",
        "title",
        "location",
        "job_type",
        "is_active",
        "remote_work",
        "posted_by",
        "application_deadline",
    ]

    list_display_links = ["id", "title", "location"]
    list_filter = ["location", "job_type", "is_active", "remote_work"]
    search_fields = ["title", "location", "job_type"]
    readonly_fields = ["id", "created_at", "updated_at"]
    ordering = ["-created_at"]


@admin.register(JobApplication)
class JobApplicationAdmin(admin.ModelAdmin):
    """
    Custom admin panel for managing JobOpportunity model in Django Admin interface.
    """

    list_display = [
        "id",
        "user",
        "job",
        "application_status",
        "applied_at",
        "updated_at",
    ]

    list_display_links = ["id", "user", "job"]
    list_filter = ["application_status"]
    search_fields = ["job", "user", "application_status"]
    readonly_fields = ["id", "applied_at", "updated_at"]
    ordering = ["-applied_at"]
