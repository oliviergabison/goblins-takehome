// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'json2csv';
import db from '../../../../lib/db';

export async function GET() {
    // Read data from the database
    await db.read();
    const whiteboards = db.data?.whiteboards || [];

    const allChunks: Array<{
        whiteboardId: string;
        chunkId: string;
        x: number;
        y: number;
        width: number;
        height: number;
        transcription: string;
        confidence: string;
        contractor: string;
        createdAt: string;
    }> = [];

    // Extract and format chunks
    whiteboards.forEach((wb) => {
        wb.chunks.forEach((chunk) => {
            allChunks.push({
                whiteboardId: wb.id,
                chunkId: chunk.id,
                x: chunk.coordinates.x,
                y: chunk.coordinates.y,
                width: chunk.coordinates.width,
                height: chunk.coordinates.height,
                transcription: chunk.transcription,
                confidence: chunk.confidence,
                contractor: chunk.contractor,
                createdAt: chunk.createdAt,
            });
        });
    });

    // Define CSV fields and options
    const fields = [
        'whiteboardId',
        'chunkId',
        'x',
        'y',
        'width',
        'height',
        'transcription',
        'confidence',
        'contractor',
        'createdAt',
    ];
    const opts = { fields };

    try {
        // Convert data to CSV
        const csv = parse(allChunks, opts);

        // Create and return CSV response
        return new NextResponse(csv, {
            headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': 'attachment; filename=export.csv',
            },
        });
    } catch (err) {
        return NextResponse.json(
            { message: 'Error generating CSV', error: err },
            { status: 500 },
        );
    }
}
