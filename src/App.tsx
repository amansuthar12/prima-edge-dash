import React, { useState, useEffect } from 'react';
import Dashboard from './pages/Index';
import Login from './pages/Login';
import Signup from './pages/Signup';

const App = () => {
  const [user, setUser] = useState(null);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // You could validate token via backend here if needed
      setUser({ name: 'Aman Suthar', email: 'aman@example.com' }); // Dummy until API check
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-950 text-white">
        {isSignup ? (
          <Signup
            onSignupSuccess={setUser}
            switchToLogin={() => setIsSignup(false)}
          />
        ) : (
          <Login
            onLoginSuccess={setUser}
            switchToSignup={() => setIsSignup(true)}
          />
        )}
      </div>
    );
  }

  return <Dashboard user={user} onLogout={handleLogout} />;
};

export default App;
