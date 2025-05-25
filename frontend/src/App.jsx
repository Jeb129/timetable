// src/App.jsx
import React from 'react';
import ScheduleGrid from './components/Schedule/ScheduleGrid';

function App() {
  return (
    <div>
      <h1 style={{ textAlign: 'center' }}>Расписание университета</h1>
      <ScheduleGrid />
    </div>
  );
}

export default App;
