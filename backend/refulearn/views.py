from django.shortcuts import render
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.reverse import reverse
from rest_framework import viewsets, permissions, status
from django.contrib.auth.models import User
from .models import UserProfile, Course, Lesson, UserProgress
from .serializers import (
    UserSerializer, UserProfileSerializer, CourseSerializer,
    LessonSerializer, UserProgressSerializer, UserRegistrationSerializer,
    UserLoginSerializer, PeerLearningSessionSerializer, PeerLearningParticipantSerializer
)
from .couchdb_utils import get_user_db, get_peer_learning_session_db, get_peer_learning_participant_db
from datetime import datetime
import uuid
from rest_framework.views import APIView
from drf_spectacular.utils import extend_schema
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.hashers import check_password
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.utils.decorators import classonlymethod
from rest_framework.permissions import BasePermission
from .permissions import IsRefugee, IsInstructor, IsMentor, IsEmployer, IsAdmin, IsNGOPartner
# from couchdb import DocumentNotFound

# Create your views here.

@api_view(['GET'])
def api_root(request, format=None):
    return Response({
        'users': reverse('user-list', request=request, format=format),
        'courses': reverse('course-list', request=request, format=format),
        'lessons': reverse('lesson-list', request=request, format=format),
        'progress': reverse('progress-list', request=request, format=format),
    })

class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProfileViewSet(viewsets.ModelViewSet):
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProfile.objects.filter(user=self.request.user)

class CourseViewSet(viewsets.ModelViewSet):
    queryset = Course.objects.all()
    serializer_class = CourseSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        serializer.save(instructor=self.request.user)

class LessonViewSet(viewsets.ModelViewSet):
    queryset = Lesson.objects.all()
    serializer_class = LessonSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserProgressViewSet(viewsets.ModelViewSet):
    queryset = UserProgress.objects.all()
    serializer_class = UserProgressSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return UserProgress.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class RoleRegistrationView(APIView):
    role = None
    permission_classes = [AllowAny] # Allow unauthenticated access for registration

    @classonlymethod
    def as_view(cls, **initkwargs):
        role_from_initkwargs = initkwargs.pop('role', None)
        print(f"DEBUG: In as_view, role_from_initkwargs: {role_from_initkwargs}")
        view = super().as_view(**initkwargs)
        view.role = role_from_initkwargs
        print(f"DEBUG: In as_view, view.role after setting: {view.role}")
        return view

    @extend_schema(request=UserRegistrationSerializer)
    def post(self, request):
        print(f"DEBUG: In post, self.role: {self.role}") # Existing debug print
        data = request.data.copy()
        data.pop('role', None) # Explicitly remove 'role' from incoming data
        data['role'] = self.role
        print(f"Data being passed to serializer: {data}") # Existing debug print
        serializer = UserRegistrationSerializer(data=data)
        if serializer.is_valid():
            user_db = get_user_db()
            user_data = serializer.validated_data.copy()
            user_data['created_at'] = datetime.utcnow().isoformat()
            user_data['updated_at'] = datetime.utcnow().isoformat()
            user_data['id'] = str(user_data.get('id') or uuid.uuid4())
            user_data.pop('confirm_password', None)
            for row in user_db:
                doc = user_db[row]
                if doc.get('email') == user_data['email']:
                    return Response({'detail': 'Email already exists.'}, status=status.HTTP_400_BAD_REQUEST)
            user_db.save(user_data)
            return Response({'detail': f'{self.role.capitalize()} registered successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RoleLoginView(APIView):
    role = None

    @classonlymethod
    def as_view(cls, **initkwargs):
        role = initkwargs.pop('role', None)
        view = super().as_view(**initkwargs)
        view.role = role
        return view

    @extend_schema(request=UserLoginSerializer)
    def post(self, request):
        data = request.data.copy()
        data['role'] = self.role
        serializer = UserLoginSerializer(data=data)
        if serializer.is_valid():
            user_db = get_user_db()
            email = serializer.validated_data['email']
            password = serializer.validated_data['password']
            role = serializer.validated_data['role']
            user_doc = None
            for row in user_db:
                doc = user_db[row]
                if doc.get('email') == email and doc.get('role') == role:
                    user_doc = doc
                    break
            if not user_doc:
                return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
            if not check_password(password, user_doc['password']):
                return Response({'detail': 'Invalid credentials.'}, status=status.HTTP_401_UNAUTHORIZED)
            refresh = RefreshToken.for_user(None)
            refresh['user_id'] = user_doc['id']
            refresh['email'] = user_doc['email']
            refresh['role'] = user_doc['role']
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': {
                    'id': user_doc['id'],
                    'first_name': user_doc['first_name'],
                    'last_name': user_doc['last_name'],
                    'email': user_doc['email'],
                    'role': user_doc['role'],
                }
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserListByRoleView(APIView):
    """List users by role (refugee, instructor, employer, mentor, etc.)"""
    def get(self, request, role):
        user_db = get_user_db()
        users = [doc for doc in user_db if user_db[doc].get('role') == role]
        user_list = [user_db[doc] for doc in users]
        return Response(user_list, status=status.HTTP_200_OK)

class UserListView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow admin/staff
        if not (request.user and (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False))):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user_db = get_user_db()
        users = [user_db[doc] for doc in user_db]
        return Response(users, status=status.HTTP_200_OK)

