# api/permissions.py

from rest_framework import permissions

class IsPatientUser(permissions.BasePermission):
    """
    Custom permission to only allow users with the 'patient' role.
    """
    def has_permission(self, request, view):
        # This code checks two things:
        # 1. Is the user logged in? (request.user.is_authenticated)
        # 2. Is the user's role 'patient'? (request.user.role == 'patient')
        # Both must be true for permission to be granted.
        return request.user and request.user.is_authenticated and request.user.role == 'patient'
    

class IsDoctorUser(permissions.BasePermission):
    """
    Custom permission to only allow users with the 'doctor' role.
    """
    def has_permission(self, request, view):
        # This rule checks if the user is logged in AND their role is 'doctor'.
        return request.user and request.user.is_authenticated and request.user.role == 'doctor'
    

class IsHospitalAdminUser(permissions.BasePermission):
    """
    Custom permission to only allow users with the 'hospital_admin' role.
    """
    def has_permission(self, request, view):
        # This rule checks if the user is logged in AND their role is 'hospital_admin'.
        return request.user and request.user.is_authenticated and request.user.role == 'hospital_admin'


class IsDoctorOrHospitalAdmin(permissions.BasePermission):
    """
    Custom permission to allow users with 'doctor' or 'hospital_admin' role.
    """
    def has_permission(self, request, view):
        # Allow both doctors and hospital admins to create/manage articles
        return (request.user and request.user.is_authenticated and 
                (request.user.role == 'doctor' or request.user.role == 'hospital_admin'))