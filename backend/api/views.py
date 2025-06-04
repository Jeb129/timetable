from django.http import JsonResponse
from rest_framework.decorators import api_view, authentication_classes, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
import logging
from .constraint_engine import ConstraintEngine
from .models import *
from .serializers import *
from .pervissions import *

logger = logging.getLogger(__name__)

def hello_world(request):
    return JsonResponse({"message": "Hello from Django API!"})

MODEL_MAP = {
    'weekday': (Weekday, WeekdaySerializer),
    'lessontype': (LessonType, LessonTypeSerializer),
    'building': (Building, BuildingSerializer),
    'equipment': (Equipment, EquipmentSerializer),
    'room': (Room, RoomSerializer),
    'institute': (Institute, InstituteSerializer),
    'educationdirection': (EducationDirection, EducationDirectionSerializer),
    'educationform': (EducationForm, EducationFormSerializer),
    'educationlevel': (EducationLevel, EducationLevelSerializer),
    'discipline': (Discipline, DisciplineSerializer),
    'pair': (Pair, PairSerializer),
    'studentgroup': (StudentGroup, StudentGroupSerializer),
    'teacher': (Teacher, TeacherSerializer),
    'controltype': (ControlType, ControlTypeSerializer),
    'curriculum': (Curriculum, CurriculumSerializer),
    'lessonrequirement': (LessonRequirement, LessonRequirementSerializer),
    'lesson': (Lesson, LessonSerializer),
    'timeslot': (TimeSlot, TimeSlotSerializer),
    'scheduledlesson': (ScheduledLesson, ScheduledLessonSerializer),
    'teachertimepreference': (TeacherTimePreference, TeacherTimePreferenceSerializer),
    'teacherroompreference': (TeacherRoomPreference, TeacherRoomPreferenceSerializer),
    'constraint': (Constraint, ConstraintSerializer),
}

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_object(request, model_name):
    model_info = MODEL_MAP.get(model_name.lower())
    if not model_info:
        return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

    _, serializer_class = model_info
    serializer = serializer_class(data=request.data)
    if serializer.is_valid():
        instance = serializer.save()
        return Response(serializer_class(instance).data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_schedule_for_group(request, group_id):
    logger.info(f"Запрос расписания для группы ID: {group_id}, параметры: {request.query_params}")
    week_is_even_str = request.query_params.get('week_is_even', None)
    
    if week_is_even_str is None:
        logger.warning("Параметр 'week_is_even' отсутствует")
        return Response({"error": "Параметр 'week_is_even' (true/false) обязателен"}, status=status.HTTP_400_BAD_REQUEST)
    
    is_even = week_is_even_str.lower() == 'true'
    logger.info(f"Фильтр недели: is_even_week={is_even}")

    try:
        time_slots_for_week = TimeSlot.objects.filter(is_even_week=is_even)
        logger.info(f"Найдено таймслотов для недели: {time_slots_for_week.count()}")
        if not time_slots_for_week.exists():
             logger.info("Таймслоты для данной недели не найдены, будет возвращен пустой список уроков.")
             return Response([], status=status.HTTP_200_OK) # Если нет таймслотов, то и уроков не будет

        scheduled_lessons_qs = ScheduledLesson.objects.filter(
            lesson__groups__id=group_id, 
            time_slot__in=time_slots_for_week 
        ).select_related( 
            'lesson__discipline', 
            'lesson__teacher',    
            'lesson__lesson_type',
            'lesson__room__building', 
            'time_slot__weekday',
            'time_slot__pair', # Убрал __building, т.к. PairSerializer полный
            # 'time_slot__pair__building' # Если PairSerializer тоже вложенный и использует это
        ).prefetch_related(
            'lesson__groups' 
        )
        
        logger.info(f"Найдено ScheduledLessons (до сериализации): {scheduled_lessons_qs.count()}")
        # Для отладки можно вывести несколько объектов
        # for sl_debug in scheduled_lessons_qs[:2]:
        #     logger.debug(f"Отладочный SL: lesson_id={sl_debug.lesson_id}, timeslot_id={sl_debug.time_slot_id}")

        serializer = DetailedScheduledLessonSerializer(scheduled_lessons_qs, many=True)
        response_data = serializer.data # Получаем данные до Response
        logger.info(f"Данные после сериализации (первые 2, если есть): {response_data[:2]}")
        return Response(response_data)

    except Exception as e:
        logger.error(f"КРИТИЧЕСКАЯ ОШИБКА в get_schedule_for_group для группы {group_id}, week_is_even={is_even}: {e}")
        return Response({"error": "Внутренняя ошибка сервера при получении расписания. См. логи сервера."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

@api_view(['GET'])
def list_objects(request, model_name):
    print('Ищу модель')
    model_info = MODEL_MAP.get(model_name.lower())
    if not model_info:
        return Response({"error": "Unknown model type"}, status=status.HTTP_400_BAD_REQUEST)
    print('Нашел модель')
    model_class, serializer_class = model_info
    
    queryset = model_class.objects.all()
    print('Нашел данные')
    serializer = serializer_class(queryset, many=True)
    print('Успех')
    return Response(serializer.data)

@api_view(['GET'])
def get_object_by_id(request, object_name, object_id):
    object_info = MODEL_MAP.get(object_name)
    if not object_info:
        return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

    object_class, serializer_class = object_info

    try:
        obj = object_class.objects.get(pk=object_id)
    except object_class.DoesNotExist:
        return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = serializer_class(obj)
    return Response(serializer.data)

@api_view(['GET'])
def get_objects(request, object_name):
    object_info = MODEL_MAP.get(object_name)
    if not object_info:
        return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

    object_class, serializer_class = object_info

    try:
        obj = object_class.objects.all()
    except object_class.DoesNotExist:
        return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = serializer_class(obj, many=True)
    return Response(serializer.data)

@api_view(['PUT'])
@permission_classes([IsAdminUser])
def update_object(request, object_name, object_id):
    model_info = MODEL_MAP.get(object_name)
    if not model_info:
        return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

    model_class, serializer_class = model_info

    try:
        obj = model_class.objects.get(pk=object_id)
    except model_class.DoesNotExist:
        return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

    serializer = serializer_class(obj, data=request.data)
    if serializer.is_valid():
        serializer.save()
        return Response(serializer.data)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['DELETE'])
@permission_classes([IsAdminUser])
def delete_object(request, object_name, object_id):
    object_info = MODEL_MAP.get(object_name)
    if not object_info:
        return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

    object_class, _ = object_info
    try:
        obj = object_class.objects.get(pk=object_id)
    except object_class.DoesNotExist:
        return Response({'error': 'Object not found'}, status=status.HTTP_404_NOT_FOUND)

    obj.delete()
    return Response({'message': f'{object_name} deleted'}, status=status.HTTP_204_NO_CONTENT)

@api_view(['GET'])
def group_pairs(request, group_id):
    try:
        group = StudentGroup.objects.get(pk=group_id)
    except StudentGroup.DoesNotExist:
        return Response({'error': 'Group not found'}, status=status.HTTP_404_NOT_FOUND)

    # Получаем приоритетный корпус через цепочку
    building = group.direction.institute.primary_building
    if not building:
        return Response({'error': 'No primary building found for institute'}, status=status.HTTP_404_NOT_FOUND)

    # Все пары в этом корпусе
    pairs = Pair.objects.filter(building=building).order_by('number')
    serializer = PairSerializer(pairs, many=True)
    return Response(serializer.data)

@api_view(['POST'])
@permission_classes([IsAdminUser])
def create_ScheduledLesson(request,lesson_id, timeslot_id):
    try:
        lesson = Lesson.objects.get(id=lesson_id)
        time_slot = TimeSlot.objects.get(id=timeslot_id)
    except Lesson.DoesNotExist:
        return Response({"error": "Занятие не найдено"}, status=status.HTTP_404_NOT_FOUND)
    except TimeSlot.DoesNotExist:
        return Response({"error": "Слот не найден"}, status=status.HTTP_404_NOT_FOUND)

    # Проверка ограничений
    engine = ConstraintEngine()
    context = {
        "lesson": lesson,
        "time_slot": time_slot,
    }
    results = engine.evaluate(context)

    failed = {name: info for name, info in results.items() if not info["passed"]}

    if failed:
        return Response({
            "status": "error",
            "violations": failed
        }, status=status.HTTP_400_BAD_REQUEST)

    # Удаляем старое расписание
    ScheduledLesson.objects.filter(lesson=lesson).delete()

    # Создаем новое
    ScheduledLesson.objects.create(lesson=lesson, time_slot=time_slot)

    return Response({"status": "ok"}, status=status.HTTP_200_OK)