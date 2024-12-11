// types/index.ts

import { JSX } from 'react';

// Confidence levels for chunk transcriptions
export type ConfidenceLevel = 'high' | 'medium' | 'low';

// Coordinates defining a rectangular region on the whiteboard
export interface Coordinates {
    x: number; // The x-coordinate of the top-left corner
    y: number; // The y-coordinate of the top-left corner
    width: number; // The width of the rectangle
    height: number; // The height of the rectangle
}

// A single annotated chunk on a whiteboard
export interface Chunk {
    id: string; // Unique identifier for the chunk
    whiteboardId: string; // Reference to the parent whiteboard
    coordinates: Coordinates; // Position and size of the chunk on the whiteboard
    transcription: string; // The transcribed text or symbol
    confidence: ConfidenceLevel; // Confidence level of the transcription
    contractor: string; // Name of the contractor who labeled the chunk
    createdAt: string; // ISO timestamp when the chunk was created
}

// A whiteboard submitted by a student
export interface Whiteboard {
    id: string; // Unique identifier for the whiteboard
    image_url: string; // URL to the whiteboard image
    chunks: Chunk[]; // List of annotated chunks on the whiteboard
    complete: boolean;
    contractor: string;
}

// Information about a contractor (labeler)
export interface Contractor {
    name: string; // Contractor's name (unique identifier)
    processed: number; // Number of chunks processed
    lastProcessed: string; // ISO timestamp of the last processed chunk
}

// The overall structure of the LowDB database
export interface Database {
    whiteboards: Whiteboard[]; // Collection of whiteboards
    contractors: Contractor[]; // Collection of contractors
}

// Payload for creating a new chunk
export interface CreateChunkPayload {
    coordinates: Coordinates; // Position and size of the new chunk
    transcription: string; // Transcribed text or symbol
    confidence: ConfidenceLevel; // Confidence level
    contractor: string; // Name of the contractor
}

// Response structure for API authentication
export interface AuthResponse {
    message: string; // Status message
    name?: string; // Contractor's name (if authenticated)
}

// Error response structure
export interface ErrorResponse {
    message: string; // Error message
}

// API response structure for fetching whiteboards
// export interface WhiteboardResponse extends Whiteboard {}

// API response structure for fetching all whiteboards
// export interface WhiteboardsResponse extends Array<Whiteboard> {}

// API response structure for fetching a contractor
// export interface ContractorResponse extends Contractor {}

// Props for the ProtectedRoute component
export interface ProtectedRouteProps {
    children: JSX.Element; // Child components to render if authenticated
}

// Props for the WhiteboardAnnotator component
export interface WhiteboardAnnotatorProps {
    whiteboardId: string; // ID of the whiteboard to annotate
    imageUrl: string; // URL of the whiteboard image
    onSave: () => void; // Callback function after saving a chunk
}

// Props for the Header component
// export interface HeaderProps {}

// Props for the WhiteboardList component
// export interface WhiteboardListProps {}

// Props for the WhiteboardPage component
// export interface WhiteboardPageProps {}
