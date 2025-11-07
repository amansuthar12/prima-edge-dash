import React, { useState } from 'react';

const Signup = ({ onSignupSuccess, switchToLogin }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [message, setMessage] = useState('');

    const handleSignup = async (e) => {
        e.preventDefault();
        setMessage('');

        try {
            const res = await fetch('http://localhost:5000/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await res.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                setMessage('Signup successful!');
                onSignupSuccess(data.user);
            } else {
                setMessage('Signup failed: ' + (data.message || 'Unknown error'));
            }
        } catch (err) {
            setMessage('Server error');
        }
    };

    return (
        <div className="auth-container">
            <h2>Signup</h2>
            <form onSubmit={handleSignup}>
                <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                />
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />
                <button type="submit">Signup</button>
                {message && <p>{message}</p>}
            </form>
            <p>
                Already have an account?{' '}
                <button onClick={switchToLogin}>Login</button>
            </p>
        </div>
    );
};

export default Signup;
