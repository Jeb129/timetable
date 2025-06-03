import React, { useState, useEffect } from 'react'; // Добавил useEffect для проверки токена
import { useNavigate } from 'react-router-dom';
import './Pages.css'; // Убедитесь, что путь правильный

function CreateUserPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate(); // Инициализируем hook

    const handleGoBack = () => {
        navigate(-1); // Переход на предыдущую страницу в истории браузера
        // или navigate('/edit'); // Переход на конкретную страницу редактирования
    };

  // Лучше получать токен непосредственно перед запросом или проверять его актуальность
  // Но для примера оставим так. Или можно вынести в useEffect для проверки при загрузке.
  const token = sessionStorage.getItem('auth') === 'true' ? "some_dummy_token_if_needed_by_api" : null; 
  // Важно: API ожидает Bearer токен. sessionStorage 'auth'='true' - это просто флаг аутентификации.
  // Вам нужен реальный JWT токен, если API его требует.
  // Если ваше API /api/create-user/ не требует Bearer токена, когда вы уже авторизованы через сессию Django,
  // то заголовок Authorization можно и не отправлять.
  // Я предполагаю, что 'auth'='true' в sessionStorage означает, что сессия Django активна,
  // и fetch автоматически отправит куки сессии.

  useEffect(() => {
    // Перенаправляем, если пользователь не авторизован (например, если sessionStorage 'auth' не 'true')
    if (sessionStorage.getItem('auth') !== 'true') {
      navigate('/login'); // или на главную, если неавторизованным нельзя сюда
      alert('Для создания пользователя необходимо войти в систему.');
    }
  }, [navigate]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!username || !password) {
        setError('Имя пользователя и пароль обязательны.');
        return;
    }
    if (password.length < 6) { // Пример простой валидации
        setError('Пароль должен быть не менее 6 символов.');
        return;
    }

    const actualToken = localStorage.getItem('accessToken'); // Если используете реальный JWT токен

    try {
      const headers = {
        'Content-Type': 'application/json',
      };
      // Если ваше API /api/create-user/ защищено JWT токеном
      if (actualToken) {
        headers['Authorization'] = `Bearer ${actualToken}`;
      }
      // Если API использует сессии Django, то Authorization не нужен, куки отправятся автоматически.

      const res = await fetch('/api/create-user/', { // Убедитесь, что этот URL настроен в Django urls.py
        method: 'POST',
        headers: headers,
        body: JSON.stringify({ username, password }),
      });

      const responseData = await res.json().catch(() => null); // Попытка прочитать JSON, даже если ошибка

      if (!res.ok) {
        setError(responseData?.error || responseData?.detail || `Ошибка: ${res.status} ${res.statusText}`);
        return;
      }

      alert('Пользователь успешно создан!');
      navigate('/edit'); // Перенаправляем на страницу редактирования или куда вам нужно
    } catch (err) {
      console.error("Fetch error:", err);
      setError('Ошибка подключения к серверу. Проверьте консоль.');
    }
  };

  return (
    <div className="create-user-page-container">
      <div className="create-user-form-wrapper">
        <div className="admin-form-header">
        <h2>Создание нового пользователя</h2>
        <button onClick={handleGoBack} className="admin-form-back-button">
                        ← Назад 
                    </button>
                    </div>
        <form onSubmit={handleSubmit}>
          <div className="form-input-group">
            <label htmlFor="username">Имя пользователя:</label>
            <input
              id="username"
              type="text"
              placeholder="Введите имя пользователя"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>
          <div className="form-input-group">
            <label htmlFor="password">Пароль:</label>
            <input
              id="password"
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit">Создать пользователя</button>
          {error && <p className="error-message">{error}</p>} {/* Изменен класс */}
        </form>
      </div>
    </div>
  );
}

export default CreateUserPage;