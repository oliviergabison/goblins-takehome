// importWhiteboards.ts
import fs from 'fs';
// import path from 'path';
import csv from 'csv-parser';
import { Whiteboard } from '../types';
import db from '../lib/db';

export const importWhiteboards = async () => {
    const results: Whiteboard[] = [];
    // const csvPath = path.join(process.cwd(), 'data', 'whiteboards.csv');

    fs.createReadStream('data/whiteboards.csv')
        .pipe(csv())
        .on('data', (data) => {
            results.push({
                id: data.id,
                image_url: data.image_url,
                chunks: [],
            });
        })
        .on('end', async () => {
            await db.read();
            db.data = db.data || { whiteboards: [], contractors: [] };
            db.data.whiteboards.push(...results);
            await db.write();
            console.log('Whiteboards imported successfully');
        });
};
