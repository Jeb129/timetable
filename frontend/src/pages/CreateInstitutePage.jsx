// src/pages/CreateInstitutePage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // Общие стили

function CreateInstitutePage() {
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [primaryBuildingId, setPrimaryBuildingId] = useState('');
    const [buildings, setBuildings] = useState([]); // Для выпадающего списка корпусов
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    // Получение токена (предполагается, что у вас есть механизм для этого)
    // const token = localStorage.getItem('accessToken'); // Или sessionStorage

    useEffect(() => {
        // Загрузка списка корпусов для выбора primary_building
        const fetchBuildings = async () => {
            try {
                // const response = await fetch('/api/buildings/', { // Замените на ваш реальный эндпоинт для корпусов
                //     headers: {
                //         'Authorization': `Bearer ${token}` 
                //     }
                // });
                // if (!response.ok) throw new Error('Не удалось загрузить корпуса');
                // const data = await response.json();
                // setBuildings(data); 

                // --- МОКОВЫЕ ДАННЫЕ для корпусов, пока нет API ---
                setBuildings([
                    { id: 1, code: 'К1' },
                    { id: 2, code: 'К2 (лаб)' },
                    { id: 3, code: 'УЛК' },
                ]);
                // --- КОНЕЦ МОКОВЫХ ДАННЫХ ---

            } catch (err) {
                setError('Ошибка загрузки списка корпусов: ' + err.message);
            }
        };
        fetchBuildings();
    }, []); // Зависимость от token, если он используется

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!name || !shortName) {
            setError('Название и краткое название обязательны.');
            return;
        }
        
        const instituteData = {
            name,
            short_name: shortName,
        };
        if (primaryBuildingId) { // Отправляем ID, если выбран
            instituteData.primary_building = parseInt(primaryBuildingId, 10);
        } else {
            instituteData.primary_building = null; // Явно отправляем null, если не выбран
        }
        
        const token = localStorage.getItem('accessToken'); // Получаем токен перед запросом

        try {
            const response = await fetch('/api/institutes/', { // Убедитесь, что префикс /api/ соответствует core/urls.py
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`, // Если ваш API требует Bearer токен
                },
                body: JSON.stringify(instituteData),
            });

            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = responseData?.detail || responseData?.error || Object.values(responseData || {}).flat().join('; ') || `Ошибка: ${response.status}`;
                throw new Error(errorMessage);
            }

            setSuccess(`Институт "${responseData.name}" успешно создан!`);
            setName('');
            setShortName('');
            setPrimaryBuildingId('');
            // Можно добавить navigate('/admin/institutes-list') или что-то подобное
        } catch (err) {
            setError('Ошибка создания института: ' + err.message);
        }
    };

    return (
        <div className="admin-form-page-container"> {/* Используем общий стиль для админ-страниц */}
            <div className="admin-form-wrapper">
                <h2>Создание нового института</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="institute-name">Полное название:</label>
                        <input
                            id="institute-name"
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="institute-short-name">Краткое название (аббревиатура):</label>
                        <input
                            id="institute-short-name"
                            type="text"
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            required
                        />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="institute-primary-building">Основной корпус (необязательно):</label>
                        <select
                            id="institute-primary-building"
                            value={primaryBuildingId}
                            onChange={(e) => setPrimaryBuildingId(e.target.value)}
                            className="admin-form-select" // Добавьте стили для селекта
                        >
                            <option value="">-- Не выбран --</option>
                            {buildings.map(building => (
                                <option key={building.id} value={building.id}>
                                    {building.code}
                                </option>
                            ))}
                        </select>
                    </div>
                    <button type="submit" className="admin-form-submit-button">Создать институт</button>
                </form>
            </div>
        </div>
    );
}

export default CreateInstitutePage;