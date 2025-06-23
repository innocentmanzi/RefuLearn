from django.contrib import admin
from .models import Language, Camp
from utils import logging_config

logger = logging_config.setup_logging()


@admin.register(Language)
class LanguageAdmin(admin.ModelAdmin):
    list_display = ["id", "code", "name"]
    list_display_links = ["id", "code"]
    search_fields = ["code", "name"]
    ordering = ["name"]


@admin.register(Camp)
class CampAdmin(admin.ModelAdmin):
    list_display = ["id", "name", "location"]
    list_display_links = ["id", "name"]
    search_fields = ["name", "location"]
    ordering = ["name"]
