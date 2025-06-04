// src/pages/CreateCurriculumPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/navigation/navigation';
import '../../Pages.css';
import '../../../assets/form.css'

function CreateCurriculumPage() {
    const [groupId, setGroupId] = useState('');
    const [disciplineId, setDisciplineId] = useState('');
    const [teacherId, setTeacherId] = useState('');
    const [lessonTypeId, setLessonTypeId] = useState('');
    const [hours, setHours] = useState('');
    const [controlTypeId, setControlTypeId] = useState(''); // Может быть null

    // Состояния для хранения списков из API
    const [studentGroups, setStudentGroups] = useState([]);
    const [disciplines, setDisciplines] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [lessonTypes, setLessonTypes] = useState([]);
    const [controlTypes, setControlTypes] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const handleGoBack = () => navigate(-1);

    useEffect(() => {
        if (!token) {
            setError("Токен не найден. Невозможно загрузить справочники.");
            return;
        }
        const fetchData = async () => {
            try {
                // Параллельная загрузка всех необходимых справочников
                const [
                    groupsRes, 
                    disciplinesRes, 
                    teachersRes, 
                    lessonTypesRes, 
                    controlTypesRes
                ] = await Promise.all([
                    axios.get('http://localhost:8000/api/list/studentgroup/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/discipline/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/teacher/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/lessontype/', { headers: { 'Authorization': `Bearer ${token}` } }),
                    axios.get('http://localhost:8000/api/list/controltype/', { headers: { 'Authorization': `Bearer ${token}` } })
                ]);
                setStudentGroups(groupsRes.data || []);
                setDisciplines(disciplinesRes.data || []);
                setTeachers(teachersRes.data || []);
                setLessonTypes(lessonTypesRes.data || []);
                setControlTypes(controlTypesRes.data || []);
            } catch (err) {
                console.error('Ошибка загрузки справочников для учебного плана:', err.response?.data || err.message || err);
                setError('Не удалось загрузить один или несколько справочников. Проверьте консоль.');
            }
        };
        fetchData();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!groupId || !disciplineId || !teacherId || !lessonTypeId || !hours) {
            setError('Поля: Группа, Дисциплина, Преподаватель, Вид занятия и Часы - обязательны.');
            return;
        }
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }

        const curriculumData = {
            group: parseInt(groupId, 10),
            discipline: parseInt(disciplineId, 10),
            teacher: parseInt(teacherId, 10),
            lesson_type: parseInt(lessonTypeId, 10),
            hours: parseInt(hours, 10),
            control_type: controlTypeId ? parseInt(controlTypeId, 10) : null, // null, если не выбрано
        };

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/curriculum/',
                curriculumData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Запись в учебный план (ID: ${response.data.id}) успешно создана!`);
            // Очистка формы
            setGroupId(''); setDisciplineId(''); setTeacherId(''); 
            setLessonTypeId(''); setHours(''); setControlTypeId('');
        } catch (err) {
            let errorMessage = 'Ошибка создания записи в учебном плане.';
            // ... (стандартная обработка ошибок axios, скопируйте из других форм) ...
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create curriculum error:", err.response || err);
        }
    };

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
            ]} />
            <div className="form-container">
                <div className="form-header">
                    <h2>Добавление записи в учебный план</h2>
                    <button onClick={handleGoBack} className="form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="curr-group">Учебная группа:</label>
                        <select id="curr-group" value={groupId} onChange={(e) => setGroupId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите группу --</option>
                            {studentGroups.map(g => <option key={g.id} value={g.id}>{g.admission_year}-{g.direction_details?.short_name || g.direction}-{g.group_number}.{g.subgroup_number}</option>)}
                            {/* Примечание: g.direction_details?.short_name - это если ваш API для групп возвращает детали направления */}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="curr-discipline">Дисциплина:</label>
                        <select id="curr-discipline" value={disciplineId} onChange={(e) => setDisciplineId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите дисциплину --</option>
                            {disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="curr-teacher">Преподаватель:</label>
                        <select id="curr-teacher" value={teacherId} onChange={(e) => setTeacherId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите преподавателя --</option>
                            {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="curr-lessontype">Вид занятия:</label>
                        <select id="curr-lessontype" value={lessonTypeId} onChange={(e) => setLessonTypeId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите вид занятия --</option>
                            {lessonTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="curr-hours">Количество часов:</label>
                        <input id="curr-hours" type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="curr-controltype">Тип контроля (необязательно):</label>
                        <select id="curr-controltype" value={controlTypeId} onChange={(e) => setControlTypeId(e.target.value)} className="admin-form-select">
                            <option value="">-- Не выбран --</option>
                            {controlTypes.map(ct => <option key={ct.id} value={ct.id}>{ct.name}</option>)}
                        </select>
                    </div>
                    <button type="submit" className="form-submit-button">Добавить в учебный план</button>
                </form>
            </div>
        </div>
    );
}
export default CreateCurriculumPage;