import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './ScheduleGrid.css';

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const generateEmptySchedule = () =>
  days.reduce((acc, day) => {
    acc[day] = times.map((time, index) => ({
      id: `${day}-${index}-${Math.random().toString(36).substr(2, 5)}`, // Уникальный ID
      time,
      lesson: '',
    }));
    return acc;
  }, {});

// Инициализируем два расписания
const initialEvenSchedule = generateEmptySchedule();
initialEvenSchedule['Понедельник'][0].lesson = 'Математика';
initialEvenSchedule['Понедельник'][1].lesson = 'Физика';

const initialOddSchedule = generateEmptySchedule();
initialOddSchedule['Вторник'][2].lesson = 'История';

function ScheduleGrid({ editable = false }) {
  const [isEvenWeek, setIsEvenWeek] = useState(true);
  const [evenSchedule, setEvenSchedule] = useState(initialEvenSchedule);
  const [oddSchedule, setOddSchedule] = useState(initialOddSchedule);

  const schedule = isEvenWeek ? evenSchedule : oddSchedule;
  const setSchedule = isEvenWeek ? setEvenSchedule : setOddSchedule;

  const handleWeekToggle = () => setIsEvenWeek(!isEvenWeek);

 const onDragEnd = (result) => {
  const { source, destination } = result;
  if (!destination) return;

  // 👇 Добавлено: если не переместили — выходим
  if (
    source.droppableId === destination.droppableId &&
    source.index === destination.index
  ) {
    return;
  }

  const sourceDay = source.droppableId;
  const destDay = destination.droppableId;

  const sourceItems = Array.from(schedule[sourceDay]);
  const destItems = Array.from(schedule[destDay]);

  const draggedItem = { ...sourceItems[source.index] };

  if (!draggedItem.lesson) return;

  sourceItems[source.index].lesson = '';
  destItems[destination.index].lesson = draggedItem.lesson;

  const updatedSchedule = {
    ...schedule,
    [sourceDay]: sourceItems,
    [destDay]: destItems,
  };

  setSchedule(updatedSchedule);
};


    return (
    <div className="grid-container">
      <div className="week-toggle">
        <label>
          <input
            type="checkbox"
            checked={isEvenWeek}
            onChange={handleWeekToggle}
          />
          Чётная неделя
        </label>
      </div>

      {editable ? (
        <DragDropContext onDragEnd={onDragEnd}>
          {/* drag-and-drop код */}
        </DragDropContext>
      ) : (
        <div>
          <div className="grid-header">
            <div className="time-slot-header"></div>
            {days.map((day) => (
              <div key={day} className="day-column-header">{day}</div>
            ))}
          </div>

          <div className="grid-body">
            {times.map((time, timeIndex) => (
              <div key={time} className="row">
                <div className="time-slot">{time}</div>
                {days.map((day) => {
                  const slot = schedule[day][timeIndex];
                  return (
                    <div key={`${day}-${timeIndex}`} className="cell">
                      {slot.lesson && (
                        <div className="lesson-card">{slot.lesson}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ScheduleGrid;
