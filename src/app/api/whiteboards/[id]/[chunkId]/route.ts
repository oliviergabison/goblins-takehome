import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

// Define the route handler
export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string; chunkId: string } },
) {
    try {
        const { id, chunkId } = params;

        // Verify the whiteboard exists
        const { data: whiteboard, error: whiteboardError } = await supabase
            .from('whiteboards')
            .select('id')
            .eq('id', id)
            .single();

        if (whiteboardError || !whiteboard) {
            return NextResponse.json(
                { message: 'Whiteboard not found', error: whiteboardError },
                { status: 404 },
            );
        }

        // Delete the chunk with the given chunkId
        const { error: deleteError } = await supabase
            .from('chunks')
            .delete()
            .eq('id', chunkId)
            .eq('whiteboard_id', id); // Ensure the chunk belongs to the specified whiteboard

        if (deleteError) {
            return NextResponse.json(
                {
                    message: 'Chunk not found or failed to delete',
                    error: deleteError,
                },
                { status: 404 },
            );
        }

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
