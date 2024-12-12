// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_KEY!,
);

export async function POST(req: NextRequest) {
    const { name } = await req.json();
    if (!name) {
        return NextResponse.json(
            { message: 'Name is required' },
            { status: 400 },
        );
    }

    // Check if the contractor exists in Supabase
    const { data: contractor, error: fetchError } = await supabase
        .from('contractors')
        .select('*')
        .eq('name', name)
        .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
        // If the error is not about no matching rows, return an error
        return NextResponse.json(
            { message: 'Error checking contractor', error: fetchError },
            { status: 500 },
        );
    }

    if (!contractor) {
        // Add new contractor if it doesn't exist
        const { error: insertError } = await supabase
            .from('contractors')
            .insert({
                name,
                processed: 0,
                last_processed: new Date().toISOString(),
            });

        if (insertError) {
            return NextResponse.json(
                { message: 'Error creating contractor', error: insertError },
                { status: 500 },
            );
        }
    }

    // Set a cookie
    const response = NextResponse.json({ message: 'Authenticated', name });
    response.cookies.set('contractor', name, { httpOnly: true, path: '/' });
    return response;
}

export async function GET(req: NextRequest) {
    const cookie = req.headers.get('cookie');
    if (!cookie) {
        return NextResponse.json(
            { message: 'Not authenticated' },
            { status: 401 },
        );
    }

    const match = cookie.match(/contractor=([^;]+)/);
    if (match) {
        const name = match[1];
        return NextResponse.json({ name });
    } else {
        return NextResponse.json(
            { message: 'Not authenticated' },
            { status: 401 },
        );
    }
}

export async function DELETE() {
    // Logout
    const response = NextResponse.json({ message: 'Logged out' });
    response.cookies.set('contractor', '', {
        httpOnly: true,
        path: '/',
        maxAge: 0,
    });
    return response;
}
