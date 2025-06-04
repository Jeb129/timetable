import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TimetableView from './pages/TimetableView';
import TimetableEditor from './pages/TimetableEditor';
import LoginPage from './pages/LoginPage';
import PrivateRoute from './components/PrivateRoute';
import Navigation from './components/navigation/navigation.jsx';

import CreateDefaultPage from './pages/Creations/CreateDefault.jsx';
import CreateBuildingPage from './pages/Creations/Building/CreateBuildingPage.jsx';
import CreateControlTypePage from './pages/Creations/ControlType/CreateControlTypePage.jsx';
import CreateCurriculumPage from './pages/Creations/Curriculum/CreateCurriculumPage.jsx';
import CreateDisciplinePage from './pages/Creations/Discipline/CreateDisciplinePage.jsx';
import CreateEducationDirectionPage from './pages/Creations/EducationDirection/CreateEducationDirectionPage.jsx';
import CreateEducationFormPage from './pages/Creations/EducationForm/CreateEducationFormPage.jsx';
import CreateEducationLevelPage from './pages/Creations/EducationLevel/CreateEducationLevelPage.jsx';
import CreateEquipmentPage from './pages/Creations/Equipment/CreateEquipmentPage.jsx';
import CreateInstitutePage from './pages/Creations/Institute/CreateInstitutePage.jsx';
import CreateLessonTypePage from './pages/Creations/LessonType/CreateLessonTypePage.jsx';
import CreatePairPage from './pages/Creations/Pair/CreatePairPage.jsx';
import CreateRoomPage from './pages/Creations/Room/CreateRoomPage.jsx';
import CreateStudentGroupPage from './pages/Creations/StudentGroup/CreateStudentGroupPage.jsx';
import CreateTeacherPage from './pages/Creations/Teacher/CreateTeacherPage.jsx';
import CreateUserPage from './pages/Creations/User/CreateUserPage.jsx';
import CreateWeekdayPage from './pages/Creations/WeekDay/CreateWeekdayPage.jsx';

function App() {
  return (
    <Router>
      <Navigation links={[
        ['/','Просмотр расписания'],
        ['/login','Вход'],
        ['/edit','Редактирование расписания'],
        ['/dbcreate', 'Работа с БД']
      ]} />
      <Routes>
        <Route path="/" element={<TimetableView />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/edit" element={<PrivateRoute><TimetableEditor /></PrivateRoute>} />
        <Route path="/create-user" element={<PrivateRoute><CreateUserPage /></PrivateRoute>} />
        <Route path="/dbcreate" element={<PrivateRoute><CreateDefaultPage /></PrivateRoute>} />
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
         <Route 
          path="/admin/initialize-timeslots" // Выберите путь, например, такой
          element={
            <PrivateRoute> {/* Защищаем, чтобы только админ мог это делать */}
              <InitializeTimeSlotsPage />
            </PrivateRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
