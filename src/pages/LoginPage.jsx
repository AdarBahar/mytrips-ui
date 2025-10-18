import React from 'react';
import { Link } from 'react-router-dom';
import LoginForm from '../components/Auth/LoginForm';

const LoginPage = () => {
  return (
    <div className="login-page">
      <div className="login-page-container">
        <div className="login-header">
          <Link to="/" className="back-link">← Back to Home</Link>
        </div>
        
        <div className="login-content">
          <LoginForm />
        </div>
        
        <div className="login-footer">
          <p>Don't have an account? Contact your administrator.</p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
