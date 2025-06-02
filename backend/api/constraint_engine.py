from .models import Constraint

class ConstraintEngine:
    def __init__(self, constraints=None):
        if constraints is None:
            constraints = Constraint.objects.all()
        self.constraints = constraints

    def evaluate(self, context) -> dict:
        """
        context: dict с нужными объектами (занятие, преподаватель, группа и т.д.)
        Возвращает: словарь вида { 'constraint_name': { 'passed': True/False, 'weight': N } }
        """
        results = {}
        for constraint in self.constraints:
            method = getattr(self, constraint.method_name, None)
            if not method:
                continue  # метод не найден — пропускаем
            passed = method(context)
            results[constraint.name] = {
                "passed": passed,
                "weight": constraint.weight
            }
        return results
