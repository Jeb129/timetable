import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimetableView from './pages/TimetableView';
import TimetableEditor from './pages/TimetableEditor';
import LoginPage from './pages/LoginPage';
import CreateUserPage from './pages/CreateUserPage';
import PrivateRoute from './components/PrivateRoute';
import CreateTeacherPage from './pages/CreateTeacherPage';
import CreateStudentGroupPage from './pages/CreateStudentGroupPage';
import CreateInstitutePage from './pages/CreateInstitutePage'; 
import CreateBuildingPage from './pages/CreateBuildingPage';
import CreateRoomPage from './pages/CreateRoomPage';
import CreateDisciplinePage from './pages/CreateDisciplinePage';
import CreateLessonTypePage from './pages/CreateLessonTypePage';
import CreatePairPage from './pages/CreatePairPage';
import CreateWeekdayPage from './pages/CreateWeekdayPage';
import CreateControlTypePage from './pages/CreateControlTypePage';
import CreateEquipmentPage from './pages/CreateEquipmentPage';
import CreateCurriculumPage from './pages/CreateCurriculumPage.jsx';
import CreateEducationDirectionPage from './pages/CreateEducationDirectionPage';
import CreateEducationFormPage from './pages/CreateEducationFormPage';
import CreateEducationLevelPage from './pages/CreateEducationLevelPage';
import Navigation from './components/navigation/navigation.jsx';


function App() {
  return (
    <Router>
      <Navigation links={[
        ['/','Просмотр расписания'],
        ['/login','Вход'],
        ['/edit','Редактирование расписания'],
      ]} />
      <Routes>
        <Route path="/" element={<TimetableView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={<TimetableEditor />} />
        <Route path="/create-user" element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
        <Route path="/admin/create-building" element={<PrivateRoute><CreateBuildingPage /></PrivateRoute>} />
        <Route path="/admin/create-room" element={<PrivateRoute><CreateRoomPage /></PrivateRoute>} />
        <Route  path="/admin/create-institute" element={ <PrivateRoute> <CreateInstitutePage /> </PrivateRoute>  }   />
        <Route  path="/admin/create-teacher"  element={ <PrivateRoute>  <CreateTeacherPage />   </PrivateRoute>  }  />
        <Route  path="/admin/create-studentgroup" element={ <PrivateRoute> <CreateStudentGroupPage />   </PrivateRoute>  } />
        <Route   path="/admin/create-discipline" element={<PrivateRoute><CreateDisciplinePage /></PrivateRoute>}  />
        <Route   path="/admin/create-lessontype" element={<PrivateRoute><CreateLessonTypePage /></PrivateRoute>} />
        <Route  path="/admin/create-pair" element={<PrivateRoute><CreatePairPage /></PrivateRoute>}  />
        <Route  path="/admin/create-weekday" element={<PrivateRoute><CreateWeekdayPage /></PrivateRoute>} />
        <Route  path="/admin/create-controltype" element={<PrivateRoute><CreateControlTypePage /></PrivateRoute>} />
        <Route  path="/admin/create-equipment" element={<PrivateRoute><CreateEquipmentPage /></PrivateRoute>} />
        <Route path="/admin/create-curriculum"  element={<PrivateRoute><CreateCurriculumPage /></PrivateRoute>}   />
        <Route  path="/admin/create-educationdirection" element={<PrivateRoute><CreateEducationDirectionPage /></PrivateRoute>}  />
        <Route  path="/admin/create-educationform" element={<PrivateRoute><CreateEducationFormPage /></PrivateRoute>}  />
        <Route  path="/admin/create-educationlevel" element={<PrivateRoute><CreateEducationLevelPage /></PrivateRoute>}  />
      </Routes>
    </Router>
  );
}

export default App;
