from rest_framework import serializers
from .models import *

class WeekdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Weekday
        fields = '__all__'

class LessonTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = LessonType
        fields = '__all__'

class BuildingSerializer(serializers.ModelSerializer):
    class Meta:
        model = Building
        fields = '__all__'

class EquipmentSerializer(serializers.ModelSerializer):
    class Meta:
        model = Equipment
        fields = '__all__'

class RoomSerializer(serializers.ModelSerializer):
    equipment = serializers.PrimaryKeyRelatedField(many=True, queryset=Equipment.objects.all())

    class Meta:
        model = Room
        fields = '__all__'

class InstituteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Institute
        fields = '__all__'

class EducationDirectionSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationDirection
        fields = '__all__'

class EducationFormSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationForm
        fields = '__all__'

class EducationLevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = EducationLevel
        fields = '__all__'

class DisciplineSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = '__all__'

class PairSerializer(serializers.ModelSerializer):
    class Meta:
        model = Pair
        fields = '__all__'

class StudentGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = StudentGroup
        fields = '__all__'

class TeacherSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = '__all__'

class ControlTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = ControlType
        fields = '__all__'

class CurriculumSerializer(serializers.ModelSerializer):
    class Meta:
        model = Curriculum
        fields = '__all__'

class LessonRequirementSerializer(serializers.ModelSerializer):
    required_equipment = serializers.PrimaryKeyRelatedField(many=True, queryset=Equipment.objects.all())

    class Meta:
        model = LessonRequirement
        fields = '__all__'

class LessonSerializer(serializers.ModelSerializer):
    groups = serializers.PrimaryKeyRelatedField(many=True, queryset=StudentGroup.objects.all())

    class Meta:
        model = Lesson
        fields = '__all__'

class TimeSlotSerializer(serializers.ModelSerializer):
    class Meta:
        model = TimeSlot
        fields = '__all__'

class ScheduledLessonSerializer(serializers.ModelSerializer):
    class Meta:
        model = ScheduledLesson
        fields = '__all__'

class TeacherTimePreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherTimePreference
        fields = '__all__'

class TeacherRoomPreferenceSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeacherRoomPreference
        fields = '__all__'

class ConstraintSerializer(serializers.ModelSerializer):
    class Meta:
        model = Constraint
        fields = '__all__'
