from rest_framework import serializers
from django.contrib.auth.models import User
from .models import UserProfile, Course, Lesson, UserProgress
from django.contrib.auth.hashers import make_password
import uuid

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'first_name', 'last_name')
        read_only_fields = ('id',)

class UserProfileSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)

    class Meta:
        model = UserProfile
        fields = ('id', 'user', 'bio', 'language_preference', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class LessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = Lesson
        fields = ('id', 'course', 'title', 'content', 'order', 'duration_minutes', 'created_at', 'updated_at')
        read_only_fields = ('id', 'created_at', 'updated_at')

class CourseSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    instructor_id = serializers.CharField()
    language = serializers.CharField()
    category = serializers.CharField()
    duration = serializers.CharField()
    difficult_level = serializers.CharField()
    is_active = serializers.BooleanField(default=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class UserProgressSerializer(serializers.ModelSerializer):
    user = UserSerializer(read_only=True)
    lesson = LessonSerializer(read_only=True)

    class Meta:
        model = UserProgress
        fields = ('id', 'user', 'lesson', 'completed', 'last_accessed', 'created_at')
        read_only_fields = ('id', 'last_accessed', 'created_at')

USER_ROLES = [
    ('refugee', 'Refugee (Student)'),
    ('instructor', 'Instructor'),
    ('mentor', 'Mentor'),
    ('admin', 'Admin'),
    ('ngo_partner', 'NGO Partner'),
    ('employer', 'Employer'),
]

class UserRegistrationSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    first_name = serializers.CharField(max_length=50)
    last_name = serializers.CharField(max_length=50)
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    confirm_password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=USER_ROLES, required=False)
    is_verified = serializers.BooleanField(default=False)
    is_active = serializers.BooleanField(default=True)
    is_staff = serializers.BooleanField(default=False)
    is_superuser = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

    def validate(self, data):
        if data['password'] != data['confirm_password']:
            raise serializers.ValidationError({'confirm_password': 'Passwords do not match.'})
        # Hash the password after confirming they match
        data['password'] = make_password(data['password'])
        return data

class UserLoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)
    role = serializers.ChoiceField(choices=USER_ROLES)

class LanguageSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    code = serializers.CharField(max_length=10)
    name = serializers.CharField(max_length=50)

class CategorySerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    name = serializers.CharField(max_length=100)

class CampSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    name = serializers.CharField(max_length=100)
    location = serializers.CharField(max_length=100)

class JobSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    location = serializers.CharField(max_length=100)
    job_type = serializers.CharField(max_length=50)
    required_skills = serializers.ListField(child=serializers.CharField(), default=list)
    salary_range = serializers.CharField(allow_blank=True, required=False)
    application_deadline = serializers.CharField()
    is_active = serializers.BooleanField(default=True)
    remote_work = serializers.BooleanField(default=False)
    posted_by = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class JobApplicationSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    job_id = serializers.CharField()
    applicant_id = serializers.CharField()
    cover_letter = serializers.CharField()
    resume_url = serializers.URLField(required=False)
    status = serializers.ChoiceField(
        choices=['pending', 'reviewed', 'shortlisted', 'rejected', 'accepted'],
        default='pending'
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    reviewed_at = serializers.DateTimeField(required=False)
    reviewed_by = serializers.CharField(required=False)
    feedback = serializers.CharField(required=False, allow_blank=True)

class QuestionSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    text = serializers.CharField()
    question_type = serializers.ChoiceField(
        choices=['multiple_choice', 'true_false', 'short_answer', 'essay'],
        default='multiple_choice'
    )
    options = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    correct_answer = serializers.CharField()
    points = serializers.IntegerField(default=1)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class AssessmentSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    title = serializers.CharField(max_length=200)
    description = serializers.CharField()
    course_id = serializers.CharField()
    module_id = serializers.CharField(required=False)
    duration_minutes = serializers.IntegerField()
    passing_score = serializers.IntegerField()
    total_points = serializers.IntegerField()
    is_active = serializers.BooleanField(default=True)
    created_by = serializers.CharField()
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    questions = QuestionSerializer(many=True, required=False)

class UserAssessmentSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    assessment_id = serializers.CharField()
    user_id = serializers.CharField()
    score = serializers.IntegerField()
    answers = serializers.ListField(
        child=serializers.DictField(),
        required=False
    )
    started_at = serializers.DateTimeField()
    completed_at = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(
        choices=['in_progress', 'completed', 'abandoned'],
        default='in_progress'
    )
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class CertificateSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    user_id = serializers.CharField()
    course_id = serializers.CharField()
    assessment_id = serializers.CharField()
    certificate_number = serializers.CharField()
    issue_date = serializers.DateTimeField()
    expiry_date = serializers.DateTimeField(required=False)
    status = serializers.ChoiceField(
        choices=['active', 'expired', 'revoked'],
        default='active'
    )
    score = serializers.IntegerField()
    issued_by = serializers.CharField()
    verification_url = serializers.URLField(required=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class DiscussionReplySerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    discussion_id = serializers.CharField()
    user_id = serializers.CharField()
    content = serializers.CharField()
    parent_reply_id = serializers.CharField(required=False)  # For nested replies
    likes = serializers.IntegerField(default=0)
    is_solution = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class DiscussionSerializer(serializers.Serializer):
    id = serializers.UUIDField(default=uuid.uuid4, read_only=True)
    title = serializers.CharField(max_length=200)
    content = serializers.CharField()
    course_id = serializers.CharField()
    module_id = serializers.CharField(required=False)
    created_by = serializers.CharField()
    tags = serializers.ListField(
        child=serializers.CharField(),
        required=False
    )
    status = serializers.ChoiceField(
        choices=['open', 'closed', 'archived'],
        default='open'
    )
    views = serializers.IntegerField(default=0)
    likes = serializers.IntegerField(default=0)
    is_question = serializers.BooleanField(default=False)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)
    replies = DiscussionReplySerializer(many=True, required=False)

class PeerLearningSessionSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    title = serializers.CharField(max_length=255)
    description = serializers.CharField()
    course_id = serializers.CharField()
    module_id = serializers.CharField(required=False, allow_blank=True, allow_null=True)
    created_by = serializers.CharField()
    scheduled_at = serializers.DateTimeField()
    duration_minutes = serializers.IntegerField()
    status = serializers.ChoiceField(choices=["scheduled", "ongoing", "completed", "cancelled"], default="scheduled")
    participants = serializers.ListField(child=serializers.CharField(), required=False)
    max_participants = serializers.IntegerField(required=False, allow_null=True)
    created_at = serializers.DateTimeField(read_only=True)
    updated_at = serializers.DateTimeField(read_only=True)

class PeerLearningParticipantSerializer(serializers.Serializer):
    id = serializers.CharField(read_only=True)
    session_id = serializers.CharField()
    user_id = serializers.CharField()
    joined_at = serializers.DateTimeField(read_only=True)
    role = serializers.ChoiceField(choices=["refugee", "mentor", "instructor"], default="refugee")
    status = serializers.ChoiceField(choices=["active", "left", "removed"], default="active") 