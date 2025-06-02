import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

// Простые SVG иконки для глаза (можно заменить на более сложные или из библиотеки)
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const EyeSlashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
  </svg>
);

export default function LoginPage() {
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false); // Состояние для видимости пароля
  const navigate = useNavigate();

  const handleLogin = () => {
    if (login === 'admin' && password === 'admin') {
      sessionStorage.setItem('auth', 'true');
      navigate('/edit');
    } else {
      alert('Неверные данные');
    }
  };

  const toggleShowPassword = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-blue-50"> {/* Фон всей страницы */}
      <div className="p-8 max-w-md mx-auto bg-white rounded-lg shadow-xl"> {/* Контейнер формы с белым фоном и тенью */}
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-700">Вход</h2> {/* Заголовок */}
        
        <div className="mb-4">
          <label htmlFor="login-input" className="block text-sm font-medium text-gray-700 mb-1">Логин</label>
          <input
            id="login-input"
            type="text"
            value={login}
            onChange={(e) => setLogin(e.target.value)}
            placeholder="Введите ваш логин"
            className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out"
          />
        </div>

        <div className="mb-6 relative"> {/* Обертка для поля пароля и кнопки */}
          <label htmlFor="password-input" className="block text-sm font-medium text-gray-700 mb-1">Пароль</label>
          <input
            id="password-input"
            type={showPassword ? 'text' : 'password'} // Динамическое изменение типа поля
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Введите ваш пароль"
            className="border border-gray-300 p-3 w-full rounded-md focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition duration-150 ease-in-out pr-10" // pr-10 для места под иконку
          />
          <button
            type="button" // Важно для кнопок, не отправляющих форму
            onClick={toggleShowPassword}
            className="absolute inset-y-0 right-0 top-7 flex items-center px-3 text-blue-500 hover:text-blue-700 focus:outline-none" // Стили кнопки "показать/скрыть пароль"
            aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
          >
            {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
          </button>
        </div>

        <button 
          onClick={handleLogin} 
          className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-3 rounded-md font-semibold transition duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Войти
        </button>
      </div>
    </div>
  );
}