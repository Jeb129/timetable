// src/components/Schedule/ScheduleGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import './ScheduleGrid.css'; 

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// --- Вспомогательные функции (findTimeSlotId, generateEmptyScheduleStructure, transformFetchedDataToSchedule) ---
// Оставляем их такими же, как в вашем последнем коде, они выглядят хорошо.
// Убедитесь, что findTimeSlotId корректно работает с вашими данными allTimeSlots.
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
  return days.reduce((acc, day) => {
    acc[day] = times.map((time, timeIndex) => {
      const timeSlotId = findTimeSlotId(day, time, isEvenWeekForGrid, loadedTimeSlots);
      return {
        id: `cell-${day}-${timeIndex}-${isEvenWeekForGrid}-${timeSlotId || 'no-ts'}`, 
        time,
        lesson: '', 
        scheduledLessonId: null,
        lessonId: null,          
        timeSlotId: timeSlotId, 
      };
    });
    return acc;
  }, {});
};

const transformFetchedDataToSchedule = (scheduledLessonsFromServer, baseGridStructure) => {
    const newGridData = JSON.parse(JSON.stringify(baseGridStructure)); 

    if (!Array.isArray(scheduledLessonsFromServer)) {
        console.error("transformFetchedDataToSchedule: fetchedScheduledLessons is not an array", scheduledLessonsFromServer);
        return newGridData;
    }

    scheduledLessonsFromServer.forEach(sl => {
        if (!sl.lesson?.curriculum?.discipline || 
            !sl.time_slot?.weekday_details || 
            !sl.time_slot?.pair_details) {
            return; 
        }
        const dayName = sl.time_slot.weekday_details.name;
        const pairStartTime = sl.time_slot.pair_details.start_time?.substring(0, 5);
        if (!dayName || !pairStartTime) return;

        const dayInGrid = days.find(d => d === dayName);
        const timeIndex = times.indexOf(pairStartTime);

        if (dayInGrid && timeIndex !== -1) {
            // Формируем текстовое представление урока. Адаптируйте под свои нужды.
            let lessonText = sl.lesson.curriculum.discipline.name;
            if (sl.lesson.curriculum.teacher) lessonText += ` (${sl.lesson.curriculum.teacher.full_name})`;
            if (sl.lesson.room) lessonText += ` а.${sl.lesson.room.number}`;
            if (sl.lesson.curriculum.lesson_type_name) lessonText += ` (${sl.lesson.curriculum.lesson_type_name})`;
            // Если у Lesson есть поле title/description для простого текста, используйте его:
            // lessonText = sl.lesson.title || lessonText;
            
            if (newGridData[dayName] && newGridData[dayName][timeIndex]) {
                newGridData[dayName][timeIndex].lesson = lessonText;
                newGridData[dayName][timeIndex].id = `sl-${sl.id}`; 
                newGridData[dayName][timeIndex].scheduledLessonId = sl.id;
                newGridData[dayName][timeIndex].lessonId = sl.lesson.id;
                newGridData[dayName][timeIndex].timeSlotId = sl.time_slot.id;
            }
        }
    });
    return newGridData;
};
// --- Конец вспомогательных функций ---


