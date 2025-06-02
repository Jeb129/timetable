import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimetableView from './pages/TimetableView';
import TimetableEditor from './pages/TimetableEditor';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import PrivateRoute from './components/PrivateRoute';



function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimetableView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={<TimetableEditor />} />
        <Route path="/create-user" element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
