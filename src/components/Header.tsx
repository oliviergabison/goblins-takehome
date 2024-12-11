// components/Header.tsx (add the Export button)
import { useContractorName } from '@/hooks/useContractorName';
import { useRouter } from 'next/router';
import { Button } from './ui/button';
import { usePathname } from 'next/navigation';

const Header = () => {
    const name = useContractorName();
    const router = useRouter();
    const pathname = usePathname();

    const handleLogout = async () => {
        await fetch('/api/auth', { method: 'DELETE' });
        router.push('/login');
    };

    const handleExport = () => {
        window.location.href = '/api/export';
    };

    return (
        <div className="flex justify-between items-center p-[20px] bg-gray-100">
            <h2>Goblins Labeling Interface</h2>
            <div className="flex space-x-4 items-center">
                {name && (
                    <>
                        <span className="mr-8">Welcome, {name}</span>
                        {pathname === '/' && (
                            <Button onClick={handleExport}>Export CSV</Button>
                        )}
                        <Button onClick={handleLogout}>Logout</Button>
                    </>
                )}
            </div>
        </div>
    );
};

export default Header;
