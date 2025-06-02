from django.urls import path
from .api import create_user

urlpatterns = [
    path('api/create-user/', create_user),
]
