#!/usr/bin/env node
/**
 * Smoke test pós-implantação da MistérioBox.
 *
 *   npm run smoke -- https://seu-projeto.vercel.app            (somente leitura)
 *   npm run smoke -- https://seu-projeto.vercel.app --write    (cria um jogador de teste)
 *
 * Somente leitura: saúde da API, catálogo (10 missões, 3/3/4, sem solução exposta),
 * página inicial e rotas do SPA, proteção das rotas autenticadas e cabeçalhos de cache.
 * Com --write: cadastro, login, sessão, início e continuidade de investigação, histórico
 * e renovação do token, usando um e-mail e uma senha aleatórios gerados nesta execução.
 * Nenhuma senha ou token é exibido. A conta de teste fica registrada no banco.
 */
import { randomBytes } from 'node:crypto';

const [, , rawBaseUrl, ...flags] = process.argv;
if (!rawBaseUrl) {
  console.error('Uso: npm run smoke -- <URL base> [--write]');
  process.exit(2);
}
const baseUrl = rawBaseUrl.replace(/\/+$/, '');
const allowWrite = flags.includes('--write');

const results = [];
async function check(name, run) {
  try {
    await run();
    results.push({ name, ok: true });
    console.log(`  ✓ ${name}`);
  } catch (error) {
    results.push({ name, ok: false });
    console.log(`  ✗ ${name}: ${error instanceof Error ? error.message : error}`);
  }
}

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function call(path, { method = 'GET', token, body } = {}) {
  const headers = { Accept: 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${baseUrl}${path}`, {
    method,
    headers,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await response.text();
  let json = null;
  try {
    json = JSON.parse(text);
  } catch {
    /* página HTML ou corpo vazio */
  }
  return { status: response.status, headers: response.headers, json, text };
}

console.log(`Smoke test em ${baseUrl}${allowWrite ? ' (com escrita)' : ' (somente leitura)'}\n`);

await check('GET /api/health responde 200', async () => {
  const { status, json } = await call('/api/health');
  assert(status === 200 && json?.data?.status === 'ok', `status ${status}`);
});

await check(
  'Catálogo com 10 missões (3 fáceis, 3 médias, 4 difíceis), sem solução exposta',
  async () => {
    const { status, json, text } = await call('/api/missions');
    assert(status === 200, `status ${status}`);
    const missions = json?.data ?? [];
    const count = (difficulty) => missions.filter((m) => m.difficulty === difficulty).length;
    assert(missions.length === 10, `${missions.length} missões`);
    assert(
      count('FACIL') === 3 && count('MEDIO') === 3 && count('DIFICIL') === 4,
      `distribuição ${count('FACIL')}/${count('MEDIO')}/${count('DIFICIL')}`,
    );
    assert(!/solution|culprit|explanation/i.test(text), 'campos da solução presentes na resposta');
  },
);

await check('Respostas da API com Cache-Control: no-store', async () => {
  const { headers } = await call('/api/missions');
  assert((headers.get('cache-control') ?? '').includes('no-store'), 'cabeçalho ausente');
});

await check('Rotas autenticadas recusam acesso sem token (401)', async () => {
  const { status } = await call('/api/investigations');
  assert(status === 401, `status ${status}`);
});

await check('Rota inexistente da API responde 404 em JSON', async () => {
  const { status, json } = await call('/api/rota-inexistente-smoke');
  assert(status === 404 && json?.error?.code === 'ROUTE_NOT_FOUND', `status ${status}`);
});

for (const path of ['/', '/login', '/historico']) {
  await check(`Página ${path} entrega o aplicativo (HTML)`, async () => {
    const response = await fetch(`${baseUrl}${path}`);
    const html = await response.text();
    assert(response.status === 200 && /<div id="root">/.test(html), `status ${response.status}`);
  });
}

if (allowWrite) {
  const email = `smoke.${Date.now()}.${randomBytes(3).toString('hex')}@example.com`;
  const password = `Smoke${randomBytes(8).toString('hex')}9`;
  let token = null;
  let investigationId = null;

  await check('Cadastro de jogador de teste', async () => {
    const { status, json } = await call('/api/auth/register', {
      method: 'POST',
      body: { name: 'Detetive Fumaca', email, password },
    });
    assert(status === 201, `status ${status}`);
    token = json.data.token;
  });

  await check('Login com o jogador de teste', async () => {
    const { status, json } = await call('/api/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    assert(status === 200 && json?.data?.token, `status ${status}`);
    token = json.data.token;
  });

  await check('Sessão autenticada (/api/auth/me)', async () => {
    const { status } = await call('/api/auth/me', { token });
    assert(status === 200, `status ${status}`);
  });

  await check('Início de investigação (missao-001)', async () => {
    const { status, json } = await call('/api/investigations', {
      method: 'POST',
      token,
      body: { missionId: 'missao-001' },
    });
    assert(status === 201, `status ${status}`);
    investigationId = json.data.id;
  });

  await check('Análise de evidência e progresso salvo', async () => {
    const analyzed = await call(`/api/investigations/${investigationId}/evidences/ev-01/analysis`, {
      method: 'POST',
      token,
    });
    assert(analyzed.status === 200, `status ${analyzed.status}`);
    const progress = await call(`/api/investigations/${investigationId}`, { token });
    assert(progress.json?.data?.progress?.analyzedEvidences === 1, 'progresso não salvo');
  });

  await check(
    'Continuidade: iniciar de novo aponta a investigação em andamento (409)',
    async () => {
      const { status, json } = await call('/api/investigations', {
        method: 'POST',
        token,
        body: { missionId: 'missao-001' },
      });
      assert(
        status === 409 && json?.error?.details?.investigationId === investigationId,
        `status ${status}`,
      );
    },
  );

  await check('Histórico do jogador lista a tentativa', async () => {
    const { status, json } = await call('/api/investigations', { token });
    assert(status === 200 && json.data.some((item) => item.id === investigationId), 'ausente');
  });

  await check('Renovação da sessão (POST /api/auth/refresh)', async () => {
    const { status } = await call('/api/auth/refresh', { method: 'POST', token });
    assert(status === 200, `status ${status}`);
  });

  await check('Abandono encerra a tentativa de teste', async () => {
    const { status } = await call(`/api/investigations/${investigationId}/abandon`, {
      method: 'POST',
      token,
    });
    assert(status === 200, `status ${status}`);
  });

  console.log(`\nConta de teste criada: ${email} (senha aleatória, não exibida).`);
}

const failed = results.filter((result) => !result.ok).length;
console.log(`\n${results.length - failed}/${results.length} verificações aprovadas.`);
process.exit(failed === 0 ? 0 : 1);
