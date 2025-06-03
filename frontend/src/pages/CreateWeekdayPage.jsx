// src/pages/CreateWeekdayPage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function CreateWeekdayPage() {
    const [number, setNumber] = useState('');
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => navigate(-1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!number || !name.trim() || !shortName.trim()) {
            setError('Все поля обязательны для заполнения.');
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }
        try {
            const weekdayData = {
                number: parseInt(number, 10),
                name: name.trim(),
                short_name: shortName.trim(),
            };
            const response = await axios.post(
                'http://localhost:8000/api/create/weekday/',
                weekdayData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`День недели "${response.data.name}" успешно создан!`);
            setNumber(''); setName(''); setShortName('');
        } catch (err) {
            let errorMessage = 'Ошибка создания дня недели.';
            // ... (стандартная обработка ошибок axios) ...
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create weekday error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                    <h2>Добавление дня недели</h2>
                    <button onClick={handleGoBack} className="admin-form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="weekday-number">Номер дня (1=Пн, ..., 7=Вс):</label>
                        <input id="weekday-number" type="number" min="1" max="7" value={number} onChange={(e) => setNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="weekday-name">Полное название (Понедельник):</label>
                        <input id="weekday-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="weekday-short-name">Краткое название (Пн):</label>
                        <input id="weekday-short-name" type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить день недели</button>
                </form>
            </div>
        </div>
    );
}
export default CreateWeekdayPage;