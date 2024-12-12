// src/app/api/whiteboards/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

// GET handler: Fetch a whiteboard by ID
export async function GET(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;

    const { data: whiteboard, error } = await supabase
        .from('whiteboards')
        .select('*, chunks(*)') // Fetch associated chunks
        .eq('id', id)
        .single();

    if (error || !whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found', error },
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
    const { id } = context.params; // Extract whiteboard ID from route params
    const body = await req.json();

    const { coordinates, transcription, confidence, contractor } = body;

    // Verify the whiteboard exists
    const { data: whiteboard, error: fetchError } = await supabase
        .from('whiteboards')
        .select('id')
        .eq('id', id)
        .single();

    if (fetchError || !whiteboard) {
        console.error(fetchError);
        return NextResponse.json(
            { message: 'Whiteboard not found', error: fetchError },
            { status: 404 },
        );
    }

    // Create a new chunk
    const newChunk = {
        whiteboard_id: id,
        coordinates,
        transcription,
        confidence,
        contractor,
        created_at: new Date().toISOString(),
    };

    // Insert the chunk and return the inserted row
    const { data: insertedChunk, error: insertError } = await supabase
        .from('chunks')
        .insert(newChunk)
        .select('*') // Return the inserted row(s)
        .single();

    if (insertError) {
        console.error(insertError);
        return NextResponse.json(
            { message: 'Failed to add chunk', error: insertError },
            { status: 500 },
        );
    }

    // Update contractor stats
    const { data: contractorData, error: contractorFetchError } = await supabase
        .from('contractors')
        .select('processed, last_processed')
        .eq('name', contractor)
        .single();

    if (!contractorFetchError && contractorData) {
        await supabase
            .from('contractors')
            .update({
                processed: contractorData.processed + 1,
                last_processed: new Date().toISOString(),
            })
            .eq('name', contractor);
    }

    return NextResponse.json(insertedChunk, { status: 201 });
}

// PATCH handler: Update whiteboard completeness
export async function PATCH(
    req: NextRequest,
    context: { params: Promise<{ id: string }> },
) {
    const { id } = await context.params;
    const { complete } = await req.json(); // Expect { complete: boolean }

    // Verify the whiteboard exists
    const { data: whiteboard, error: fetchError } = await supabase
        .from('whiteboards')
        .select('id, complete')
        .eq('id', id)
        .single();

    if (fetchError || !whiteboard) {
        return NextResponse.json(
            { message: 'Whiteboard not found', error: fetchError },
            { status: 404 },
        );
    }

    // Update the completeness of the whiteboard
    const { error: updateError } = await supabase
        .from('whiteboards')
        .update({ complete })
        .eq('id', id);

    if (updateError) {
        return NextResponse.json(
            { message: 'Failed to update whiteboard', error: updateError },
            { status: 500 },
        );
    }

    return NextResponse.json({ complete }, { status: 200 });
}
