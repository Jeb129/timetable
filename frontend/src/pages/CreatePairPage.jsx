// src/pages/CreatePairPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function CreatePairPage() {
    const [number, setNumber] = useState('');
    const [buildingId, setBuildingId] = useState('');
    const [startTime, setStartTime] = useState(''); // Формат HH:MM
    const [endTime, setEndTime] = useState('');   // Формат HH:MM

    const [allBuildings, setAllBuildings] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const handleGoBack = () => navigate(-1);

    useEffect(() => {
        if (!token) { 
            setError("Токен не найден, не могу загрузить корпуса.");
            return; 
        }
        const fetchBuildings = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/list/building/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setAllBuildings(response.data || []);
            } catch (err) {
                console.error('Ошибка загрузки списка корпусов:', err.response?.data || err);
                setError('Не удалось загрузить список корпусов.');
            }
        };
        fetchBuildings();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!number || !buildingId || !startTime || !endTime) {
            setError('Все поля обязательны для заполнения.');
            return;
        }
        const pairData = {
            number: parseInt(number, 10),
            building: parseInt(buildingId, 10),
            start_time: startTime, // Django TimeField принимает строки 'HH:MM' или 'HH:MM:SS'
            end_time: endTime,
        };
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }
        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/pair/',
                pairData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Пара №${response.data.number} для корпуса ID ${response.data.building} (${response.data.start_time}-${response.data.end_time}) успешно создана!`);
            setNumber(''); setBuildingId(''); setStartTime(''); setEndTime('');
        } catch (err) {
            // Стандартная обработка ошибок axios
            let errorMessage = 'Ошибка создания пары.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create pair error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                    <h2>Добавление новой пары (расписание звонков)</h2>
                    <button onClick={handleGoBack} className="admin-form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="pair-building">Корпус:</label>
                        <select id="pair-building" value={buildingId} onChange={(e) => setBuildingId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите корпус --</option>
                            {allBuildings.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="pair-number">Номер пары (1, 2, ...):</label>
                        <input id="pair-number" type="number" min="1" value={number} onChange={(e) => setNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="pair-start-time">Время начала (ЧЧ:ММ):</label>
                        <input id="pair-start-time" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="pair-end-time">Время окончания (ЧЧ:ММ):</label>
                        <input id="pair-end-time" type="time" value={endTime} onChange={(e) => setEndTime(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить пару</button>
                </form>
            </div>
        </div>
    );
}
export default CreatePairPage;