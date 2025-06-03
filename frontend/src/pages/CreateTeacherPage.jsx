// src/pages/CreateTeacherPage.jsx
import React, { useState, useEffect } from 'react';// <--- ДОБАВЛЕНА ТОЧКА С ЗАПЯТОЙ
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // Убедитесь, что путь к Pages.css правильный

function CreateTeacherPage() {
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate(); // Если нужно перенаправление после создания

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fullName.trim()) {
            setError('ФИО преподавателя обязательно для заполнения.');
            return;
        }

        const teacherData = {
            full_name: fullName.trim(),
        };
        
        const token = localStorage.getItem('accessToken'); // Или ваш способ получения токена

        try {
            const response = await fetch('/api/create/teacher/', { // Используем универсальный эндпоинт
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(teacherData),
            });

            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = responseData?.detail || responseData?.error || Object.values(responseData || {}).flat().join('; ') || `Ошибка: ${response.status}`;
                throw new Error(errorMessage);
            }

            setSuccess(`Преподаватель "${responseData.full_name}" успешно создан!`);
            setFullName(''); // Очищаем поле
            // navigate('/admin/teachers'); // Опциональное перенаправление
        } catch (err) {
            setError('Ошибка создания преподавателя: ' + err.message);
            console.error("Create teacher error:", err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <h2>Добавление нового преподавателя</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="teacher-full-name">ФИО преподавателя:</label>
                        <input
                            id="teacher-full-name"
                            type="text"
                            placeholder="Иванов Иван Иванович"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить преподавателя</button>
                </form>
            </div>
        </div>
    );
}

export default CreateTeacherPage;