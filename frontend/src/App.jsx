import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import DogsPage from './pages/DogsPage';
import WalkRequestsPage from './pages/WalkRequestsPage';

export default function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dogs" element={<DogsPage />} />
        <Route path="/walks" element={<WalkRequestsPage />} />
      </Routes>
    </>
  );
}
