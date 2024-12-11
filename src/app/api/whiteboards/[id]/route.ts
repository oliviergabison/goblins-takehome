// src/app/api/whiteboards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { Chunk } from '../../../../../types';
import db from '../../../../../lib/db';

// GET handler: Fetch a whiteboard by ID
export async function GET(
    req: NextRequest,
    context: { params: { id: string } },
) {
    const { id } = await context.params; // Access params inside the function body

    await db.read();
    const whiteboard = db.data?.whiteboards.find((wb) => wb.id === id);

    if (!whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found' },
            { status: 404 },
        );
    }

    return NextResponse.json(whiteboard, { status: 200 });
}

// POST handler: Add a new chunk to a whiteboard
export async function POST(
    req: NextRequest,
    context: { params: { id: string } },
) {
    const { id } = await context.params; // Access params inside the function body
    const body = await req.json();

    const { coordinates, transcription, confidence, contractor } = body;

    await db.read();
    const whiteboard = db.data?.whiteboards.find((wb) => wb.id === id);

    if (!whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found' },
            { status: 404 },
        );
    }

    const newChunk: Chunk = {
        id: uuidv4(),
        whiteboardId: id,
        coordinates,
        transcription,
        confidence,
        contractor,
        createdAt: new Date().toISOString(),
    };

    whiteboard.chunks.push(newChunk);

    // Update contractor stats
    const contractorData = db.data?.contractors.find(
        (c) => c.name === contractor,
    );
    if (contractorData) {
        contractorData.processed += 1;
        contractorData.lastProcessed = new Date().toISOString();
    }

    await db.write();
    return NextResponse.json(newChunk, { status: 201 });
}

export async function PATCH(
    req: NextRequest,
    context: { params: { id: string } },
) {
    const { id } = context.params;
    const { complete } = await req.json(); // Expect { complete: boolean }

    await db.read();
    const whiteboard = db.data?.whiteboards.find((wb) => wb.id === id);

    if (!whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found' },
            { status: 404 },
        );
    }

    whiteboard.complete = complete;
    await db.write();

    return NextResponse.json(
        { complete: whiteboard.complete },
        { status: 200 },
    );
}
