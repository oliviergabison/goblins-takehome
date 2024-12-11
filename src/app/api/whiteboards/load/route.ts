// src/app/api/whiteboards/route.ts
import { NextResponse } from 'next/server';
import { join } from 'path';
import { readFileSync, writeFileSync } from 'fs';
import { Whiteboard } from '../../../../../types';

export async function GET() {
    const dbPath = join(process.cwd(), 'db.json');
    const data = JSON.parse(readFileSync(dbPath, 'utf8'));

    // Ensure db.json has a whiteboards array
    if (!data.whiteboards || !Array.isArray(data.whiteboards)) {
        return NextResponse.json(
            { message: 'No whiteboards found' },
            { status: 500 },
        );
    }

    // Update each whiteboard to ensure complete = false if not present
    data.whiteboards = data.whiteboards.map((wb: Whiteboard) => {
        if (wb.complete !== false) {
            wb.complete = false;
        }
        wb.contractor = '';
        return wb;
    });

    // Write updated data back to db.json
    writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf8');

    return NextResponse.json('success', { status: 200 });
}
