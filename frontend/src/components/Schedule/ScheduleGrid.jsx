// src/components/Schedule/ScheduleGrid.jsx
import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CreateLessonModal from '../CreateLessonModal'; // <--- УБЕДИТЕСЬ, ЧТО ЭТОТ ПУТЬ ПРАВИЛЬНЫЙ!
import './ScheduleGrid.css'; 

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

// --- Вспомогательные функции ---
const findTimeSlotId = (dayName, timeValue, isEvenWeek, allTimeSlotsFromServer) => {
    if (!allTimeSlotsFromServer || allTimeSlotsFromServer.length === 0) {
        // console.log(`findTimeSlotId: allTimeSlotsFromServer пуст для ${dayName} ${timeValue} ${isEvenWeek}`);
        return null;
    }
    // Логируем только для одной конкретной ячейки, чтобы не засорять консоль
    if (dayName === "Понедельник" && timeValue === "08:30") {
        console.log(`findTimeSlotId ИЩЕМ для: day=${dayName}, time=${timeValue}, isEven=${isEvenWeek}`);
    }

    const slot = allTimeSlotsFromServer.find(ts => {
        const dayMatch = ts.weekday_details?.name === dayName;
        const timeMatch = ts.pair_details?.start_time?.startsWith(timeValue);
        const weekMatch = ts.is_even_week === isEvenWeek;
        
        if (dayName === "Понедельник" && timeValue === "08:30") { // Логируем только для одной ячейки
            console.log(`  Сравниваем с TimeSlot ID ${ts.id}: `+
                        `wd='${ts.weekday_details?.name}' (match:${dayMatch}), `+
                        `pair='${ts.pair_details?.start_time}' (match:${timeMatch}), `+
                        `isEven=${ts.is_even_week} (match:${weekMatch})`);
        }
        return dayMatch && timeMatch && weekMatch;
    });

    if (dayName === "Понедельник" && timeValue === "08:30") {
        console.log(`findTimeSlotId РЕЗУЛЬТАТ для ${dayName} ${timeValue} ${isEvenWeek}:`, slot ? slot.id : null);
    }
    return slot ? slot.id : null; 
};

const generateBaseScheduleStructure = (isEvenWeekForGrid, loadedTimeSlots = []) => {
  return days.reduce((acc, day) => {
    acc[day] = times.map((time, timeIndex) => {
      const timeSlotId = findTimeSlotId(day, time, isEvenWeekForGrid, loadedTimeSlots);
      return {
        id: `cell-${day}-${timeIndex}-${isEvenWeekForGrid}-${timeSlotId || 'no-ts-id'}`, 
        time,
        lesson: '', 
        scheduledLessonId: null,
        lessonId: null,          
        lessonDetails: null, // Для хранения полного объекта урока с деталями
        timeSlotId: timeSlotId, 
      };
    });
    return acc;
  }, {});
};

