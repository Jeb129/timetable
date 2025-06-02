// src/components/Schedule/ScheduleGrid.jsx
import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import './ScheduleGrid.css';

const times = ['08:30', '10:10', '11:50', '14:00', '15:40', '17:20'];
const days = ['Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'];

const initialSchedule = days.reduce((acc, day) => {
  acc[day] = times.map((time, i) => ({
    id: `${day}-${i}`,
    time,
    lesson: '',
  }));
  return acc;
}, {});

initialSchedule['Понедельник'][0].lesson = 'Математика';
initialSchedule['Понедельник'][1].lesson = 'Физика';
initialSchedule['Вторник'][2].lesson = 'История';

function ScheduleGrid() {
  const [schedule, setSchedule] = useState(initialSchedule);

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceDay = schedule[source.droppableId];
    const destDay = schedule[destination.droppableId];

    const sourceItem = sourceDay[source.index];
    const destItem = destDay[destination.index];

    if (!sourceItem.lesson) return;

    const updatedSchedule = { ...schedule };

    // Переместить пару
    updatedSchedule[source.droppableId][source.index].lesson = '';
    updatedSchedule[destination.droppableId][destination.index].lesson = sourceItem.lesson;

    setSchedule(updatedSchedule);
  };

  return (
    <div className="grid-container">
      <DragDropContext onDragEnd={onDragEnd}>
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
              {days.map((day) => (
                <Droppable droppableId={day} key={`${day}-${time}`}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="cell"
                    >
                      {schedule[day][timeIndex].lesson && (
                        <Draggable
                          draggableId={`${day}-${timeIndex}`}
                          index={timeIndex}
                        >
                          {(provided) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="lesson-card"
                            >
                              {schedule[day][timeIndex].lesson}
                            </div>
                          )}
                        </Draggable>
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              ))}
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}

export default ScheduleGrid;
