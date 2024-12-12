// components/WhiteboardList.tsx
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Header from './Header';
import { Whiteboard } from '../../types';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from './ui/table';
import { Button } from './ui/button';
import { CheckCircle, X } from 'lucide-react';

const WhiteboardList = () => {
    const [whiteboards, setWhiteboards] = useState<Whiteboard[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchWhiteboards = async () => {
            const res = await fetch('/api/whiteboards');
            if (res.ok) {
                const data = await res.json();
                setWhiteboards(data);
            }
            setLoading(false);
        };
        fetchWhiteboards();
    }, []);

    if (loading) return <p>Loading whiteboards...</p>;
    return (
        <>
            <Header />
            <div className="p-8">
                <Table>
                    <TableCaption>List of Whiteboards to Review</TableCaption>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <TableHead>Whiteboard ID</TableHead>
                            <TableHead></TableHead>
                            <TableHead>Completed?</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {whiteboards.map((wb, index) => (
                            <TableRow key={index}>
                                <TableCell>{index + 1}</TableCell>
                                <TableCell className="whitespace-nowrap">
                                    <p>{wb.id}</p>
                                </TableCell>

                                <TableCell>
                                    <Link href={`/whiteboard/${wb.id}`}>
                                        <Button className="bg-slate-800">
                                            Open Task
                                        </Button>
                                    </Link>
                                </TableCell>
                                <TableCell style={{ verticalAlign: 'middle' }}>
                                    {wb.complete ? (
                                        <CheckCircle className="ml-6 inline-block text-green-500" />
                                    ) : (
                                        <X className="ml-6 inline-block text-red-500" />
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
                <ul></ul>
            </div>
        </>
    );
};

export default WhiteboardList;
