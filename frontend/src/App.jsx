import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import MyCourses from './pages/MyCourses';
import HelpCenter from './pages/HelpCenter';
import InstructorDashboard from './pages/InstructorDashboard';
import ContactUs from './pages/ContactUs';

function App() {
  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/instructor" element={<InstructorDashboard />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/my-courses" element={<MyCourses />} />
            <Route path="/help" element={<HelpCenter />} />
            <Route path="/faq" element={<HelpCenter />} />
            <Route path="/contact" element={<ContactUs />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;