function ScheduleGrid({ editable = false, filterId = null, initialIsEvenWeek = true }) {
  const [isEvenWeek, setIsEvenWeek] = useState(initialIsEvenWeek);
  const [allTimeSlots, setAllTimeSlots] = useState([]);
  const [baseScheduleStructure, setBaseScheduleStructure] = useState(null);
  const [scheduleData, setScheduleData] = useState(null); 
  
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);
  const [isLoadingSchedule, setIsLoadingSchedule] = useState(false);
  const [error, setError] = useState(null);
  
  const token = localStorage.getItem('accessToken'); 

  useEffect(() => { setIsEvenWeek(initialIsEvenWeek); }, [initialIsEvenWeek]);

  // 1. Загрузка всех таймслотов
  useEffect(() => {
    if (!token) { setError("Токен не найден (для таймслотов)."); setIsLoadingTimeSlots(false); setAllTimeSlots([]); return; }
    setIsLoadingTimeSlots(true); setError(null);
    axios.get('http://localhost:8000/api/list/timeslot/', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => { setAllTimeSlots(response.data || []); })
    .catch(err => { console.error("SG: Ошибка загрузки таймслотов:", err); setError("Не удалось загрузить таймслоты."); setAllTimeSlots([]); })
    .finally(() => { setIsLoadingTimeSlots(false); });
  }, [token]);

  // 2. Создание базовой структуры сетки
  useEffect(() => {
    if (!isLoadingTimeSlots) {
        const newBase = generateEmptyScheduleStructure(isEvenWeek, allTimeSlots);
        setBaseScheduleStructure(newBase);
        if (!filterId) setScheduleData(newBase); // Показать пустую структуру, если нет фильтра
    }
  }, [isEvenWeek, allTimeSlots, isLoadingTimeSlots, filterId]);


  // Функция для принудительной перезагрузки данных расписания
  const fetchScheduleData = useCallback(() => {
    if (!filterId || !token || isLoadingTimeSlots || !baseScheduleStructure) {
        if (baseScheduleStructure && !filterId) setScheduleData(baseScheduleStructure);
        setIsLoadingSchedule(false);
        return;
    }
    setIsLoadingSchedule(true); setError(null);
    axios.get(`http://localhost:8000/api/schedule/group/${filterId}/?week_is_even=${isEvenWeek}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
        const newFilledSchedule = transformFetchedDataToSchedule(response.data, baseScheduleStructure);
        setScheduleData(newFilledSchedule);
    })
    .catch(err => {
        console.error("SG: Ошибка загрузки расписания:", err);
        setError(`Не удалось загрузить расписание для группы ${filterId}.`);
        if (baseScheduleStructure) setScheduleData(baseScheduleStructure);
    })
    .finally(() => setIsLoadingSchedule(false));
  }, [filterId, isEvenWeek, token, baseScheduleStructure, isLoadingTimeSlots]); // Добавили baseScheduleStructure

  // 3. Загрузка данных расписания (ScheduledLessons) при изменении зависимостей
  useEffect(() => {
    fetchScheduleData();
  }, [fetchScheduleData]); // fetchScheduleData обернута в useCallback


  const handleWeekToggle = () => { setIsEvenWeek(prev => !prev); };

  const handleLessonChange = useCallback(async (day, timeIndex, newLessonText) => {
    if (!editable || !scheduleData) return; // Добавил !scheduleData
    
    const cellData = scheduleData[day]?.[timeIndex];2`1 `
    if (!cellData) {
        console.error("Cell data not found for lesson change", day, timeIndex);
        return;
    }

    const trimmedText = newLessonText.trim();

    // Оптимистичное обновление UI
    const oldLessonText = cellData.lesson;
    setScheduleData(prev => {
        const newSchedule = JSON.parse(JSON.stringify(prev));
        newSchedule[day][timeIndex].lesson = trimmedText;
        return newSchedule;
    });

    try {
        if (trimmedText === "" && cellData.scheduledLessonId) {
            // Удаление ScheduledLesson
            await axios.delete(`http://localhost:8000/api/delete/scheduledlesson/${cellData.scheduledLessonId}/`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            // Очищаем данные в ячейке (кроме ID ячейки и timeSlotId)
            setScheduleData(prev => {
                const newSchedule = JSON.parse(JSON.stringify(prev));
                newSchedule[day][timeIndex].lesson = '';
                newSchedule[day][timeIndex].scheduledLessonId = null;
                newSchedule[day][timeIndex].lessonId = null;
                // ID самой ячейки (newSchedule[day][timeIndex].id) не меняем, он привязан к позиции
                return newSchedule;
            });
            // Можно опционально удалить Lesson, если он больше не используется
            // await axios.delete(`/api/delete/lesson/${cellData.lessonId}/`, { headers });
             console.log("ScheduledLesson deleted");

        } else if (trimmedText !== "" && cellData.scheduledLessonId && cellData.lessonId) {
            // Обновление существующего Lesson (только его текстового поля, например 'title')
            // Убедитесь, что модель Lesson имеет поле 'title' или 'description'
            await axios.put(`http://localhost:8000/api/update/lesson/${cellData.lessonId}/`, 
                { title: trimmedText }, // Отправляем только обновляемое поле
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            console.log("Lesson updated");

        } else if (trimmedText !== "" && !cellData.scheduledLessonId) {
            // Создание нового Lesson и ScheduledLesson
            if (!cellData.timeSlotId) {
                setError("Невозможно создать занятие: не определен временной слот для ячейки.");
                // Возвращаем старый текст, если был
                setScheduleData(prev => { const n = JSON.parse(JSON.stringify(prev)); n[day][timeIndex].lesson = oldLessonText; return n;});
                return;
            }

            // 1. Создаем Lesson
            const lessonResponse = await axios.post('http://localhost:8000/api/create/lesson/', 
                { title: trimmedText, groups: [filterId] }, // Предполагаем поле title и groups у Lesson
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            const newLessonId = lessonResponse.data.id;

            // 2. Создаем ScheduledLesson
            const scheduledLessonResponse = await axios.post('http://localhost:8000/api/create/scheduledlesson/', 
                { lesson: newLessonId, time_slot: cellData.timeSlotId },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            const newScheduledLessonId = scheduledLessonResponse.data.id;

            // Обновляем ID в состоянии
            setScheduleData(prev => {
                const newSchedule = JSON.parse(JSON.stringify(prev));
                newSchedule[day][timeIndex].lessonId = newLessonId;
                newSchedule[day][timeIndex].scheduledLessonId = newScheduledLessonId;
                newSchedule[day][timeIndex].id = `sl-${newScheduledLessonId}`; // Обновляем ID Draggable
                return newSchedule;
            });
            console.log("New Lesson and ScheduledLesson created");
        }
        // После успешной операции можно перезагрузить все расписание для консистентности,
        // но это может сбросить фокус с инпута. Оптимистичное обновление обычно лучше.
        // fetchScheduleData(); // Раскомментируйте, если хотите полную перезагрузку
    } catch (err) {
        console.error("Ошибка при сохранении урока:", err.response?.data || err.message || err);
        setError("Не удалось сохранить изменения урока.");
        // Откатываем UI к предыдущему состоянию
        setScheduleData(prev => {
            const newSchedule = JSON.parse(JSON.stringify(prev));
            newSchedule[day][timeIndex].lesson = oldLessonText; // Возвращаем старый текст
            // Если это было создание, нужно откатить и ID
            if (!cellData.scheduledLessonId && trimmedText !== "") { // Если пытались создать
                 newSchedule[day][timeIndex].lessonId = null;
                 newSchedule[day][timeIndex].scheduledLessonId = null;
                 newSchedule[day][timeIndex].id = `cell-${day}-${timeIndex}-${isEvenWeek}-${cellData.timeSlotId || 'no-ts'}`;
            }
            return newSchedule;
        });
    }
  }, [editable, scheduleData, token, filterId, isEvenWeek, setScheduleData, setError, fetchScheduleData]); // Добавил fetchScheduleData

  const handleMoveLesson = useCallback(async (sourceDayName, sourceTimeIndex, direction) => {
    if (!editable || !scheduleData) return;

    const sourceCell = scheduleData[sourceDayName]?.[sourceTimeIndex];
    if (!sourceCell || !sourceCell.scheduledLessonId || !sourceCell.timeSlotId) {
        // console.log("Нечего перемещать из исходной ячейки.");
        return;
    }

    let targetDayIndex = days.indexOf(sourceDayName);
    let targetTimeIndex = sourceTimeIndex;

    if (direction === 'up') targetTimeIndex--;
    else if (direction === 'down') targetTimeIndex++;
    else if (direction === 'left') targetDayIndex--;
    else if (direction === 'right') targetDayIndex++;

    // Проверка границ
    if (targetTimeIndex < 0 || targetTimeIndex >= times.length || targetDayIndex < 0 || targetDayIndex >= days.length) {
        // console.log("Выход за границы сетки.");
        return;
    }

    const targetDayName = days[targetDayIndex];
    const targetCell = scheduleData[targetDayName]?.[targetTimeIndex];

    if (!targetCell || !targetCell.timeSlotId) {
        // console.log("Целевая ячейка не имеет TimeSlot ID.");
        return;
    }

    // Оптимистичное обновление UI
    const originalScheduleData = JSON.parse(JSON.stringify(scheduleData)); // Сохраняем для отката

    setScheduleData(prev => {
        const newSchedule = JSON.parse(JSON.stringify(prev));
        const sourceData = { ...newSchedule[sourceDayName][sourceTimeIndex] }; // Копируем данные урока
        const targetData = { ...newSchedule[targetDayName][targetTimeIndex] }; // Копируем данные целевой ячейки

        if (targetData.scheduledLessonId) { // Если целевая ячейка занята (обмен)
            // Обмен данными урока
            newSchedule[targetDayName][targetTimeIndex].lesson = sourceData.lesson;
            newSchedule[targetDayName][targetTimeIndex].lessonId = sourceData.lessonId;
            newSchedule[targetDayName][targetTimeIndex].scheduledLessonId = sourceData.scheduledLessonId;
            // ID для Draggable также обновляем
            newSchedule[targetDayName][targetTimeIndex].id = sourceData.id;


            newSchedule[sourceDayName][sourceTimeIndex].lesson = targetData.lesson;
            newSchedule[sourceDayName][sourceTimeIndex].lessonId = targetData.lessonId;
            newSchedule[sourceDayName][sourceTimeIndex].scheduledLessonId = targetData.scheduledLessonId;
            newSchedule[sourceDayName][sourceTimeIndex].id = targetData.id;
        } else { // Если целевая ячейка пуста (перемещение)
            newSchedule[targetDayName][targetTimeIndex] = { ...sourceData }; // Копируем весь объект урока
            // Очищаем исходную ячейку, сохраняя ее ID и timeSlotId
            newSchedule[sourceDayName][sourceTimeIndex].lesson = '';
            newSchedule[sourceDayName][sourceTimeIndex].lessonId = null;
            newSchedule[sourceDayName][sourceTimeIndex].scheduledLessonId = null;
            newSchedule[sourceDayName][sourceTimeIndex].id = `cell-${sourceDayName}-${sourceTimeIndex}-${isEvenWeek}-${sourceCell.timeSlotId || 'no-ts'}`;
        }
        return newSchedule;
    });

    try {
        if (targetCell.scheduledLessonId) { // Обмен
            // 1. Обновляем исходный урок -> на таймслот целевой ячейки
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${sourceCell.scheduledLessonId}/`,
                { time_slot: targetCell.timeSlotId },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
            // 2. Обновляем (бывший) целевой урок -> на таймслот исходной ячейки
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${targetCell.scheduledLessonId}/`,
                { time_slot: sourceCell.timeSlotId },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
        } else { // Перемещение в пустую ячейку
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${sourceCell.scheduledLessonId}/`,
                { time_slot: targetCell.timeSlotId },
                { headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' } }
            );
        }
        // console.log("Lesson moved on server.");
        fetchScheduleData(); // Перезагружаем данные для консистентности после успешного перемещения
    } catch (err) {
        console.error("Ошибка при перемещении урока:", err.response?.data || err.message || err);
        setError("Не удалось переместить урок.");
        setScheduleData(originalScheduleData); // Откатываем UI
    }

  }, [editable, scheduleData, token, filterId, isEvenWeek, allTimeSlots, setScheduleData, setError, fetchScheduleData]);


  // --- Логика отображения (оставляем как в вашем последнем коде) ---
  if (!token && !error) { return <div className="schedule-error">Ошибка: Токен аутентификации не найден.</div>; }
  if (isLoadingTimeSlots && !error) { return <div className="schedule-loading">Загрузка конфигурации временных слотов...</div>; }
  if (error) {  return <div className="schedule-error">Ошибка ScheduleGrid: {error}</div>; }
  if (filterId && isLoadingSchedule) { return <div className="schedule-loading">Обновление данных расписания...</div>; }
  if (!scheduleData) { return <div className="schedule-loading">Инициализация сетки...</div>; }

  const dataToRender = scheduleData;
  
  return (
    // ... ВАШ JSX ДЛЯ РЕНДЕРИНГА СЕТКИ ...
    // Убедитесь, что key для input уникален и стабилен, чтобы избежать проблем с фокусом/состоянием input.
    // Если вы используете defaultValue, то проблем с редактированием быть не должно.
    // Важно: `onBlur={(e) => handleLessonChange(day, timeIndex, e.target.value)}` 
    // Это означает, что `handleLessonChange` будет вызван КАЖДЫЙ РАЗ, когда input теряет фокус.
    // Если пользователь просто кликнул в input и потом мимо, отправится запрос.
    // Можно добавить проверку, изменился ли текст, прежде чем отправлять запрос.
    // Или использовать отдельную кнопку "сохранить" для ячейки, или Enter.
    // Пока оставим onBlur для простоты.
    <div className="schedule-grid-container">
      <div className="schedule-grid-week-toggle">
        <label className="schedule-grid-week-toggle-label">
          <input type="checkbox" checked={isEvenWeek} onChange={handleWeekToggle} className="schedule-grid-week-toggle-checkbox"/>
          {isEvenWeek ? 'Чётная неделя' : 'Нечётная неделя'}
        </label>
      </div>
      <div className="schedule-grid-table">
        <div className="schedule-grid-header-row">
          <div className="schedule-grid-cell schedule-grid-time-header-cell">Время</div>
          {days.map((day) => ( <div key={day} className="schedule-grid-cell schedule-grid-day-header-cell">{day}</div> ))}
        </div>
        {times.map((time, timeIndex) => (
          <div key={`${time}-${isEvenWeek}-${filterId || 'no-filter'}`} className="schedule-grid-row"> {/* Добавил filterId в key */}
            <div className="schedule-grid-cell schedule-grid-time-header-cell">{time}</div>
            {days.map((day) => {
              const lessonItem = dataToRender[day]?.[timeIndex] || 
                                 { id: `fallback-${day}-${timeIndex}-${isEvenWeek}`, lesson: '', scheduledLessonId: null, timeSlotId: null };
              return (
                <div key={`${day}-${timeIndex}-${isEvenWeek}-cell-${filterId || 'no-filter'}`} className="schedule-grid-cell"> {/* Добавил filterId в key */}
                  <div className="schedule-lesson-content">
                    <input 
                      type="text" 
                      key={`input-${lessonItem.id}`} // Используем ID урока/ячейки
                      defaultValue={lessonItem.lesson} 
                      onBlur={(e) => editable && handleLessonChange(day, timeIndex, e.target.value)} // Вызываем только если editable
                      placeholder="-" 
                      className="schedule-grid-lesson-input" 
                      disabled={!editable}
                    />
                    {editable && lessonItem.scheduledLessonId && (
                      <div className="lesson-move-buttons">
                        <button onClick={() => handleMoveLesson(day, timeIndex, 'up')} className="move-btn" title="Вверх">↑</button>
                        <button onClick={() => handleMoveLesson(day, timeIndex, 'down')} className="move-btn" title="Вниз">↓</button>
                        <button onClick={() => handleMoveLesson(day, timeIndex, 'left')} className="move-btn" title="Влево">←</button>
                        <button onClick={() => handleMoveLesson(day, timeIndex, 'right')} className="move-btn" title="Вправо">→</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ScheduleGrid;