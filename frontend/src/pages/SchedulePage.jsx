import { useNavigate } from 'react-router-dom';

// внутри компонента
const navigate = useNavigate();

{isAuthenticated && (
  <button onClick={() => navigate('/create-user')} className="create-user-button">
    Добавить пользователя
  </button>
)}
