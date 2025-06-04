// src/pages/CreateDisciplinePage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/navigation/navigation';
import '../../Pages.css';
import '../../../assets/form.css'

function CreateDisciplinePage() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => navigate(-1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name.trim()) {
            setError('Название дисциплины обязательно.');
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/discipline/',
                { name: name.trim() },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Дисциплина "${response.data.name}" успешно создана (ID: ${response.data.id})!`);
            setName('');
        } catch (err) {
            // Стандартная обработка ошибок axios
            let errorMessage = 'Ошибка создания дисциплины.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create discipline error:", err.response || err);
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
                    <h2>Добавление новой дисциплины</h2>
                    <button onClick={handleGoBack} className="form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="discipline-name">Название дисциплины:</label>
                        <input id="discipline-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <button type="submit" className="form-submit-button">Добавить дисциплину</button>
                </form>
            </div>
        </div>
    );
}
export default CreateDisciplinePage;