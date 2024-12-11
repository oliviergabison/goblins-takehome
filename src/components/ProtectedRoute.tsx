// components/ProtectedRoute.tsx
import { JSX, useEffect, useState } from 'react';
import { useRouter } from 'next/router';

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const checkAuth = async () => {
            const res = await fetch('/api/auth');
            console.log(res);
            if (res.ok) {
                setLoading(false);
            } else {
                router.push('/login');
            }
        };
        checkAuth();
    }, [router]);

    if (loading) {
        return <p>Loading...</p>;
    }

    return children;
};

export default ProtectedRoute;
