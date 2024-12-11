// pages/index.tsx
import WhiteboardList from '@/components/WhiteboardList';
import ProtectedRoute from '../components/ProtectedRoute';
import '../../styles/globals.css';

const HomePage = () => {
    return (
        <ProtectedRoute>
            <WhiteboardList />
        </ProtectedRoute>
    );
};

export default HomePage;
