// src/components/Schedule/ScheduleGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import axios from 'axios';
import './ScheduleGrid.css';

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// --- Вспомогательные функции (оставляем как есть, они выглядят нормально) ---
const findTimeSlotId = (dayName, timeValue, isEvenWeek, allTimeSlotsFromServer) => {
    if (!allTimeSlotsFromServer || allTimeSlotsFromServer.length === 0) return null;
    const slot = allTimeSlotsFromServer.find(ts => 
        ts.weekday_details?.name === dayName && 
        ts.pair_details?.start_time?.startsWith(timeValue) &&
        ts.is_even_week === isEvenWeek
    );
    return slot ? slot.id : null; 
};

const generateEmptyScheduleStructure = (isEvenWeekForGrid, loadedTimeSlots) => {
    // console.log("GENERATE EMPTY STRUCTURE for week:", isEvenWeekForGrid, "with timeslots:", loadedTimeSlots.length);
    return days.reduce((acc, day) => {
        acc[day] = times.map((time, timeIndex) => {
            const timeSlotId = findTimeSlotId(day, time, isEvenWeekForGrid, loadedTimeSlots);
            return {
                id: `cell-${day}-${timeIndex}-${isEvenWeekForGrid}-${timeSlotId || 'no-ts'}`, 
                time, lesson: '', scheduledLessonId: null, lessonId: null, timeSlotId: timeSlotId,
            };
        });
        return acc;
    }, {});
};

const transformFetchedDataToSchedule = (scheduledLessonsFromServer, baseGridStructure) => {
    // console.log("TRANSFORMING data. Base structure:", baseGridStructure, "Fetched lessons:", scheduledLessonsFromServer);
    const newGridData = JSON.parse(JSON.stringify(baseGridStructure)); 
    // ... (остальная логика transformFetchedDataToSchedule, она выглядит нормально) ...
    // ... Убедитесь, что здесь нет вызовов setState или чего-то, что может вызвать ререндер косвенно ...
     if (!Array.isArray(scheduledLessonsFromServer)) {
        console.error("transform: данные не являются массивом", scheduledLessonsFromServer);
        return newGridData;
    }

    scheduledLessonsFromServer.forEach(sl => {
        if (!sl.lesson?.curriculum?.discipline || 
            !sl.time_slot?.weekday_details || 
            !sl.time_slot?.pair_details) {
            console.warn("Пропущен ScheduledLesson из-за неполных данных во вложениях:", sl);
            return; 
        }
        const dayName = sl.time_slot.weekday_details.name;
        const pairStartTime = sl.time_slot.pair_details.start_time?.substring(0, 5);

        if (!dayName || !pairStartTime) {
            console.warn("Не удалось определить день или время для ScheduledLesson:", sl);
            return;
        }
        const dayInGrid = days.find(d => d === dayName);
        const timeIndex = times.indexOf(pairStartTime);

        if (dayInGrid && timeIndex !== -1) {
            const lessonText = 
                `${sl.lesson.curriculum.discipline.name} ` +
                `(${sl.lesson.curriculum.teacher?.full_name || 'Н/У'}) ` +
                `${sl.lesson.room?.number ? 'а.' + sl.lesson.room.number : ''} ` +
                `(${sl.lesson.curriculum.lesson_type_name || ''})`;
            
            if (newGridData[dayName] && newGridData[dayName][timeIndex]) {
                newGridData[dayName][timeIndex].lesson = lessonText;
                newGridData[dayName][timeIndex].id = `sl-${sl.id}`; 
                newGridData[dayName][timeIndex].scheduledLessonId = sl.id;
                newGridData[dayName][timeIndex].lessonId = sl.lesson.id;
                if (newGridData[dayName][timeIndex].timeSlotId !== sl.time_slot.id) {
                    newGridData[dayName][timeIndex].timeSlotId = sl.time_slot.id;
                }
            }
        }
    });
    return newGridData;
};
// --- Конец вспомогательных функций ---


