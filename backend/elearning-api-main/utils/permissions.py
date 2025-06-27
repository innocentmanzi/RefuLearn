from rest_framework.permissions import BasePermission, SAFE_METHODS
from rest_framework import exceptions
from authentication.models import User
from utils import logging_config

# Initialize logger
logger = logging_config.setup_logging()


class IsCourseAdminInstructorOrReadOnly(BasePermission):
    """
    Custom permission for Course:
    - Admin: full access
    - Instructor: full access to their own courses
    - Student: read-only (list/retrieve)
    """

    def has_permission(self, request, view):
        user = request.user
        if not user or not user.is_authenticated:
            logger.warning("Unauthenticated access attempt.")
            return False

        # Allow GET, HEAD, OPTIONS for all authenticated users (including students)
        if request.method in SAFE_METHODS:
            return True

        # Allow POST, PATCH, DELETE only for Admins and Instructors
        if user.role in ["Admin", "Instructor"]:
            return True

        logger.warning(f"User {user.email} with role {user.role} denied write access.")
        return False

    def has_object_permission(self, request, view, obj):
        user = request.user
        # Safe methods: allow all
        if request.method in SAFE_METHODS:
            return True

        # Admin can do anything
        if user.role == "Admin":
            return True

        # Instructor can only modify their own courses
        if (
            user.role == "Instructor"
            and hasattr(obj, "instructor")
            and obj.instructor == user
        ):
            return True

        logger.warning(
            f"User {user.email} denied object-level write access to course {getattr(obj, 'id', None)}."
        )
        return False


class BaseRolePermission(BasePermission):
    """
    Base permission class for role-based access control.
    Checks if the authenticated user has the specified role and is active/verified.
    """

    required_role = None

    def has_permission(self, request, view):
        """
        Check if the user has the required role and is active/verified.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if the user has permission, False otherwise.

        Raises:
            exceptions.AuthenticationFailed: If the user is not authenticated.
            exceptions.PermissionDenied: If the user lacks the required role or status.
            Exception: For unexpected errors during permission check.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.debug(
            f"Checking {self.__class__.__name__} permission for IP: {client_ip}"
        )

        try:
            # Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                logger.warning(f"Unauthenticated access attempt from IP: {client_ip}")
                raise exceptions.AuthenticationFailed(
                    {
                        "message": "Authentication required",
                        "error_code": "NOT_AUTHENTICATED",
                    }
                )

            user = request.user
            logger.debug(
                f"Checking permissions for user: {user.email} (UUID: {user.id})"
            )

            # Check if user is active and verified
            if not user.is_active:
                logger.warning(f"Inactive user {user.email} attempted access")
                raise exceptions.PermissionDenied(
                    {
                        "message": "User account is inactive",
                        "error_code": "USER_INACTIVE",
                    }
                )

            if not user.is_verified:
                logger.warning(f"Unverified user {user.email} attempted access")
                raise exceptions.PermissionDenied(
                    {
                        "message": "User email is not verified",
                        "error_code": "USER_NOT_VERIFIED",
                    }
                )

            # Convert required_roles to list if it's a single role
            roles = (
                [self.required_roles]
                if isinstance(self.required_roles, str)
                else self.required_roles
            )

            # Check if user has one of the required roles
            if not roles or user.role not in roles:
                logger.warning(
                    f"User {user.email} with role {user.role} attempted access requiring one of {roles}"
                )
                raise exceptions.PermissionDenied(
                    {
                        "message": f"User must have one of the following roles: {', '.join(roles)}",
                        "error_code": "INVALID_ROLE",
                    }
                )

            logger.info(
                f"Permission granted for user: {user.email} with role: {user.role}"
            )
            return True

        except (exceptions.AuthenticationFailed, exceptions.PermissionDenied):
            # Let AuthenticationFailed and PermissionDenied propagate
            raise

        except AttributeError as e:
            logger.error(
                f"Attribute error during permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {"message": "Invalid user data", "error_code": "INVALID_USER_DATA"}
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                }
            )


class IsJobOpportunityConnectedOrReadOnly(BaseRolePermission):
    """
    Custom permission for JobOpportunity:
    - Students: read-only (list/retrieve)
    - Admins: full access
    - Employer, Instructor, Mentor, NGO_Partner: full access to jobs they posted
    """

    required_roles = ["Admin", "Employer", "Instructor", "Mentor", "NGO_Partner"]

    def has_permission(self, request, view):
        """
        Check if the user has permission to perform the action.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.debug(f"Checking JobOpportunity permission for IP: {client_ip}")
        try:
            if not request.user or not request.user.is_authenticated:
                logger.warning(f"Unauthenticated access attempt from IP: {client_ip}")
                raise exceptions.PermissionDenied(
                    {
                        "message": "Authentication required",
                        "error_code": "NOT_AUTHENTICATED",
                    }
                )

            user = request.user
            # Allow read-only access for all authenticated users (including Students)
            if request.method in SAFE_METHODS:
                logger.debug(f"Read-only access granted for user: {user.email}")
                return True

            # Admins have full access
            if user.role == "Admin":
                logger.debug(f"Admin access granted for user: {user.email}")
                return True

            # Other roles must be in allowed roles for write operations
            if user.role not in self.required_roles:
                logger.warning(
                    f"User {user.email} with role {user.role} denied write access"
                )
                raise exceptions.PermissionDenied(
                    {
                        "message": f"User must have one of the following roles: {', '.join(self.required_roles)}",
                        "error_code": "INVALID_ROLE",
                    }
                )

            return True
        except exceptions.PermissionDenied:
            raise

        except Exception as e:
            logger.error(f"Unexpected error in permission check: {str(e)}")
            raise exceptions.PermissionDenied(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                }
            )

    def has_object_permission(self, request, view, obj):
        """
        Check if the user has permission to access the specific job opportunity.
        """
        user = request.user
        logger.debug(
            f"Checking object permission for JobOpportunity {obj.id} by {user.email}"
        )
        try:
            # Allow read-only access for all
            if request.method in SAFE_METHODS:
                return True

            # Admins have full access
            if user.role == "Admin":
                return True

            # Other roles can only modify their own job opportunities
            if obj.posted_by == user:
                return True

            logger.warning(
                f"User {user.email} denied access to JobOpportunity {obj.id}"
            )
            raise exceptions.PermissionDenied(
                {
                    "message": "You can only modify job opportunities you posted.",
                    "error_code": "UNAUTHORIZED_JOB_ACCESS",
                }
            )

        except exceptions.PermissionDenied:
            raise

        except Exception as e:
            logger.error(f"Unexpected error in object permission check: {str(e)}")
            raise exceptions.PermissionDenied(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                }
            )