const mapApiDataToGrid = (scheduledLessonsFromServer, baseGridStructure) => {
    const newGridData = JSON.parse(JSON.stringify(baseGridStructure)); 

    if (!Array.isArray(scheduledLessonsFromServer)) {
        console.error("mapApiDataToGrid: данные с сервера не являются массивом", scheduledLessonsFromServer);
        return newGridData;
    }

    scheduledLessonsFromServer.forEach(sl => {
        // ОБНОВЛЕННАЯ ПРОВЕРКА для новой структуры Lesson
        if (!sl.lesson || // Проверяем, что объект lesson вообще есть
            !sl.lesson.discipline || // Проверяем наличие discipline напрямую в lesson
            !sl.lesson.teacher ||    // Проверяем наличие teacher напрямую в lesson
            !sl.lesson.lesson_type ||// Проверяем наличие lesson_type напрямую в lesson
            !sl.lesson.room ||       // Проверяем наличие room напрямую в lesson
            !sl.time_slot?.weekday_details || 
            !sl.time_slot?.pair_details) {
            console.warn("mapApiDataToGrid: Пропущен ScheduledLesson из-за неполных данных (проверьте структуру Lesson и TimeSlot):", sl);
            return; 
        }

        const dayName = sl.time_slot.weekday_details.name;
        const pairStartTime = sl.time_slot.pair_details.start_time?.substring(0, 5);

        if (!dayName || !pairStartTime) {
            console.warn("mapApiDataToGrid: Не удалось определить день или время для ScheduledLesson (API):", sl);
            return;
        }

        const dayInGrid = days.find(d => d === dayName);
        const timeIndex = times.indexOf(pairStartTime);

        if (dayInGrid && timeIndex !== -1) {
            // ОБНОВЛЕННОЕ ФОРМИРОВАНИЕ ТЕКСТА УРОКА
            let lessonText = sl.lesson.discipline.name; 
            if (sl.lesson.teacher) lessonText += ` (${sl.lesson.teacher.full_name})`;
            else lessonText += ` (Преп. Н/У)`; // Если преподаватель может быть null

            if (sl.lesson.room) lessonText += ` а.${sl.lesson.room.number}`; // room.number и room.building_code из RoomShortSerializer
            else lessonText += ` (Ауд. Н/У)`;

            if (sl.lesson.lesson_type) lessonText += ` (${sl.lesson.lesson_type.name})`;
            else lessonText += ` (Тип Н/У)`;
            
            if (newGridData[dayName] && newGridData[dayName][timeIndex]) {
                newGridData[dayName][timeIndex].lesson = lessonText;
                newGridData[dayName][timeIndex].id = `sl-${sl.id}`; 
                newGridData[dayName][timeIndex].scheduledLessonId = sl.id;
                newGridData[dayName][timeIndex].lessonId = sl.lesson.id;
                newGridData[dayName][timeIndex].lessonDetails = sl.lesson; 
                newGridData[dayName][timeIndex].timeSlotId = sl.time_slot.id; 
            } else {
                 console.warn(`mapApiDataToGrid: Ячейка [${dayName}][${timeIndex}] не найдена в структуре newGridData.`);
            }
        } else {
            console.warn(
                "mapApiDataToGrid: Не удалось сопоставить ScheduledLesson с ячейкой (локально):", 
                { dayName, isDayInGrid: !!dayInGrid, pairStartTime, timeIndex, lessonDetails: sl }
            );
        }
    });
    return newGridData;
};
// --- Конец вспомогательных функций ---


