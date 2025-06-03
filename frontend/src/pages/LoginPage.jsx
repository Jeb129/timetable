// src/pages/LoginPage.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // Импортируем axios
import './Pages.css'; 

const EyeIcon = () => <span role="img" aria-label="Показать пароль" className="password-toggle-icon">👁️</span>;
const EyeSlashIcon = () => <span role="img" aria-label="Скрыть пароль" className="password-toggle-icon">🙈</span>;

export default function LoginPage() {
  const [username, setUsername] = useState(''); // Изменил 'login' на 'username' для соответствия API
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false); // Состояние для индикатора загрузки
  const navigate = useNavigate();

  const handleLogin = async (e) => { // Делаем функцию асинхронной
    e.preventDefault(); // Предотвращаем стандартную отправку формы, если бы это была <form>
    setError('');
    setIsLoading(true);

    try {
      // Отправляем POST-запрос на эндпоинт Django для получения токенов
      const response = await axios.post('http://localhost:8000/api/login/', {
        username: username, // Django simplejwt по умолчанию ожидает 'username'
        password: password,
      });

      // Если запрос успешен (статус 2xx), axios не выбросит ошибку
      if (response.data && response.data.access) {
        // Сохраняем токены в localStorage
        localStorage.setItem('accessToken', response.data.access);
        if (response.data.refresh) {
          localStorage.setItem('refreshToken', response.data.refresh);
        }

        // Устанавливаем флаг аутентификации для PrivateRoute
        sessionStorage.setItem('auth', 'true');
        
        // Перенаправляем на страницу редактирования или другую защищенную страницу
        navigate('/edit'); 
      } else {
        // Этого случая быть не должно, если API работает корректно и simplejwt возвращает токены
        setError('Не удалось получить токен от сервера. Ответ не содержит токенов.');
      }

    } catch (err) {
      // axios выбрасывает ошибку для статусов 4xx/5xx
      if (err.response && err.response.data) {
        // DRF simplejwt обычно возвращает ошибку в поле "detail" при неверных кредах
        // Другие ошибки могут быть в виде словаря {field: [errors]}
        const serverError = err.response.data;
        if (serverError.detail) {
            setError(serverError.detail);
        } else if (typeof serverError === 'object') {
            const messages = Object.values(serverError).flat().join('; ');
            setError(messages || 'Ошибка валидации данных.');
        } else {
            setError('Неверный логин или пароль.');
        }
      } else if (err.request) {
        // Запрос был сделан, но ответ не получен (например, сервер недоступен)
        setError('Ошибка сети: сервер не ответил.');
      } else {
        // Что-то пошло не так при настройке запроса
        setError('Произошла ошибка при отправке запроса.');
      }
      console.error("Login error:", err.response || err.request || err.message);
    } finally {
      setIsLoading(false); // В любом случае убираем индикатор загрузки
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <h2 className="login-title">Вход в систему</h2>
        {/* Оборачиваем в <form> для лучшей семантики и возможности отправки по Enter */}
        <form onSubmit={handleLogin}> 
            <div className="login-input-group">
            <label htmlFor="username-input" className="login-label">Логин (Username):</label> {/* Изменено для ясности */}
            <input
                id="username-input"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Введите ваш логин"
                className="login-input"
                required // Добавлено для базовой валидации браузером
            />
            </div>

            <div className="login-password-input-group">
            <label htmlFor="password-input" className="login-label">Пароль:</label>
            <input
                id="password-input"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите ваш пароль"
                className="login-input login-input-password"
                required // Добавлено
            />
            <button
                type="button" // Важно, чтобы не отправлял форму сам по себе
                onClick={toggleShowPassword}
                className="login-password-toggle-button"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
            >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
            </button>
            </div>

            <button 
                type="submit" // Теперь это кнопка отправки формы
                className="login-button"
                disabled={isLoading} // Блокируем кнопку во время запроса
            >
            {isLoading ? 'Вход...' : 'Войти'}
            </button>
            {error && <p className="login-error-message">{error}</p>}
        </form>
      </div>
    </div>
  );
}