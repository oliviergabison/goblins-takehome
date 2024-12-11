// pages/login.tsx
import { useState } from 'react';
import { useRouter } from 'next/router';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import '../../styles/globals.css';

const LoginPage = () => {
    const [name, setName] = useState('');
    const router = useRouter();

    const handleLogin = async () => {
        const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name }),
        });

        if (res.ok) {
            router.push('/');
        } else {
            alert('Login failed');
        }
    };

    return (
        <div className="flex flex-col items-center p-[100px]">
            <div className="flex flex-col space-y-4">
                <h1>Contractor Login</h1>
                <Input
                    type="text"
                    placeholder="Enter your name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
                <Button onClick={handleLogin} disabled={!name}>
                    Login
                </Button>
            </div>
        </div>
    );
};

export default LoginPage;
