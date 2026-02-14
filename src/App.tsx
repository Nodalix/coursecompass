import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ProfileProvider, useProfile } from './context/ProfileContext';
import Layout from './components/Layout';
import DashboardPage from './pages/DashboardPage';
import GenEdPage from './pages/GenEdPage';
import ChatPage from './pages/ChatPage';
import OnboardingPage from './pages/OnboardingPage';

function AppRoutes() {
  const { profiles } = useProfile();

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route
          path="/"
          element={
            profiles.length === 0 ? <Navigate to="/onboarding" replace /> : <DashboardPage />
          }
        />
        <Route path="/gen-ed" element={<GenEdPage />} />
        <Route path="/chat" element={<ChatPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
      </Route>
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ProfileProvider>
        <AppRoutes />
      </ProfileProvider>
    </BrowserRouter>
  );
}
