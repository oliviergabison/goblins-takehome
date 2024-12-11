import { useState, useEffect } from 'react';

export function useContractorName() {
    const [name, setName] = useState<string | null>(null);

    useEffect(() => {
        const fetchAuth = async () => {
            try {
                const res = await fetch('/api/auth');
                if (res.ok) {
                    const data = await res.json();
                    setName(data.name);
                }
            } catch (error) {
                console.error('Error fetching auth data:', error);
            }
        };
        fetchAuth();
    }, []);

    return name;
}
