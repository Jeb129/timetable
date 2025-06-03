import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // <--- ВАЖНО: Импортируем CSS файл

// Иконки можно оставить как компоненты или использовать символы/SVG напрямую в JSX
const EyeIcon = () => <span role="img" aria-label="Показать пароль" className="password-toggle-icon">👁️</span>;
const EyeSlashIcon = () => <span role="img" aria-label="Скрыть пароль" className="password-toggle-icon">🙈</span>;

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    setError('');
    if (login === 'admin' && password === 'admin') {
      sessionStorage.setItem('auth', 'true');
      navigate('/edit');
    } else {
      setError('Неверный логин или пароль');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="login-page-container">
      <div className="login-form-container">
        <h2 className="login-title">Вход в систему</h2>
        
        <div className="login-input-group">
          <label htmlFor="login-input" className="login-label">Логин</label>
          <input
            id="login-input"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Логин"
            className="login-input"
          />
        </div>

        <div className="login-password-input-group"> {/* Для позиционирования кнопки */}
          <label htmlFor="password-input" className="login-label">Пароль</label>
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Пароль"
            className="login-input login-input-password" // Дополнительный класс для отступа
          />
          <button
            type="button"
            onClick={toggleShowPassword}
            className="login-password-toggle-button"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>

        <button 
          onClick={handleLogin} 
          className="login-button"
        >
          Войти
        </button>
        {error && <p className="login-error-message">{error}</p>}
      </div>
    </div>
  );
}