// src/app/api/whiteboards/route.ts
import { NextResponse } from 'next/server';
import db from '../../../../lib/db';

export async function GET() {
    // Read data from the database
    await db.read();

    // Retrieve whiteboards data or fallback to an empty array
    const whiteboards = db.data?.whiteboards || [];

    return NextResponse.json(whiteboards, { status: 200 });
}
