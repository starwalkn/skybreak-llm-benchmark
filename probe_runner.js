const https = require('https');
const fs = require('fs');
const path = require('path');

const API_KEY = process.env.OPENROUTER_API_KEY;
if (!API_KEY) {
  console.error('Error: Please set your OPENROUTER_API_KEY environment variable.');
  console.error('Example: export OPENROUTER_API_KEY="sk-or-v1-..."');
  process.exit(1);
}

const CONFIG_PATH = path.join(__dirname, 'models_config.json');
const OUTPUT_FILE = path.join(__dirname, 'benchmark_data.json');

function fetchAllModelsPricing() {
  return new Promise((resolve, reject) => {
    https.get('https://openrouter.ai/api/v1/models', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          const map = {};
          if (json.data && Array.isArray(json.data)) {
            json.data.forEach(m => {
              map[m.id] = {
                name: m.name,
                prompt_price_raw: parseFloat(m.pricing?.prompt || 0),
                completion_price_raw: parseFloat(m.pricing?.completion || 0),
                input_cache_raw: m.pricing?.input_cache ? parseFloat(m.pricing.input_cache) : null,
                context_length: m.context_length || 0,
                description: m.description || ''
              };
            });
          }
          resolve(map);
        } catch (e) {
          reject(e);
        }
      });
    }).on('error', reject);
  });
}

function probeModelLatency(modelId) {
  return new Promise((resolve) => {
    const postData = JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: 'Say READY' }],
      stream: true,
      max_tokens: 5,
      temperature: 0.1
    });

    const startTime = Date.now();
    let firstTokenTime = null;
    let tokenChunkCount = 0;
    let completed = false;

    const timeout = setTimeout(() => {
      if (!completed) {
        completed = true;
        try { req.destroy(); } catch (_) {}
        resolve({ success: false, ttft_ms: null, total_ms: 10000, error: 'TIMEOUT' });
      }
    }, 10000);

    const req = https.request('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://skybreakplatform.com',
        'X-Title': 'SkyBreak Benchmark Probe'
      }
    }, (res) => {
      if (res.statusCode !== 200) {
        clearTimeout(timeout);
        completed = true;
        resolve({ success: false, ttft_ms: null, error: `HTTP_${res.statusCode}` });
        return;
      }

      res.on('data', () => {
        const now = Date.now();
        if (!firstTokenTime) firstTokenTime = now;
        tokenChunkCount++;
        if (tokenChunkCount >= 2 && !completed) {
          completed = true;
          clearTimeout(timeout);
          const ttft = firstTokenTime - startTime;
          try { req.destroy(); } catch (_) {}
          resolve({ success: true, ttft_ms: ttft });
        }
      });

      res.on('end', () => {
        if (!completed) {
          completed = true;
          clearTimeout(timeout);
          resolve({ success: true, ttft_ms: (firstTokenTime || Date.now()) - startTime });
        }
      });
    });

    req.on('error', (err) => {
      if (!completed) {
        completed = true;
        clearTimeout(timeout);
        resolve({ success: false, ttft_ms: null, error: err.code || err.message });
      }
    });

    req.write(postData);
    req.end();
  });
}

async function runBenchmark() {
  console.log('=== SkyBreak Benchmark Probe Starting ===');
  const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf8'));
  const pricingMap = await fetchAllModelsPricing();
  const results = [];

  for (let i = 0; i < config.models.length; i++) {
    const m = config.models[i];
    console.log(`[${i + 1}/${config.models.length}] Probing ${m.id} (${m.name})...`);
    const livePricing = pricingMap[m.id] || {};
    const prompt1M = (livePricing.prompt_price_raw * 1000000) || 0;
    const completion1M = (livePricing.completion_price_raw * 1000000) || 0;

    const probe = await probeModelLatency(m.id);
    console.log(`  -> Status: ${probe.success ? 'ONLINE' : 'ERROR'} | TTFT: ${probe.ttft_ms}ms | $${prompt1M.toFixed(2)}/$${completion1M.toFixed(2)} /1M`);

    results.push({
      id: m.id,
      name: m.name,
      provider: m.provider,
      ttft_ms: probe.ttft_ms,
      pricing: { prompt_1m: prompt1M, completion_1m: completion1M }
    });

    await new Promise(r => setTimeout(r, 500));
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify({ updated_at: new Date().toISOString(), models: results }, null, 2));
  console.log(`Saved benchmark output to ${OUTPUT_FILE}`);
}

runBenchmark().catch(console.error);
