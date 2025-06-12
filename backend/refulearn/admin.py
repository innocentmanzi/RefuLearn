from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from django.contrib.auth.models import User
from .models import UserProfile, Course, Lesson, UserProgress

# Register UserProfile inline with User
class UserProfileInline(admin.StackedInline):
    model = UserProfile
    can_delete = False
    verbose_name_plural = 'Profile'

# Extend UserAdmin
class CustomUserAdmin(UserAdmin):
    inlines = (UserProfileInline,)

# Re-register UserAdmin
admin.site.unregister(User)
admin.site.register(User, CustomUserAdmin)

@admin.register(Course)
class CourseAdmin(admin.ModelAdmin):
    list_display = ('title', 'instructor', 'language', 'level', 'created_at')
    search_fields = ('title', 'description', 'instructor__username')
    list_filter = ('language', 'level')
    date_hierarchy = 'created_at'

@admin.register(Lesson)
class LessonAdmin(admin.ModelAdmin):
    list_display = ('title', 'course', 'order', 'duration_minutes')
    search_fields = ('title', 'content', 'course__title')
    list_filter = ('course',)
    ordering = ('course', 'order')
    raw_id_fields = ('course',)

@admin.register(UserProgress)
class UserProgressAdmin(admin.ModelAdmin):
    list_display = ('user', 'lesson', 'completed', 'last_accessed')
    search_fields = ('user__username', 'lesson__title')
    list_filter = ('completed',)
    raw_id_fields = ('user', 'lesson')
