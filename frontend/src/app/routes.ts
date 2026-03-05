import { createBrowserRouter } from "react-router";
import LandingPage from "./pages/landing";
import SymptomsPage from "./pages/symptoms";
import ResultsPage from "./pages/results";
import HospitalsPage from "./pages/hospitals";
import DoctorsPage from "./pages/doctors";
import BookingPage from "./pages/booking";
import LoginPage from "./pages/login";
import SignupPage from "./pages/signup";
import DashboardPage from "./pages/dashboard";
import TicketDetailPage from "./pages/ticket-detail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: LandingPage,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
  },
  {
    path: "/ticket/:ticketId",
    Component: TicketDetailPage,
  },
  {
    path: "/symptoms",
    Component: SymptomsPage,
  },
  {
    path: "/results",
    Component: ResultsPage,
  },
  {
    path: "/hospitals",
    Component: HospitalsPage,
  },
  {
    path: "/doctors/:hospitalId",
    Component: DoctorsPage,
  },
  {
    path: "/booking/:doctorId",
    Component: BookingPage,
  },
  {
    path: "/login",
    Component: LoginPage,
  },
  {
    path: "/signup",
    Component: SignupPage,
  },
]);