# ⚡ SkyBreak: Global LLM Latency & Pricing Micro-Probe Runner

[![Live Leaderboard](https://img.shields.io/badge/Live%20Leaderboard-skybreakplatform.com-blue?style=for-the-badge&logo=cloudflare)](https://skybreakplatform.com)
[![Probe Node](https://img.shields.io/badge/Edge%20Probe-Asia--Pacific%20%2F%20Tokyo-emerald?style=for-the-badge)](https://skybreakplatform.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> Automated lightweight micro-probe benchmarking engine that measures **Time-to-First-Token (TTFT)**, **Throughput (Tokens/sec)**, and tracks real-time pricing per 1M tokens across 13+ premier global and Asian LLMs with minimal token burn (<$0.50/month).

**Live Dashboard**: [https://skybreakplatform.com](https://skybreakplatform.com)

---

## 🚀 Key Features

* **Sub-Second Micro-Probe Architecture**: Measures TTFT by requesting a minimal streaming prompt and terminating connection immediately after capturing the first chunk. Burns `<5` tokens per ping.
* **Throughput (TPS) Evaluation**: Measures token generation velocity in tokens per second.
* **Prompt Caching Discount Tracking**: Captures cost reductions from Prompt Caching (e.g. Anthropic, DeepSeek).
* **Unified Model Coverage**: Benchmarks OpenAI (GPT-4o, GPT-4o mini), Anthropic (Claude 3.5/4.5), DeepSeek (V3, R1), Alibaba Qwen (2.5 72B, Coder 32B), Google (Gemini 2.5 Flash & Pro), Meta (Llama 3.3 70B), Mistral AI, and MiniMax via OpenRouter.
* **Asia-Pacific Gateway Optimized**: Evaluates real network conditions and handshake speeds without proxy or VPN distortions.

---

## 📦 Quick Start

### 1. Clone & Install
```bash
git clone https://github.com/YOUR_USERNAME/skybreak-llm-benchmark.git
cd skybreak-llm-benchmark
npm install
```

### 2. Set API Key
Get an API key from [OpenRouter](https://openrouter.ai/?ref=skybreak):
```bash
export OPENROUTER_API_KEY="sk-or-v1-your-key-here"
```

### 3. Run Benchmark
```bash
node probe_runner.js
```
The results will be printed to stdout and saved as `benchmark_data.json`.

---

## 📊 Output Schema

```json
{
  "id": "qwen/qwen-2.5-72b-instruct",
  "name": "Qwen 2.5 72B Instruct",
  "provider": "Alibaba Qwen",
  "ttft_ms": 332,
  "tps": 21.4,
  "pricing": {
    "prompt_1m": 0.36,
    "completion_1m": 0.40,
    "prompt_cache_discount_pct": null
  },
  "value_score": 9.6
}
```

---

## 🌐 Live Platform
View the real-time matrix, interactive cost simulator, and model comparisons at:  
👉 **[https://skybreakplatform.com](https://skybreakplatform.com)**

## 📄 License
MIT License. Free for developers and researchers.
