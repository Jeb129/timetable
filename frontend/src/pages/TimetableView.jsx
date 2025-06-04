// TimetableView.js
import React, { useState, useEffect, useRef } from 'react'; // Добавили useRef
import { useNavigate } from 'react-router-dom';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import Navigation from '../components/navigation/navigation';
import './Pages.css';

// --- МОКОВЫЕ ДАННЫЕ (позже будут с бэкенда) ---
const allGroups = [
  { id: 'group1', name: 'ИС-101' },
  { id: 'group2', name: 'ИС-102 (веч)' },
  { id: 'group3', name: 'ПД-202' },
  { id: 'group4', name: 'ЭУ-305' },
  { id: 'group5', name: 'ПИ-111' },
];

const allTeachers = [
  { id: 'teacher1', name: 'Иванов И.И.' },
  { id: 'teacher2', name: 'Петрова М.А.' },
  { id: 'teacher3', name: 'Сидоров С.С.' },
  { id: 'teacher4', name: 'Кузнецова Е.П.' },
];
// --- КОНЕЦ МОКОВЫХ ДАННЫХ ---

export default function TimetableView() {
  const navigate = useNavigate();
  
  // Состояния для фильтра по группам
  const [groupSearchText, setGroupSearchText] = useState('');
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [showGroupSuggestions, setShowGroupSuggestions] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState(null); // Храним выбранную группу (объект)

  // Состояния для фильтра по преподавателям (аналогично)
  const [teacherSearchText, setTeacherSearchText] = useState('');
  const [filteredTeachers, setFilteredTeachers] = useState([]);
  const [showTeacherSuggestions, setShowTeacherSuggestions] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState(null);

  const [showSchedule, setShowSchedule] = useState(false);
  
  const groupInputRef = useRef(null); // Для закрытия списка при клике вне
  const teacherInputRef = useRef(null);

  // Загрузка всех групп и преподавателей (симуляция)
  // useEffect(() => {
  //   // fetch('/api/groups').then(res => res.json()).then(data => setAllGroups(data));
  //   // fetch('/api/teachers').then(res => res.json()).then(data => setAllTeachers(data));
  // }, []);

  // Обработчик клика вне поля для закрытия подсказок
  useEffect(() => {
    function handleClickOutside(event) {
      if (groupInputRef.current && !groupInputRef.current.contains(event.target)) {
        setShowGroupSuggestions(false);
      }
      if (teacherInputRef.current && !teacherInputRef.current.contains(event.target)) {
        setShowTeacherSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);


  const handleGroupInputChange = (event) => {
    const query = event.target.value;
    setGroupSearchText(query);
    setSelectedGroup(null); // Сбрасываем выбор, если текст меняется
    setShowSchedule(false); // Скрываем расписание при новом поиске
    if (query.length > 0) {
      const suggestions = allGroups.filter(group =>
        group.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredGroups(suggestions);
      setShowGroupSuggestions(true);
    } else {
      setFilteredGroups([]);
      setShowGroupSuggestions(false);
    }
  };

  const handleGroupSuggestionClick = (group) => {
    setSelectedGroup(group);
    setGroupSearchText(group.name); // Заполняем инпут выбранным значением
    setShowGroupSuggestions(false);
    // Очищаем поле преподавателя, если была выбрана группа
    setTeacherSearchText('');
    setSelectedTeacher(null);
  };

  const handleTeacherInputChange = (event) => {
    const query = event.target.value;
    setTeacherSearchText(query);
    setSelectedTeacher(null);
    setShowSchedule(false);
    if (query.length > 0) {
      const suggestions = allTeachers.filter(teacher =>
        teacher.name.toLowerCase().includes(query.toLowerCase())
      );
      setFilteredTeachers(suggestions);
      setShowTeacherSuggestions(true);
    } else {
      setFilteredTeachers([]);
      setShowTeacherSuggestions(false);
    }
  };

  const handleTeacherSuggestionClick = (teacher) => {
    setSelectedTeacher(teacher);
    setTeacherSearchText(teacher.name);
    setShowTeacherSuggestions(false);
    // Очищаем поле группы, если был выбран преподаватель
    setGroupSearchText('');
    setSelectedGroup(null);
  };


  const handleShowSchedule = () => {
    if (selectedGroup || selectedTeacher) {
      setShowSchedule(true);
      const filterTarget = selectedGroup ? `группы ${selectedGroup.name}` : `преподавателя ${selectedTeacher.name}`;
      console.log(`Запрос на показ расписания для: ${filterTarget}`);
    } else {
      alert('Пожалуйста, выберите группу или преподавателя из списка.');
    }
  };
  
  //const isAuthenticated = sessionStorage.getItem('auth') === 'true';

  return (
    <div className="timetable-view-container">
      <div className="timetable-view-header">
        <h1 className="timetable-view-title">Просмотр расписания</h1>
        {/* Убираем условие !isAuthenticated */}
        <button
          onClick={() => navigate('/login')}
          className="timetable-view-login-button"
        >
          Войти
        </button>
      </div>

      <div className="timetable-filter-section timetable-filter-section-inputs">
        {/* Фильтр по группе */}
        <div className="autocomplete-wrapper" ref={groupInputRef}>
          <label htmlFor="group-search" className="timetable-filter-label">Поиск по группе:</label>
          <input
            id="group-search"
            type="text"
            className="timetable-filter-input"
            placeholder="Начните вводить название группы..."
            value={groupSearchText}
            onChange={handleGroupInputChange}
            onFocus={() => groupSearchText.length > 0 && setFilteredGroups(allGroups.filter(g => g.name.toLowerCase().includes(groupSearchText.toLowerCase()))) && setShowGroupSuggestions(true)}
            autoComplete="off"
          />
          {showGroupSuggestions && filteredGroups.length > 0 && (
            <ul className="autocomplete-suggestions">
              {filteredGroups.map(group => (
                <li key={group.id} onClick={() => handleGroupSuggestionClick(group)}>
                  {group.name}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Фильтр по преподавателю */}
        <div className="autocomplete-wrapper" ref={teacherInputRef}>
          <label htmlFor="teacher-search" className="timetable-filter-label">Поиск по преподавателю:</label>
          <input
            id="teacher-search"
            type="text"
            className="timetable-filter-input"
            placeholder="Начните вводить ФИО преподавателя..."
            value={teacherSearchText}
            onChange={handleTeacherInputChange}
            onFocus={() => teacherSearchText.length > 0 && setFilteredTeachers(allTeachers.filter(t => t.name.toLowerCase().includes(teacherSearchText.toLowerCase()))) && setShowTeacherSuggestions(true)}
            autoComplete="off"
          />
          {showTeacherSuggestions && filteredTeachers.length > 0 && (
            <ul className="autocomplete-suggestions">
              {filteredTeachers.map(teacher => (
                <li key={teacher.id} onClick={() => handleTeacherSuggestionClick(teacher)}>
                  {teacher.name}
                </li>
              ))}
            </ul>
          )}
        </div>
        
        <button
          onClick={handleShowSchedule}
          disabled={!selectedGroup && !selectedTeacher}
          className="timetable-action-button timetable-action-button-view"
          style={{ alignSelf: 'flex-end' }} // Чтобы кнопка была внизу, если инпуты друг под другом
        >
          Показать расписание
        </button>
      </div>

      {showSchedule && (selectedGroup || selectedTeacher) ? (
        <ScheduleGrid 
            editable={false} 
            filterId={selectedGroup ? selectedGroup.id : selectedTeacher.id} 
        />
      ) : (
        <p className="timetable-info-text">
          {groupSearchText || teacherSearchText ? "Выберите точное значение из списка или завершите ввод." : "Введите название группы или ФИО преподавателя для поиска."}
        </p>
      )}
    </div>
  );
}