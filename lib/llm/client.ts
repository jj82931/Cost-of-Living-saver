export interface LLMRequest {
  model?: string
  messages: { role: 'system' | 'user' | 'assistant'; content: string }[]
  temperature?: number
  maxTokens?: number
  cacheTtlSec?: number
}

export interface LLMResponse {
  text: string
  model: string
  usage?: { promptTokens?: number; completionTokens?: number; totalTokens?: number }
  cached?: boolean
}

export class LLMError extends Error {
  status?: number
  code?: string
  constructor(message: string, status?: number, code?: string) {
    super(message)
    this.name = 'LLMError'
    this.status = status
    this.code = code
  }
}

// Simple in-memory memo cache
type CacheKey = string
interface CacheEntry { value: LLMResponse; expiresAt: number }
const memo = new Map<CacheKey, CacheEntry>()

function keyFor(req: LLMRequest) {
  const { model = 'openrouter/auto', temperature = 0.2, maxTokens = 512 } = req
  const content = req.messages.map(m => `${m.role}:${m.content}`).join('\n')
  return `${model}|${temperature}|${maxTokens}|${content}`
}

export interface ClientOptions {
  baseUrl?: string
  apiKey?: string
  site?: string // Referer header value
  app?: string // X-Title header value
  timeoutMs?: number
  retry?: { retries: number; backoffMs: number }
  fetchImpl?: typeof fetch
}

export class OpenRouterClient {
  private baseUrl: string
  private apiKey: string
  private site?: string
  private app?: string
  private timeoutMs: number
  private retry: { retries: number; backoffMs: number }
  private fetchImpl: typeof fetch

  constructor(opts: ClientOptions = {}) {
    this.baseUrl = opts.baseUrl || process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1'
    this.apiKey = opts.apiKey || process.env.OPENROUTER_API_KEY || ''
    this.site = opts.site || process.env.OPENROUTER_SITE
    this.app = opts.app || process.env.OPENROUTER_APP
    this.timeoutMs = opts.timeoutMs ?? 20000
    this.retry = opts.retry || { retries: 1, backoffMs: 300 }
    this.fetchImpl = opts.fetchImpl || (globalThis as any).fetch
  }

  async generateText(req: LLMRequest): Promise<LLMResponse> {
    const cacheKey = keyFor(req)
    const now = Date.now()
    const ttlSec = req.cacheTtlSec ?? 0
    const cached = memo.get(cacheKey)
    if (cached && cached.expiresAt > now) {
      return { ...cached.value, cached: true }
    }

    if (!this.apiKey) {
      throw new LLMError('Missing OPENROUTER_API_KEY', 401, 'no_api_key')
    }

    const body = {
      model: req.model || 'openrouter/auto',
      messages: req.messages,
      temperature: req.temperature ?? 0.2,
      max_tokens: req.maxTokens ?? 512,
    }

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${this.apiKey}`,
    }
    if (this.site) headers['HTTP-Referer'] = this.site
    if (this.app) headers['X-Title'] = this.app

    const url = this.baseUrl.replace(/\/$/, '') + '/chat/completions'

    let attempt = 0
    let lastErr: any
    while (attempt <= this.retry.retries) {
      try {
        const res = await this.withTimeout(
          this.fetchImpl(url, { method: 'POST', headers, body: JSON.stringify(body) }),
        )
        if (!res.ok) {
          const text = await safeText(res)
          throw new LLMError(`OpenRouter error: ${res.status} ${text}`, res.status, 'http_error')
        }
        const json = await res.json() as any
        const content = json.choices?.[0]?.message?.content ?? ''
        const model = json.model || body.model
        const value: LLMResponse = {
          text: String(content),
          model: String(model),
          usage: json.usage ? {
            promptTokens: json.usage.prompt_tokens,
            completionTokens: json.usage.completion_tokens,
            totalTokens: json.usage.total_tokens,
          } : undefined,
        }
        if (ttlSec > 0) memo.set(cacheKey, { value, expiresAt: now + ttlSec * 1000 })
        return value
      } catch (err: any) {
        lastErr = err
        if (attempt === this.retry.retries) break
        await sleep(this.retry.backoffMs * (attempt + 1))
        attempt++
      }
    }
    if (lastErr instanceof LLMError) throw lastErr
    throw new LLMError(lastErr?.message || 'LLM request failed', 0, 'request_failed')
  }

  private async withTimeout<T>(p: Promise<T>): Promise<T> {
    const to = this.timeoutMs
    return new Promise<T>((resolve, reject) => {
      const t = setTimeout(() => reject(new LLMError('timeout', 0, 'timeout')), to)
      p.then(v => { clearTimeout(t); resolve(v) })
       .catch(e => { clearTimeout(t); reject(e) })
    })
  }
}

async function safeText(res: Response) {
  try { return await res.text() } catch { return '' }
}

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)) }

// Testing utility: clear memo cache between tests
export function __clearLlmMemo() { memo.clear() }
