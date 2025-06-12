from rest_framework import permissions

class IsRefugee(permissions.BasePermission):
    """Custom permission to only allow refugees to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'refugee'

class IsInstructor(permissions.BasePermission):
    """Custom permission to only allow instructors to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'instructor'

class IsMentor(permissions.BasePermission):
    """Custom permission to only allow mentors to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'mentor'

class IsEmployer(permissions.BasePermission):
    """Custom permission to only allow employers to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'employer'

class IsAdmin(permissions.BasePermission):
    """Custom permission to only allow admins to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'admin'

class IsNGOPartner(permissions.BasePermission):
    """Custom permission to only allow NGO partners to access."""
    def has_permission(self, request, view):
        return hasattr(request.user, 'role') and request.user.role == 'ngo_partner' 