function ScheduleGrid({ editable = false, filterId = null, initialIsEvenWeek = true }) {
  const [isEvenWeek, setIsEvenWeek] = useState(initialIsEvenWeek);
  const [allTimeSlots, setAllTimeSlots] = useState([]); 
  const [scheduleData, setScheduleData] = useState(null); // Начинаем с null, чтобы показать начальную загрузку
  
  const [isLoadingTimeSlots, setIsLoadingTimeSlots] = useState(true);
  const [isLoadingLessons, setIsLoadingLessons] = useState(false); 
  const [error, setError] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalTargetCell, setModalTargetCell] = useState(null); // { dayName, timeIndex, timeSlotId }
  
  const token = localStorage.getItem('accessToken'); 

  useEffect(() => { setIsEvenWeek(initialIsEvenWeek); }, [initialIsEvenWeek]);

  // 1. Загрузка всех таймслотов
  useEffect(() => {
    if (!token) { setError("Токен не найден. Невозможно загрузить конфигурацию сетки."); setIsLoadingTimeSlots(false); return; }
    
    setIsLoadingTimeSlots(true); setError(null);
    axios.get('http://localhost:8000/api/list/timeslot/', { headers: { 'Authorization': `Bearer ${token}` } })
    .then(response => { 
      const loadedSlots = response.data || [];
        console.log("ScheduleGrid: ЗАГРУЖЕННЫЕ allTimeSlots (ПЕРВЫЕ 5):", loadedSlots.slice(0, 5)); 
        setAllTimeSlots(response.data || []); 
    })
    .catch(err => { 
        console.error("SG: Ошибка загрузки таймслотов:", err); 
        setError("Не удалось загрузить таймслоты. Расписание не может быть отображено."); 
        setAllTimeSlots([]); 
    })
    .finally(() => { setIsLoadingTimeSlots(false); });
  }, [token]);

  // 2. Функция для загрузки и установки уроков расписания
  const fetchAndDisplaySchedule = useCallback(() => {
    console.log(`Вызов fetchAndDisplaySchedule. isLoadingTimeSlots: ${isLoadingTimeSlots}, filterId: ${filterId}, isEvenWeek: ${isEvenWeek}, allTimeSlots.length: ${allTimeSlots.length}`);

    if (isLoadingTimeSlots) {
        console.log("fetchAndDisplaySchedule: Ожидание загрузки таймслотов...");
        // Не устанавливаем scheduleData в null, ждем пока таймслоты загрузятся
        // и baseStructure будет готова в следующем useEffect
        return; 
    }

    // Таймслоты загружены (или ошибка загрузки), создаем базовую структуру
    const baseStructure = generateBaseScheduleStructure(isEvenWeek, allTimeSlots);

    if (!filterId || !token) { // Если нет ID группы или токена, показываем пустую базовую структуру
        setScheduleData(baseStructure);
        setIsLoadingLessons(false); // Убедимся, что загрузка уроков не активна
        setError(null); 
        return;
    }
    
    setIsLoadingLessons(true); setError(null);
    axios.get(`http://localhost:8000/api/schedule/group/${filterId}/?week_is_even=${isEvenWeek}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(response => {
      console.log("ScheduleGrid: ДАННЫЕ РАСПИСАНИЯ ПОЛУЧЕНЫ ПОСЛЕ СОЗДАНИЯ:", response.data); // <--- ВАЖНЫЙ ЛОГ
       const fetchedScheduledLessons = response.data;
        const newFilledSchedule = mapApiDataToGrid(response.data, baseStructure);
        setScheduleData(newFilledSchedule);
    })
    .catch(err => {
        console.error("SG: Ошибка загрузки уроков:", err);
        setError(`Не удалось загрузить расписание для группы ${filterId}.`);
        setScheduleData(baseStructure); // Показываем базовую структуру при ошибке
    })
    .finally(() => setIsLoadingLessons(false));
  }, [filterId, isEvenWeek, token, isLoadingTimeSlots, allTimeSlots]); // Зависимости

  // Вызов загрузки расписания при изменении ключевых параметров
  useEffect(() => {
    fetchAndDisplaySchedule();
  }, [fetchAndDisplaySchedule]);

useEffect(() => {
    if (scheduleData) {
        console.log("ScheduleGrid: ОБНОВЛЕННЫЙ scheduleData (например, Понедельник 08:30):", 
            scheduleData['Понедельник'] ? scheduleData['Понедельник'][0] : "Нет данных для Понедельника");
    }
}, [scheduleData]);

  const handleWeekToggle = () => { setIsEvenWeek(prev => !prev); };

  const openCreateLessonModal = (dayName, timeIndex) => {
    console.log(`openCreateLessonModal вызван для: [${dayName}][${timeIndex}]`); // Какой timeIndex?
    if (!editable) { console.log("Не редактируемый режим"); return; }
    if (!scheduleData) { console.log("scheduleData еще не готов"); return; }
    
    const cellData = scheduleData[dayName]?.[timeIndex];
    console.log("Данные ячейки для модального окна (cellData):", cellData); // <--- САМЫЙ ВАЖНЫЙ ЛОГ

    if (cellData && cellData.timeSlotId && !cellData.scheduledLessonId) {
        console.log("Условия для открытия модального окна ВЫПОЛНЕНЫ. TimeSlotId:", cellData.timeSlotId);
        setModalTargetCell({ dayName, timeIndex, timeSlotId: cellData.timeSlotId });
        setIsModalOpen(true);
    } // ... остальные else if ...
};
 const handleDeleteScheduledLesson = async (scheduledLessonIdToDelete, dayName, timeIndex) => {
    if (!editable || !scheduledLessonIdToDelete) return;

    setIsLoadingLessons(true); 
    setError(null);

    try {
        await axios.delete(`http://localhost:8000/api/delete/scheduledlesson/${scheduledLessonIdToDelete}/`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });

        // Обновляем UI: сбрасываем ячейку до "пустой", но сохраняем ее timeSlotId и позиционные данные
        setScheduleData(prevSchedule => {
            const newSchedule = JSON.parse(JSON.stringify(prevSchedule));
            if (newSchedule[dayName] && newSchedule[dayName][timeIndex]) {
                const cellToReset = newSchedule[dayName][timeIndex];
                
                // Сохраняем важные идентификаторы ячейки
                const originalCellId = cellToReset.id; // ID для Droppable, если он генерируется на основе позиции
                const originalTimeSlotId = cellToReset.timeSlotId; 

                // Сбрасываем поля, связанные с уроком
                cellToReset.lessonText = '';
                cellToReset.lessonId = null;
                cellToReset.scheduledLessonId = null;
                cellToReset.lessonDetails = null;
                cellToReset.isPlaceholder = true; // Помечаем как пустую
            }
            return newSchedule;
        });
        
        // После локального обновления можно дополнительно перезагрузить данные с сервера для полной консистентности
        // Если вы уверены в локальном обновлении, этот вызов можно убрать для более быстрого UI,
        // но он гарантирует, что данные точно соответствуют серверу.
        await fetchAndDisplaySchedule(); 
        
        console.log(`ScheduledLesson ID ${scheduledLessonIdToDelete} успешно удален.`);

    } catch (err) {
        console.error("Ошибка при удалении ScheduledLesson:", err.response?.data || err.message || err);
        setError("Не удалось удалить занятие: " + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
        await fetchAndDisplaySchedule(); // Попытка синхронизировать с сервером в случае ошибки
    } finally {
        setIsLoadingLessons(false);
    }
};

  const handleCreateLessonSubmit = async (lessonFormDataFromModal) => {
    if (!modalTargetCell || !modalTargetCell.timeSlotId || !filterId || !token) {
        setError("Ошибка: недостаточно данных для создания урока.");
        setIsModalOpen(false); return;
    }
    setIsLoadingLessons(true); setError(null); // Показываем индикатор на время сохранения
    try {
        const lessonPayload = { ...lessonFormDataFromModal };
        
        const lessonResponse = await axios.post('http://localhost:8000/api/create/lesson/', 
            lessonPayload,
            { headers: { 'Authorization': `Bearer ${token}` } }
        );
        const newLessonId = lessonResponse.data.id;

        // const scheduledLessonPayload = {
        //     lesson: newLessonId,
        //     time_slot: modalTargetCell.timeSlotId
        // };
        // await axios.post('http://localhost:8000/api/create/scheduledlesson/', 
        //     scheduledLessonPayload,
        //     { headers: { 'Authorization': `Bearer ${token}` } }
        // );
        const scheduleresp = await axios.post(`http://localhost:8000/api/scheduledlesson/${newLessonId}/${modalTargetCell.timeSlotId}/`, 
        {
            headers: { 'Authorization': `Bearer ${token}` }
        }
        );
        
        setIsModalOpen(false); 
        setModalTargetCell(null);
        
        // Вызываем fetchScheduleLessons (или как вы назвали вашу функцию загрузки)
        // Эта функция асинхронная, дождемся ее завершения
        await fetchAndDisplaySchedule(); 

        // Уведомление для пользователя (можно использовать более продвинутое)
        console.log("Занятие успешно создано и добавлено в расписание!");
        // setError(null); // Очищаем предыдущие ошибки
        // setSuccess("Занятие успешно создано!"); // Если есть состояние для успеха

    } catch (err) {
        console.error("Ошибка при создании урока:", err.response?.data || err.message || err);
        setError("Не удалось создать урок: " + (err.response?.data?.detail || JSON.stringify(err.response?.data) || err.message));
        // Оставляем модальное окно открытым при ошибке, чтобы пользователь мог видеть ошибку
    } finally {
        setIsLoadingLessons(false); // Убираем индикатор
    }
  };
  
  // Заглушка для редактирования текста (пока не используется активно)
  const handleLessonTextEdit = (day, timeIndex, newText) => {
      if(!editable) return;
      console.log("Редактирование текста (не сохраняется):", day, timeIndex, newText);
      // Можно добавить оптимистичное обновление, если нужно
  };

  const handleMoveLesson = useCallback(async (sourceDayName, sourceTimeIndex, direction) => {
    if (!editable || !scheduleData) return;
    const sourceCell = scheduleData[sourceDayName]?.[sourceTimeIndex];
    if (!sourceCell || !sourceCell.scheduledLessonId || !sourceCell.timeSlotId) return;

    // ... (логика определения targetDayName, targetTimeIndex) ...
    let targetDayIndex = days.indexOf(sourceDayName);
    let targetTimeIndex = sourceTimeIndex;
    if (direction === 'up') targetTimeIndex--;
    else if (direction === 'down') targetTimeIndex++;
    else if (direction === 'left') targetDayIndex--;
    else if (direction === 'right') targetDayIndex++;
    if (targetTimeIndex < 0 || targetTimeIndex >= times.length || targetDayIndex < 0 || targetDayIndex >= days.length) return;
    const targetDayName = days[targetDayIndex];
    // ...

    const targetCell = scheduleData[targetDayName]?.[targetTimeIndex];
    if (!targetCell || !targetCell.timeSlotId) { alert("Целевая ячейка не имеет валидного временного слота."); return; }

    const originalScheduleDataForRollback = JSON.parse(JSON.stringify(scheduleData));
    setIsLoadingLessons(true); setError(null);

    // Оптимистичное обновление UI (ваша логика обмена/перемещения)
    setScheduleData(prev => {
        const newSchedule = JSON.parse(JSON.stringify(prev));
        // ... (код обмена/перемещения lesson, lessonId, scheduledLessonId, id между ячейками) ...
        // Пример для простого перемещения в пустую ячейку:
        if (!targetCell.scheduledLessonId) {
            newSchedule[targetDayName][targetTimeIndex] = { ...sourceCell };
            newSchedule[sourceDayName][sourceTimeIndex] = { 
                ...generateEmptyScheduleStructure(isEvenWeek, [allTimeSlots.find(ts=>ts.id === sourceCell.timeSlotId)])[sourceDayName][sourceTimeIndex]
            }; // Восстанавливаем пустую ячейку с ее timeSlotId
        } else { /* TODO: логика обмена, если целевая занята */ }
        return newSchedule;
    });

    try {
        if (targetCell.scheduledLessonId) { // Обмен
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${sourceCell.scheduledLessonId}/`, { time_slot: targetCell.timeSlotId }, { headers: { 'Authorization': `Bearer ${token}`}});
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${targetCell.scheduledLessonId}/`, { time_slot: sourceCell.timeSlotId }, { headers: { 'Authorization': `Bearer ${token}`}});
        } else { // Перемещение
            await axios.put(`http://localhost:8000/api/update/scheduledlesson/${sourceCell.scheduledLessonId}/`, { time_slot: targetCell.timeSlotId }, { headers: { 'Authorization': `Bearer ${token}`}});
        }
        fetchAndDisplaySchedule(); 
    } catch (err) {
        console.error("Ошибка при перемещении урока:", err); setError("Не удалось переместить урок.");
        setScheduleData(originalScheduleDataForRollback); 
    } finally {
        setIsLoadingLessons(false);
    }
  }, [editable, scheduleData, token, isEvenWeek, allTimeSlots, fetchAndDisplaySchedule]);


  // --- Логика отображения ---
  if (!token && !error) return <div className="schedule-error">Ошибка: Токен аутентификации не найден.</div>;
  
  // Показываем общий лоадер, пока грузятся таймслоты ИЛИ пока не установлен scheduleData (первичная инициализация)
  if (isLoadingTimeSlots || (!scheduleData && !error) ) { 
      return <div className="schedule-loading">Загрузка данных и конфигурации сетки...</div>;
  }
  
  // Если была ошибка на этапе загрузки таймслотов и scheduleData не установился
  if (error && !scheduleData) {
      return <div className="schedule-error">Ошибка ScheduleGrid: {error}</div>;
  }

  // Если scheduleData есть (хотя бы базовая структура), но есть ошибка от загрузки уроков
  if (error && scheduleData) {
      // Можно отобразить ошибку над сеткой
  }
  
  // Если scheduleData еще не успел заполниться после загрузки таймслотов (маловероятно, но для подстраховки)
  if (!scheduleData) {
      return <div className="schedule-loading">Инициализация сетки...</div>;
  }
  
  return (
    <div className="schedule-grid-container">
      {error && <div className="schedule-error encima-grid">{error}</div>} {/* Ошибка выводится над сеткой */}
      <div className="schedule-grid-week-toggle">
        <label className="schedule-grid-week-toggle-label">
          <input type="checkbox" checked={isEvenWeek} onChange={handleWeekToggle} className="schedule-grid-week-toggle-checkbox"/>
          {isEvenWeek ? 'Чётная неделя' : 'Нечётная неделя'}
        </label>
      </div>
      {isLoadingLessons && <div className="schedule-loading-inline">Загрузка уроков...</div>}

      <div className="schedule-grid-table">
        <div className="schedule-grid-header-row">
          <div className="schedule-grid-cell schedule-grid-time-header-cell">Время</div>
          {days.map((day) => ( <div key={day} className="schedule-grid-cell schedule-grid-day-header-cell">{day}</div> ))}
        </div>
        {times.map((time, timeIndex) => (
          <div key={`${time}-${isEvenWeek}-${filterId || 'no-filter'}`} className="schedule-grid-row">
            <div className="schedule-grid-cell schedule-grid-time-header-cell">{time}</div>
            {days.map((day) => {
              const lessonItem = scheduleData[day]?.[timeIndex] || 
                                 { id: `fallback-${day}-${timeIndex}-${isEvenWeek}`, lesson: '', scheduledLessonId: null, timeSlotId: null, lessonDetails: null };
              const canAddLesson = editable && !lessonItem.scheduledLessonId && lessonItem.timeSlotId;
              return (
                <div 
                    key={lessonItem.id} 
                    className={`schedule-grid-cell ${canAddLesson ? 'editable-empty-cell' : ''}`}
                    onClick={() => canAddLesson && openCreateLessonModal(day, timeIndex)}
                    title={canAddLesson ? "Добавить занятие" : (lessonItem.lesson || "")}
                >
                  <div className="schedule-lesson-content">
                    <input 
                      type="text" 
                      key={`input-${lessonItem.id}`} 
                      defaultValue={lessonItem.lesson} 
                      onBlur={(e) => editable && lessonItem.scheduledLessonId && handleLessonTextEdit(day, timeIndex, e.target.value)}
                      placeholder={canAddLesson ? "+" : "-"} 
                      className="schedule-grid-lesson-input" 
                      
                      disabled={!editable}
                      readOnly={!lessonItem.scheduledLessonId || !editable} // Только для существующих уроков (если есть), или если не редактируемый режим
                    />
                    {editable && lessonItem.scheduledLessonId && (
                      <button 
                          onClick={(e) => { 
                              e.stopPropagation(); // Предотвращаем всплытие до onClick ячейки
                              handleDeleteScheduledLesson(lessonItem.scheduledLessonId, day, timeIndex); 
                          }} 
                          className="delete-lesson-btn" // Добавьте стили для этой кнопки
                          title="Удалить занятие"
                      >
                        ✖ {/* Символ крестика (X) */}
                      </button>
                    )}
                    {editable && lessonItem.scheduledLessonId && (
                      <div className="lesson-move-buttons">
                        <button onClick={(e) => {e.stopPropagation(); handleMoveLesson(day, timeIndex, 'up')}} className="move-btn" title="Вверх">↑</button>
                        <button onClick={(e) => {e.stopPropagation(); handleMoveLesson(day, timeIndex, 'down')}} className="move-btn" title="Вниз">↓</button>
                        <button onClick={(e) => {e.stopPropagation(); handleMoveLesson(day, timeIndex, 'left')}} className="move-btn" title="Влево">←</button>
                        <button onClick={(e) => {e.stopPropagation(); handleMoveLesson(day, timeIndex, 'right')}} className="move-btn" title="Вправо">→</button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
      <CreateLessonModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setModalTargetCell(null); setError(''); }}
        onSubmit={handleCreateLessonSubmit}
        currentGroupId={filterId}
        token={token}
      />
    </div>
  );
}

export default ScheduleGrid;