from django.db import models


# 📅 Дни недели
class Weekday(models.Model):
    number = models.PositiveSmallIntegerField(unique=True)  # 1=Пн, 2=Вт...
    name = models.CharField(max_length=20)
    short_name = models.CharField(max_length=5)

    def __str__(self):
        return self.name


# 🎓 Виды занятий
class LessonType(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# 🏢 Корпуса
class Building(models.Model):
    code = models.CharField(max_length=5, unique=True)

    def __str__(self):
        return self.code


# 🛠 Оборудование
class Equipment(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 🏫 Аудитории
class Room(models.Model):
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    number = models.CharField(max_length=10)
    capacity = models.PositiveIntegerField()
    equipment = models.ManyToManyField(Equipment, blank=True)

    def __str__(self):
        return f"{self.building.code}-{self.number}"


# 🏛 Институты
class Institute(models.Model):
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=20)
    primary_building = models.ForeignKey(Building, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return self.short_name


# 🎓 Направления подготовки
class EducationDirection(models.Model):
    code = models.CharField(max_length=20)
    name = models.CharField(max_length=100)
    short_name = models.CharField(max_length=50)
    institute = models.ForeignKey(Institute, on_delete=models.CASCADE)

    def __str__(self):
        return f"{self.code} - {self.short_name}"


# 🧾 Формы обучения
class EducationForm(models.Model):
    name = models.CharField(max_length=50)
    short_code = models.CharField(max_length=10)

    def __str__(self):
        return self.name


# 🎓 Уровни подготовки
class EducationLevel(models.Model):
    name = models.CharField(max_length=50)
    short_code = models.CharField(max_length=10)

    def __str__(self):
        return self.name


# 📚 Дисциплины
class Discipline(models.Model):
    name = models.CharField(max_length=100)

    def __str__(self):
        return self.name


# 🕑 Пара — расписание звонков
class Pair(models.Model):
    number = models.PositiveSmallIntegerField()
    building = models.ForeignKey(Building, on_delete=models.CASCADE)
    start_time = models.TimeField()
    end_time = models.TimeField()

    class Meta:
        unique_together = ('building', 'number')

    def __str__(self):
        return f"{self.building.code} - Пара {self.number}"


# 👥 Учебная подгруппа
class StudentSubGroup(models.Model):
    admission_year = models.PositiveIntegerField()
    direction = models.ForeignKey(EducationDirection, on_delete=models.CASCADE)
    form = models.ForeignKey(EducationForm, on_delete=models.CASCADE)
    level = models.ForeignKey(EducationLevel, on_delete=models.CASCADE)
    group_number = models.PositiveIntegerField()
    subgroup_number = models.PositiveIntegerField()
    student_count = models.PositiveIntegerField()

    def __str__(self):
        return f"{self.admission_year}-{self.direction.short_name}-{self.group_number}.{self.subgroup_number}"


# 👨‍🏫 Преподаватели
class Teacher(models.Model):
    full_name = models.CharField(max_length=100)

    def __str__(self):
        return self.full_name


# 📘 Тип контроля
class ControlType(models.Model):
    name = models.CharField(max_length=50)

    def __str__(self):
        return self.name


# 📋 Учебный план
class Curriculum(models.Model):
    group = models.ForeignKey(StudentSubGroup, on_delete=models.CASCADE)
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(LessonType, on_delete=models.CASCADE)
    hours = models.PositiveIntegerField()
    control_type = models.ForeignKey(ControlType, on_delete=models.SET_NULL, null=True)

    def __str__(self):
        return f"{self.group} - {self.discipline}"


# 🧾 Требования к аудитории
class LessonRequirement(models.Model):
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(LessonType, on_delete=models.CASCADE)
    required_equipment = models.ManyToManyField(Equipment)

    def __str__(self):
        return f"{self.discipline} ({self.lesson_type})"


# 📍 Планируемое занятие
class Lesson(models.Model):
    curriculum = models.ForeignKey(Curriculum, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)
    groups = models.ManyToManyField(StudentSubGroup)
    # Фактическое распределение — через TimeSlot

    def __str__(self):
        return f"{self.curriculum} в {self.room}"


# 🕓 Временной слот
class TimeSlot(models.Model):
    weekday = models.ForeignKey(Weekday, on_delete=models.CASCADE)
    is_even_week = models.BooleanField()
    pair = models.ForeignKey(Pair, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('weekday', 'is_even_week', 'pair')

    def __str__(self):
        return f"{self.weekday.short_name} {'Чет' if self.is_even_week else 'Неч'} - {self.pair}"


# 📅 Фактическое размещение занятия в расписании
class ScheduledLesson(models.Model):
    lesson = models.ForeignKey(Lesson, on_delete=models.CASCADE)
    time_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('lesson', 'time_slot')

    def __str__(self):
        return f"{self.lesson} @ {self.time_slot}"


# 🕐 Пожелания преподавателя по времени
class TeacherTimePreference(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    excluded_slot = models.ForeignKey(TimeSlot, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('teacher', 'excluded_slot')


# 🏫 Пожелания преподавателя по аудиториям
class TeacherRoomPreference(models.Model):
    teacher = models.ForeignKey(Teacher, on_delete=models.CASCADE)
    discipline = models.ForeignKey(Discipline, on_delete=models.CASCADE)
    lesson_type = models.ForeignKey(LessonType, on_delete=models.CASCADE)
    room = models.ForeignKey(Room, on_delete=models.CASCADE)

    class Meta:
        unique_together = ('teacher', 'discipline', 'lesson_type', 'room')

class Constraint(models.Model):
    name = models.CharField(max_length=100, unique=True)
    weight = models.PositiveSmallIntegerField(default=5)
    method_name = models.CharField(max_length=100)

    def __str__(self):
        return f"{self.name} (weight={self.weight})"

