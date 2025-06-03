import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './ScheduleGrid.css'; // Импорт CSS

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const generateEmptySchedule = () =>
  days.reduce((acc, day) => {
    acc[day] = times.map((time, index) => ({
      id: `${day}-${time}-${index}-${Math.random().toString(36).substr(2, 9)}`,
      time,
      lesson: '',
    }));
    return acc;
  }, {});

const initialEvenSchedule = generateEmptySchedule();
initialEvenSchedule['Понедельник'][0].lesson = 'Математика (Ч)';
initialEvenSchedule['Понедельник'][1].lesson = 'Физика (Ч)';

const initialOddSchedule = generateEmptySchedule();
initialOddSchedule['Вторник'][2].lesson = 'История (НЧ)';

function ScheduleGrid({ editable = false, filterId = null }) {
  const [isEvenWeek, setIsEvenWeek] = useState(true);
  const [evenSchedule, setEvenSchedule] = useState(initialEvenSchedule);
  const [oddSchedule, setOddSchedule] = useState(initialOddSchedule);

  // useEffect для загрузки/обновления данных при смене filterId или isEvenWeek
  // useEffect(() => {
  //   console.log(`Current filterId: ${filterId}, Week: ${isEvenWeek ? 'Четная' : 'Нечетная'}`);
  //   // Здесь будет логика загрузки данных с сервера
  //   // Например: loadSchedule(filterId, isEvenWeek).then(data => {
  //   //   if (isEvenWeek) setEvenSchedule(data.even || generateEmptySchedule());
  //   //   else setOddSchedule(data.odd || generateEmptySchedule());
  //   // });
  //   // Пока что просто сбрасываем на initial для демонстрации, если filterId меняется
  //   // (В реальном приложении это может быть не нужно, если filterId меняется редко или данные грузятся один раз)
  //   // setEvenSchedule(initialEvenSchedule); 
  //   // setOddSchedule(initialOddSchedule);
  // }, [filterId, isEvenWeek]);


  const currentSchedule = isEvenWeek ? evenSchedule : oddSchedule;
  const setCurrentScheduleState = isEvenWeek ? setEvenSchedule : setOddSchedule;

  const handleWeekToggle = () => setIsEvenWeek(!isEvenWeek);

  const handleLessonChange = (day, timeIndex, newLesson) => {
    const updatedDaySchedule = [...currentSchedule[day]];
    updatedDaySchedule[timeIndex] = { ...updatedDaySchedule[timeIndex], lesson: newLesson };
    
    const newFullSchedule = {
      ...currentSchedule,
      [day]: updatedDaySchedule,
    };
    setCurrentScheduleState(newFullSchedule);
    // console.log('Lesson changed, new schedule:', newFullSchedule); // Для дебага
  };

  const onDragEnd = (result) => {
    const { source, destination, draggableId } = result;
    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }
    
    // droppableId у нас "day-timeIndex"
    const [sourceDay, sourceTimeIdxStr] = source.droppableId.split('-');
    const sourceTimeIndex = parseInt(sourceTimeIdxStr, 10);

    const [destDay, destTimeIdxStr] = destination.droppableId.split('-');
    const destTimeIndex = parseInt(destTimeIdxStr, 10);
    
    const scheduleCopy = JSON.parse(JSON.stringify(currentSchedule));

    const sourceLessonItem = { ...scheduleCopy[sourceDay][sourceTimeIndex] };
    const destLessonItem = { ...scheduleCopy[destDay][destTimeIndex] };

    // Обмен уроками
    scheduleCopy[destDay][destTimeIndex].lesson = sourceLessonItem.lesson;
    scheduleCopy[sourceDay][sourceTimeIndex].lesson = destLessonItem.lesson;
    
    // Важно: ID самих элементов (ячеек/слотов) должны оставаться привязанными к их позиции,
    // а ID перетаскиваемых элементов (draggableId) - это ID самих уроков.
    // В нашей модели ID урока меняется вместе с ним.
    // Если ID должен быть статичным для ячейки, то нужно менять только .lesson
    // scheduleCopy[destDay][destTimeIndex].id = sourceLessonItem.id; // Если ID тоже должен перемещаться
    // scheduleCopy[sourceDay][sourceTimeIndex].id = destLessonItem.id; // Если ID тоже должен перемещаться

    setCurrentScheduleState(scheduleCopy);
    // console.log('Drag ended, new schedule:', scheduleCopy); // Для дебага
  };

  return (
    <div className="schedule-grid-container">
      <div className="schedule-grid-week-toggle">
        <label className="schedule-grid-week-toggle-label">
          <input
            type="checkbox"
            checked={isEvenWeek}
            onChange={handleWeekToggle}
            className="schedule-grid-week-toggle-checkbox"
          />
          {isEvenWeek ? 'Чётная неделя' : 'Нечётная неделя'}
        </label>
      </div>

      <div className="schedule-grid-table">
        <div className="schedule-grid-header-row">
          <div className="schedule-grid-cell schedule-grid-time-header-cell">Время</div>
          {days.map((day) => (
            <div key={day} className="schedule-grid-cell schedule-grid-day-header-cell">{day}</div>
          ))}
        </div>

        {editable ? (
          <DragDropContext onDragEnd={onDragEnd}>
            {times.map((time, timeIndex) => (
              <div key={time} className="schedule-grid-row">
                <div className="schedule-grid-cell schedule-grid-time-header-cell">{time}</div>
                {days.map((day) => {
                  const lessonItem = currentSchedule[day][timeIndex];
                  const droppableId = `${day}-${timeIndex}`;
                  return (
                    <Droppable key={droppableId} droppableId={droppableId}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                          className={`schedule-grid-cell ${snapshot.isDraggingOver ? 'schedule-grid-cell-dragging-over' : ''}`}
                          // style со snapshot.isDraggingOver не нужен, т.к. есть класс
                        >
                          <Draggable
                            key={lessonItem.id}
                            draggableId={lessonItem.id}
                            index={0} // В каждой ячейке один Draggable
                            isDragDisabled={!editable} // Тащить можно всегда, если editable
                          >
                            {(providedDraggable, snapshotDraggable) => (
                              <div
                                ref={providedDraggable.innerRef}
                                {...providedDraggable.draggableProps}
                                {...providedDraggable.dragHandleProps}
                                // Важно передать style от providedDraggable для корректной работы dnd
                                style={providedDraggable.draggableProps.style}
                                className={`schedule-grid-draggable-lesson ${snapshotDraggable.isDragging ? 'schedule-grid-lesson-dragging' : ''}`}
                              >
                                <input
                                  type="text"
                                  value={lessonItem.lesson}
                                  onChange={(e) => handleLessonChange(day, timeIndex, e.target.value)}
                                  placeholder="-"
                                  className="schedule-grid-lesson-input"
                                  disabled={!editable}
                                />
                              </div>
                            )}
                          </Draggable>
                          {/* provided.placeholder не обязателен здесь, т.к. у нас сетка */}
                        </div>
                      )}
                    </Droppable>
                  );
                })}
              </div>
            ))}
          </DragDropContext>
        ) : ( // Режим просмотра
          times.map((time, timeIndex) => (
            <div key={time} className="schedule-grid-row">
              <div className="schedule-grid-cell schedule-grid-time-header-cell">{time}</div>
              {days.map((day) => {
                const slot = currentSchedule[day][timeIndex];
                return (
                  <div key={`${day}-${timeIndex}`} className="schedule-grid-cell">
                    <div className={`schedule-grid-lesson-card ${!slot.lesson ? 'schedule-grid-lesson-card-empty' : ''}`}>
                      {slot.lesson || '-'}
                    </div>
                  </div>
                );
              })}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default ScheduleGrid;