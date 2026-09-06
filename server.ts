import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();


const __dirname = process.cwd();

const GARZON_API_URL = (process.env.GARZON_API_URL || 'https://joyeria-garzon.onrender.com').replace(/\/$/, '');

function shouldProxyToGarzon(reqPath: string) {
  return (
    reqPath.startsWith('/api/auth') ||
    reqPath.startsWith('/api/categories') ||
    reqPath.startsWith('/api/products') ||
    reqPath.startsWith('/api/product-images') ||
    reqPath.startsWith('/images/')
  );
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  app.use(async (req, res, next) => {
    if (!shouldProxyToGarzon(req.path)) return next();

    try {
      const target = `${GARZON_API_URL}${req.originalUrl}`;
      const headers: Record<string, string> = {};
      const authorization = req.headers.authorization;
      if (typeof authorization === 'string') headers.Authorization = authorization;

      const init: RequestInit = { method: req.method, headers };
      if (req.method !== 'GET' && req.method !== 'HEAD' && req.body && Object.keys(req.body).length > 0) {
        headers['Content-Type'] = 'application/json';
        init.body = JSON.stringify(req.body);
      }

      const upstream = await fetch(target, init);
      const contentType = upstream.headers.get('content-type') || 'application/octet-stream';
      res.status(upstream.status);
      res.setHeader('Content-Type', contentType);

      if (contentType.includes('application/json')) {
        const data = await upstream.json();
        return res.json(data);
      }

      const buffer = Buffer.from(await upstream.arrayBuffer());
      return res.send(buffer);
    } catch (err) {
      console.error('Error al conectar con Garzon API:', err);
      return res.status(502).json({ error: 'No se pudo conectar con la API de Garzon Joyería' });
    }
  });

  // API Route: AI Jewelry Stylist
  app.post('/api/ai-stylist', async (req, res) => {
    try {
      const { query, products } = req.body;

      if (!query) {
        return res.status(400).json({ error: 'Falta la consulta (query)' });
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        // Return structured fallback if no key set
        return res.json({
          text: `Te sugiero revisar nuestras joyas recomendadas en Oro 18K y Plata 925 para tu solicitud: "${query}".`,
          productIds: products ? products.slice(0, 2).map((p: { id: string }) => p.id) : []
        });
      }

      const ai = new GoogleGenAI({ apiKey });

      const catalogSummary = (products || []).map((p: { id: string; name: string; category: string; price: number; materials: string[] }) => (
        `ID: ${p.id} | Nombre: ${p.name} | Cat: ${p.category} | Precio: $${p.price} COP | Mat: ${p.materials.join(', ')}`
      )).join('\n');

      const prompt = `Eres un elegante Asesor Personal de Joyería Fina para "Garzon Joyería".
El cliente pregunta: "${query}"

Aquí está nuestro catálogo actual de joyas:
${catalogSummary}

Responde en español de forma refinada, atenta y entusiasta.
Recomienda entre 1 y 3 joyas de nuestro catálogo que encajen perfectamente con su solicitud.
Formatea tu respuesta final como JSON estrictamente con la estructura:
{
  "text": "Tu mensaje explicativo y consejo de estilo...",
  "productIds": ["joya-001", "joya-002"]
}`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = response.text;
      if (responseText) {
        const parsed = JSON.parse(responseText);
        return res.json(parsed);
      }

      return res.json({
        text: 'Hemos seleccionado las joyas más afines a tu búsqueda:',
        productIds: products ? products.slice(0, 2).map((p: { id: string }) => p.id) : []
      });

    } catch (err) {
      console.error('Error en /api/ai-stylist:', err);
      return res.json({
        text: 'Nuestras piezas de Oro 18K y Piedras Preciosas son ideales para ti:',
        productIds: req.body.products ? req.body.products.slice(0, 2).map((p: { id: string }) => p.id) : []
      });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', store: 'Garzon Joyería API' });
  });

  // Vite development middleware or production static serving
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Aura Joyería corriendo en http://localhost:${PORT}`);
  });
}

startServer();
