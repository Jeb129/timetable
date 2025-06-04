from datetime import timedelta, datetime
from .models import *
def prebuid():
        constraints = [
            ("Пересечение по преподавателю", 5, "teacher_no_overlap"),
            ("Пересечение по группе", 5, "group_no_overlap"),
            ("Пересечение по аудиториям", 5, "no_room_overlap"),
            ("Аудитория вмещает всех студентов", 5, "room_has_enough_seats"),
            ("Аудитория соответствует оборудованию", 4, "room_meets_equipment_requirements"),
            ("Предпочтения преподавателя по аудитории", 3, "matches_teacher_room_preference"),
            ("Предпочтения преподавателя по времени", 2, "matches_teacher_time_preference"),
            ("Переход между корпусами", 5, "enough_travel_time"),
        ]
        for name, weight, method in constraints:
            Constraint.objects.get_or_create(name=name, weight=weight, method_name=method)

class ConstraintEngine:
    def __init__(self, constraints=None):
        self.constraints = constraints or Constraint.objects.all()
    def evaluate(self, context) -> dict:
        results = {}
        for constraint in self.constraints:
            print(constraint.method_name)
            method = getattr(self, constraint.method_name, None)
            if not method:
                continue  # метод не найден — пропускаем
            passed,error = method(context)
            results[constraint.name] = {
                "passed": passed,
                "error": error,
                "weight": constraint.weight
            }
        return results

    def sample_constraint(self, context) -> tuple[bool, str | None]:
        # логика...
        if True: # ошибка
            return False, "описание причины"
        return True, None
    
        # 1.1 Преподаватель не может быть в двух местах одновременно
    def teacher_no_overlap(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        time_slot = context["time_slot"]
        teacher = lesson.teacher

        conflict = ScheduledLesson.objects.filter( 
            lesson__teacher=teacher,
            time_slot=time_slot
        ).exclude(lesson=lesson).exists()
        
        if conflict:
            return False, f"Преподаватель {teacher} уже занят в это время"
        return True, None

    # 1.2 Группа не может быть в двух местах одновременно
    def group_no_overlap(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        time_slot = context["time_slot"]
        groups = lesson.groups.all()

        conflict = ScheduledLesson.objects.filter(
            lesson__groups__in=groups,
            time_slot=time_slot
        ).exclude(lesson=lesson).distinct()

        if conflict.exists():
            return False, f"Некоторые группы уже заняты в это время"
        return True, None

    # 2. В одной аудитории не может проводиться несколько занятий одновременно
    def no_room_overlap(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        time_slot = context["time_slot"]

        room = lesson.room
        conflict = ScheduledLesson.objects.filter(
            lesson__room=room,
            time_slot=time_slot
        ).exclude(lesson=lesson).exists()

        if conflict:
            return False, f"Аудитория {room} уже занята в это время"
        return True, None


    # 3. Достаточно ли мест в аудитории
    def room_has_enough_seats(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        total_students = sum(g.student_count for g in lesson.groups.all())
        if lesson.room.capacity < total_students:
            return False, f"Аудитория вмещает {lesson.room.capacity} студентов, требуется {total_students}"
        return True, None


    # 4. Соответствие техническим требованиям
    def room_meets_equipment_requirements(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        lesson_type = lesson.lesson_type
        discipline = lesson.discipline
        room_equipment = set(lesson.room.equipment.values_list("id", flat=True))

        try:
            requirement = LessonRequirement.objects.get(
                discipline=discipline,
                lesson_type=lesson_type
            )
            required_equipment = set(requirement.required_equipment.values_list("id", flat=True))
        except LessonRequirement.DoesNotExist:
            return True, None  # Нет требований — всё ок

        if not required_equipment.issubset(room_equipment):
            return False, "Аудитория не соответствует техническим требованиям"
        return True, None


    # 5. Пожелания преподавателя по аудитории
    def matches_teacher_room_preference(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        teacher = lesson.teacher
        discipline = lesson.discipline
        lesson_type = lesson.lesson_type
        room = lesson.room
        has_preferences = TeacherRoomPreference.objects.filter(
            teacher=teacher,
            discipline=discipline,
            lesson_type=lesson_type).exists()

        if not has_preferences:
            return True, None

        preferred = TeacherRoomPreference.objects.filter(
            teacher=teacher,
            discipline=discipline,
            lesson_type=lesson_type,
            room=room
        ).exists()

        if not preferred:
            return False, "Аудитория не входит в список предпочтений преподавателя"
        return True, None


    # 6. Пожелания по времени
    def matches_teacher_time_preference(self, context) -> tuple[bool, str | None]:
        teacher = context["lesson"].teacher
        time_slot = context["time_slot"]

        is_excluded = TeacherTimePreference.objects.filter(
            teacher=teacher,
            excluded_slot=time_slot
        ).exists()

        if is_excluded:
            return False, "Выбранное время не соответствует предпочтениям преподавателя"
        return True, None


    # 7. Достаточно времени на переход между корпусами
    def enough_travel_time(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        time_slot = context["time_slot"]
        groups = lesson.groups.all()
        teacher = lesson.teacher

        previous_lessons = ScheduledLesson.objects.filter(
            time_slot__pair__number=time_slot.pair.number - 1,
            time_slot__weekday=time_slot.weekday,
            time_slot__is_even_week=time_slot.is_even_week
        ).filter(
            models.Q(lesson__teacher=teacher) |
            models.Q(lesson__groups__in=groups)
        ).distinct()

        for prev in previous_lessons:
            prev_building = prev.lesson.room.building
            current_building = lesson.room.building
            if prev_building != current_building:
                return False, "Недостаточно времени на переход между корпусами"

        return True, None

    # 7. Переход между корпусами — нужен запас в 30 минут
    def enough_travel_time(self, context) -> tuple[bool, str | None]:
        lesson = context["lesson"]
        time_slot = context["time_slot"]
        groups = lesson.groups.all()
        teacher = lesson.teacher
        current_pair = time_slot.pair

        previous_lessons = ScheduledLesson.objects.filter(
            time_slot__weekday=time_slot.weekday,
            time_slot__is_even_week=time_slot.is_even_week,
            time_slot__pair__number__lt=current_pair.number,
        ).filter(
            models.Q(lesson__teacher=teacher) |
            models.Q(lesson__groups__in=groups)
        ).distinct()

        for prev in previous_lessons:
            prev_end = prev.time_slot.pair.end_time
            curr_start = current_pair.start_time
            prev_building = prev.lesson.room.building
            curr_building = lesson.room.building

            if prev_building != curr_building:
                # Сравниваем как datetime.time объекты
                prev_dt = datetime.combine(datetime.today(), prev_end)
                curr_dt = datetime.combine(datetime.today(), curr_start)
                if (curr_dt - prev_dt) < timedelta(minutes=30):
                    return False, "Недостаточно времени на переход между корпусами"
        return True, None

