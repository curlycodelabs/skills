#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { chmod, mkdir, readFile, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, extname, join } from 'node:path';
import { parseArgs } from 'node:util';

const DEFAULT_API_URL = 'https://storescreenshot.app';

const API_URL = (process.env.STORESCREENSHOT_API_URL || DEFAULT_API_URL).replace(
  /\/$/,
  '',
);

function tokenFileName() {
  if (API_URL === DEFAULT_API_URL) {
    return 'token';
  }

  return `token-${new URL(API_URL).host.replace(/[^a-z0-9.-]/gi, '_')}`;
}

const TOKEN_FILE = join(homedir(), '.config', 'storescreenshot', tokenFileName());

const TOKEN = process.env.STORESCREENSHOT_TOKEN || (await readSavedToken());

const CLI_COMMAND = 'npx -y @curlycode/storescreenshot@latest';

const TOKEN_HELP = `Connect your StoreScreenshot account once with:
  ${CLI_COMMAND} login`;

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
    fail(`Not connected to StoreScreenshot yet.\n${TOKEN_HELP}`);
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

  console.log(`Signed in as ${body.email} on ${API_URL}`);
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

async function saveToken(token) {
  await mkdir(dirname(TOKEN_FILE), { recursive: true });
  await writeFile(TOKEN_FILE, `${token}\n`, { mode: 0o600 });
  await chmod(TOKEN_FILE, 0o600);
}

const OPEN_COMMANDS = { darwin: 'open', win32: 'explorer' };

function openInBrowser(url) {
  const command = OPEN_COMMANDS[process.platform] ?? 'xdg-open';

  try {
    spawn(command, [url], { stdio: 'ignore', detached: true }).unref();
  } catch {
    return;
  }
}

async function postJson(path, payload) {
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await response.text();

    return { status: response.status, body: text ? JSON.parse(text) : null };
  } catch (error) {
    fail(`Could not reach ${API_URL}: ${error.message}\nRun the same command again to retry.`);
  }
}

const sleep = (seconds) => new Promise((resolve) => setTimeout(resolve, seconds * 1000));

const LOGIN_FAILURES = {
  access_denied: 'The request was denied in the browser. Run login again to retry.',
  expired_token: 'The code expired before it was approved. Run login again to get a new one.',
  invalid_grant: 'This login request is no longer valid. Run login again.',
};

async function waitForApproval({ deviceCode, interval, expiresIn }) {
  const deadline = Date.now() + expiresIn * 1000;
  let delay = interval;

  while (Date.now() < deadline) {
    await sleep(delay);
    const { status, body } = await postJson('/api/v1/cli/token', { deviceCode });

    if (status === 200 && body?.token) {
      return body.token;
    }

    if (body?.error === 'slow_down') {
      delay += 5;
      continue;
    }

    if (body?.error !== 'authorization_pending') {
      fail(LOGIN_FAILURES[body?.error] ?? `Login failed (${status}): ${body?.error ?? 'no details'}`);
    }
  }

  fail(LOGIN_FAILURES.expired_token);
}

async function loginInBrowser() {
  const { status, body } = await postJson('/api/v1/cli/device-code', {});

  if (status !== 200) {
    fail(`Could not start the login (${status}): ${body?.error ?? 'no details'}`);
  }

  console.log('To connect StoreScreenshot, open this link and click Authorize:');
  console.log(`  ${body.verificationUrlComplete}`);
  console.log(`Check that the page shows the code ${body.userCode}.`);
  console.log('New to StoreScreenshot? The same page lets you sign up for free.');
  openInBrowser(body.verificationUrlComplete);
  console.log('Waiting for approval...');

  const token = await waitForApproval(body);
  await saveToken(token);
  console.log(`Connected. Token saved to ${TOKEN_FILE}.`);
}

async function loginWithStdinToken() {
  const token = await readStdin();

  if (!token.startsWith('ss_')) {
    fail(`That does not look like a StoreScreenshot token.\n${TOKEN_HELP}`);
  }

  await saveToken(token);
  console.log(`Token saved to ${TOKEN_FILE}.`);
}

function login(argv) {
  if (argv.includes('--token-stdin')) {
    return loginWithStdinToken();
  }

  return loginInBrowser();
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
      source: 'cli',
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

async function version() {
  const packageJson = JSON.parse(
    await readFile(new URL('../package.json', import.meta.url), 'utf8'),
  );

  console.log(packageJson.version);
}

const COMMANDS = {
  login: (argv) => login(argv),
  me: () => me(),
  send: (argv) => send(argv),
  '--version': () => version(),
};

const [command, ...rest] = process.argv.slice(2);

if (API_URL !== DEFAULT_API_URL && command !== '--version') {
  console.error(`Using ${API_URL} (set by STORESCREENSHOT_API_URL).`);
}
const run = COMMANDS[command];

if (!run) {
  fail(
    `Usage: ${CLI_COMMAND} login [--token-stdin] | me | send --app-name <name> --description-file <file> <screenshots...>\n` +
      'Full guide for coding agents: https://storescreenshot.app/setup.md',
  );
}

await run(rest);
