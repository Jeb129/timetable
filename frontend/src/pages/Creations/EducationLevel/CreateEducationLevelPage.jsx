// src/pages/CreateEducationLevelPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Navigation from '../../../components/navigation/navigation';
import '../../Pages.css';
import '../../../assets/form.css'

function CreateEducationLevelPage() {
    const [name, setName] = useState('');
    const [shortCode, setShortCode] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const handleGoBack = () => navigate(-1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name.trim() || !shortCode.trim()) {
            setError('Все поля обязательны.'); return;
        }
        if (!token) { setError('Токен не найден.'); return; }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/educationlevel/',
                { name: name.trim(), short_code: shortCode.trim() },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Уровень подготовки "${response.data.name}" успешно создан!`);
            setName(''); setShortCode('');
        } catch (err) {
            // ... (стандартная обработка ошибок axios) ...
            let errorMessage = 'Ошибка создания уровня подготовки.';
            if (err.response && err.response.data) { /* ... */ } else if (err.request) { /* ... */ } else { /* ... */ }
            setError(errorMessage); console.error("Create EducationLevel error:", err.response || err);
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
                    <h2>Добавление уровня подготовки</h2>
                    <button onClick={handleGoBack} className="form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="el-name">Название (Бакалавриат, Магистратура):</label>
                        <input id="el-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="el-short-code">Краткий код (БАК, МАГ):</label>
                        <input id="el-short-code" type="text" value={shortCode} onChange={(e) => setShortCode(e.target.value)} required />
                    </div>
                    <button type="submit" className="form-submit-button">Добавить уровень</button>
                </form>
            </div>
        </div>
    );
}
export default CreateEducationLevelPage;