// src/pages/TimetableEditor.js
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import './Pages.css';

export default function TimetableEditor() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // ... (filterOptions, useEffect, handleCreateUser (если он не для Django User), handleLogout, ...)

  // Функции навигации для новых кнопок
  const navigateToCreateInstitute = () => navigate('/admin/create-institute');
  const navigateToCreateTeacher = () => navigate('/admin/create-teacher');
  const navigateToCreateStudentGroup = () => navigate('/admin/create-studentgroup');
  // Старая функция handleCreateUser, возможно, теперь не нужна, если создание Django User будет отдельно
  const handleOldCreateUser = () => navigate('/create-user'); // Если это еще актуально для Django User


  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    localStorage.removeItem('accessToken'); // Также удаляем токен из localStorage
    localStorage.removeItem('refreshToken');
        // Вместо navigate('/login'), перенаправляем на главную страницу просмотра
    navigate('/');  // Перенаправляем на страницу входа
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    if (selectedFilter) {
      setIsEditing(true);
    } else {
      alert('Пожалуйста, выберите объект для редактирования.');
    }
  };


  return (
    <div className="timetable-editor-container">
      <div className="timetable-editor-header">
        <h1 className="timetable-editor-title">Редактирование расписания</h1>
        <div className="timetable-editor-controls">
          {/* Старая кнопка создания пользователя Django (если нужна) */}
          {/* <button
            onClick={handleOldCreateUser}
            className="timetable-editor-button timetable-editor-create-user-button"
          >
            Создать пользователя (Django)
          </button> */}
          <button
            onClick={handleLogout}
            className="timetable-editor-button timetable-editor-logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      {/* Секция с административными кнопками */}
      <div className="admin-actions-section">
        <h3 className="admin-actions-title">Управление справочниками:</h3>
        <div className="admin-actions-buttons">
            <button onClick={navigateToCreateInstitute} className="admin-action-button">
                Добавить институт
            </button>
            <button onClick={navigateToCreateTeacher} className="admin-action-button">
                Добавить преподавателя
            </button>
            <button onClick={navigateToCreateStudentGroup} className="admin-action-button">
                Добавить учебную группу
            </button>
            {/* Добавьте другие кнопки по аналогии */}
        </div>
      </div>


      <div className="timetable-filter-section">
        <label htmlFor="edit-filter" className="timetable-filter-label">Редактировать для (пока не используется):</label>
        <select
          id="edit-filter"
          value={selectedFilter}
          onChange={handleFilterChange}
          className="timetable-filter-select"
        >
          <option value="">-- Выберите группу или преподавателя --</option>
          {/* ... filterOptions ... */}
        </select>
        <button
          onClick={handleStartEditing}
          disabled={!selectedFilter}
          className="timetable-action-button timetable-action-button-editor"
        >
          Редактировать выбранное
        </button>
      </div>

      {isEditing && selectedFilter ? (
        <ScheduleGrid 
            editable={true} 
            filterId={selectedFilter}
        />
      ) : (
         <p className="timetable-info-text">
          {selectedFilter ? "Нажмите 'Редактировать выбранное' для начала." : "Выберите объект из списка для редактирования расписания."}
        </p>
      )}
    </div>
  );
}