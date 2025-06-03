// src/pages/TimetableEditor.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import './Pages.css';

export default function TimetableEditor() {
  const navigate = useNavigate();
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [allGroups, setAllGroups] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [currentWeekIsEven, setCurrentWeekIsEven] = useState(true);
  const [errorLoadingGroups, setErrorLoadingGroups] = useState(null);

  // Функции навигации
  const navigateToCreateInstitute = () => navigate('/admin/create-institute');
  const navigateToCreateTeacher = () => navigate('/admin/create-teacher');
  const navigateToCreateStudentGroup = () => navigate('/admin/create-studentgroup');
  const navigateToCreateBuilding = () => navigate('/admin/create-building');
  const navigateToCreateRoom = () => navigate('/admin/create-room');
  const navigateToCreateDiscipline = () => navigate('/admin/create-discipline');
  const navigateToCreateLessonType = () => navigate('/admin/create-lessontype');
  const navigateToCreatePair = () => navigate('/admin/create-pair');
  const navigateToCreateWeekday = () => navigate('/admin/create-weekday');
  const navigateToCreateControlType = () => navigate('/admin/create-controltype');
  const navigateToCreateEquipment = () => navigate('/admin/create-equipment');
  const navigateToCreateCurriculum = () => navigate('/admin/create-curriculum');
  const navigateToCreateEducationDirection = () => navigate('/admin/create-educationdirection');
  const navigateToCreateEducationForm = () => navigate('/admin/create-educationform');
  const navigateToCreateEducationLevel = () => navigate('/admin/create-educationlevel');

  // Загрузка списка групп
  useEffect(() => {
    console.log("TimetableEditor: Mounting, attempting to load groups.");
    const token = localStorage.getItem('accessToken');
    console.log("TimetableEditor: Token for groups:", token);
    if (!token) {
      setErrorLoadingGroups("Токен не найден для загрузки групп.");
      return;
    }
    axios.get('http://localhost:8000/api/list/studentgroup/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        console.log("TimetableEditor: Groups loaded:", response.data);
        setAllGroups(response.data || []);
        setErrorLoadingGroups(null);
    })
    .catch(error => {
        console.error("TimetableEditor: Ошибка загрузки списка групп:", error.response?.data || error.message || error);
        setErrorLoadingGroups("Не удалось загрузить список групп.");
        setAllGroups([]);
    });
  }, []); 

  // Проверка аутентификации
  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  const handleLogout = () => {
    sessionStorage.removeItem('auth');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    navigate('/'); 
  };

  const handleGroupFilterChange = (event) => {
    setSelectedGroupId(event.target.value);
    setIsEditing(false); 
  };

  const handleStartEditing = () => {
    if (selectedGroupId) {
      setIsEditing(true);
    } else {
      alert('Пожалуйста, выберите группу для редактирования расписания.');
    }
  };

  // Переключатель недели (если вы хотите, чтобы TimetableEditor управлял начальной неделей ScheduleGrid)
  const handleToggleWeekInEditor = () => {
      setCurrentWeekIsEven(prev => !prev);
  };

  console.log("TimetableEditor: Rendering. Selected Group ID:", selectedGroupId, "Is Editing:", isEditing);

  return (
    <div className="timetable-editor-container">
      <div className="timetable-editor-header">
        <h1 className="timetable-editor-title">Редактирование расписания</h1>
        <div className="timetable-editor-controls">
          <button
            onClick={handleLogout}
            className="timetable-editor-button timetable-editor-logout-button"
          >
            Выйти
          </button>
        </div>
      </div>

      <div className="admin-sections-wrapper">
        <div className="admin-actions-section">
          <h3 className="admin-actions-title">Основные справочники</h3>
          <div className="admin-actions-buttons">
            <button onClick={navigateToCreateBuilding} className="admin-action-button color-buildings">Добавить корпус</button>
            <button onClick={navigateToCreateRoom} className="admin-action-button color-rooms">Добавить аудиторию</button>
            <button onClick={navigateToCreateEquipment} className="admin-action-button color-equipment">Добавить оборудование</button>
            <button onClick={navigateToCreateTeacher} className="admin-action-button color-teachers">Добавить преподавателя</button>
          </div>
        </div>
        <div className="admin-actions-section">
          <h3 className="admin-actions-title">Учебный процесс</h3>
          <div className="admin-actions-buttons">
            <button onClick={navigateToCreateInstitute} className="admin-action-button color-institutes">Добавить институт</button>
            <button onClick={navigateToCreateEducationDirection} className="admin-action-button color-directions">Добавить направление</button>
            <button onClick={navigateToCreateEducationForm} className="admin-action-button color-eduforms">Добавить форму обучения</button>
            <button onClick={navigateToCreateEducationLevel} className="admin-action-button color-edulevels">Добавить уровень обучения</button>
            <button onClick={navigateToCreateStudentGroup} className="admin-action-button color-groups">Добавить учебную группу</button>
            <button onClick={navigateToCreateDiscipline} className="admin-action-button color-disciplines">Добавить дисциплину</button>
            <button onClick={navigateToCreateLessonType} className="admin-action-button color-lessontypes">Добавить вид занятия</button>
            <button onClick={navigateToCreateControlType} className="admin-action-button color-controltypes">Добавить тип контроля</button>
            <button onClick={navigateToCreateCurriculum} className="admin-action-button color-curriculum">Добавить в учебный план</button>
          </div>
        </div>
        <div className="admin-actions-section">
          <h3 className="admin-actions-title">Элементы расписания</h3>
          <div className="admin-actions-buttons">
            <button onClick={navigateToCreatePair} className="admin-action-button color-pairs">Добавить пару (звонок)</button>
            <button onClick={navigateToCreateWeekday} className="admin-action-button color-weekdays">Добавить день недели</button>
          </div>
        </div>
      </div>

      <div className="timetable-filter-section">
        <label htmlFor="group-edit-filter" className="timetable-filter-label">Выберите группу для редактирования:</label>
        <select
          id="group-edit-filter"
          value={selectedGroupId}
          onChange={handleGroupFilterChange}
          className="timetable-filter-select"
        >
          <option value="">-- Выберите группу --</option>
          {allGroups.length > 0 ? (
            allGroups.map(group => (
              <option key={group.id} value={group.id}>
                {`Группа ${group.group_number || 'N/A'} (Год: ${group.admission_year || 'N/A'}, ID: ${group.id})`}
              </option>
            ))
          ) : (<option value="" disabled>{errorLoadingGroups || "Загрузка групп..."}</option>)}
        </select>
        {/* Можно добавить кнопку для переключения недели здесь, если нужно */}
        <button onClick={handleToggleWeekInEditor} className="admin-action-button" style={{marginLeft: '10px'}}>
            Неделя: {currentWeekIsEven ? 'Чётная' : 'Нечётная'}
        </button>
        <button
          onClick={handleStartEditing}
          disabled={!selectedGroupId}
          className="timetable-action-button timetable-action-button-editor"
          style={{marginLeft: '10px'}}
        >
          Редактировать расписание группы
        </button>
      </div>

      {isEditing && selectedGroupId ? (
        <ScheduleGrid 
            key={`${selectedGroupId}-${currentWeekIsEven}`} 
            editable={true} 
            filterId={selectedGroupId} 
            initialIsEvenWeek={currentWeekIsEven} 
        />
      ) : ( 
        <p className="timetable-info-text">
          {selectedGroupId ? "Нажмите 'Редактировать расписание группы' для начала." : "Выберите группу из списка для просмотра или редактирования ее расписания."}
        </p> 
      )}
    </div>
  );
} 