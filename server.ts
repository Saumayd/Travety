import 'dotenv/config';
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';
import { requireAuth, AuthRequest } from './src/middleware/auth.ts';
import {
  getLobbySnapshotFromSql,
  getOrCreateUser,
  insertAreaReviewInSql,
  upsertLobbyInSql,
  upsertPollOptionInSql,
  upsertSquadMemberInSql,
} from './src/db/repository.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function getAiClient(): GoogleGenAI {
  return new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

interface ChatHistoryTurn {
  role: 'user' | 'model';
  text: string;
}

interface GroundingSource {
  title: string;
  uri: string;
}

function extractGroundingSources(response: GenerateContentResponse): GroundingSource[] {
  const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
  if (!chunks || !Array.isArray(chunks)) return [];

  const sources: GroundingSource[] = [];
  const seen = new Set<string>();

  for (const chunk of chunks) {
    const uri = chunk?.web?.uri;
    const title = chunk?.web?.title || uri;
    if (uri && typeof uri === 'string' && !seen.has(uri)) {
      seen.add(uri);
      sources.push({
        uri,
        title: typeof title === 'string' ? title : uri,
      });
    }
  }
  return sources;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json({ limit: '2mb' }));

  // ============================================================================
  // Cloud SQL (PostgreSQL + Drizzle ORM) Authenticated Routes
  // ============================================================================

  app.post('/api/sql/sync-user', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const email = req.user?.email || `${uid}@travety.local`;
      const displayName = (req.body?.displayName || req.user?.name || 'Saumay').slice(0, 60);
      const userRecord = await getOrCreateUser(uid, email, displayName);
      res.json({ user: userRecord });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to sync user';
      console.error('Failed to sync user in Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  app.get('/api/sql/lobby/:code', requireAuth, async (req: AuthRequest, res) => {
    try {
      const code = String(req.params.code || 'TRV-8492').slice(0, 16);
      const snapshot = await getLobbySnapshotFromSql(code);
      res.json(snapshot);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to fetch lobby state';
      console.error('Failed to load lobby from Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/sql/lobby', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const b = req.body || {};
      const updated = await upsertLobbyInSql({
        code: String(b.code || 'TRV-8492').slice(0, 16),
        title: String(b.title || 'NSUT × IGDTUW Squad Meet').slice(0, 80),
        hostName: String(b.hostName || 'Saumay').slice(0, 50),
        hostId: uid,
        mode: b.mode === 'fun' ? 'fun' : 'safe',
        centralHub: String(
          b.centralHub || 'NSUT (Netaji Subhas University of Technology)'
        ).slice(0, 100),
        departureTime: String(b.departureTime || '7:45 PM').slice(0, 20),
        activePings: typeof b.activePings === 'number' ? b.activePings : 5,
        lastPingBy: String(b.lastPingBy || 'Saumay').slice(0, 60),
        sosActive: Boolean(b.sosActive),
      });
      res.json({ lobby: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save lobby';
      console.error('Failed to upsert lobby in Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/sql/member', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const b = req.body || {};
      const updated = await upsertSquadMemberInSql({
        id: String(b.id || `member-${uid.slice(0, 12)}`).slice(0, 40),
        lobbyCode: String(b.lobbyCode || 'TRV-8492').slice(0, 16),
        userId: uid,
        name: String(b.name || 'Saumay').slice(0, 50),
        initials: String(b.initials || 'SM').slice(0, 4),
        gender: b.gender === 'male' ? 'male' : 'female',
        location: String(b.location || 'NSUT, Dwarka Mor').slice(0, 100),
        curfew: String(b.curfew || '21:30').slice(0, 20),
        accompanyingDetails: String(b.accompanyingDetails || 'Blue Line Metro').slice(0, 100),
        budget: typeof b.budget === 'number' ? b.budget : 450,
        phone: String(b.phone || '+91 99104 88123').slice(0, 20),
        leaveByTime: String(b.leaveByTime || '8:55 PM').slice(0, 20),
        transitMins: typeof b.transitMins === 'number' ? b.transitMins : 26,
      });
      res.json({ member: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save member';
      console.error('Failed to upsert member in Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/sql/poll', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const b = req.body || {};
      const updated = await upsertPollOptionInSql({
        id: String(b.id || `poll-${Date.now()}`).slice(0, 40),
        lobbyCode: String(b.lobbyCode || 'TRV-8492').slice(0, 16),
        title: String(b.title || 'NSUT Main Gate Cafe Hub').slice(0, 80),
        subtitle: String(b.subtitle || 'Blue Line · Safe Hub').slice(0, 120),
        votes: typeof b.votes === 'number' ? b.votes : 1,
        createdBy: uid,
      });
      res.json({ poll: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save poll';
      console.error('Failed to upsert poll in Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  app.post('/api/sql/review', requireAuth, async (req: AuthRequest, res) => {
    try {
      const uid = req.user?.uid;
      if (!uid) {
        res.status(401).json({ error: 'Unauthorized' });
        return;
      }
      const b = req.body || {};
      const updated = await insertAreaReviewInSql({
        id: String(b.id || `rev-${Date.now()}`).slice(0, 40),
        userId: uid,
        authorName: String(b.authorName || 'Saumay').slice(0, 50),
        areaName: String(
          b.areaName || 'NSUT (Netaji Subhas University of Technology)'
        ).slice(0, 80),
        safetyRating: typeof b.safetyRating === 'number' ? b.safetyRating : 5,
        lightingStatus: String(b.lightingStatus || 'Well Lit').slice(0, 30),
        issueFlag: String(b.issueFlag || 'None').slice(0, 40),
        comment: String(b.comment || '').slice(0, 300),
      });
      res.json({ review: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to save review';
      console.error('Failed to insert review in Cloud SQL:', error);
      res.status(500).json({ error: message });
    }
  });

  // ============================================================================
  // Multi-turn Gemini Chat & Google Search Grounding Endpoints
  // ============================================================================

  app.post('/api/gemini/chat', async (req, res) => {
    try {
      const {
        messages = [],
        modelTier = 'general',
        useSearchGrounding = true,
        lobbyContext = '',
      } = req.body as {
        messages?: ChatHistoryTurn[];
        modelTier?: 'fast' | 'general';
        useSearchGrounding?: boolean;
        lobbyContext?: string;
      };

      const ai = getAiClient();

      let selectedModel = 'gemini-3.8-flash';
      if (useSearchGrounding) {
        selectedModel = 'gemini-3.8-flash';
      } else if (modelTier === 'fast') {
        selectedModel = 'gemini-3.1-flash-lite';
      }

      const systemInstruction = [
        'You are the Travety Commute & Safety Assistant for a student squad from NSUT (Netaji Subhas University of Technology, Dwarka Sector 3) and IGDTUW (Indira Gandhi Delhi Technical University for Women, Kashmere Gate).',
        'The 5 squad members are: Devika (IGDTUW, Kashmere Gate, curfew 8:30 PM), Vansh (NSUT, Dwarka Sec 3, curfew 9:30 PM), Saumay (NSUT, Dwarka Mor, curfew 9:30 PM), Rimisha (IGDTUW, Civil Lines, curfew 8:15 PM), and Pragya (NSUT, Janakpuri West, curfew 8:30 PM).',
        'Your role is to help them coordinate safe, budget-friendly hangouts, plan DMRC Metro routes (Blue Line, Yellow Line, Red Line, Pink Line, Magenta Line), verify Pink Saheli booth & street-lighting safety, and ensure everyone leaves on time before their home curfew.',
        'Keep responses concise, practical, and well-structured with bullet points when helpful.',
        lobbyContext ? `Current Active Lobby Context: ${lobbyContext}` : '',
      ]
        .filter(Boolean)
        .join('\n');

      const sanitizedTurns = Array.isArray(messages)
        ? messages.filter((m) => m && typeof m.text === 'string' && m.text.trim().length > 0)
        : [];

      if (sanitizedTurns.length === 0) {
        res.status(400).json({ error: 'Please provide a message to start the conversation.' });
        return;
      }

      const history = sanitizedTurns.slice(0, -1).map((m) => ({
        role: m.role === 'model' ? 'model' : 'user',
        parts: [{ text: m.text }],
      }));
      const latestMessage = sanitizedTurns[sanitizedTurns.length - 1].text;

      const chat = ai.chats.create({
        model: selectedModel,
        history,
        config: {
          systemInstruction,
          ...(useSearchGrounding ? { tools: [{ googleSearch: {} }] } : {}),
        },
      });
      const response: GenerateContentResponse = await chat.sendMessage({ message: latestMessage });

      const replyText = response.text || 'I processed your request, but no text was returned.';
      const sources = extractGroundingSources(response);

      res.json({
        text: replyText,
        modelUsed: selectedModel,
        sources,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Gemini Chat API Error:', message);
      res.status(500).json({
        error:
          'Unable to complete the Gemini request right now. Please verify your API key in Settings > Secrets.',
        details: message,
      });
    }
  });

  app.post('/api/gemini/search-grounding', async (req, res) => {
    try {
      const {
        query = 'Latest Delhi Metro DMRC Blue and Yellow Line status and weather around Dwarka and Kashmere Gate',
      } = req.body as { query?: string };

      const ai = getAiClient();
      const response: GenerateContentResponse = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: query,
        config: {
          systemInstruction:
            'You are a real-time Delhi NCR & DMRC transit intelligence assistant for NSUT (Dwarka) and IGDTUW (Kashmere Gate) students. Use Google Search to provide accurate, up-to-date facts in 3-4 concise bullet points.',
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text || 'No grounded summary available.';
      const sources = extractGroundingSources(response);

      res.json({
        text,
        sources,
        modelUsed: 'gemini-3.8-flash',
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.error('Gemini Search Grounding Error:', message);
      res.status(500).json({
        error: 'Failed to fetch Google Search grounded data.',
        details: message,
      });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*all', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Travety full-stack server running on http://localhost:${PORT}`);
  });
}

startServer();
