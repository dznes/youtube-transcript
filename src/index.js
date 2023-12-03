import Fastify from 'fastify';
import { getSubtitles } from 'youtube-captions-scraper';
import FastifyStatic from '@fastify/static';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFile } from 'node:fs/promises';

import 'dotenv/config'

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const fastify = Fastify({ logger: true });

const port = process.env.PORT

// Serve static files
fastify.register(FastifyStatic, {
  root: join(__dirname, 'public'),
  prefix: '/public/', // optional: default '/'
});

fastify.get('/', async (request, reply) => {
  try {
    const htmlFilePath = join(__dirname, 'index.html'); 
    const htmlContent = await readFile(htmlFilePath, 'utf8');
    await reply.type('text/html').send(htmlContent);
  } catch (err) {
    reply.status(500).send('Error loading the page');
  }
});

fastify.get('/video-transcript', async (request, reply) => {
  try {
    const videoId = request.query.videoId;
    if (!videoId) {
      return reply.status(400).send({ error: 'No video ID provided' });
    }

    const subtitles = await getSubtitles({ videoID: videoId, lang: 'en' });
    reply.send({ subtitles });
  } catch (err) {
    fastify.log.error(err);
    reply.status(500).send({ error: 'Failed to fetch subtitles' });
  }
});

const start = async () => {
  try {
    await fastify.listen({ port: port });
    console.log(`Server running at ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
