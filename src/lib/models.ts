import type { ModelInfo } from './types'

export const MODELS: ModelInfo[] = [
  { id: 'claude', name: 'Claude', category: 'text', color: '#D97757' },
  { id: 'chatgpt', name: 'ChatGPT', category: 'text', color: '#10A37F' },
  { id: 'gemini', name: 'Gemini', category: 'text', color: '#4C8DF6' },
  { id: 'flux', name: 'Flux', category: 'image', color: '#A855F7' },
  { id: 'midjourney', name: 'Midjourney', category: 'image', color: '#6366F1' },
  { id: 'stable-diffusion', name: 'Stable Diffusion', category: 'image', color: '#F59E0B' },
]

export function getModel(id: string): ModelInfo | undefined {
  return MODELS.find((m) => m.id === id)
}