class IsJobApplicationConnectedOrReadOnly(BasePermission):
    """
    Custom permission for JobApplication views:
    - Admins: Full access (list, create, retrieve, update, delete).
    - Students: Can list, create, retrieve, update their own applications (no delete).
    - Mentor, Instructor, Employer, NGO_Partner: Full access to applications for jobs they posted.
    - Any authenticated user: Can create applications.
    """

    def has_permission(self, request, view):
        """
        Check if the user has permission for the view action.
        """
        user = request.user
        logger.debug(
            f"Checking permissions for user: {user.email} (Role: {user.role}) for method: {request.method}"
        )

        if not user.is_authenticated:
            logger.warning(f"Unauthenticated user attempted access to {request.method}")
            return False

        # Admins have full access
        if user.role == "Admin":
            logger.debug(f"Admin user {user.email} granted full access")
            return True

        # Any authenticated user can create
        if request.method == "POST":
            logger.debug(
                f"Authenticated user {user.email} allowed to create job application"
            )
            return True

        # Safe methods (GET, HEAD, OPTIONS) are allowed for listing/retrieving
        if request.method in SAFE_METHODS:
            logger.debug(f"User {user.email} allowed for safe method {request.method}")
            return True

        # For non-safe methods (PUT, PATCH, DELETE), further checks needed
        return True

    def has_object_permission(self, request, view, obj):
        """
        Check object-level permissions for retrieve, update, delete actions.
        """
        user = request.user
        logger.debug(
            f"Checking object permissions for user: {user.email} (Role: {user.role}) on JobApplication: {obj}"
        )

        # Admins have full access
        if user.role == "Admin":
            logger.debug(f"Admin user {user.email} granted object access")
            return True

        # Students can retrieve/update their own applications, but not delete
        if user.role == "Student" and obj.user == user:
            if request.method == "DELETE":
                logger.warning(
                    f"Student {user.email} attempted to delete JobApplication {obj.id}"
                )
                return False
            logger.debug(
                f"Student {user.email} granted access to own JobApplication {obj.id}"
            )
            return True

        # Mentor, Instructor, Employer, NGO_Partner can access applications for their jobs
        if (
            user.role in ["Mentor", "Instructor", "Employer", "NGO_Partner"]
            and obj.job.posted_by == user
        ):
            logger.debug(
                f"User {user.email} (Role: {user.role}) granted access to JobApplication {obj.id} for their job"
            )
            return True

        logger.warning(
            f"User {user.email} (Role: {user.role}) denied access to JobApplication {obj.id}"
        )
        return False