class UserDetailView(APIView):
    permission_classes = [IsAuthenticated]

    def get_object(self, user_id):
        user_db = get_user_db()
        for doc_id in user_db:
            doc = user_db[doc_id]
            if doc.get('id') == user_id:
                return doc_id, doc
        return None, None

    def get(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only allow self or admin
        if not (request.user and (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or user.get('id') == str(request.user.id))):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        return Response(user, status=status.HTTP_200_OK)

    def put(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only allow self or admin
        if not (request.user and (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False) or user.get('id') == str(request.user.id))):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        data = request.data.copy()
        for field in ['first_name', 'last_name', 'email', 'role', 'is_active', 'is_verified', 'is_staff', 'is_superuser']:
            if field in data:
                user[field] = data[field]
        user['updated_at'] = datetime.utcnow().isoformat()
        user_db = get_user_db()
        user_db[doc_id] = user
        return Response({'detail': 'User updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        # Only allow admin
        if not (request.user and (getattr(request.user, 'is_superuser', False) or getattr(request.user, 'is_staff', False))):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        user_db = get_user_db()
        user_db.delete(doc_id)
        return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class RoleUserListView(APIView):
    role = None
    permission_classes = [IsAuthenticated]

    @classonlymethod
    def as_view(cls, **initkwargs):
        role = initkwargs.pop('role', None)
        view = super().as_view(**initkwargs)
        view.role = role
        return view

    def get(self, request):
        user_db = get_user_db()
        users = [user_db[doc] for doc in user_db if user_db[doc].get('role') == self.role]
        return Response(users, status=status.HTTP_200_OK)

class RoleUserDetailView(APIView):
    role = None
    permission_classes = [IsAuthenticated]

    @classonlymethod
    def as_view(cls, **initkwargs):
        role = initkwargs.pop('role', None)
        view = super().as_view(**initkwargs)
        view.role = role
        return view

    def get_object(self, user_id):
        user_db = get_user_db()
        for doc_id in user_db:
            doc = user_db[doc_id]
            if doc.get('id') == user_id and doc.get('role') == self.role:
                return doc_id, doc
        return None, None

    def get(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(user, status=status.HTTP_200_OK)

    def put(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        for field in ['first_name', 'last_name', 'email', 'is_active', 'is_verified', 'is_staff', 'is_superuser']:
            if field in data:
                user[field] = data[field]
        user['updated_at'] = datetime.utcnow().isoformat()
        user_db = get_user_db()
        user_db[doc_id] = user
        return Response({'detail': 'User updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, user_id):
        doc_id, user = self.get_object(user_id)
        if not user:
            return Response({'detail': 'User not found.'}, status=status.HTTP_404_NOT_FOUND)
        user_db = get_user_db()
        user_db.delete(doc_id)
        return Response({'detail': 'User deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class IsInstructor(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'instructor'

class IsRefugee(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'refugee'

class IsAdmin(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'admin'

class IsNGOPartner(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'ngo_partner'

class InstructorCourseListView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        course_db = get_course_db()
        courses = [course_db[doc] for doc in course_db if course_db[doc].get('instructor_id') == str(request.user.id)]
        return Response(courses, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            course_db = get_course_db()
            course_data = serializer.validated_data.copy()
            course_data['created_at'] = datetime.utcnow().isoformat()
            course_data['updated_at'] = datetime.utcnow().isoformat()
            course_data['id'] = str(course_data.get('id') or uuid.uuid4())
            course_data['instructor_id'] = str(request.user.id)
            course_db.save(course_data)
            return Response({'detail': 'Course created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorCourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get_object(self, course_id, user_id):
        course_db = get_course_db()
        for doc_id in course_db:
            doc = course_db[doc_id]
            if doc.get('id') == course_id and doc.get('instructor_id') == user_id:
                return doc_id, doc
        return None, None

    def get(self, request, course_id):
        doc_id, course = self.get_object(course_id, str(request.user.id))
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(course, status=status.HTTP_200_OK)

    def put(self, request, course_id):
        doc_id, course = self.get_object(course_id, str(request.user.id))
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        for field in ['title', 'description', 'language', 'category', 'duration', 'difficult_level', 'is_active']:
            if field in data:
                course[field] = data[field]
        course['updated_at'] = datetime.utcnow().isoformat()
        course_db = get_course_db()
        course_db[doc_id] = course
        return Response({'detail': 'Course updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, course_id):
        doc_id, course = self.get_object(course_id, str(request.user.id))
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        course_db = get_course_db()
        course_db.delete(doc_id)
        return Response({'detail': 'Course deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class RefugeeCourseListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        course_db = get_course_db()
        courses = [course_db[doc] for doc in course_db if course_db[doc].get('is_active', True)]
        return Response(courses, status=status.HTTP_200_OK)

class RefugeeCourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request, course_id):
        course_db = get_course_db()
        for doc_id in course_db:
            doc = course_db[doc_id]
            if doc.get('id') == course_id:
                return Response(doc, status=status.HTTP_200_OK)
        return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)

class AdminCourseListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        course_db = get_course_db()
        courses = [course_db[doc] for doc in course_db]
        return Response(courses, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = CourseSerializer(data=request.data)
        if serializer.is_valid():
            course_db = get_course_db()
            course_data = serializer.validated_data.copy()
            course_data['created_at'] = datetime.utcnow().isoformat()
            course_data['updated_at'] = datetime.utcnow().isoformat()
            course_data['id'] = str(course_data.get('id') or uuid.uuid4())
            course_db.save(course_data)
            return Response({'detail': 'Course created successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminCourseDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, course_id):
        course_db = get_course_db()
        for doc_id in course_db:
            doc = course_db[doc_id]
            if doc.get('id') == course_id:
                return doc_id, doc
        return None, None

    def get(self, request, course_id):
        doc_id, course = self.get_object(course_id)
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        return Response(course, status=status.HTTP_200_OK)

    def put(self, request, course_id):
        doc_id, course = self.get_object(course_id)
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        for field in ['title', 'description', 'language', 'category', 'duration', 'difficult_level', 'is_active']:
            if field in data:
                course[field] = data[field]
        course['updated_at'] = datetime.utcnow().isoformat()
        course_db = get_course_db()
        course_db[doc_id] = course
        return Response({'detail': 'Course updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, course_id):
        doc_id, course = self.get_object(course_id)
        if not course:
            return Response({'detail': 'Course not found.'}, status=status.HTTP_404_NOT_FOUND)
        course_db = get_course_db()
        course_db.delete(doc_id)
        return Response({'detail': 'Course deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class LanguageListView(APIView):
    def get(self, request):
        db = get_language_db()
        items = [db[doc] for doc in db]
        return Response(items, status=status.HTTP_200_OK)

    def post(self, request):
        if not (hasattr(request.user, 'role') and (request.user.role == 'admin' or request.user.role == 'ngo_partner')):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = LanguageSerializer(data=request.data)
        if serializer.is_valid():
            db = get_language_db()
            data = serializer.validated_data.copy()
            data['id'] = str(data.get('id') or uuid.uuid4())
            db.save(data)
            return Response({'detail': 'Language created.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryListView(APIView):
    def get(self, request):
        db = get_category_db()
        items = [db[doc] for doc in db]
        return Response(items, status=status.HTTP_200_OK)

    def post(self, request):
        if not (hasattr(request.user, 'role') and (request.user.role == 'admin' or request.user.role == 'ngo_partner')):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CategorySerializer(data=request.data)
        if serializer.is_valid():
            db = get_category_db()
            data = serializer.validated_data.copy()
            data['id'] = str(data.get('id') or uuid.uuid4())
            db.save(data)
            return Response({'detail': 'Category created.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CategoryDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsNGOPartner]

    def get_object(self, category_id):
        db = get_category_db()
        return db.get(category_id)

    def get(self, request, category_id):
        """Retrieve details of a specific category."""
        category = self.get_object(category_id)
        if not category:
            return Response({'detail': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CategorySerializer(category)
        return Response(serializer.data)

    def put(self, request, category_id):
        """Update a specific category."""
        category = self.get_object(category_id)
        if not category:
            return Response({'detail': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CategorySerializer(data=request.data, partial=True)
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                category[field] = value
            category['updated_at'] = datetime.utcnow().isoformat()
            db = get_category_db()
            db.save(category)
            return Response({'detail': 'Category updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, category_id):
        """Delete a specific category."""
        category = self.get_object(category_id)
        if not category:
            return Response({'detail': 'Category not found.'}, status=status.HTTP_404_NOT_FOUND)

        db = get_category_db()
        db.delete(category)
        return Response({'detail': 'Category deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class CampListView(APIView):
    def get(self, request):
        db = get_camp_db()
        items = [db[doc] for doc in db]
        return Response(items, status=status.HTTP_200_OK)

    def post(self, request):
        if not (hasattr(request.user, 'role') and (request.user.role == 'admin' or request.user.role == 'ngo_partner')):
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)
        serializer = CampSerializer(data=request.data)
        if serializer.is_valid():
            db = get_camp_db()
            data = serializer.validated_data.copy()
            data['id'] = str(data.get('id') or uuid.uuid4())
            db.save(data)
            return Response({'detail': 'Camp created.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CampDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsNGOPartner]

    def get_object(self, camp_id):
        db = get_camp_db()
        return db.get(camp_id)

    def get(self, request, camp_id):
        """Retrieve details of a specific camp."""
        camp = self.get_object(camp_id)
        if not camp:
            return Response({'detail': 'Camp not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = CampSerializer(camp)
        return Response(serializer.data)

    def put(self, request, camp_id):
        """Update a specific camp."""
        camp = self.get_object(camp_id)
        if not camp:
            return Response({'detail': 'Camp not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CampSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                camp[field] = value
            camp['updated_at'] = datetime.utcnow().isoformat()
            db = get_camp_db()
            db.save(camp)
            return Response({'detail': 'Camp updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, camp_id):
        """Delete a specific camp."""
        camp = self.get_object(camp_id)
        if not camp:
            return Response({'detail': 'Camp not found.'}, status=status.HTTP_404_NOT_FOUND)

        db = get_camp_db()
        db.delete(camp)
        return Response({'detail': 'Camp deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class EmployerJobListView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request):
        job_db = get_job_db()
        jobs = [job_db[doc] for doc in job_db if job_db[doc].get('posted_by') == str(request.user.id)]
        return Response(jobs, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = JobSerializer(data=request.data)
        if serializer.is_valid():
            job_db = get_job_db()
            job_data = serializer.validated_data.copy()
            job_data['created_at'] = datetime.utcnow().isoformat()
            job_data['updated_at'] = datetime.utcnow().isoformat()
            job_data['id'] = str(job_data.get('id') or uuid.uuid4())
            job_data['posted_by'] = str(request.user.id)
            job_db.save(job_data)
            return Response({'detail': 'Job posted successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployerJobDetailView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_object(self, job_id, user_id):
        job_db = get_job_db()
        for doc_id in job_db:
            doc = job_db[doc_id]
            if doc.get('id') == job_id and doc.get('posted_by') == user_id:
                return doc_id, doc
        return None, None

    def put(self, request, job_id):
        doc_id, job = self.get_object(job_id, str(request.user.id))
        if not job:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        for field in ['title', 'description', 'location', 'job_type', 'required_skills', 'salary_range', 'application_deadline', 'is_active', 'remote_work']:
            if field in data:
                job[field] = data[field]
        job['updated_at'] = datetime.utcnow().isoformat()
        job_db = get_job_db()
        job_db[doc_id] = job
        return Response({'detail': 'Job updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        doc_id, job = self.get_object(job_id, str(request.user.id))
        if not job:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        job_db = get_job_db()
        job_db.delete(doc_id)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class NGOPartnerJobListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List jobs sponsored/posted by this NGO partner."""
        db = get_job_db()
        ngo_id = request.user.id
        jobs = [row.doc for row in db.view('_all_docs', include_docs=True) if row.doc.get('sponsored_by') == ngo_id]
        serializer = JobSerializer(jobs, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Sponsor/post a new job."""
        db = get_job_db()
        data = request.data.copy()
        data['sponsored_by'] = request.user.id
        serializer = JobSerializer(data=data)
        if serializer.is_valid():
            doc_id, doc_rev = db.save(serializer.validated_data)
            job = serializer.validated_data
            job['id'] = doc_id
            return Response(job, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class NGOPartnerCourseListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List courses sponsored/posted by this NGO partner."""
        db = get_course_db()
        ngo_id = request.user.id
        courses = [row.doc for row in db.view('_all_docs', include_docs=True) if row.doc.get('sponsored_by') == ngo_id]
        serializer = CourseSerializer(courses, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Sponsor/post a new course."""
        db = get_course_db()
        data = request.data.copy()
        data['sponsored_by'] = request.user.id
        serializer = CourseSerializer(data=data)
        if serializer.is_valid():
            doc_id, doc_rev = db.save(serializer.validated_data)
            course = serializer.validated_data
            course['id'] = doc_id
            return Response(course, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RefugeeJobListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        job_db = get_job_db()
        jobs = [job_db[doc] for doc in job_db if job_db[doc].get('is_active', True)]
        return Response(jobs, status=status.HTTP_200_OK)

class RefugeeJobApplyView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def post(self, request, job_id):
        # This is a stub; you would implement application logic here
        return Response({'detail': f'Applied to job {job_id}.'}, status=status.HTTP_200_OK)

class AdminJobListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        job_db = get_job_db()
        jobs = [job_db[doc] for doc in job_db]
        return Response(jobs, status=status.HTTP_200_OK)

class AdminJobDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, job_id):
        job_db = get_job_db()
        for doc_id in job_db:
            doc = job_db[doc_id]
            if doc.get('id') == job_id:
                return doc_id, doc
        return None, None

    def put(self, request, job_id):
        doc_id, job = self.get_object(job_id)
        if not job:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        data = request.data.copy()
        for field in ['title', 'description', 'location', 'job_type', 'required_skills', 'salary_range', 'application_deadline', 'is_active', 'remote_work']:
            if field in data:
                job[field] = data[field]
        job['updated_at'] = datetime.utcnow().isoformat()
        job_db = get_job_db()
        job_db[doc_id] = job
        return Response({'detail': 'Job updated successfully.'}, status=status.HTTP_200_OK)

    def delete(self, request, job_id):
        doc_id, job = self.get_object(job_id)
        if not job:
            return Response({'detail': 'Job not found.'}, status=status.HTTP_404_NOT_FOUND)
        job_db = get_job_db()
        job_db.delete(doc_id)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class IsEmployer(BasePermission):
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'employer'

class RefugeeJobApplicationListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        application_db = get_job_application_db()
        applications = [application_db[doc] for doc in application_db 
                       if application_db[doc].get('applicant_id') == str(request.user.id)]
        return Response(applications, status=status.HTTP_200_OK)

    def post(self, request, job_id):
        # Check if job exists and is active
        job_db = get_job_db()
        job = None
        for doc_id in job_db:
            doc = job_db[doc_id]
            if doc.get('id') == job_id and doc.get('is_active', True):
                job = doc
                break
        
        if not job:
            return Response({'detail': 'Job not found or not active.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Check if already applied
        application_db = get_job_application_db()
        for doc_id in application_db:
            doc = application_db[doc_id]
            if (doc.get('job_id') == job_id and 
                doc.get('applicant_id') == str(request.user.id)):
                return Response({'detail': 'You have already applied for this job.'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        serializer = JobApplicationSerializer(data=request.data)
        if serializer.is_valid():
            application_data = serializer.validated_data.copy()
            application_data['job_id'] = job_id
            application_data['applicant_id'] = str(request.user.id)
            application_data['created_at'] = datetime.utcnow().isoformat()
            application_data['updated_at'] = datetime.utcnow().isoformat()
            application_data['id'] = str(application_data.get('id') or uuid.uuid4())
            application_db.save(application_data)
            return Response({'detail': 'Application submitted successfully.'}, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class EmployerJobApplicationListView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get(self, request, job_id):
        # Verify job belongs to employer
        job_db = get_job_db()
        job = None
        for doc_id in job_db:
            doc = job_db[doc_id]
            if doc.get('id') == job_id and doc.get('posted_by') == str(request.user.id):
                job = doc
                break
        
        if not job:
            return Response({'detail': 'Job not found or unauthorized.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        application_db = get_job_application_db()
        applications = [application_db[doc] for doc in application_db 
                       if application_db[doc].get('job_id') == job_id]
        return Response(applications, status=status.HTTP_200_OK)

class EmployerJobApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsEmployer]

    def get_object(self, application_id, job_id):
        application_db = get_job_application_db()
        for doc_id in application_db:
            doc = application_db[doc_id]
            if doc.get('id') == application_id and doc.get('job_id') == job_id:
                return doc_id, doc
        return None, None

    def put(self, request, job_id, application_id):
        # Verify job belongs to employer
        job_db = get_job_db()
        job = None
        for doc_id in job_db:
            doc = job_db[doc_id]
            if doc.get('id') == job_id and doc.get('posted_by') == str(request.user.id):
                job = doc
                break
        
        if not job:
            return Response({'detail': 'Job not found or unauthorized.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        doc_id, application = self.get_object(application_id, job_id)
        if not application:
            return Response({'detail': 'Application not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Only allow updating status, feedback, and reviewed fields
        allowed_fields = ['status', 'feedback']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if data:
            for field, value in data.items():
                application[field] = value
            application['reviewed_at'] = datetime.utcnow().isoformat()
            application['reviewed_by'] = str(request.user.id)
            application['updated_at'] = datetime.utcnow().isoformat()
            
            application_db = get_job_application_db()
            application_db[doc_id] = application
            
            return Response({'detail': 'Application updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response({'detail': 'No valid fields to update.'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class AdminJobApplicationListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        application_db = get_job_application_db()
        applications = [application_db[doc] for doc in application_db]
        return Response(applications, status=status.HTTP_200_OK)

class AdminJobApplicationDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, application_id):
        application_db = get_job_application_db()
        for doc_id in application_db:
            doc = application_db[doc_id]
            if doc.get('id') == application_id:
                return doc_id, doc
        return None, None

    def put(self, request, application_id):
        doc_id, application = self.get_object(application_id)
        if not application:
            return Response({'detail': 'Application not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Admin can update all fields
        data = request.data.copy()
        if data:
            for field, value in data.items():
                application[field] = value
            application['reviewed_at'] = datetime.utcnow().isoformat()
            application['reviewed_by'] = str(request.user.id)
            application['updated_at'] = datetime.utcnow().isoformat()
            
            application_db = get_job_application_db()
            application_db[doc_id] = application
            
            return Response({'detail': 'Application updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response({'detail': 'No fields to update.'}, 
                       status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, application_id):
        doc_id, application = self.get_object(application_id)
        if not application:
            return Response({'detail': 'Application not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        application_db = get_job_application_db()
        application_db.delete(doc_id)
        return Response({'detail': 'Application deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)

class InstructorAssessmentListView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        assessment_db = get_assessment_db()
        assessments = [assessment_db[doc] for doc in assessment_db 
                      if assessment_db[doc].get('created_by') == str(request.user.id)]
        return Response(assessments, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = AssessmentSerializer(data=request.data)
        if serializer.is_valid():
            assessment_data = serializer.validated_data.copy()
            assessment_data['created_by'] = str(request.user.id)
            assessment_data['created_at'] = datetime.utcnow().isoformat()
            assessment_data['updated_at'] = datetime.utcnow().isoformat()
            assessment_data['id'] = str(assessment_data.get('id') or uuid.uuid4())
            
            # Calculate total points from questions
            if 'questions' in assessment_data:
                total_points = sum(q.get('points', 1) for q in assessment_data['questions'])
                assessment_data['total_points'] = total_points
            
            assessment_db = get_assessment_db()
            assessment_db.save(assessment_data)
            return Response({'detail': 'Assessment created successfully.'}, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorAssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get_object(self, assessment_id, user_id):
        assessment_db = get_assessment_db()
        for doc_id in assessment_db:
            doc = assessment_db[doc_id]
            if doc.get('id') == assessment_id and doc.get('created_by') == user_id:
                return doc_id, doc
        return None, None

    def get(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id, str(request.user.id))
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        return Response(assessment, status=status.HTTP_200_OK)

    def put(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id, str(request.user.id))
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        serializer = AssessmentSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                assessment[field] = value
            
            # Recalculate total points if questions are updated
            if 'questions' in data:
                total_points = sum(q.get('points', 1) for q in data['questions'])
                assessment['total_points'] = total_points
            
            assessment['updated_at'] = datetime.utcnow().isoformat()
            assessment_db = get_assessment_db()
            assessment_db[doc_id] = assessment
            return Response({'detail': 'Assessment updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id, str(request.user.id))
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        assessment_db = get_assessment_db()
        assessment_db.delete(doc_id)
        return Response({'detail': 'Assessment deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)

class RefugeeAssessmentListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        # Get assessments for courses the refugee is enrolled in
        assessment_db = get_assessment_db()
        user_assessment_db = get_user_assessment_db()
        
        # Get user's course enrollments
        enrollment_db = get_enrollment_db()
        enrolled_courses = [enrollment_db[doc].get('course_id') for doc in enrollment_db 
                          if enrollment_db[doc].get('user_id') == str(request.user.id)]
        
        # Get available assessments
        available_assessments = []
        for doc in assessment_db:
            assessment = assessment_db[doc]
            if (assessment.get('course_id') in enrolled_courses and 
                assessment.get('is_active', True)):
                # Check if user has already taken this assessment
                taken = False
                for user_doc in user_assessment_db:
                    user_assessment = user_assessment_db[user_doc]
                    if (user_assessment.get('assessment_id') == assessment.get('id') and 
                        user_assessment.get('user_id') == str(request.user.id)):
                        taken = True
                        break
                if not taken:
                    available_assessments.append(assessment)
        
        return Response(available_assessments, status=status.HTTP_200_OK)

class RefugeeUserAssessmentView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        user_assessment_db = get_user_assessment_db()
        user_assessments = [user_assessment_db[doc] for doc in user_assessment_db 
                          if user_assessment_db[doc].get('user_id') == str(request.user.id)]
        return Response(user_assessments, status=status.HTTP_200_OK)

    def post(self, request, assessment_id):
        # Verify assessment exists and is active
        assessment_db = get_assessment_db()
        assessment = None
        for doc in assessment_db:
            if assessment_db[doc].get('id') == assessment_id and assessment_db[doc].get('is_active', True):
                assessment = assessment_db[doc]
                break
        
        if not assessment:
            return Response({'detail': 'Assessment not found or not active.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Check if user has already started/completed this assessment
        user_assessment_db = get_user_assessment_db()
        for doc in user_assessment_db:
            user_assessment = user_assessment_db[doc]
            if (user_assessment.get('assessment_id') == assessment_id and 
                user_assessment.get('user_id') == str(request.user.id)):
                return Response({'detail': 'You have already started this assessment.'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        serializer = UserAssessmentSerializer(data=request.data)
        if serializer.is_valid():
            user_assessment_data = serializer.validated_data.copy()
            user_assessment_data['assessment_id'] = assessment_id
            user_assessment_data['user_id'] = str(request.user.id)
            user_assessment_data['created_at'] = datetime.utcnow().isoformat()
            user_assessment_data['updated_at'] = datetime.utcnow().isoformat()
            user_assessment_data['id'] = str(user_assessment_data.get('id') or uuid.uuid4())
            user_assessment_db.save(user_assessment_data)
            return Response({'detail': 'Assessment started successfully.'}, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, assessment_id):
        # Find the user's assessment
        user_assessment_db = get_user_assessment_db()
        user_assessment = None
        doc_id = None
        for doc in user_assessment_db:
            if (user_assessment_db[doc].get('assessment_id') == assessment_id and 
                user_assessment_db[doc].get('user_id') == str(request.user.id)):
                user_assessment = user_assessment_db[doc]
                doc_id = doc
                break

        if not user_assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Update assessment with answers and calculate score
        data = request.data.copy()
        if 'answers' in data:
            user_assessment['answers'] = data['answers']
            # Calculate score based on answers
            assessment_db = get_assessment_db()
            assessment = None
            for doc in assessment_db:
                if assessment_db[doc].get('id') == assessment_id:
                    assessment = assessment_db[doc]
                    break
            
            if assessment:
                score = 0
                for answer in data['answers']:
                    question_id = answer.get('question_id')
                    for question in assessment.get('questions', []):
                        if question.get('id') == question_id:
                            if answer.get('answer') == question.get('correct_answer'):
                                score += question.get('points', 1)
                            break
                user_assessment['score'] = score
                user_assessment['completed_at'] = datetime.utcnow().isoformat()
                user_assessment['status'] = 'completed'

        user_assessment['updated_at'] = datetime.utcnow().isoformat()
        user_assessment_db[doc_id] = user_assessment
        return Response({'detail': 'Assessment updated successfully.'}, 
                       status=status.HTTP_200_OK)

class AdminAssessmentListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        assessment_db = get_assessment_db()
        assessments = [assessment_db[doc] for doc in assessment_db]
        return Response(assessments, status=status.HTTP_200_OK)

class AdminAssessmentDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, assessment_id):
        assessment_db = get_assessment_db()
        for doc_id in assessment_db:
            doc = assessment_db[doc_id]
            if doc.get('id') == assessment_id:
                return doc_id, doc
        return None, None

    def get(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id)
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        return Response(assessment, status=status.HTTP_200_OK)

    def put(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id)
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        serializer = AssessmentSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                assessment[field] = value
            
            # Recalculate total points if questions are updated
            if 'questions' in data:
                total_points = sum(q.get('points', 1) for q in data['questions'])
                assessment['total_points'] = total_points
            
            assessment['updated_at'] = datetime.utcnow().isoformat()
            assessment_db = get_assessment_db()
            assessment_db[doc_id] = assessment
            return Response({'detail': 'Assessment updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, assessment_id):
        doc_id, assessment = self.get_object(assessment_id)
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        assessment_db = get_assessment_db()
        assessment_db.delete(doc_id)
        return Response({'detail': 'Assessment deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)

class RefugeeCertificateListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        certificate_db = get_certificate_db()
        certificates = [certificate_db[doc] for doc in certificate_db 
                       if certificate_db[doc].get('user_id') == str(request.user.id)]
        return Response(certificates, status=status.HTTP_200_OK)

class RefugeeCertificateDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request, certificate_id):
        certificate_db = get_certificate_db()
        certificate = None
        for doc in certificate_db:
            if (certificate_db[doc].get('id') == certificate_id and 
                certificate_db[doc].get('user_id') == str(request.user.id)):
                certificate = certificate_db[doc]
                break
        
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        return Response(certificate, status=status.HTTP_200_OK)

class InstructorCertificateListView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        certificate_db = get_certificate_db()
        certificates = [certificate_db[doc] for doc in certificate_db 
                       if certificate_db[doc].get('issued_by') == str(request.user.id)]
        return Response(certificates, status=status.HTTP_200_OK)

    def post(self, request):
        # Verify assessment exists and user has passed
        assessment_db = get_assessment_db()
        user_assessment_db = get_user_assessment_db()
        
        assessment_id = request.data.get('assessment_id')
        user_id = request.data.get('user_id')
        
        # Find the assessment
        assessment = None
        for doc in assessment_db:
            if assessment_db[doc].get('id') == assessment_id:
                assessment = assessment_db[doc]
                break
        
        if not assessment:
            return Response({'detail': 'Assessment not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Find user's assessment result
        user_assessment = None
        for doc in user_assessment_db:
            if (user_assessment_db[doc].get('assessment_id') == assessment_id and 
                user_assessment_db[doc].get('user_id') == user_id):
                user_assessment = user_assessment_db[doc]
                break

        if not user_assessment:
            return Response({'detail': 'User has not completed this assessment.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        if user_assessment.get('score', 0) < assessment.get('passing_score', 0):
            return Response({'detail': 'User has not passed the assessment.'}, 
                          status=status.HTTP_400_BAD_REQUEST)

        # Check if certificate already exists
        certificate_db = get_certificate_db()
        for doc in certificate_db:
            if (certificate_db[doc].get('assessment_id') == assessment_id and 
                certificate_db[doc].get('user_id') == user_id):
                return Response({'detail': 'Certificate already exists for this assessment.'}, 
                              status=status.HTTP_400_BAD_REQUEST)

        # Generate certificate
        serializer = CertificateSerializer(data=request.data)
        if serializer.is_valid():
            certificate_data = serializer.validated_data.copy()
            certificate_data['created_at'] = datetime.utcnow().isoformat()
            certificate_data['updated_at'] = datetime.utcnow().isoformat()
            certificate_data['id'] = str(certificate_data.get('id') or uuid.uuid4())
            certificate_data['issued_by'] = str(request.user.id)
            certificate_data['score'] = user_assessment.get('score', 0)
            
            # Generate certificate number
            certificate_data['certificate_number'] = f"CERT-{certificate_data['id'][:8].upper()}"
            
            # Generate verification URL
            certificate_data['verification_url'] = f"/verify/{certificate_data['certificate_number']}"
            
            certificate_db.save(certificate_data)
            return Response({'detail': 'Certificate issued successfully.'}, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class InstructorCertificateDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get_object(self, certificate_id, user_id):
        certificate_db = get_certificate_db()
        for doc_id in certificate_db:
            doc = certificate_db[doc_id]
            if doc.get('id') == certificate_id and doc.get('issued_by') == user_id:
                return doc_id, doc
        return None, None

    def get(self, request, certificate_id):
        doc_id, certificate = self.get_object(certificate_id, str(request.user.id))
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        return Response(certificate, status=status.HTTP_200_OK)

    def put(self, request, certificate_id):
        doc_id, certificate = self.get_object(certificate_id, str(request.user.id))
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Only allow updating status and expiry_date
        allowed_fields = ['status', 'expiry_date']
        data = {k: v for k, v in request.data.items() if k in allowed_fields}
        
        if data:
            for field, value in data.items():
                certificate[field] = value
            certificate['updated_at'] = datetime.utcnow().isoformat()
            
            certificate_db = get_certificate_db()
            certificate_db[doc_id] = certificate
            
            return Response({'detail': 'Certificate updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response({'detail': 'No valid fields to update.'}, 
                       status=status.HTTP_400_BAD_REQUEST)

class AdminCertificateListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        certificate_db = get_certificate_db()
        certificates = [certificate_db[doc] for doc in certificate_db]
        return Response(certificates, status=status.HTTP_200_OK)

class AdminCertificateDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, certificate_id):
        certificate_db = get_certificate_db()
        for doc_id in certificate_db:
            doc = certificate_db[doc_id]
            if doc.get('id') == certificate_id:
                return doc_id, doc
        return None, None

    def get(self, request, certificate_id):
        doc_id, certificate = self.get_object(certificate_id)
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        return Response(certificate, status=status.HTTP_200_OK)

    def put(self, request, certificate_id):
        doc_id, certificate = self.get_object(certificate_id)
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        serializer = CertificateSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                certificate[field] = value
            certificate['updated_at'] = datetime.utcnow().isoformat()
            
            certificate_db = get_certificate_db()
            certificate_db[doc_id] = certificate
            
            return Response({'detail': 'Certificate updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, certificate_id):
        doc_id, certificate = self.get_object(certificate_id)
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        certificate_db = get_certificate_db()
        certificate_db.delete(doc_id)
        return Response({'detail': 'Certificate deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)

class CertificateVerificationView(APIView):
    permission_classes = [AllowAny]

    def get(self, request, certificate_number):
        certificate_db = get_certificate_db()
        certificate = None
        for doc in certificate_db:
            if certificate_db[doc].get('certificate_number') == certificate_number:
                certificate = certificate_db[doc]
                break
        
        if not certificate:
            return Response({'detail': 'Certificate not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if certificate.get('status') != 'active':
            return Response({'detail': f'Certificate is {certificate.get("status")}.'}, 
                          status=status.HTTP_400_BAD_REQUEST)
        
        # Return only public information
        public_data = {
            'certificate_number': certificate.get('certificate_number'),
            'issue_date': certificate.get('issue_date'),
            'status': certificate.get('status'),
            'course_id': certificate.get('course_id'),
            'user_id': certificate.get('user_id')
        }
        return Response(public_data, status=status.HTTP_200_OK)

class RefugeeDiscussionListView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get(self, request):
        discussion_db = get_discussion_db()
        reply_db = get_discussion_reply_db()
        
        # Get discussions for courses the refugee is enrolled in
        enrollment_db = get_enrollment_db()
        enrolled_courses = [enrollment_db[doc].get('course_id') for doc in enrollment_db 
                          if enrollment_db[doc].get('user_id') == str(request.user.id)]
        
        discussions = []
        for doc in discussion_db:
            discussion = discussion_db[doc]
            if discussion.get('course_id') in enrolled_courses:
                # Get replies for this discussion
                discussion['replies'] = [reply_db[reply_doc] for reply_doc in reply_db 
                                      if reply_db[reply_doc].get('discussion_id') == discussion.get('id')]
                discussions.append(discussion)
        
        return Response(discussions, status=status.HTTP_200_OK)

    def post(self, request):
        serializer = DiscussionSerializer(data=request.data)
        if serializer.is_valid():
            discussion_data = serializer.validated_data.copy()
            discussion_data['created_by'] = str(request.user.id)
            discussion_data['created_at'] = datetime.utcnow().isoformat()
            discussion_data['updated_at'] = datetime.utcnow().isoformat()
            discussion_data['id'] = str(discussion_data.get('id') or uuid.uuid4())
            
            discussion_db = get_discussion_db()
            discussion_db.save(discussion_data)
            return Response({'detail': 'Discussion created successfully.'}, 
                          status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class RefugeeDiscussionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def get_object(self, discussion_id):
        discussion_db = get_discussion_db()
        for doc_id in discussion_db:
            doc = discussion_db[doc_id]
            if doc.get('id') == discussion_id:
                return doc_id, doc
        return None, None

    def get(self, request, discussion_id):
        doc_id, discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Increment views
        discussion['views'] = discussion.get('views', 0) + 1
        discussion_db = get_discussion_db()
        discussion_db[doc_id] = discussion
        
        # Get replies
        reply_db = get_discussion_reply_db()
        discussion['replies'] = [reply_db[reply_doc] for reply_doc in reply_db 
                               if reply_db[reply_doc].get('discussion_id') == discussion_id]
        
        return Response(discussion, status=status.HTTP_200_OK)

    def put(self, request, discussion_id):
        doc_id, discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if discussion.get('created_by') != str(request.user.id):
            return Response({'detail': 'You can only edit your own discussions.'}, 
                          status=status.HTTP_403_FORBIDDEN)

        serializer = DiscussionSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                discussion[field] = value
            discussion['updated_at'] = datetime.utcnow().isoformat()
            
            discussion_db = get_discussion_db()
            discussion_db[doc_id] = discussion
            
            return Response({'detail': 'Discussion updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, discussion_id):
        doc_id, discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        if discussion.get('created_by') != str(request.user.id):
            return Response({'detail': 'You can only delete your own discussions.'}, 
                          status=status.HTTP_403_FORBIDDEN)
        
        discussion_db = get_discussion_db()
        discussion_db.delete(doc_id)
        
        # Delete associated replies
        reply_db = get_discussion_reply_db()
        for reply_doc in reply_db:
            if reply_db[reply_doc].get('discussion_id') == discussion_id:
                reply_db.delete(reply_doc)
        
        return Response({'detail': 'Discussion deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)

class RefugeePeerLearningSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List available peer learning sessions for the refugee's courses."""
        db = get_peer_learning_session_db()
        sessions = [row.doc for row in db.view('_all_docs', include_docs=True)]
        serializer = PeerLearningSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Join a peer learning session."""
        session_id = request.data.get('session_id')
        db = get_peer_learning_participant_db()
        participant = {
            'session_id': session_id,
            'user_id': request.user.id,
            'role': 'refugee',
            'status': 'active',
        }
        doc_id, doc_rev = db.save(participant)
        participant['id'] = doc_id
        serializer = PeerLearningParticipantSerializer(participant)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

class InstructorPeerLearningSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List peer learning sessions for instructor's courses."""
        db = get_peer_learning_session_db()
        user_id = request.user.id
        sessions = [row.doc for row in db.view('_all_docs', include_docs=True) if row.doc.get('created_by') == user_id]
        serializer = PeerLearningSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Create a new peer learning session."""
        db = get_peer_learning_session_db()
        data = request.data.copy()
        data['created_by'] = request.user.id
        serializer = PeerLearningSessionSerializer(data=data)
        if serializer.is_valid():
            doc_id, doc_rev = db.save(serializer.validated_data)
            session = serializer.validated_data
            session['id'] = doc_id
            return Response(session, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class MentorPeerLearningSessionView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        """List all peer learning sessions mentor is involved in."""
        db = get_peer_learning_session_db()
        sessions = [row.doc for row in db.view('_all_docs', include_docs=True)]
        serializer = PeerLearningSessionSerializer(sessions, many=True)
        return Response(serializer.data)

    def post(self, request):
        """Mentor creates a peer learning session."""
        db = get_peer_learning_session_db()
        data = request.data.copy()
        data['created_by'] = request.user.id
        serializer = PeerLearningSessionSerializer(data=data)
        if serializer.is_valid():
            doc_id, doc_rev = db.save(serializer.validated_data)
            session = serializer.validated_data
            session['id'] = doc_id
            return Response(session, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminAnalyticsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        # Only allow admin users
        if not hasattr(request.user, 'role') or request.user.role != 'admin':
            return Response({'detail': 'Not authorized.'}, status=status.HTTP_403_FORBIDDEN)

        # User counts by role
        user_db = get_user_db()
        users = [row.doc for row in user_db.view('_all_docs', include_docs=True)]
        user_roles = {}
        for user in users:
            role = user.get('role', 'unknown')
            user_roles[role] = user_roles.get(role, 0) + 1

        # Courses
        course_db = get_course_db()
        total_courses = len([row for row in course_db.view('_all_docs')])

        # Jobs
        job_db = get_job_db()
        total_jobs = len([row for row in job_db.view('_all_docs')])

        # Enrollments
        try:
            enrollment_db = get_enrollment_db()
            total_enrollments = len([row for row in enrollment_db.view('_all_docs')])
        except Exception:
            total_enrollments = 0

        # Assessments
        try:
            assessment_db = get_assessment_db()
            total_assessments = len([row for row in assessment_db.view('_all_docs')])
        except Exception:
            total_assessments = 0

        # Certificates
        try:
            certificate_db = get_certificate_db()
            total_certificates = len([row for row in certificate_db.view('_all_docs')])
        except Exception:
            total_certificates = 0

        # Peer Learning Sessions
        try:
            peer_learning_db = get_peer_learning_session_db()
            total_peer_learning_sessions = len([row for row in peer_learning_db.view('_all_docs')])
        except Exception:
            total_peer_learning_sessions = 0

        analytics = {
            'user_counts': user_roles,
            'total_courses': total_courses,
            'total_jobs': total_jobs,
            'total_enrollments': total_enrollments,
            'total_assessments': total_assessments,
            'total_certificates': total_certificates,
            'total_peer_learning_sessions': total_peer_learning_sessions,
        }
        return Response(analytics)

class LanguageDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin | IsNGOPartner]

    def get_object(self, language_id):
        db = get_language_db()
        return db.get(language_id)

    def get(self, request, language_id):
        """Retrieve details of a specific language."""
        language = self.get_object(language_id)
        if not language:
            return Response({'detail': 'Language not found.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = LanguageSerializer(language)
        return Response(serializer.data)

    def put(self, request, language_id):
        """Update a specific language."""
        language = self.get_object(language_id)
        if not language:
            return Response({'detail': 'Language not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = LanguageSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                language[field] = value
            language['updated_at'] = datetime.utcnow().isoformat()
            db = get_language_db()
            db.save(language)
            return Response({'detail': 'Language updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, language_id):
        """Delete a specific language."""
        language = self.get_object(language_id)
        if not language:
            return Response({'detail': 'Language not found.'}, status=status.HTTP_404_NOT_FOUND)

        db = get_language_db()
        db.delete(language)
        return Response({'detail': 'Language deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class NGOPartnerJobDetailView(APIView):
    permission_classes = [IsAuthenticated, IsNGOPartner]

    def get_object(self, job_id, user_id):
        db = get_job_db()
        job = db.get(job_id)
        if job and job.get('sponsored_by') == user_id:
            return job_id, job # Return doc_id and doc for consistency with other get_object methods
        return None, None

    def get(self, request, job_id):
        """Retrieve details of a specific job sponsored by this NGO partner."""
        doc_id, job = self.get_object(job_id, str(request.user.id))
        if not job:
            return Response({'detail': 'Job not found or not sponsored by you.'}, status=status.HTTP_404_NOT_FOUND)
        serializer = JobSerializer(job)
        return Response(serializer.data)

    def put(self, request, job_id):
        """Update a specific job sponsored by this NGO partner."""
        doc_id, job = self.get_object(job_id, str(request.user.id))
        if not job:
            return Response({'detail': 'Job not found or not sponsored by you.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = JobSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                job[field] = value
            job['updated_at'] = datetime.utcnow().isoformat()
            db = get_job_db()
            db.save(job)
            return Response({'detail': 'Job updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, job_id):
        """Delete a specific job sponsored by this NGO partner."""
        doc_id, job = self.get_object(job_id, str(request.user.id))
        if not job:
            return Response({'detail': 'Job not found or not sponsored by you.'}, status=status.HTTP_404_NOT_FOUND)
        db = get_job_db()
        db.delete(job)
        return Response({'detail': 'Job deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class RefugeeDiscussionReplyView(APIView):
    permission_classes = [IsAuthenticated, IsRefugee]

    def post(self, request, discussion_id):
        """Post a reply to a discussion."""
        # Verify discussion exists
        discussion_db = get_discussion_db()
        discussion = discussion_db.get(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, status=status.HTTP_404_NOT_FOUND)

        serializer = DiscussionReplySerializer(data=request.data)
        if serializer.is_valid():
            reply_data = serializer.validated_data.copy()
            reply_data['discussion_id'] = discussion['id']
            reply_data['user_id'] = str(request.user.id)
            reply_data['created_at'] = datetime.utcnow().isoformat()
            reply_data['updated_at'] = datetime.utcnow().isoformat()
            reply_data['id'] = str(uuid.uuid4())
            
            reply_db = get_discussion_reply_db()
            reply_db.save(reply_data)
            return Response({'detail': 'Reply posted successfully.'}, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def put(self, request, discussion_id, reply_id):
        """Update a specific reply."""
        reply_db = get_discussion_reply_db()
        reply = reply_db.get(reply_id)
        if not reply:
            return Response({'detail': 'Reply not found.'}, status=status.HTTP_404_NOT_FOUND)

        if reply.get('discussion_id') != discussion_id:
            return Response({'detail': 'Reply does not belong to the specified discussion.'}, status=status.HTTP_400_BAD_REQUEST)

        if reply.get('user_id') != str(request.user.id):
            return Response({'detail': 'You can only edit your own replies.'}, status=status.HTTP_403_FORBIDDEN)

        serializer = DiscussionReplySerializer(data=request.data, partial=True)
        if serializer.is_valid():
            for field, value in serializer.validated_data.items():
                reply[field] = value
            reply['updated_at'] = datetime.utcnow().isoformat()
            reply_db.save(reply)
            return Response({'detail': 'Reply updated successfully.'}, status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, discussion_id, reply_id):
        """Delete a specific reply."""
        reply_db = get_discussion_reply_db()
        reply = reply_db.get(reply_id)
        if not reply:
            return Response({'detail': 'Reply not found.'}, status=status.HTTP_404_NOT_FOUND)

        if reply.get('discussion_id') != discussion_id:
            return Response({'detail': 'Reply does not belong to the specified discussion.'}, status=status.HTTP_400_BAD_REQUEST)

        if reply.get('user_id') != str(request.user.id):
            return Response({'detail': 'You can only delete your own replies.'}, status=status.HTTP_403_FORBIDDEN)

        reply_db.delete(reply)
        return Response({'detail': 'Reply deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

class InstructorDiscussionListView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get(self, request):
        """List discussions for instructor's courses."""
        discussion_db = get_discussion_db()
        reply_db = get_discussion_reply_db()
        
        # Get discussions for courses the instructor teaches
        course_db = get_course_db()
        instructor_courses = [course_db[doc].get('id') for doc in course_db 
                            if course_db[doc].get('instructor_id') == str(request.user.id)]
        
        discussions = []
        for doc in discussion_db:
            discussion = discussion_db[doc]
            if discussion.get('course_id') in instructor_courses:
                # Get replies for this discussion
                discussion['replies'] = [reply_db[reply_doc] for reply_doc in reply_db 
                                      if reply_db[reply_doc].get('discussion_id') == discussion.get('id')]
                discussions.append(discussion)
        
        return Response(discussions, status=status.HTTP_200_OK)

class InstructorDiscussionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsInstructor]

    def get_object(self, discussion_id):
        discussion_db = get_discussion_db()
        return discussion_db.get(discussion_id)

    def get(self, request, discussion_id):
        """Retrieve details of a specific discussion for instructors."""
        discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Verify instructor teaches the course associated with this discussion
        course_db = get_course_db()
        course_found = False
        for doc in course_db:
            if (course_db[doc].get('id') == discussion.get('course_id') and 
                course_db[doc].get('instructor_id') == str(request.user.id)):
                course_found = True
                break
        
        if not course_found:
            return Response({'detail': 'You are not authorized to view this discussion.'}, 
                          status=status.HTTP_403_FORBIDDEN)

        # Increment views
        discussion['views'] = discussion.get('views', 0) + 1
        discussion_db = get_discussion_db()
        discussion_db.save(discussion)
        
        # Get replies
        reply_db = get_discussion_reply_db()
        discussion['replies'] = [reply_db[reply_doc] for reply_doc in reply_db 
                               if reply_db[reply_doc].get('discussion_id') == discussion_id]
        
        return Response(discussion, status=status.HTTP_200_OK)

    def put(self, request, discussion_id):
        """Update a specific discussion for instructors."""
        discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        # Verify instructor teaches the course associated with this discussion
        course_db = get_course_db()
        course_found = False
        for doc in course_db:
            if (course_db[doc].get('id') == discussion.get('course_id') and 
                course_db[doc].get('instructor_id') == str(request.user.id)):
                course_found = True
                break
        
        if not course_found:
            return Response({'detail': 'You are not authorized to edit this discussion.'}, 
                          status=status.HTTP_403_FORBIDDEN)

        serializer = DiscussionSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                discussion[field] = value
            discussion['updated_at'] = datetime.utcnow().isoformat()
            
            discussion_db = get_discussion_db()
            discussion_db.save(discussion)
            
            return Response({'detail': 'Discussion updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class AdminDiscussionListView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get(self, request):
        """List all discussions for admins."""
        discussion_db = get_discussion_db()
        reply_db = get_discussion_reply_db()
        
        discussions = []
        for doc_id in discussion_db:
            discussion = discussion_db[doc_id]
            # Get replies for this discussion
            discussion['replies'] = [reply_db[reply_doc_id] for reply_doc_id in reply_db 
                                  if reply_db[reply_doc_id].get('discussion_id') == discussion.get('id')]
            discussions.append(discussion)
        
        return Response(discussions, status=status.HTTP_200_OK)

class AdminDiscussionDetailView(APIView):
    permission_classes = [IsAuthenticated, IsAdmin]

    def get_object(self, discussion_id):
        discussion_db = get_discussion_db()
        return discussion_db.get(discussion_id)

    def get(self, request, discussion_id):
        """Retrieve details of a specific discussion for admins."""
        discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        # Get replies
        reply_db = get_discussion_reply_db()
        discussion['replies'] = [reply_db[reply_doc_id] for reply_doc_id in reply_db 
                               if reply_db[reply_doc_id].get('discussion_id') == discussion_id]
        
        return Response(discussion, status=status.HTTP_200_OK)

    def put(self, request, discussion_id):
        """Update a specific discussion as admin."""
        discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)

        serializer = DiscussionSerializer(data=request.data, partial=True)
        if serializer.is_valid():
            data = serializer.validated_data
            for field, value in data.items():
                discussion[field] = value
            discussion['updated_at'] = datetime.utcnow().isoformat()
            
            discussion_db = get_discussion_db()
            discussion_db.save(discussion)
            
            return Response({'detail': 'Discussion updated successfully.'}, 
                          status=status.HTTP_200_OK)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def delete(self, request, discussion_id):
        """Delete a specific discussion as admin."""
        discussion = self.get_object(discussion_id)
        if not discussion:
            return Response({'detail': 'Discussion not found.'}, 
                          status=status.HTTP_404_NOT_FOUND)
        
        discussion_db = get_discussion_db()
        discussion_db.delete(discussion)
        
        # Delete associated replies
        reply_db = get_discussion_reply_db()
        # Iterate through all replies and delete those belonging to this discussion
        for reply_doc_id in reply_db:
            reply = reply_db[reply_doc_id]
            if reply.get('discussion_id') == discussion_id:
                reply_db.delete(reply)
        
        return Response({'detail': 'Discussion deleted successfully.'}, 
                       status=status.HTTP_204_NO_CONTENT)
