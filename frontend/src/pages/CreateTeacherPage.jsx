// src/pages/CreateTeacherPage.jsx
import React, { useState } from 'react'; // Убедитесь, что useEffect не нужен здесь, если нет других сайд-эффектов
// import { useNavigate } from 'react-router-dom'; // Раскомментируйте, если нужно перенаправление
import axios from 'axios'; // Импортируем axios
import './Pages.css'; // Убедитесь, что путь к Pages.css правильный

function CreateTeacherPage() {
    const [fullName, setFullName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!fullName.trim()) {
            setError('ФИО преподавателя обязательно для заполнения.');
            return;
        }

        const teacherData = {
            full_name: fullName.trim(), // Поле должно точно совпадать с полем модели/сериализатора
        };
        
        const token = localStorage.getItem('accessToken'); 

        if (!token) {
            setError('Ошибка: токен аутентификации не найден. Пожалуйста, войдите в систему.');
            // Можно добавить navigate('/login');
            return;
        }

        try {
            const response = await axios.post(
                'http://localhost:8000/api/create/teacher/', // Полный URL к вашему API
                teacherData, // Данные для отправки
                {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    },
                }
            );

            // axios по умолчанию выбрасывает ошибку для статусов 4xx/5xx, 
            // поэтому мы попадем в catch, если !response.ok (в терминах fetch)
            
            setSuccess(`Преподаватель "${response.data.full_name}" успешно создан! (ID: ${response.data.id})`);
            setFullName(''); 
        } catch (err) {
            let errorMessage = 'Ошибка создания преподавателя.';
            if (err.response && err.response.data) {
                // Пытаемся получить сообщение об ошибке от сервера
                const serverError = err.response.data;
                if (typeof serverError === 'string') {
                    errorMessage = serverError;
                } else if (serverError.error) {
                    errorMessage = serverError.error;
                } else if (serverError.detail) {
                    errorMessage = serverError.detail;
                } else {
                    // Если это ошибки валидации DRF (словарь field: [errors])
                    errorMessage = Object.entries(serverError)
                        .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
                        .join('; ');
                }
            } else if (err.request) {
                errorMessage = 'Сервер не ответил. Проверьте подключение и доступность сервера.';
            } else {
                errorMessage = err.message;
            }
            setError(errorMessage);
            console.error("Create teacher error:", err.response || err);
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