// src/pages/CreateBuildingPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../Pages.css';
import '../../../assets/form.css'
import Navigation from '../../../components/navigation/navigation';

function CreateBuildingPage() {
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Инициализируем hook

    const handleGoBack = () => {
        navigate(-1); // Переход на предыдущую страницу в истории браузера
        // или navigate('/edit'); // Переход на конкретную страницу редактирования
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!code.trim()) {
            setError('Код корпуса обязателен.');
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/building/',
                { code: code.trim() },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Корпус "${response.data.code}" успешно создан (ID: ${response.data.id})!`);
            setCode('');
        } catch (err) {
            // ... (обработка ошибок как в CreateTeacherPage) ...
            let errorMessage = 'Ошибка создания корпуса.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create building error:", err.response || err);
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
                <h2>Добавление нового корпуса</h2>
                    <button onClick={handleGoBack} className="form-back-button">
                        ← Назад 
                    </button>
                    </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="building-code">Код корпуса (например, К1, УЛК):</label>
                        <input id="building-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <button type="submit" className="form-submit-button">Добавить корпус</button>
                </form>
            </div>
        </div>
    );
}
export default CreateBuildingPage;