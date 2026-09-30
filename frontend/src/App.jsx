import { useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import CourseDetail from './pages/CourseDetail';
import MyCourses from './pages/MyCourses';
import Learn from './pages/Learn';
import CreateLesson from './pages/CreateLesson';
import CreateCourse from './pages/CreateCourse';
import { BookmarkProvider } from './context/BookmarkContext';

function AppContent() {
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const isLearnPage = location.pathname.startsWith('/learn');

  return (
    <>
      {!isLearnPage && <Navbar onSearchChange={setSearchQuery} searchQuery={searchQuery} />}
      <main className={isLearnPage ? 'min-h-screen bg-slate-950' : 'min-h-screen bg-slate-50'}>
        <Routes>
          <Route path="/" element={<Home externalSearchQuery={searchQuery} />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/create-course" element={<CreateCourse />} />
          <Route path="/course/:id" element={<CourseDetail />} />
          <Route path="/my-courses" element={<MyCourses />} />
          <Route path="/learn/:id" element={<Learn />} />
          <Route path="/course/:id/create-lesson" element={<CreateLesson />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <BookmarkProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </BookmarkProvider>
  );
}

export default App;