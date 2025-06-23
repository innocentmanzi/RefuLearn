from rest_framework.permissions import BasePermission
from rest_framework import exceptions
from authentication.models import User
from utils import logging_config

# Initialize logger
logger = logging_config.setup_logging()


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

            # # Check if user has the required role
            # if user.role != self.required_role:
            #     logger.warning(
            #         f"User {user.email} with role {user.role} attempted access requiring {self.required_role}"
            #     )
            #     raise exceptions.PermissionDenied(
            #         {
            #             "message": f"User must have {self.required_role} role",
            #             "error_code": "INVALID_ROLE",
            #         }
            #     )

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
