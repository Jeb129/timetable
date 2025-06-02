import React from 'react';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';
import { useNavigate } from 'react-router-dom';

export default function TimetableView() {
  const navigate = useNavigate();

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Расписание</h1>
        <button
          onClick={() => navigate('/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Войти
        </button>
      </div>
      <ScheduleGrid editable={false} />
    </div>
  );
}
