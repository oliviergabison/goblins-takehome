import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Database } from '../types';
import fs from 'fs';

// Define the path to the JSON file in a writable directory (`/tmp` for serverless environments)
const writableDir = process.env.DB_DIRECTORY || '/tmp'; // Use an environment variable for flexibility
const file = join(writableDir, 'db.json');

// Ensure the writable directory exists
try {
    if (!fs.existsSync(writableDir)) {
        fs.mkdirSync(writableDir, { recursive: true }); // Ensure parent directories are created
    }

    // Ensure the db.json file exists with default data
    if (!fs.existsSync(file)) {
        fs.writeFileSync(
            file,
            JSON.stringify({ whiteboards: [], contractors: [] }, null, 2),
        );
    }
} catch (error) {
    console.error('Failed to set up database directory or file:', error);
    throw error;
}

// Create a Low adapter for JSON files
const adapter = new JSONFile<Database>(file);

const defaultData: Database = {
    whiteboards: [],
    contractors: [],
};

// Create a Low instance
const db = new Low<Database>(adapter, defaultData);

/**
 * Initializes the database by reading the existing data and setting default values if necessary.
 */
export const initializeDB = async () => {
    try {
        await db.read();

        // Log the contents of the database for debugging
        console.log('Database Path:', file);
        console.log('Database Contents Before:', db.data);

        // If the db.json file is empty or corrupted, set default data
        db.data ||= defaultData;

        // Write default data to db.json if it was just initialized
        await db.write();

        console.log('Database Contents After:', db.data);
    } catch (error) {
        console.error('Failed to initialize the database:', error);
        throw error;
    }
};

// Immediately initialize the database when the module is loaded
initializeDB().catch((error) => {
    console.error(
        'Failed to initialize the database during module load:',
        error,
    );
});

/**
 * Exports the initialized database instance for use in other parts of the application.
 */
export default db;
