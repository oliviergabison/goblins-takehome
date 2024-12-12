// src/app/api/whiteboards/route.ts
import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

export async function GET() {
    try {
        // Fetch all whiteboards from the Supabase database
        const { data: whiteboards, error } = await supabase
            .from('whiteboards')
            .select('*')
            .order('created_at');

        if (error) {
            return NextResponse.json(
                { message: 'Failed to fetch whiteboards', error },
                { status: 500 },
            );
        }

        return NextResponse.json(whiteboards, { status: 200 });
    } catch (error: unknown) {
        const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';

        return NextResponse.json(
            { message: `Error processing request: ${errorMessage}` },
            { status: 500 },
        );
    }
}
