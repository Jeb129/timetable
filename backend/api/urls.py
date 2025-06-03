from django.urls import path
from . import views
from .views import *
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
) 

urlpatterns = [
    path('hello/', views.hello_world),
    path('login/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('create/<str:model_name>/', create_object),
    path('get/<str:object_name>/<int:object_id>/',get_object),
    path('update/<str:object_name>/<int:object_id>/',update_object),
    path('delete/<str:object_name>/<int:object_id>/',delete_object),
]
