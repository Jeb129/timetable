// src/pages/CreateStudentGroupPage.jsx
import React, { useState, useEffect } from 'react';
 import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navigation from '../../../components/navigation/navigation';
import '../../Pages.css';
import '../../../assets/form.css'

function CreateStudentGroupPage() {
    const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
    const [directionId, setDirectionId] = useState(''); 
    const [formId, setFormId] = useState('');         
    const [levelId, setLevelId] = useState('');       
    const [groupNumber, setGroupNumber] = useState('');
    const [subgroupNumber, setSubgroupNumber] = useState('1'); 
    const [studentCount, setStudentCount] = useState('');
    const navigate = useNavigate(); // Инициализируем hook

    const handleGoBack = () => {
        navigate(-1); // Переход на предыдущую страницу в истории браузера
        // или navigate('/edit'); // Переход на конкретную страницу редактирования
    };

    // Состояния для хранения списков для ForeignKey (если будете делать <select>)
    // const [directions, setDirections] = useState([]);
    // const [forms, setForms] = useState([]);
    // const [levels, setLevels] = useState([]);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // const navigate = useNavigate();
    
    const token = localStorage.getItem('accessToken');

    // useEffect для загрузки списков для ForeignKey (направлений, форм, уровней)
    // useEffect(() => {
    //     if (!token) return;
    //     const fetchData = async () => {
    //         try {
    //             const [dirsRes, formsRes, levelsRes] = await Promise.all([
    //                 axios.get('http://localhost:8000/api/educationdirections/', { headers: { 'Authorization': `Bearer ${token}` } }),
    //                 axios.get('http://localhost:8000/api/educationforms/', { headers: { 'Authorization': `Bearer ${token}` } }),
    //                 axios.get('http://localhost:8000/api/educationlevels/', { headers: { 'Authorization': `Bearer ${token}` } })
    //             ]);
    //             setDirections(dirsRes.data || []);
    //             setForms(formsRes.data || []);
    //             setLevels(levelsRes.data || []);
    //         } catch (err) {
    //             console.error('Ошибка загрузки справочников для группы:', err.response?.data || err);
    //             setError('Не удалось загрузить справочники. Попробуйте обновить страницу.');
    //         }
    //     };
    //     fetchData();
    // }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!admissionYear || !directionId || !formId || !levelId || !groupNumber || !subgroupNumber || !studentCount) {
            setError('Все поля обязательны для заполнения.');
            return;
        }

        const groupData = {
            admission_year: parseInt(admissionYear, 10),
            direction: parseInt(directionId, 10), 
            form: parseInt(formId, 10),           
            level: parseInt(levelId, 10),         
            group_number: parseInt(groupNumber, 10),
            subgroup_number: parseInt(subgroupNumber, 10),
            student_count: parseInt(studentCount, 10),
        };
        
        if (!token) {
            setError('Ошибка: токен аутентификации не найден.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/studentgroup/',
                groupData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            
            setSuccess(`Учебная группа успешно создана! (ID: ${response.data.id})`);
            setAdmissionYear(new Date().getFullYear());
            setDirectionId(''); setFormId(''); setLevelId('');
            setGroupNumber(''); setSubgroupNumber('1'); setStudentCount('');
        } catch (err) {
            let errorMessage = 'Ошибка создания учебной группы.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create student group error:", err.response || err);
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
                <h2>Добавление новой учебной группы</h2>
                <button onClick={handleGoBack} className="form-back-button">
                        ← Назад 
                    </button>
                    </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="sg-admission-year">Год поступления:</label>
                        <input id="sg-admission-year" type="number" value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)} required />
                    </div>
                    {/* Поля для ForeignKey (пока текстовый ввод ID, потом можно заменить на select) */}
                    <div className="form-input-group">
                        <label htmlFor="sg-direction-id">ID Направления подготовки:</label>
                        <input id="sg-direction-id" type="number" placeholder="Введите ID" value={directionId} onChange={(e) => setDirectionId(e.target.value)} required />
                        {/* <select value={directionId} onChange={(e) => setDirectionId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите направление --</option>
                            {directions.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select> */}
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-form-id">ID Формы обучения:</label>
                        <input id="sg-form-id" type="number" placeholder="Введите ID" value={formId} onChange={(e) => setFormId(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-level-id">ID Уровня подготовки:</label>
                        <input id="sg-level-id" type="number" placeholder="Введите ID" value={levelId} onChange={(e) => setLevelId(e.target.value)} required />
                    </div>
                    {/* Остальные поля */}
                    <div className="form-input-group">
                        <label htmlFor="sg-group-number">Номер группы:</label>
                        <input id="sg-group-number" type="number" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-subgroup-number">Номер подгруппы:</label>
                        <input id="sg-subgroup-number" type="number" value={subgroupNumber} onChange={(e) => setSubgroupNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-student-count">Количество студентов:</label>
                        <input id="sg-student-count" type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} required />
                    </div>
                    <button type="submit" className="form-submit-button">Добавить группу</button>
                </form>
            </div>
        </div>
    );
}

export default CreateStudentGroupPage;