import { useNavigate } from 'react-router-dom';
import './navigation.css';

const Navigation = ({ links = [] }) => {
  const navigate = useNavigate();

  return (
    <nav className='nav-list'>
      {links.map(([path, label], index) => (
        <button
          key={index}
          className='nav-item'
          onClick={() => navigate(path)}
        >
          {label}
        </button>
      ))}
    </nav>
  );
};

export default Navigation;