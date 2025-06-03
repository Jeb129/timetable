// src/pages/CreateInstitutePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css'; 

function CreateInstitutePage() {
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [primaryBuildingId, setPrimaryBuildingId] = useState('');
    const [buildings, setBuildings] = useState([]); 
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Инициализируем hook

    const handleGoBack = () => {
        navigate(-1); // Переход на предыдущую страницу в истории браузера
        // или navigate('/edit'); // Переход на конкретную страницу редактирования
    };
    
    const token = localStorage.getItem('accessToken'); // Получаем токен один раз

    useEffect(() => {
        const fetchBuildings = async () => {
            if (!token) return; // Не делаем запрос, если нет токена

            try {
                // Предполагаем, что у вас есть эндпоинт /api/buildings/ для получения списка зданий
                const response = await axios.get('http://localhost:8000/api/buildings/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setBuildings(response.data || []); // DRF обычно возвращает массив в data
            } catch (err) {
                console.error('Ошибка загрузки списка корпусов:', err.response?.data || err);
                setError('Не удалось загрузить список корпусов. Попробуйте обновить страницу.');
                // Для простоты можно оставить моковые данные, если API еще нет
                // setBuildings([ { id: 1, code: 'К1' }, { id: 2, code: 'К2' }]);
            }
        };
        fetchBuildings();
    }, [token]); // Перезагружаем, если токен изменился (хотя обычно он не меняется без перезагрузки страницы)

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !shortName) {
            setError('Название и краткое название обязательны.');
            return;
        }
        
        const instituteData = {
            name: name.trim(),
            short_name: shortName.trim(),
            // Если primaryBuildingId не пустой, преобразуем в число, иначе null
            primary_building: primaryBuildingId ? parseInt(primaryBuildingId, 10) : null,
        };
        
        if (!token) {
            setError('Ошибка: токен аутентификации не найден.');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/institute/',
                instituteData,
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );
            
            setSuccess(`Институт "${response.data.name}" успешно создан! (ID: ${response.data.id})`);
            setName('');
            setShortName('');
            setPrimaryBuildingId('');
        } catch (err) {
            let errorMessage = 'Ошибка создания института.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create institute error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                <h2>Создание нового института</h2>
                <button onClick={handleGoBack} className="admin-form-back-button">
                        ← Назад 
                    </button>
                    </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="institute-name">Полное название:</label>
                        <input id="institute-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="institute-short-name">Краткое название:</label>
                        <input id="institute-short-name" type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="institute-primary-building">Основной корпус (ID):</label>
                        <select
                            id="institute-primary-building"
                            value={primaryBuildingId}
                            onChange={(e) => setPrimaryBuildingId(e.target.value)}
                            className="admin-form-select"
                        >
                            <option value="">-- Не выбран --</option>
                            {buildings.length > 0 ? (
                                buildings.map(building => (
                                    <option key={building.id} value={building.id}>
                                        {building.code} (ID: {building.id})
                                    </option>
                                ))
                            ) : (
                                <option value="" disabled>Загрузка корпусов...</option>
                            )}
                        </select>
                        {/* Или, если пока нет API для корпусов, просто текстовое поле для ID:
                        <input 
                            id="institute-primary-building" 
                            type="number" 
                            placeholder="Введите ID корпуса (необязательно)" 
                            value={primaryBuildingId} 
                            onChange={(e) => setPrimaryBuildingId(e.target.value)} 
                        />
                        */}
                    </div>
                    <button type="submit" className="admin-form-submit-button">Создать институт</button>
                </form>
            </div>
        </div>
    );
}

export default CreateInstitutePage;