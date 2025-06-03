// src/pages/CreateRoomPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Pages.css';

function CreateRoomPage() {
    const [buildingId, setBuildingId] = useState('');
    const [number, setNumber] = useState('');
    const [capacity, setCapacity] = useState('');
    const [selectedEquipmentIds, setSelectedEquipmentIds] = useState([]); // Массив ID выбранного оборудования

    const [allBuildings, setAllBuildings] = useState([]); // Для <select> корпусов
    const [allEquipment, setAllEquipment] = useState([]); // Для выбора оборудования (например, чекбоксы)

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const token = localStorage.getItem('accessToken');
    const navigate = useNavigate(); // Инициализируем hook

    const handleGoBack = () => {
        navigate(-1); // Переход на предыдущую страницу в истории браузера
        // или navigate('/edit'); // Переход на конкретную страницу редактирования
    };

    useEffect(() => {
        if (!token) return;
        const fetchData = async () => {
             try {
            const [buildingsRes, equipmentRes] = await Promise.all([
                axios.get('http://localhost:8000/api/list/building/', { headers: { 'Authorization': `Bearer ${token}` } }),
                // 'equipment' уже правильный (единственное число)
                axios.get('http://localhost:8000/api/list/equipment/', { headers: { 'Authorization': `Bearer ${token}` } })
            ]);
            setAllBuildings(buildingsRes.data || []);
            setAllEquipment(equipmentRes.data || []);
        } catch (err) {
                console.error('Ошибка загрузки справочников для аудитории:', err.response?.data || err);
                setError('Не удалось загрузить справочники (корпуса/оборудование).');
            }
        };
        fetchData();
    }, [token]);

    const handleEquipmentChange = (equipmentId) => {
        setSelectedEquipmentIds(prevIds =>
            prevIds.includes(equipmentId)
                ? prevIds.filter(id => id !== equipmentId)
                : [...prevIds, equipmentId]
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!buildingId || !number.trim() || !capacity) {
            setError('Корпус, номер аудитории и вместимость обязательны.');
            return;
        }
        if (!token) {
            setError('Токен аутентификации не найден.');
            return;
        }

        const roomData = {
            building: parseInt(buildingId, 10),
            number: number.trim(),
            capacity: parseInt(capacity, 10),
            equipment: selectedEquipmentIds, // Отправляем массив ID
        };

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/room/',
                roomData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Аудитория "${response.data.number}" в корпусе ID ${response.data.building} успешно создана!`);
            setBuildingId(''); setNumber(''); setCapacity(''); setSelectedEquipmentIds([]);
        } catch (err) {
            // ... (обработка ошибок как в CreateTeacherPage) ...
            let errorMessage = 'Ошибка создания аудитории.';
            if (err.response && err.response.data) {
                const serverError = err.response.data;
                if (serverError.error) errorMessage = serverError.error;
                else if (serverError.detail) errorMessage = serverError.detail;
                else errorMessage = Object.entries(serverError).map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`).join('; ');
            } else if (err.request) errorMessage = 'Сервер не ответил.';
            else errorMessage = err.message;
            setError(errorMessage);
            console.error("Create room error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                <h2>Добавление новой аудитории</h2>
                <button onClick={handleGoBack} className="admin-form-back-button">
                        ← Назад 
                    </button>
                    </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="room-building">Корпус:</label>
                        <select id="room-building" value={buildingId} onChange={(e) => setBuildingId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите корпус --</option>
                            {allBuildings.map(b => <option key={b.id} value={b.id}>{b.code}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="room-number">Номер аудитории:</label>
                        <input id="room-number" type="text" value={number} onChange={(e) => setNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="room-capacity">Вместимость:</label>
                        <input id="room-capacity" type="number" value={capacity} onChange={(e) => setCapacity(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label>Оборудование (можно выбрать несколько):</label>
                        <div className="checkbox-group"> {/* Добавьте стили для .checkbox-group */}
                            {allEquipment.map(eq => (
                                <div key={eq.id} className="checkbox-item">
                                    <input
                                        type="checkbox"
                                        id={`eq-${eq.id}`}
                                        value={eq.id}
                                        checked={selectedEquipmentIds.includes(eq.id)}
                                        onChange={() => handleEquipmentChange(eq.id)}
                                    />
                                    <label htmlFor={`eq-${eq.id}`}>{eq.name}</label>
                                </div>
                            ))}
                        </div>
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить аудиторию</button>
                </form>
            </div>
        </div>
    );
}
export default CreateRoomPage;