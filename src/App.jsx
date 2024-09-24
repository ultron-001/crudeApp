import React from 'react';
import CreateBlog from './CreateBlog';
import './App.css';
import BlogsListView from './BlogsList';
import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import BlogView from './Show';
import BlogEdit from './Edit';
import Signin from './signup';
import HomePage from './pages/HomePage';
import Navbar from './Navbar';
import Footer from './Footer';

export default function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-content">
        <Routes>
          <Route exact path="/" element={<HomePage />} /> 
          <Route path="/signup" element={<Signin />} />
          <Route path="/CreateBlogs" element={<CreateBlog />} />  
          <Route path="/show/:id" element={<BlogView />} /> 
          <Route path="/editBlog/:id" element={<BlogEdit />} />
        </Routes>
      </div>
      <Footer />
    </Router>
  );
}