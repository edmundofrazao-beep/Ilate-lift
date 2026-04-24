import express from 'express';
import { execFile } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../..');
const runtimeRoot = path.join(repoRoot, 'public/runtime');
const publicRoot = path.join(__dirname, 'public');
const port = Number(process.env.ILATE_RUNTIME_EDITOR_PORT || 4177);

const app = express();
app.use(express.json({ limit: '5mb' }));
app.use(express.static(publicRoot));

const git = (args) => new Promise((resolve, reject) => {
  execFile('git', args, { cwd: repoRoot }, (error, stdout, stderr) => {
    if (error) {
      reject(new Error(stderr || stdout || error.message));
      return;
    }
    resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
  });
});

const safeRuntimePath = (relativePath) => {
  if (!relativePath || relativePath.includes('..') || path.isAbsolute(relativePath)) {
    throw new Error('Invalid runtime path.');
  }
  if (!relativePath.endsWith('.json')) {
    throw new Error('Only JSON runtime files can be edited.');
  }
  const fullPath = path.join(runtimeRoot, relativePath);
  const resolved = path.resolve(fullPath);
  if (!resolved.startsWith(path.resolve(runtimeRoot) + path.sep)) {
    throw new Error('Runtime path escapes the runtime directory.');
  }
  return resolved;
};

app.get('/api/runtime/files', async (_req, res) => {
  const entries = await fs.readdir(runtimeRoot);
  res.json(entries.filter((entry) => entry.endsWith('.json')).sort());
});

app.get('/api/runtime/file', async (req, res) => {
  try {
    const file = safeRuntimePath(String(req.query.path || ''));
    const content = await fs.readFile(file, 'utf8');
    res.type('application/json').send(content);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.put('/api/runtime/file', async (req, res) => {
  try {
    const { path: relativePath, content } = req.body || {};
    const file = safeRuntimePath(String(relativePath || ''));
    const text = typeof content === 'string' ? content : JSON.stringify(content, null, 2);
    JSON.parse(text);
    await fs.writeFile(file, `${text.trim()}\n`, 'utf8');
    res.json({ ok: true, path: relativePath });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

app.get('/api/git/status', async (_req, res) => {
  try {
    const [{ stdout: branch }, { stdout: status }] = await Promise.all([
      git(['branch', '--show-current']),
      git(['status', '--short', '--', 'public/runtime', 'src/lib/runtimeConfig.ts', 'src/App.tsx', 'docs', '.github/workflows', 'package.json', 'package-lock.json']),
    ]);
    res.json({ branch, status });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/git/commit', async (req, res) => {
  try {
    const message = String(req.body?.message || 'Update runtime configuration').trim();
    await git(['add', 'public/runtime', 'src/lib/runtimeConfig.ts', 'src/App.tsx', 'docs', '.github/workflows', 'package.json', 'package-lock.json']);
    const { stdout } = await git(['commit', '-m', message]);
    res.json({ ok: true, output: stdout });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/git/push', async (_req, res) => {
  try {
    const { stdout } = await git(['push', 'origin', 'v1.1']);
    res.json({ ok: true, output: stdout || 'pushed origin v1.1' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(port, () => {
  console.log(`ILATE Runtime Editor running at http://localhost:${port}`);
  console.log(`Editing runtime directory: ${runtimeRoot}`);
});
