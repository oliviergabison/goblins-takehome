// src/app/api/export/route.ts
import { NextResponse } from 'next/server';
import { parse } from 'json2csv';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

export async function GET() {
    try {
        // Fetch whiteboards with their associated chunks
        const { data: whiteboards, error } = await supabase
            .from('whiteboards')
            .select(
                'id, chunks(id, coordinates, transcription, confidence, contractor, created_at)',
            );

        if (error || !whiteboards) {
            return NextResponse.json(
                { message: 'Failed to fetch data from Supabase', error },
                { status: 500 },
            );
        }

        // Extract and format chunks
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

        whiteboards.forEach((wb) => {
            if (wb.chunks && Array.isArray(wb.chunks)) {
                wb.chunks.forEach((chunk) => {
                    const { coordinates } = chunk;
                    allChunks.push({
                        whiteboardId: wb.id,
                        chunkId: chunk.id,
                        x: coordinates.x,
                        y: coordinates.y,
                        width: coordinates.width,
                        height: coordinates.height,
                        transcription: chunk.transcription,
                        confidence: chunk.confidence,
                        contractor: chunk.contractor,
                        createdAt: chunk.created_at,
                    });
                });
            }
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
