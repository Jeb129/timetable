import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimetableView from './pages/TimetableView';
import TimetableEditor from './pages/TimetableEditor';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import PrivateRoute from './components/PrivateRoute';
import CreateTeacherPage from './pages/CreateTeacherPage';
import CreateStudentGroupPage from './pages/CreateStudentGroupPage';
import CreateInstitutePage from './pages/CreateInstitutePage'; 


function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TimetableView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={<TimetableEditor />} />
        <Route path="/create-user" element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
        <Route 
          path="/admin/create-institute"
          element={
            <PrivateRoute>
              <CreateInstitutePage /> 
            </PrivateRoute>
          } 
        />
        <Route  path="/admin/create-teacher"  element={ <PrivateRoute>  <CreateTeacherPage />   </PrivateRoute>  }  />
        <Route  path="/admin/create-studentgroup" element={ <PrivateRoute> <CreateStudentGroupPage />   </PrivateRoute>  } />
      </Routes>
    </Router>
  );
}

export default App;
