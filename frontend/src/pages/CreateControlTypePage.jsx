// src/pages/CreateControlTypePage.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function CreateControlTypePage() {
    const [name, setName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleGoBack = () => navigate(-1);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!name.trim()) {
            setError('Название типа контроля обязательно.');
            return;
        }
        const token = localStorage.getItem('accessToken');
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/controltype/',
                { name: name.trim() },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Тип контроля "${response.data.name}" успешно создан!`);
            setName('');
        } catch (err) {
            // Стандартная обработка ошибок axios
            let errorMessage = 'Ошибка создания типа контроля.';
            if (err.response && err.response.data) { /* ... */ } // Скопируйте из другого файла
            else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create control type error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                    <h2>Добавление типа контроля</h2>
                    <button onClick={handleGoBack} className="admin-form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="controltype-name">Название типа (Экзамен, Зачет, Курсовая):</label>
                        <input id="controltype-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить тип контроля</button>
                </form>
            </div>
        </div>
    );
}
export default CreateControlTypePage;