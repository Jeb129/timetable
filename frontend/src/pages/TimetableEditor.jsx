import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ScheduleGrid from '../components/Schedule/ScheduleGrid';

export default function TimetableEditor() {
  const navigate = useNavigate();
    const handleCreateUser = () => {
    navigate('/create-user');
  };

  useEffect(() => {
    if (sessionStorage.getItem('auth') !== 'true') {
      navigate('/');
    }
  }, [navigate]);

  return (
        <div style={{ padding: '20px' }}>
      <h1>Редактирование расписания</h1>
      
      <button onClick={handleCreateUser} style={{ marginBottom: '10px' }}>
        Создать пользователя
      </button>
      <button
        onClick={() => {
        sessionStorage.removeItem('auth');
        navigate('/');
        }}
        className="bg-red-600 text-white px-4 py-2 rounded"
    >
        Выйти
  </button>

      <ScheduleGrid editable={true} />
    </div>
  );
}
