import { BrowserRouter, Routes, Route } from 'react-router';
import LandingPage from './pages/landing';
import SymptomsPage from './pages/symptoms';
import ResultsPage from './pages/results';
import HospitalsPage from './pages/hospitals';
import DoctorsPage from './pages/doctors';
import BookingPage from './pages/booking';
import LoginPage from './pages/login';
import SignupPage from './pages/signup';
import DashboardPage from './pages/dashboard';
import TicketDetailPage from './pages/ticket-detail';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/symptoms" element={<SymptomsPage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/hospitals" element={<HospitalsPage />} />
        <Route path="/doctors/:hospitalId" element={<DoctorsPage />} />
        <Route path="/booking/:doctorId" element={<BookingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/ticket/:ticketId" element={<TicketDetailPage />} />
      </Routes>
    </BrowserRouter>
  );
}
