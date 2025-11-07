import { useState } from 'react';
import axios from 'axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [msg, setMsg] = useState('');

    const handleLogin = async () => {
        try {
            const res = await axios.post('http://localhost:5000/api/auth/login', { email, password });
            setMsg(`Welcome ${res.data.user.name}`);
            localStorage.setItem('token', res.data.token);
        } catch (err) {
            setMsg('Invalid login credentials');
        }
    };

    return (
        <div className="flex flex-col items-center p-10 bg-gray-100 h-screen justify-center">
            <h1 className="text-3xl mb-4 font-bold">Fleet Login</h1>
            <input type="email" placeholder="Email" className="p-2 m-2 border rounded"
                onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Password" className="p-2 m-2 border rounded"
                onChange={(e) => setPassword(e.target.value)} />
            <button onClick={handleLogin} className="bg-blue-600 text-white px-4 py-2 rounded">Login</button>
            <p className="mt-3 text-red-600">{msg}</p>
        </div>
    );
}
