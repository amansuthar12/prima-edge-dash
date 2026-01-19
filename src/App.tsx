import React from 'react';
import Dashboard from './pages/Index';

const App = () => {
  // Demo / direct-access org user
  const user = {
    name: 'Suthar Dynamics',
    email: 'admin@suthardynamics.ai',
    role: 'Fleet Admin',
    organization: 'Suthar Dynamics',
  };

  return <Dashboard user={user} />;
};

export default App;
