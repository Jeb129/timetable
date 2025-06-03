// src/pages/CreateEducationDirectionPage.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './Pages.css';

function CreateEducationDirectionPage() {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [shortName, setShortName] = useState('');
    const [instituteId, setInstituteId] = useState('');
    
    const [institutes, setInstitutes] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();
    const token = localStorage.getItem('accessToken');

    const handleGoBack = () => navigate(-1);

    useEffect(() => {
        if (!token) { setError("Токен не найден. Невозможно загрузить институты."); return; }
        const fetchInstitutes = async () => {
            try {
                const response = await axios.get('http://localhost:8000/api/list/institute/', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                setInstitutes(response.data || []);
            } catch (err) {
                console.error('Ошибка загрузки институтов:', err.response?.data || err.message || err);
                setError('Не удалось загрузить список институтов.');
            }
        };
        fetchInstitutes();
    }, [token]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(''); setSuccess('');
        if (!code.trim() || !name.trim() || !shortName.trim() || !instituteId) {
            setError('Все поля обязательны для заполнения.'); return;
        }
        if (!token) { setError('Токен не найден.'); return; }
        
        const directionData = {
            code: code.trim(),
            name: name.trim(),
            short_name: shortName.trim(),
            institute: parseInt(instituteId, 10), // Отправляем ID института
        };

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/educationdirection/',
                directionData,
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            setSuccess(`Направление "${response.data.name}" успешно создано!`);
            setCode(''); setName(''); setShortName(''); setInstituteId('');
        } catch (err) {
            // ... (стандартная обработка ошибок axios) ...
            let errorMessage = 'Ошибка создания направления.';
            if (err.response && err.response.data) { /* ... */ } else if (err.request) { /* ... */ } else { /* ... */ }
            setError(errorMessage); console.error("Create EducationDirection error:", err.response || err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <div className="admin-form-header">
                    <h2>Добавление направления подготовки</h2>
                    <button onClick={handleGoBack} className="admin-form-back-button">← Назад</button>
                </div>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="ed-institute">Институт:</label>
                        <select id="ed-institute" value={instituteId} onChange={(e) => setInstituteId(e.target.value)} required className="admin-form-select">
                            <option value="">-- Выберите институт --</option>
                            {institutes.map(inst => <option key={inst.id} value={inst.id}>{inst.short_name || inst.name}</option>)}
                        </select>
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="ed-code">Код направления (09.03.02):</label>
                        <input id="ed-code" type="text" value={code} onChange={(e) => setCode(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="ed-name">Полное название:</label>
                        <input id="ed-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="ed-short-name">Краткое название (ИСиТ):</label>
                        <input id="ed-short-name" type="text" value={shortName} onChange={(e) => setShortName(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить направление</button>
                </form>
            </div>
        </div>
    );
}
export default CreateEducationDirectionPage;