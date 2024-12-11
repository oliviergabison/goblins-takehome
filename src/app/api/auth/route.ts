// src/app/api/auth/route.ts
import { NextRequest, NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function POST(req: NextRequest) {
    const { name } = await req.json();
    if (!name) {
        return NextResponse.json(
            { message: 'Name is required' },
            { status: 400 },
        );
    }

    await db.read();
    let contractor = db.data?.contractors.find((c) => c.name === name);

    if (!contractor) {
        contractor = {
            name,
            processed: 0,
            lastProcessed: new Date().toISOString(),
        };
        db.data?.contractors.push(contractor);
        await db.write();
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
