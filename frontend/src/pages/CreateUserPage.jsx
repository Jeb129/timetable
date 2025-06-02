import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const token = localStorage.getItem('accessToken');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch('/api/create-user/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ username, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Ошибка создания пользователя');
        return;
      }

      alert('Пользователь создан!');
      navigate('/schedule');
    } catch (err) {
      setError('Ошибка подключения к серверу');
    }
  };

  return (
    <div className="create-user-form">
      <h2>Создание пользователя</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Создать</button>
        {error && <p className="error">{error}</p>}
      </form>
    </div>
  );
}

export default CreateUserPage;
