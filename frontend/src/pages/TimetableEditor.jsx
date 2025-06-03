import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import './Pages.css'; // Импорт CSS

export default function TimetableEditor() {
  const navigate = useNavigate();
  const [selectedFilter, setSelectedFilter] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  const filterOptions = [
    { value: 'group1_edit', label: 'Группа ИС-101 (ред.)' },
    { value: 'group2_edit', label: 'Группа ПД-202 (ред.)' },
    { value: 'teacher1_edit', label: 'Преподаватель: Иванов И.И. (ред.)' },
  ];

  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleCreateUser = () => navigate('/create-user');
  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    navigate('/');
  };

  const handleFilterChange = (event) => {
    setSelectedFilter(event.target.value);
    setIsEditing(false);
  };

  const handleStartEditing = () => {
    if (selectedFilter) {
      setIsEditing(true);
      console.log(`Запрос на редактирование расписания для: ${selectedFilter}`);
    } else {
      alert('Пожалуйста, выберите объект для редактирования.');
    }
  };

  return (
    <div className="timetable-editor-container">
      <div className="timetable-editor-header">
        <h1 className="timetable-editor-title">Редактирование расписания</h1>
        <div className="timetable-editor-controls">
          <button
            onClick={handleCreateUser}
            className="timetable-editor-button timetable-editor-create-user-button"
          >
            Создать пользователя
          </button>
          <button
            onClick={handleLogout}
            className="timetable-editor-button timetable-editor-logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="timetable-filter-section">
        <label htmlFor="edit-filter" className="timetable-filter-label">Редактировать для:</label>
        <select
          id="edit-filter"
          value={selectedFilter}
          onChange={handleFilterChange}
          className="timetable-filter-select"
        >
          <option value="">-- Выберите группу или преподавателя --</option>
          {filterOptions.map(opt => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
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