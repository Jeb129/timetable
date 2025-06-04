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
    path('schedule/group/<int:group_id>/', get_schedule_for_group, name='get-schedule-for-group'),
    path('create/<str:model_name>/', create_object), # Универсальное создание объектов
    path('get/<str:object_name>/<int:object_id>/',get_object_by_id), # Универсальный поиск объектов
    path('update/<str:object_name>/<int:object_id>/',update_object), # Универсальное обновление объекта
    path('delete/<str:object_name>/<int:object_id>/',delete_object), # Универсальное удаление объекта
    path('group/<int:group_id>/pairs/', group_pairs), # расписание звонков в универе по группе
    path('scheduledlesson/<int:lesson_id>/<int:timeslot_id>/',create_ScheduledLesson), # Универсальное удаление объекта
    path('list/<str:model_name>/', list_objects, name='universal-list'), # Универсальный эндпоинт для получения списка объектов модели

    path('prebuildconstraints/', constraint_prebuild), 

]
