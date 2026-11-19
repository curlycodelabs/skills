#!/usr/bin/env node
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { parseArgs } from 'node:util';

const API_URL = (
  process.env.STORESCREENSHOT_API_URL ?? 'https://storescreenshot.app'
).replace(/\/$/, '');

const TOKEN_FILE = join(homedir(), '.config', 'storescreenshot', 'token');

const TOKEN = process.env.STORESCREENSHOT_TOKEN ?? (await readSavedToken());

const TOKEN_HELP = `Create a token at ${API_URL}/dashboard/settings/api-tokens, then save it once with:
  pbpaste | node ${process.argv[1]} login`;

async function readSavedToken() {
  try {
    return (await readFile(TOKEN_FILE, 'utf8')).trim() || undefined;
  } catch {
    return undefined;
  }
}

const MIME_TYPES = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
};

function fail(message) {
  console.error(message);
  process.exit(1);
}

async function request(path, init = {}) {
  if (!TOKEN) {
    fail(`STORESCREENSHOT_TOKEN is not set.\n${TOKEN_HELP}`);
  }

  try {
    const response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        'Content-Type': 'application/json',
        ...init.headers,
      },
    });

    const text = await response.text();
    const body = text ? JSON.parse(text) : null;

    return { status: response.status, body };
  } catch (error) {
    fail(`Could not reach ${API_URL}: ${error.message}\nRun the same command again to retry.`);
  }
}

async function me() {
  const { status, body } = await request('/api/v1/me');

  if (status === 401) {
    fail(`The token was refused.\n${TOKEN_HELP}`);
  }

  if (status !== 200) {
    fail(`Unexpected response (${status}): ${body?.error ?? 'no details'}`);
  }

  console.log(`Signed in as ${body.email}`);
  console.log(`Screenshot credits left: ${body.screenshotCredits}`);

  if (!body.emailVerified) {
    console.log('Your email is not verified yet. Verify it before sending screenshots.');
  }
}

async function readStdin() {
  const chunks = [];
  for await (const chunk of process.stdin) {
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString('utf8').trim();
}

/** Reads the token from stdin so it never lands in shell history. */
async function login() {
  const token = await readStdin();

  if (!token.startsWith('ss_')) {
    fail(`That does not look like a StoreScreenshot token.\n${TOKEN_HELP}`);
  }

  await mkdir(dirname(TOKEN_FILE), { recursive: true });
  await writeFile(TOKEN_FILE, `${token}\n`, { mode: 0o600 });
  await chmod(TOKEN_FILE, 0o600);
  console.log(`Token saved to ${TOKEN_FILE}.`);
}

async function toScreenshot(path) {
  const mimeType = MIME_TYPES[extname(path).toLowerCase()];

  if (!mimeType) {
    fail(`Unsupported file type: ${path}. Use PNG, JPEG or WebP.`);
  }

  const buffer = await readFile(path);

  return { base64: buffer.toString('base64'), mimeType };
}

async function send(argv) {
  const { values, positionals } = parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      'app-name': { type: 'string' },
      'description-file': { type: 'string' },
      description: { type: 'string' },
      device: { type: 'string', default: 'iphone' },
    },
  });

  const appName = values['app-name'];

  if (!appName) {
    fail('Missing --app-name.');
  }

  const descriptionFile = values['description-file'];

  const prompt = descriptionFile
    ? await readFile(descriptionFile, 'utf8')
    : values.description;

  if (!prompt?.trim()) {
    fail('Missing --description-file or --description.');
  }

  if (positionals.length === 0) {
    fail('Pass the screenshot files to send, in gallery order.');
  }

  const screenshots = await Promise.all(positionals.map(toScreenshot));

  console.log(`Sending ${screenshots.length} screenshots for ${appName}...`);

  const { status, body } = await request('/api/v1/projects', {
    method: 'POST',
    body: JSON.stringify({
      appName,
      prompt: prompt.trim(),
      screenshots,
      deviceFamily: values.device,
      source: 'claude-code-skill',
    }),
  });

  if (status === 201) {
    console.log(`Project created. ${body.creditsSpent} credits spent.`);
    console.log(`Open it: ${body.studioUrl}`);
    console.log('The screenshots appear frame by frame over the next minutes.');
    return;
  }

  if (status === 401) {
    fail(`The token was refused.\n${TOKEN_HELP}`);
  }

  if (status === 402) {
    fail(
      `Not enough screenshot credits: ${body.creditsNeeded} needed, ${body.creditsAvailable} left.\n` +
        `Buy credits at ${body.pricingUrl}, then run the same command again. Your captures are saved.`,
    );
  }

  fail(`StoreScreenshot refused the request (${status}): ${body?.error ?? 'no details'}`);
}

const COMMANDS = { login: () => login(), me: () => me(), send: (argv) => send(argv) };

const [command, ...rest] = process.argv.slice(2);
const run = COMMANDS[command];

if (!run) {
  fail('Usage: storescreenshot.mjs login | me | send --app-name <name> --description-file <file> <screenshots...>');
}

await run(rest);
