import { describe, it, expect, vi, beforeEach } from 'vitest'
import { OpenRouterClient, LLMError, __clearLlmMemo } from '../lib/llm/client'

function makeFetchSequence(responses: any[]) {
  let i = 0
  return vi.fn().mockImplementation(async () => {
    const r = responses[Math.min(i, responses.length - 1)]
    i++
    if (r instanceof Error) throw r
    // minimal Response-like object
    return {
      ok: r.ok !== false,
      status: r.status ?? 200,
      json: async () => r.json ?? {},
      text: async () => r.text ?? '',
    } as any
  })
}

const successJson = {
  id: 'cmpl_x',
  model: 'openrouter/auto:nice-model',
  choices: [ { message: { role: 'assistant', content: 'hello world' } } ],
  usage: { prompt_tokens: 5, completion_tokens: 2, total_tokens: 7 },
}

const messages = [{ role: 'user' as const, content: 'say hi' }]

beforeEach(() => {
  // Ensure env key presence for constructor
  process.env.OPENROUTER_API_KEY = 'test-key'
  __clearLlmMemo()
})

describe('OpenRouterClient', () => {
  it('returns text on success', async () => {
    const fetchImpl = makeFetchSequence([{ json: successJson }])
    const client = new OpenRouterClient({ fetchImpl })
    const res = await client.generateText({ messages })
    expect(res.text).toBe('hello world')
    expect(res.model).toMatch(/nice-model|openrouter\/auto/)
    expect(res.usage?.totalTokens).toBe(7)
  })

  it('retries on failure and then succeeds', async () => {
    const fetchImpl = makeFetchSequence([
      new Error('network'),
      { json: successJson },
    ])
    const client = new OpenRouterClient({ fetchImpl, retry: { retries: 1, backoffMs: 1 } })
    const res = await client.generateText({ messages })
    expect(res.text).toBe('hello world')
  })

  it('uses memo cache on second call', async () => {
    const fetchImpl = makeFetchSequence([{ json: successJson }])
    const client = new OpenRouterClient({ fetchImpl })
    const a = await client.generateText({ messages, cacheTtlSec: 60 })
    const b = await client.generateText({ messages, cacheTtlSec: 60 })
    expect(a.cached).toBeUndefined()
    expect(b.cached).toBe(true)
  })

  it('maps non-OK responses to LLMError', async () => {
    const fetchImpl = makeFetchSequence([{ ok: false, status: 429, text: 'Too Many Requests' }])
    const client = new OpenRouterClient({ fetchImpl })
    await expect(client.generateText({ messages })).rejects.toBeInstanceOf(LLMError)
  })
})
