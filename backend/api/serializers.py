#Обновленный код для serializers.py (добавьте или измените существующие классы по необходимости):

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



# --- ДЕТАЛЬНЫЕ СЕРИАЛИЗАТОРЫ ДЛЯ ОТОБРАЖЕНИЯ РАСПИСАНИЯ ---

class TeacherShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Teacher
        fields = ['id', 'full_name']

class RoomShortSerializer(serializers.ModelSerializer):
    building_code = serializers.CharField(source='building.code', read_only=True) # Добавим код корпуса
    class Meta:
        model = Room
        fields = ['id', 'number', 'building_code']

class DisciplineShortSerializer(serializers.ModelSerializer):
    class Meta:
        model = Discipline
        fields = ['id', 'name']

class CurriculumForLessonSerializer(serializers.ModelSerializer):
    teacher = TeacherShortSerializer(read_only=True)
    discipline = DisciplineShortSerializer(read_only=True)
    lesson_type_name = serializers.CharField(source='lesson_type.name', read_only=True) # Имя типа занятия
    class Meta:
        model = Curriculum
        fields = ['id', 'teacher', 'discipline', 'lesson_type_name']

class LessonForScheduledSerializer(serializers.ModelSerializer):
    # УБЕДИТЕСЬ, ЧТО ЭТИ СТРОКИ ЕСТЬ И РАСКОММЕНТИРОВАНЫ,
    # И ЧТО DisciplineShortSerializer, TeacherShortSerializer, LessonTypeSerializer СУЩЕСТВУЮТ И РАБОТАЮТ
    discipline = DisciplineShortSerializer(read_only=True) 
    teacher = TeacherShortSerializer(read_only=True)    
    lesson_type = LessonTypeSerializer(read_only=True) # Или LessonTypeShortSerializer
    room = RoomShortSerializer(read_only=True)          
    
    class Meta:
        model = Lesson
        # УБЕДИТЕСЬ, ЧТО ВСЕ ЭТИ ПОЛЯ ПЕРЕЧИСЛЕНЫ ЗДЕСЬ
        fields = ['id', 'discipline', 'teacher', 'lesson_type', 'room'] # Добавьте 'description', если оно есть в модели Lesson

class TimeSlotForScheduledSerializer(serializers.ModelSerializer):
    weekday_details = WeekdaySerializer(source='weekday', read_only=True) # Переименовал для ясности
    pair_details = PairSerializer(source='pair', read_only=True) # Переименовал для ясности
    class Meta:
        model = TimeSlot
        fields = ['id', 'weekday_details', 'pair_details', 'is_even_week']

class DetailedScheduledLessonSerializer(serializers.ModelSerializer):
    lesson = LessonForScheduledSerializer(read_only=True) 
    time_slot = TimeSlotForScheduledSerializer(read_only=True)
    
    # Для создания/обновления через ваш universal_create/update, если они ожидают ID:
    # lesson_id = serializers.PrimaryKeyRelatedField(queryset=Lesson.objects.all(), source='lesson', write_only=True)
    # time_slot_id = serializers.PrimaryKeyRelatedField(queryset=TimeSlot.objects.all(), source='time_slot', write_only=True)
    # Если create_object/update_object используют ScheduledLessonSerializer (простой), то этот Detailed - только для чтения.

    class Meta:
        model = ScheduledLesson
        fields = ['id', 'lesson', 'time_slot']

class WeekdaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Weekday
        fields = ['id', 'number', 'name', 'short_name'] # Убедитесь, что все эти поля есть в модели Weekday

class PairSerializer(serializers.ModelSerializer):
    building_code = serializers.CharField(source='building.code', read_only=True, allow_null=True) # Добавим allow_null=True на случай если building может быть null
    class Meta:
        model = Pair
        fields = ['id', 'number', 'building', 'start_time', 'end_time', 'building_code'] # 'building' - это ID

# ... (остальные ваши базовые сериализаторы: LessonType, Building, и т.д.) ...

# --- ИЗМЕНЕННЫЙ TimeSlotSerializer ---
class TimeSlotSerializer(serializers.ModelSerializer):
    weekday_details = WeekdaySerializer(source='weekday', read_only=True, allow_null=True) # Добавил allow_null=True
    pair_details = PairSerializer(source='pair', read_only=True, allow_null=True)       # Добавил allow_null=True
    
    # Убрал write_only поля для простоты, т.к. create_object для timeslot скорее всего будет использовать 
    # простой TimeSlotSerializer, который принимает ID для weekday и pair, или вы будете создавать их через админку.
    # Если вы создаете TimeSlot через API и этот сериализатор, то write_only поля нужны.
    # weekday = serializers.PrimaryKeyRelatedField(queryset=Weekday.objects.all(), write_only=True, source='weekday', required=False, allow_null=True)
    # pair = serializers.PrimaryKeyRelatedField(queryset=Pair.objects.all(), write_only=True, source='pair', required=False, allow_null=True)

    class Meta:
        model = TimeSlot
        fields = ['id', 'weekday_details', 'pair_details', 'is_even_week'] # Оставим только то, что нужно для чтения списка