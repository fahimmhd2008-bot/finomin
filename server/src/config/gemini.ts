// server/src/config/gemini.ts
import { GoogleGenAI } from '@google/genai';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../../.env') });

const apiKey = process.env.GEMINI_API_KEY;

// Provide helpful diagnostic if apiKey is not configured
if (!apiKey || apiKey === 'your-production-gemini-api-key') {
  console.warn('[Gemini Config] Warning: GEMINI_API_KEY is not set or using placeholder. AI endpoints will employ mathematical heuristic fallback engines.');
}

// Initialized instance with actual key or dummy key for safe instantiation
export const ai = new GoogleGenAI({ apiKey: apiKey || 'MISSING_KEY' });
export const GEMINI_FLASH_MODEL = 'gemini-2.5-flash';
export const GEMINI_PRO_MODEL = 'gemini-2.5-pro';

export const isGeminiConfigured = Boolean(apiKey && apiKey !== 'your-production-gemini-api-key' && apiKey.length > 5);
