// pages/whiteboard/[id].tsx
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import { Whiteboard } from '../../../types';
import dynamic from 'next/dynamic';

const WhiteboardAnnotator = dynamic(
    () => import('../../components/WhiteboardAnnotator'),
    {
        ssr: false,
    },
);

const WhiteboardPage = () => {
    const router = useRouter();
    const { id } = router.query;
    const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (id) {
            const fetchWhiteboard = async () => {
                const res = await fetch(`/api/whiteboards/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    console.log(data);
                    setWhiteboard(data);
                }
                setLoading(false);
            };
            fetchWhiteboard();
        }
    }, [id]);

    const handleSave = () => {
        // Refresh the whiteboard data after saving a chunk
        if (id) {
            const fetchWhiteboard = async () => {
                const res = await fetch(`/api/whiteboards/${id}`);
                if (res.ok) {
                    const data = await res.json();
                    setWhiteboard(data);
                }
            };
            fetchWhiteboard();
        }
    };

    if (loading) return <p>Loading...</p>;
    if (!whiteboard) return <p>Whiteboard not found</p>;

    return (
        <ProtectedRoute>
            <>
                <Header />
                <div className="flex justify-center w-full">
                    <WhiteboardAnnotator
                        whiteboardId={whiteboard.id}
                        imageUrl={whiteboard.image_url}
                        onSave={handleSave}
                    />
                </div>
                <style jsx>{`
                    .container {
                        padding: 20px;
                    }
                `}</style>
            </>
        </ProtectedRoute>
    );
};

export default WhiteboardPage;
