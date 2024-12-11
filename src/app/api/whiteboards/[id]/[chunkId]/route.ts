// src/app/api/whiteboards/[id]/[chunkId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../../../lib/db';

export async function DELETE(
    req: NextRequest,
    context: { params: { id: string; chunkId: string } },
) {
    const { id, chunkId } = await context.params;

    await db.read();
    const whiteboard = db.data?.whiteboards.find((wb) => wb.id === id);

    if (!whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found' },
            { status: 404 },
        );
    }

    const initialLength = whiteboard.chunks.length;
    whiteboard.chunks = whiteboard.chunks.filter((c) => c.id !== chunkId);

    if (whiteboard.chunks.length === initialLength) {
        return NextResponse.json(
            { message: 'Chunk not found' },
            { status: 404 },
        );
    }

    await db.write();
    return NextResponse.json({ message: 'Chunk deleted' }, { status: 200 });
}
