// src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Header from './Components/Header';
import Login from './Components/Login';
import Register from './Components/Register';
import Home from './Components/Home';
import InvoicePage from './Components/InvoicePage';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function App() {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/invoice" element={<InvoicePage />} />
      </Routes>
      <ToastContainer />
    </Router>
  );
}

export default App;