function ScheduleGrid({ editable = false, filterId = null, initialIsEvenWeek = true }) {
  const [isEvenWeek, setIsEvenWeek] = useState(initialIsEvenWeek);
  const [allTimeSlots, setAllTimeSlots] = useState([]);
  const [scheduleData, setScheduleData] = useState(null); 
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true); // Начинаем с true
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('accessToken'); 

  // Синхронизация isEvenWeek с пропом
  useEffect(() => {
    setIsEvenWeek(initialIsEvenWeek);
  }, [initialIsEvenWeek]);

  // 1. Загрузка всех таймслотов (один раз или при смене токена)
  useEffect(() => {
    // console.log("SG: useEffect - Load All TimeSlots. Token:", token);
    if (!token) {
        setError("Токен не найден (для таймслотов).");
        setIsLoadingTimeSlots(false);
        setAllTimeSlots([]); // Важно сбросить, если токена нет
        return;
    }
    setIsLoadingTimeSlots(true);
    setError(null);
    axios.get('http://localhost:8000/api/list/timeslot/', {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        // console.log("SG: All TimeSlots LOADED:", response.data);
        setAllTimeSlots(response.data || []);
    })
    .catch(err => {
        console.error("SG: Ошибка загрузки таймслотов:", err.response?.data || err.message || err);
        setError("Не удалось загрузить конфигурацию временных слотов.");
        setAllTimeSlots([]);
    })
    .finally(() => {
        setIsLoadingTimeSlots(false);
    });
  }, [token]); // Зависит только от токена

  // 2. Загрузка данных расписания (ScheduledLessons)
  // Этот useEffect должен срабатывать ТОЛЬКО когда filterId, isEvenWeek, или allTimeSlots (после их загрузки) меняются.
  // Ключевой момент: не вызывать setScheduleData так, чтобы это снова вызвало этот useEffect.
  useEffect(() => {
    // console.log("SG: useEffect - Load Schedule Data. FilterId:", filterId, "isEvenWeek:", isEvenWeek, "Token:", !!token, "TimeSlots loaded:", !isLoadingTimeSlots, "allTimeSlots #:", allTimeSlots.length);

    if (!filterId || !token || isLoadingTimeSlots) {
        // Если нет фильтра, токена, или таймслоты еще грузятся, то не делаем запрос.
        // Если таймслоты уже загружены (isLoadingTimeSlots=false), то можно установить пустую структуру.
        if (!isLoadingTimeSlots) { // Условие, что таймслоты УЖЕ загружены (или была ошибка их загрузки)
            // console.log("SG: Setting empty schedule structure because no filterId/token or timeslots still loading.");
            setScheduleData(generateEmptyScheduleStructure(isEvenWeek, allTimeSlots));
        }
        setIsLoadingSchedule(false); // Убедимся, что этот флаг сброшен
        return;
    }
    
    // Если мы здесь, значит filterId, token есть, и isLoadingTimeSlots = false (таймслоты загружены или была ошибка)
    setIsLoadingSchedule(true);
    setError(null);
    // console.log(`SG: Fetching schedule for group ${filterId}, week_is_even=${isEvenWeek}`);

    axios.get(`http://localhost:8000/api/schedule/group/${filterId}/?week_is_even=${isEvenWeek}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        const fetchedScheduledLessons = response.data;
        // console.log("SG: SCHEDULED LESSONS received:", fetchedScheduledLessons);
        // Создаем базовую структуру сетки с актуальными таймслотами и неделей
        const baseGridStructure = generateEmptyScheduleStructure(isEvenWeek, allTimeSlots);
        // Заполняем ее полученными уроками
        const newFilledSchedule = transformFetchedDataToSchedule(fetchedScheduledLessons, baseGridStructure);
        setScheduleData(newFilledSchedule);
    })
    .catch(err => {
        console.error("SG: Ошибка загрузки расписания:", err.response?.data || err.message || err);
        setError(`Не удалось загрузить расписание.`);
        // При ошибке загрузки уроков, показываем пустую сетку (с таймслотами)
        setScheduleData(generateEmptyScheduleStructure(isEvenWeek, allTimeSlots));
    })
    .finally(() => {
        setIsLoadingSchedule(false);
    });
  // Зависимости: filterId, isEvenWeek, token, isLoadingTimeSlots, allTimeSlots
  // isLoadingTimeSlots и allTimeSlots важны, чтобы этот useEffect сработал ПОСЛЕ загрузки таймслотов.
  }, [filterId, isEvenWeek, token, isLoadingTimeSlots, allTimeSlots]); 


  const handleWeekToggle = () => {
    setIsEvenWeek(prevIsEvenWeek => !prevIsEvenWeek);
  };

  // useCallback для handleLessonChange и onDragEnd
  const handleLessonChange = useCallback(async (day, timeIndex, newLessonText) => {
    // ... (ваш код для handleLessonChange с заглушками для API)
    // ... (убедитесь, что используете токен, filterId и актуальный scheduleData[day][timeIndex].timeSlotId)
  }, [editable, scheduleData, token, filterId, isEvenWeek]); // Зависимости для useCallback

  const onDragEnd = useCallback((result) => {
    // ... (ваша логика onDragEnd, тоже с API вызовами в будущем)
  }, [editable, scheduleData, token, filterId, isEvenWeek]); // Зависимости для useCallback

  // --- Логика отображения ---
  if (!token && !error) {
      return <div className="schedule-error">Ошибка: Токен аутентификации не найден. Авторизуйтесь снова.</div>;
  }
  if (error) { 
    return <div className="schedule-error">Ошибка ScheduleGrid: {error}</div>;
  }
  if (isLoadingTimeSlots && allTimeSlots.length === 0) { 
      return <div className="schedule-loading">Загрузка конфигурации временных слотов...</div>;
  }
  // Если filterId есть, но scheduleData еще не создана (ждем первого прохода useEffect для расписания)
  // или если isLoadingSchedule (основное расписание грузится)
  if (filterId && (!scheduleData || isLoadingSchedule)) { 
      return <div className="schedule-loading">Обновление данных расписания...</div>;
  }
  // Если filterId не выбран, но таймслоты загружены, и scheduleData уже является пустой сеткой
  if (!filterId && scheduleData) {
      // Показываем пустую сетку или сообщение "Выберите группу"
      // JSX ниже сам отобразит пустую сетку, если scheduleData это пустая структура
  }
  if (!scheduleData) { // Самый общий случай, если ничего не загружено и нет ошибок
      return <div className="schedule-loading">Загрузка сетки...</div>;
  }

  return (
    <div className="schedule-grid-container">
      <div className="schedule-grid-week-toggle">
        <label className="schedule-grid-week-toggle-label">
          <input type="checkbox" checked={isEvenWeek} onChange={handleWeekToggle} className="schedule-grid-week-toggle-checkbox"/>
          {isEvenWeek ? 'Чётная неделя' : 'Нечётная неделя'}
        </label>
      </div>

      {/* Можно добавить более точный индикатор загрузки, если isLoadingSchedule */}
      {/* {isLoadingSchedule && <div className="schedule-loading-inline">Загрузка уроков...</div>} */}

      <div className="schedule-grid-table">
        <div className="schedule-grid-header-row">
          <div className="schedule-grid-cell schedule-grid-time-header-cell">Время</div>
          {days.map((day) => (
            <div key={day} className="schedule-grid-cell schedule-grid-day-header-cell">{day}</div>
          ))}
        </div>

        {/* Рендер ячеек */}
        {times.map((time, timeIndex) => (
          <div key={`${time}-${isEvenWeek}`} className="schedule-grid-row">
            <div className="schedule-grid-cell schedule-grid-time-header-cell">{time}</div>
            {days.map((day) => {
              // Важно: получаем lessonItem из scheduleData, которое должно быть уже инициализировано
              const lessonItem = scheduleData[day]?.[timeIndex] || 
                                 { id: `fallback-empty-${day}-${timeIndex}-${isEvenWeek}`, lesson: '', scheduledLessonId: null, timeSlotId: null };
              const droppableId = `${day}-${timeIndex}-${isEvenWeek}`;
              
              return (
                <Droppable key={droppableId} droppableId={droppableId}>
                  {(provided, snapshot) => (
                    <div ref={provided.innerRef} {...provided.droppableProps} className={`schedule-grid-cell ${snapshot.isDraggingOver ? 'schedule-grid-cell-dragging-over' : ''}`}>
                      {editable ? (
                        <Draggable key={lessonItem.id} draggableId={lessonItem.id} index={0} isDragDisabled={!editable || !lessonItem.lesson}>
                          {(providedDraggable) => (
                            <div ref={providedDraggable.innerRef} {...providedDraggable.draggableProps} {...providedDraggable.dragHandleProps} style={providedDraggable.draggableProps.style}
                              className={`schedule-grid-draggable-lesson ${providedDraggable.isDragging ? 'schedule-grid-lesson-dragging' : ''}`}>
                              <input type="text" key={`input-${lessonItem.id}`} defaultValue={lessonItem.lesson} 
                                onBlur={(e) => handleLessonChange(day, timeIndex, e.target.value)}
                                placeholder="-" className="schedule-grid-lesson-input" disabled={!editable}
                              />
                            </div>
                          )}
                        </Draggable>
                      ) : (
                        <div className={`schedule-grid-lesson-card ${!lessonItem.lesson ? 'schedule-grid-lesson-card-empty' : ''}`}>
                          {lessonItem.lesson || '-'}
                        </div>
                      )}
                      {/* {editable && provided.placeholder} // Placeholder для Droppable, если нужно */}
                    </div>
                  )}
                </Droppable>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleGrid;