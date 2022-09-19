import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

// Components
import Login from './components/views/Login/Login';
import SignUp from './components/views/SignUp/SignUp';
import Projects from './components/views/Projects/Projects';
import ForgotPassword from './components/views/ForgotPassword/ForgotPassword';
import PlayGround from './components/views/PlayGround';
import Sidebar from './components/layout/Sidebar';
import AuthRoute from './components/common/AuthRoute';
import Materials from './components/views/Materials/Materials';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        {/* <Sidebar /> */}
        <Routes>
          <Route path="/" element={<AuthRoute component={PlayGround} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/projects"
            element={<AuthRoute component={Projects} />}
          />
          <Route
            path="/materials"
            element={<AuthRoute component={Materials} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="*" element={<Navigate to={'/login'} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
