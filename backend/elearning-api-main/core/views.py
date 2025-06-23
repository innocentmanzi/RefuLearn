from rest_framework.permissions import IsAuthenticated
from drf_spectacular.utils import extend_schema
from .models import Language, Camp
from .serializers import LanguageSerializer, CampSerializer
from utils import logging_config, custom_pagination, generic_views

# Initialize logger from the provided logging setup
logger = logging_config.setup_logging()


class LanguageListCreateView(generic_views.GenericListCreateView):
    """
    API view to list all languages or create a new language.
    Inherits from GenericListCreateView for reusable list/create logic.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LanguageSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    model = Language
    sanitize_fields = ["name", "code"]
    resource_name = "Language"

    @extend_schema(
        responses={
            200: LanguageSerializer(many=True),
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request):
        return super().get(request)

    @extend_schema(
        request=LanguageSerializer,
        responses={
            201: LanguageSerializer,
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def post(self, request):
        return super().post(request)


class LanguageDetailView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view to retrieve, update, or delete a specific language.
    Inherits from GenericRetrieveUpdateDeleteView for reusable retrieve/update/delete logic.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = LanguageSerializer
    model = Language
    sanitize_fields = ["name", "code"]
    resource_name = "Language"

    @extend_schema(
        responses={
            200: LanguageSerializer,
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request, instance_id: str):
        return super().get(request, instance_id)

    @extend_schema(
        request=LanguageSerializer,
        responses={
            200: LanguageSerializer,
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def patch(self, request, instance_id: str):
        return super().patch(request, instance_id)

    @extend_schema(
        responses={
            204: None,
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def delete(self, request, instance_id: str):
        return super().delete(request, instance_id)


class CampListCreateView(generic_views.GenericListCreateView):
    """
    API view to list all camps or create a new camp.
    Inherits from GenericListCreateView for reusable list/create logic.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CampSerializer
    pagination_class = custom_pagination.CustomPageNumberPagination
    model = Camp
    sanitize_fields = ["name", "location"]
    resource_name = "Camp"

    @extend_schema(
        responses={
            200: CampSerializer(many=True),
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request):
        return super().get(request)

    @extend_schema(
        request=CampSerializer,
        responses={
            201: CampSerializer,
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def post(self, request):
        return super().post(request)


class CampDetailView(generic_views.GenericRetrieveUpdateDeleteView):
    """
    API view to retrieve, update, or delete a specific camp.
    Inherits from GenericRetrieveUpdateDeleteView for reusable retrieve/update/delete logic.
    """

    permission_classes = [IsAuthenticated]
    serializer_class = CampSerializer
    model = Camp
    sanitize_fields = ["name", "location"]
    resource_name = "Camp"

    @extend_schema(
        responses={
            200: CampSerializer,
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def get(self, request, instance_id: str):
        return super().get(request, instance_id)

    @extend_schema(
        request=CampSerializer,
        responses={
            200: CampSerializer,
            400: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "errors": {"type": "object"},
                    "error_code": {"type": "string"},
                },
            },
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        },
    )
    def patch(self, request, instance_id: str):
        return super().patch(request, instance_id)

    @extend_schema(
        responses={
            204: None,
            404: {
                "type": "object",
                "properties": {
                    "message": {"type": "string"},
                    "error_code": {"type": "string"},
                },
            },
        }
    )
    def delete(self, request, instance_id: str):
        return super().delete(request, instance_id)
