import { Route, BrowserRouter, Routes } from 'react-router-dom';

// Components
import Login from './components/views/Login/Login';
import SignUp from './components/views/SignUp/SignUp';
import Projects from './components/views/Projects/Projects';
import ForgotPassword from './components/views/ForgotPassword/ForgotPassword';
import PlayGround from './components/views/PlayGround';
import Sidebar from './components/layout/Sidebar';
import AuthRoute from './components/common/AuthRoute';
import './App.css';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Sidebar />
        <Routes>
          <Route path="/" element={<AuthRoute component={PlayGround} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
          <Route
            path="/projects"
            element={<AuthRoute component={Projects} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
