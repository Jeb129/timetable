from django.shortcuts import render
from django.http import JsonResponse
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import *
from .serializers import *

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
class UniversalCreateView(APIView):
    def post(self, request, model_name):
        model_info = MODEL_MAP.get(model_name.lower())
        if not model_info:
            return Response({"error": "Unknown model"}, status=status.HTTP_400_BAD_REQUEST)

        model_class, serializer_class = model_info
        serializer = serializer_class(data=request.data)
        if serializer.is_valid():
            instance = serializer.save()
            return Response(serializer_class(instance).data, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
    
def hello_world(request):
    return JsonResponse({"message": "Hello from Django API!"})