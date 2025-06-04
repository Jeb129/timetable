// src/components/CreateLessonModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Modal.css'; // Создадим этот CSS файл для стилей модального окна

function CreateLessonModal({ 
    isOpen, 
    onClose, 
    onSubmit, // Функция, которая будет вызвана с данными урока для создания
    currentGroupId, // ID текущей группы, для которой создается урок
    token 
}) {
    // Состояния для списков из справочников
    const [disciplines, setDisciplines] = useState([]);
    const [teachers, setTeachers] = useState([]);
    const [lessonTypes, setLessonTypes] = useState([]);
    const [rooms, setRooms] = useState([]);

    // Состояния для выбранных значений в форме
    const [selectedDiscipline, setSelectedDiscipline] = useState('');
    const [selectedTeacher, setSelectedTeacher] = useState('');
    const [selectedLessonType, setSelectedLessonType] = useState('');
    const [selectedRoom, setSelectedRoom] = useState('');
    // selectedGroups будет по умолчанию currentGroupId, но можно расширить для выбора нескольких
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Загрузка справочников при открытии модального окна
    useEffect(() => {
        if (isOpen && token) {
            setIsLoading(true);
            setError('');
            Promise.all([
                axios.get('http://localhost:8000/api/list/discipline/', { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/list/teacher/', { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/list/lessontype/', { headers: { 'Authorization': `Bearer ${token}` } }),
                axios.get('http://localhost:8000/api/list/room/', { headers: { 'Authorization': `Bearer ${token}` } }),
            ])
            .then(([disciplinesRes, teachersRes, lessonTypesRes, roomsRes]) => {
                setDisciplines(disciplinesRes.data || []);
                setTeachers(teachersRes.data || []);
                setLessonTypes(lessonTypesRes.data || []);
                setRooms(roomsRes.data || []);
            })
            .catch(err => {
                console.error("Ошибка загрузки справочников для модального окна:", err);
                setError("Не удалось загрузить справочники для создания урока.");
            })
            .finally(() => setIsLoading(false));
        }
    }, [isOpen, token]);

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (!selectedDiscipline || !selectedTeacher || !selectedLessonType || !selectedRoom) {
            setError("Все поля (кроме групп, если они по умолчанию) должны быть выбраны.");
            return;
        }
        const lessonData = {
            discipline: parseInt(selectedDiscipline),
            teacher: parseInt(selectedTeacher),
            lesson_type: parseInt(selectedLessonType),
            room: parseInt(selectedRoom),
            groups: [currentGroupId] // По умолчанию добавляем к текущей редактируемой группе
        };
        onSubmit(lessonData); // Передаем данные в ScheduleGrid для отправки на бэкенд
    };

    if (!isOpen) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h3>Создать новое занятие</h3>
                {isLoading && <p>Загрузка справочников...</p>}
                {error && <p className="error-message">{error}</p>}
                {!isLoading && !error && (
                    <form onSubmit={handleSubmitForm}>
                        <div className="form-input-group">
                            <label htmlFor="discipline">Дисциплина:</label>
                            <select id="discipline" value={selectedDiscipline} onChange={e => setSelectedDiscipline(e.target.value)} required className="admin-form-select">
                                <option value="">-- Выберите дисциплину --</option>
                                {disciplines.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                            </select>
                        </div>
                        <div className="form-input-group">
                            <label htmlFor="teacher">Преподаватель:</label>
                            <select id="teacher" value={selectedTeacher} onChange={e => setSelectedTeacher(e.target.value)} required className="admin-form-select">
                                <option value="">-- Выберите преподавателя --</option>
                                {teachers.map(t => <option key={t.id} value={t.id}>{t.full_name}</option>)}
                            </select>
                        </div>
                        <div className="form-input-group">
                            <label htmlFor="lesson_type">Тип занятия:</label>
                            <select id="lesson_type" value={selectedLessonType} onChange={e => setSelectedLessonType(e.target.value)} required className="admin-form-select">
                                <option value="">-- Выберите тип занятия --</option>
                                {lessonTypes.map(lt => <option key={lt.id} value={lt.id}>{lt.name}</option>)}
                            </select>
                        </div>
                        <div className="form-input-group">
                            <label htmlFor="room">Аудитория:</label>
                            <select id="room" value={selectedRoom} onChange={e => setSelectedRoom(e.target.value)} required className="admin-form-select">
                                <option value="">-- Выберите аудиторию --</option>
                                {rooms.map(r => <option key={r.id} value={r.id}>{r.number} (к.{r.building_code || r.building})</option>)} 
                                {/* Предполагаем, что RoomShortSerializer возвращает building_code или RoomSerializer возвращает building (ID) */}
                            </select>
                        </div>
                        <div className="modal-actions">
                            <button type="submit" className="admin-form-submit-button">Создать</button>
                            <button type="button" onClick={onClose} className="admin-form-back-button">Отмена</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}

export default CreateLessonModal;