from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

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
@api_view("POST")
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
def get_object(request, object_name, object_id):
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

@api_view('PUT')
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
