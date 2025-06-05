import React from 'react';
import { Container } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Header from './components/Header';
import Footer from './components/Footer';
import AuthProvider from './components/AuthProvider';
import TokenInterceptor from './components/TokenInterceptor';

const App = () => {
  return (
    <AuthProvider>
      <TokenInterceptor />
      <div className='position-relative'>
        <Header />
        <main>
          <Container>
            <Outlet />
          </Container>
        </main>
        <Footer />
        <ToastContainer autoClose={1000} />
      </div>
    </AuthProvider>
  );
};

export default App;
