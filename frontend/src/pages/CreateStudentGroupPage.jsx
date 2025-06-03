// src/pages/CreateStudentGroupPage.jsx
import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom'; // Если нужно
import './Pages.css';

function CreateStudentGroupPage() {
    const [admissionYear, setAdmissionYear] = useState(new Date().getFullYear());
    const [directionId, setDirectionId] = useState(''); // Будем вводить ID
    const [formId, setFormId] = useState('');         // Будем вводить ID
    const [levelId, setLevelId] = useState('');       // Будем вводить ID
    const [groupNumber, setGroupNumber] = useState('');
    const [subgroupNumber, setSubgroupNumber] = useState('1'); // Часто по умолчанию 1
    const [studentCount, setStudentCount] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    // const navigate = useNavigate();

    // TODO: В идеале, загрузить списки Direction, Form, Level для <select>
    // useEffect(() => {
    //   // fetchDirections().then(setDirections);
    //   // fetchForms().then(setForms);
    //   // fetchLevels().then(setLevels);
    // }, []);


    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!admissionYear || !directionId || !formId || !levelId || !groupNumber || !subgroupNumber || !studentCount) {
            setError('Все поля обязательны для заполнения.');
            return;
        }

        const groupData = {
            admission_year: parseInt(admissionYear, 10),
            direction: parseInt(directionId, 10), // Отправляем ID
            form: parseInt(formId, 10),           // Отправляем ID
            level: parseInt(levelId, 10),         // Отправляем ID
            group_number: parseInt(groupNumber, 10),
            subgroup_number: parseInt(subgroupNumber, 10),
            student_count: parseInt(studentCount, 10),
        };
        
        const token = localStorage.getItem('accessToken');

        try {
            const response = await fetch('/api/create/studentgroup/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify(groupData),
            });

            const responseData = await response.json().catch(() => null);

            if (!response.ok) {
                const errorMessage = responseData?.detail || responseData?.error || Object.values(responseData || {}).flat().join('; ') || `Ошибка: ${response.status}`;
                throw new Error(errorMessage);
            }
            
            // В ответе от UniversalCreateView будет сериализованный объект группы
            setSuccess(`Учебная группа успешно создана! (ID: ${responseData.id})`);
            // Очистка полей
            setAdmissionYear(new Date().getFullYear());
            setDirectionId('');
            setFormId('');
            setLevelId('');
            setGroupNumber('');
            setSubgroupNumber('1');
            setStudentCount('');

        } catch (err) {
            setError('Ошибка создания учебной группы: ' + err.message);
            console.error("Create student group error:", err);
        }
    };

    return (
        <div className="admin-form-page-container">
            <div className="admin-form-wrapper">
                <h2>Добавление новой учебной группы</h2>
                {error && <p className="error-message">{error}</p>}
                {success && <p className="success-message">{success}</p>}
                <form onSubmit={handleSubmit}>
                    <div className="form-input-group">
                        <label htmlFor="sg-admission-year">Год поступления:</label>
                        <input id="sg-admission-year" type="number" value={admissionYear} onChange={(e) => setAdmissionYear(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-direction-id">ID Направления подготовки:</label>
                        <input id="sg-direction-id" type="number" placeholder="Введите ID из справочника" value={directionId} onChange={(e) => setDirectionId(e.target.value)} required />
                        {/* TODO: Заменить на <select> с загрузкой данных */}
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-form-id">ID Формы обучения:</label>
                        <input id="sg-form-id" type="number" placeholder="Введите ID из справочника" value={formId} onChange={(e) => setFormId(e.target.value)} required />
                        {/* TODO: Заменить на <select> с загрузкой данных */}
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-level-id">ID Уровня подготовки:</label>
                        <input id="sg-level-id" type="number" placeholder="Введите ID из справочника" value={levelId} onChange={(e) => setLevelId(e.target.value)} required />
                        {/* TODO: Заменить на <select> с загрузкой данных */}
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-group-number">Номер группы:</label>
                        <input id="sg-group-number" type="number" value={groupNumber} onChange={(e) => setGroupNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-subgroup-number">Номер подгруппы:</label>
                        <input id="sg-subgroup-number" type="number" value={subgroupNumber} onChange={(e) => setSubgroupNumber(e.target.value)} required />
                    </div>
                    <div className="form-input-group">
                        <label htmlFor="sg-student-count">Количество студентов:</label>
                        <input id="sg-student-count" type="number" value={studentCount} onChange={(e) => setStudentCount(e.target.value)} required />
                    </div>
                    <button type="submit" className="admin-form-submit-button">Добавить группу</button>
                </form>
            </div>
        </div>
    );
}

export default CreateStudentGroupPage;