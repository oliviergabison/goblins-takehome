import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../lib/db';

// Define the route handler
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; chunkId: string } },
) {
    try {
        const { id, chunkId } = await params;

        // Read the database
        await db.read();
        const whiteboard = db.data?.whiteboards.find((wb) => wb.id === id);

        if (!whiteboard) {
            return NextResponse.json(
                { message: 'Whiteboard not found' },
                { status: 404 },
            );
        }

        // Remove the chunk with the given chunkId
        const initialLength = whiteboard.chunks.length;
        whiteboard.chunks = whiteboard.chunks.filter(
            (chunk) => chunk.id !== chunkId,
        );

        if (whiteboard.chunks.length === initialLength) {
            return NextResponse.json(
                { message: 'Chunk not found' },
                { status: 404 },
            );
        }

        // Write the updated data back to the database
        await db.write();

        return NextResponse.json(
            { message: 'Chunk deleted successfully' },
            { status: 200 },
        );
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            { message: `Error processing request: ${errorMessage}` },
            { status: 500 },
        );
    }
}
