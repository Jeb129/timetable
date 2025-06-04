import Navigation from '../../components/navigation/navigation';
import '../Pages.css';
import '../../assets/form.css'

function CreateDefaultPage() {
    return (
        <div className="page-container">
            <Navigation links={[
                ['/create-user', 'Создание пользователя'],
                ['/admin/create-building', 'Создание корпуса'],
                ['/admin/create-room', 'Создание аудитории'],
                ['/admin/create-institute', 'Создание института'],
                ['/admin/create-teacher', 'Создание преподавателя'],
                ['/admin/create-studentgroup', 'Создание группы'],
                ['/admin/create-discipline', 'Создание дисциплины'],
                ['/admin/create-lessontype', 'Создание типа занятия'],
                ['/admin/create-pair', 'Создание пары'],
                ['/admin/create-weekday', 'Создание дня недели'],
                ['/admin/create-controltype', 'Создание формы контроля'],
                ['/admin/create-equipment', 'Создание оборудования'],
                ['/admin/create-curriculum', 'Создание учебного плана'],
                ['/admin/create-educationdirection', 'Создание направления подготовки'],
                ['/admin/create-educationform', 'Создание формы обучения'],
                ['/admin/create-educationlevel', 'Создание уровня образования'],
                ["/admin/create-timeslot", 'Создать слот расписания'],
                ["/admin/create-teacher-time-preference/",'Ввести предпочтение по времени'],
                ["/admin/create-teacher-room-preference/",'Ввести предпочтение по аудитории'],
            ]} />
            <div className="page-container">Выберите справочник</div>
        </div>
    );
}
export default CreateDefaultPage;