class IsAdmin(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'Admin' role.
    """

    required_roles = "Admin"


class IsMentor(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'Mentor' role.
    """

    required_roles = "Mentor"


class IsInstructor(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'Instructor' role.
    """

    required_roles = "Instructor"


class IsEmployer(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'Employer' role.
    """

    required_roles = "Employer"


class IsNGOPartner(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'NGO_Partner' role.
    """

    required_roles = "NGO_Partner"


class IsStudent(BaseRolePermission):
    """
    Permission class to allow access only to users with the 'Student' role.
    """

    required_roles = "Student"


class IsAdminOrInstructor(BaseRolePermission):
    """
    Permission class to allow access to users with either 'Admin' or 'Instructor' role.
    """

    required_roles = ["Admin", "Instructor"]


class IsOwnProfile(BasePermission):
    """
    Permission class to allow users to access or modify only their own profile data.
    Ensures the requested resource belongs to the authenticated user.
    """

    def has_permission(self, request, view):
        """
        Check if the user is authenticated, active, and verified.

        Args:
            request: The HTTP request object.
            view: The view being accessed.

        Returns:
            bool: True if the user has permission, False otherwise.

        Raises:
            exceptions.AuthenticationFailed: If the user is not authenticated.
            exceptions.PermissionDenied: If the user is inactive or unverified.
            Exception: For unexpected errors during permission check.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        logger.debug(f"Checking IsOwnProfile permission for IP: {client_ip}")

        try:
            # Check if user is authenticated
            if not request.user or not request.user.is_authenticated:
                logger.warning(f"Unauthenticated access attempt from IP: {client_ip}")
                raise exceptions.AuthenticationFailed(
                    {
                        "message": "Authentication required",
                        "error_code": "NOT_AUTHENTICATED",
                    }
                )

            user = request.user
            logger.debug(
                f"Checking profile access for user: {user.email} (UUID: {user.id})"
            )

            # Check if user is active and verified
            if not user.is_active:
                logger.warning(f"Inactive user {user.email} attempted profile access")
                raise exceptions.PermissionDenied(
                    {
                        "message": "User account is inactive",
                        "error_code": "USER_INACTIVE",
                    }
                )

            if not user.is_verified:
                logger.warning(f"Unverified user {user.email} attempted profile access")
                raise exceptions.PermissionDenied(
                    {
                        "message": "User email is not verified",
                        "error_code": "USER_NOT_VERIFIED",
                    }
                )

            return True

        except (exceptions.AuthenticationFailed, exceptions.PermissionDenied):
            raise

        except AttributeError as e:
            logger.error(
                f"Attribute error during profile permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {"message": "Invalid user data", "error_code": "INVALID_USER_DATA"}
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during profile permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                }
            )

    def has_object_permission(self, request, view, obj):
        """
        Check if the object being accessed belongs to the authenticated user.
        """
        client_ip = request.META.get("REMOTE_ADDR", "unknown")
        user = request.user
        logger.debug(
            f"Checking object permission for user: {user.email} (UUID: {user.id}) on object: {obj}"
        )

        try:
            # Determine if the object is a User or has a user attribute
            target_user = obj if isinstance(obj, User) else getattr(obj, "user", None)

            if not target_user:
                logger.error(
                    f"Object {obj} has no user attribute or is not a User instance"
                )
                raise exceptions.APIException(
                    {"message": "Invalid object type", "error_code": "INVALID_OBJECT"}
                )

            # Check if the target user matches the authenticated user
            if target_user.id != user.id:
                logger.warning(
                    f"User {user.email} attempted to access profile of user {target_user.email}"
                )
                raise exceptions.PermissionDenied(
                    {
                        "message": "You can only access your own profile",
                        "error_code": "UNAUTHORIZED_PROFILE_ACCESS",
                    }
                )

            logger.info(f"User {user.email} granted access to own profile")
            return True

        except (exceptions.AuthenticationFailed, exceptions.PermissionDenied):
            raise

        except AttributeError as e:
            logger.error(
                f"Attribute error during object permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {"message": "Invalid object data", "error_code": "INVALID_OBJECT_DATA"}
            )

        except Exception as e:
            logger.exception(
                f"Unexpected error during object permission check for IP {client_ip}: {str(e)}"
            )
            raise exceptions.APIException(
                {
                    "message": "An unexpected error occurred",
                    "error_code": "UNEXPECTED_ERROR",
                }
            )
