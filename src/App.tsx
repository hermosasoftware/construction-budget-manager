import { Route, BrowserRouter, Routes, Navigate } from 'react-router-dom';

// Components
import Login from './components/views/Login/Login';
import SignUp from './components/views/SignUp/SignUp';
import Projects from './components/views/Projects/Projects';
import ProjectDetail from './components/views/ProjectDetail/ProjectDetail';
import OrderPreview from './components/views/ProjectDetail/Orders/OrderPreview/OrderPreview';
import ActivityPreview from './components/views/ProjectDetail/ExtraBudget/BudgetActivity/ActivityPreview/ActivityPreview';
import ForgotPassword from './components/views/ForgotPassword/ForgotPassword';
import PlayGround from './components/views/PlayGround';
import Sidebar from './components/layout/Sidebar';
import AuthRoute from './components/common/AuthRoute';
import Materials from './components/views/Materials/Materials';
import './App.css';
import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './redux/hooks';
import { handleAuthChange } from './providers/userAuthContextProvider';

function App() {
  const dispatch = useAppDispatch();
  const appStrings = useAppSelector(state => state.settings.appStrings);
  useEffect(() => {
    handleAuthChange(dispatch, appStrings);
  }, []);

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
          <Route
            path="/project-detail/:id"
            element={<AuthRoute component={ProjectDetail} />}
          />
          <Route
            path="/project-detail/:projectId/order-pdf-preview/:orderId"
            element={<AuthRoute component={OrderPreview} />}
          />
          <Route
            path="/project-detail/:projectId/extra-pdf-preview/:activityId"
            element={<AuthRoute component={ActivityPreview} />}
          />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          <Route path="*" element={<Navigate to={'/login'} />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;
