// lib/db.ts

import { join } from 'path';
import { Low } from 'lowdb';
import { JSONFile } from 'lowdb/node';
import { Database } from '../types';

// Define the path to the JSON file
const file = join(process.cwd(), 'db.json');

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
const initializeDB = async () => {
    await db.read();

    // If db.json doesn't exist or is empty, set default data
    db.data ||= { whiteboards: [], contractors: [] };

    // Write the default data to db.json if it was just initialized
    await db.write();
};

// Immediately initialize the database when the module is loaded
initializeDB();

/**
 * Exports the initialized database instance for use in other parts of the application.
 */
export default db;
