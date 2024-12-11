'use client';
import React, { useState, useRef, useEffect } from 'react';
import {
    Stage,
    Layer,
    Rect,
    Image as KonvaImage,
    Group,
    Text,
} from 'react-konva';
import useImage from 'use-image';
import { ConfidenceLevel, Whiteboard } from '../../types';
import '../../styles/globals.css';
import { Button } from './ui/button';
import { useContractorName } from '@/hooks/useContractorName';
import Link from 'next/link';
import Konva from 'konva';

interface AnnotatorProps {
    whiteboardId: string;
    imageUrl: string;
    onSave: () => void;
}

interface Chunk {
    id: string;
    coordinates: { x: number; y: number; width: number; height: number };
    transcription: string;
    confidence: ConfidenceLevel;
    contractor: string;
    whiteboardId: string; // Add this property
    createdAt: Date; // Add this property
}

const WhiteboardAnnotator: React.FC<AnnotatorProps> = ({
    whiteboardId,
    imageUrl,
    onSave,
}) => {
    const contractorName = useContractorName();

    const [image] = useImage(imageUrl);
    const stageRef = useRef<Konva.Stage | null>(null); // Specify the type for stageRef

    // Store the entire whiteboard in one state variable
    const [whiteboard, setWhiteboard] = useState<Whiteboard | null>(null);

    const [currentRect, setCurrentRect] = useState<{
        x?: number;
        y?: number;
        width?: number;
        height?: number;
    }>({});
    const [isDrawing, setIsDrawing] = useState(false);
    const [transcription, setTranscription] = useState('');
    const [confidence, setConfidence] = useState<ConfidenceLevel>('high');

    const startPos = useRef<{ x: number; y: number } | null>(null);

    useEffect(() => {
        async function fetchWhiteboard() {
            try {
                const res = await fetch(`/api/whiteboards/${whiteboardId}`);
                if (res.ok) {
                    const wb = await res.json();
                    // Ensure chunks and complete are present
                    if (
                        wb &&
                        Array.isArray(wb.chunks) &&
                        typeof wb.complete === 'boolean'
                    ) {
                        setWhiteboard(wb);
                    } else {
                        console.error(
                            'Whiteboard data is missing chunks or complete field',
                        );
                    }
                } else {
                    console.error('Failed to load whiteboard data');
                }
            } catch (error) {
                console.error('Error fetching whiteboard:', error);
            }
        }

        fetchWhiteboard();
    }, [whiteboardId]);

    const handleMouseDown = () => {
        const stage = stageRef.current;
        setCurrentRect({});
        if (!stage) return;
        const pos = stage.getPointerPosition();
        if (!pos) return;

        startPos.current = { x: pos.x, y: pos.y };
        setIsDrawing(true);
    };

    const handleMouseMove = () => {
        if (!isDrawing || !startPos.current) return;
        const stage = stageRef.current;
        if (!stage) return;

        const pos = stage.getPointerPosition();
        if (!pos) return;

        const deltaX = pos.x - startPos.current.x;
        const deltaY = pos.y - startPos.current.y;

        if (Math.abs(deltaX) > 1 && Math.abs(deltaY) > 1) {
            setCurrentRect({
                x: Math.min(startPos.current.x, pos.x),
                y: Math.min(startPos.current.y, pos.y),
                width: Math.abs(deltaX),
                height: Math.abs(deltaY),
            });
        }
    };

    const handleMouseUp = () => {
        setIsDrawing(false);
    };

    const handleSaveChunk = async () => {
        if (!currentRect.width || !currentRect.height) {
            alert('No rectangle drawn or rectangle size invalid.');
            return;
        }
        if (!whiteboard) return; // Ensure whiteboard is loaded

        const chunkData = {
            coordinates: {
                x: currentRect.x ?? 0,
                y: currentRect.y ?? 0,
                width: currentRect.width ?? 0,
                height: currentRect.height ?? 0,
            },
            transcription,
            confidence,
            contractor: contractorName,
            whiteboardId,
            created_at: new Date().toISOString(),
        };

        try {
            const res = await fetch(`/api/whiteboards/${whiteboardId}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(chunkData),
            });

            if (res.ok) {
                const savedChunk: Chunk = await res.json();
                // Update whiteboard state optimistically
                setWhiteboard((prev) => {
                    if (!prev) return prev;
                    return {
                        ...prev,
                        chunks: [
                            ...prev.chunks,
                            {
                                ...savedChunk,
                                createdAt: savedChunk.createdAt.toISOString(),
                            },
                        ],
                    };
                });
                setCurrentRect({});
                setTranscription('');
                onSave();
            } else {
                alert('Failed to save chunk');
            }
        } catch (error) {
            console.error('Error saving chunk:', error);
            alert('Failed to save chunk');
        }
    };

    const handleDeleteChunk = async (id: string) => {
        if (!whiteboard) return;

        // Optimistically remove chunk
        setWhiteboard((prev) => {
            if (!prev) return prev;
            return {
                ...prev,
                chunks: prev.chunks.filter((c) => c.id !== id),
            };
        });

        try {
            const res = await fetch(`/api/whiteboards/${whiteboardId}/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) {
                // Revert optimistic update if failed
                const errorData = await res.json();
                alert(`Failed to delete chunk: ${errorData.message}`);
                // revert
                setWhiteboard((prev) => {
                    if (!prev) return prev;
                    // re-add the chunk since deleting failed
                    // this would require us to know the chunk that was removed
                    // it's simpler to just refetch the whiteboard data or handle differently
                    // For simplicity here, let's just refetch after failure:
                    return prev;
                });
            }
        } catch (error) {
            console.error('Error deleting chunk:', error);
            alert('Failed to delete chunk');
            // Revert optimistic update if we knew the chunk
            // For now, consider refetching the whiteboard data.
        }
    };

    const handleToggleComplete = async () => {
        if (!whiteboard) return;
        // Optimistic update
        const newComplete = !whiteboard.complete;
        setWhiteboard({ ...whiteboard, complete: newComplete });

        try {
            const res = await fetch(`/api/whiteboards/${whiteboardId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    complete: newComplete,
                    contractor: contractorName,
                }),
            });

            if (!res.ok) {
                // Revert optimistic update if failed
                setWhiteboard({ ...whiteboard, complete: !newComplete });
                alert('Failed to update completion status');
            }
        } catch (error) {
            console.error('Error updating completion status:', error);
            // Revert optimistic update
            setWhiteboard({ ...whiteboard, complete: !newComplete });
            alert('Failed to update completion status');
        }
    };

    return (
        <div className="flex flex-col">
            <div className="flex justify-between my-5 items-baseline">
                <div className="flex items-center space-x-8">
                    <Link href="/">
                        <Button variant={'outline'}>Back to List</Button>
                    </Link>
                    <p className="font-bold">{whiteboardId}</p>
                </div>
                <div className="flex flex-col space-y-4">
                    <Button
                        className={
                            whiteboard && whiteboard.complete
                                ? 'text-red-500 border-red-500 hover:text-red-600 hover:border-red-600'
                                : 'text-green-500 border-green-500 hover:text-green-600 hover:border-green-600'
                        }
                        variant={'outline'}
                        onClick={handleToggleComplete}
                    >
                        {whiteboard && whiteboard.complete
                            ? 'Mark Incomplete'
                            : 'Mark Complete'}
                    </Button>
                    {whiteboard && whiteboard.complete && (
                        <p>Task completed by {contractorName}</p>
                    )}
                </div>
            </div>
            <div className="flex">
                <div className="flex items-start">
                    <div className="mr-5">
                        <Stage
                            width={800}
                            height={600}
                            onMouseDown={handleMouseDown}
                            onMouseMove={handleMouseMove}
                            onMouseUp={handleMouseUp}
                            ref={stageRef}
                        >
                            <Layer>
                                {image && <KonvaImage image={image} />}

                                {whiteboard &&
                                    whiteboard.chunks.map((chunk) => (
                                        <Group key={chunk.id}>
                                            <Rect
                                                x={Number(chunk.coordinates.x)}
                                                y={Number(chunk.coordinates.y)}
                                                width={Number(
                                                    chunk.coordinates.width,
                                                )}
                                                height={Number(
                                                    chunk.coordinates.height,
                                                )}
                                                stroke={
                                                    chunk.confidence === 'high'
                                                        ? 'green'
                                                        : chunk.confidence ===
                                                          'medium'
                                                        ? 'orange'
                                                        : 'red'
                                                }
                                                strokeWidth={2}
                                            />
                                            <Text
                                                x={Number(chunk.coordinates.x)}
                                                y={
                                                    Number(
                                                        chunk.coordinates.y,
                                                    ) - 20
                                                }
                                                text={String(
                                                    chunk.transcription || '',
                                                )}
                                                fontSize={12}
                                                fill="black"
                                            />
                                        </Group>
                                    ))}

                                {currentRect.width &&
                                    currentRect.height &&
                                    Number.isFinite(currentRect.x) &&
                                    Number.isFinite(currentRect.y) &&
                                    Number.isFinite(currentRect.width) &&
                                    Number.isFinite(currentRect.height) && (
                                        <Rect
                                            x={Number(currentRect.x)}
                                            y={Number(currentRect.y)}
                                            width={Number(currentRect.width)}
                                            height={Number(currentRect.height)}
                                            stroke="blue"
                                            strokeWidth={2}
                                        />
                                    )}
                            </Layer>
                        </Stage>
                    </div>
                </div>
                <div className="w-64 bg-gray-50 p-4 border rounded max-h-[600px] overflow-y-scroll">
                    <h3 className="text-lg font-semibold mb-3">Saved Chunks</h3>
                    {(!whiteboard || whiteboard.chunks.length === 0) && (
                        <p className="text-gray-500">No chunks saved yet.</p>
                    )}
                    <ul className="space-y-3">
                        {whiteboard &&
                            whiteboard.chunks.map((chunk) => (
                                <li
                                    key={chunk.id}
                                    className="p-3 border rounded bg-white"
                                >
                                    <div className="text-sm">
                                        <strong>Transcription:</strong>{' '}
                                        {chunk.transcription}
                                    </div>
                                    <div className="text-sm">
                                        <strong>Confidence:</strong>{' '}
                                        {chunk.confidence}
                                    </div>
                                    <div className="text-sm">
                                        <strong>Created by:</strong>{' '}
                                        {chunk.contractor}
                                    </div>
                                    <button
                                        className="mt-2 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                                        onClick={() =>
                                            handleDeleteChunk(chunk.id)
                                        }
                                    >
                                        Delete
                                    </button>
                                </li>
                            ))}
                    </ul>
                </div>
            </div>

            {/* Form Below */}
            <div className="mt-5 p-4 border rounded">
                <h3 className="text-lg font-semibold mb-3">
                    Add Transcription
                </h3>
                <input
                    type="text"
                    className="mr-2 p-2 border rounded"
                    placeholder="Transcription"
                    value={transcription}
                    onChange={(e) => setTranscription(e.target.value)}
                />
                <select
                    className="mr-2 p-2 border rounded"
                    value={confidence}
                    onChange={(e) =>
                        setConfidence(e.target.value as ConfidenceLevel)
                    }
                >
                    <option value="high">High Confidence</option>
                    <option value="medium">Medium Confidence</option>
                    <option value="low">Low Confidence</option>
                </select>
                <button
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    onClick={handleSaveChunk}
                >
                    Save Chunk
                </button>
            </div>
        </div>
    );
};

export default WhiteboardAnnotator;
