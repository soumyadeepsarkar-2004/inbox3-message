import { describe, it, expect } from 'vitest'
import { AIAgent } from '../lib/aiAgent'

describe('AIAgent.analyzeMessage', () => {
  it('classifies urgent messages', () => {
    const result = AIAgent.analyzeMessage('This is urgent, need help ASAP!')
    expect(result.category).toBe('Urgent')
    expect(result.priorityScore).toBeGreaterThanOrEqual(95)
    expect(result.summary).toBeDefined()
  })

  it('classifies opportunity messages', () => {
    const result = AIAgent.analyzeMessage('Great funding opportunity for your startup')
    expect(result.category).toBe('Opportunity')
    expect(result.priorityScore).toBeGreaterThanOrEqual(85)
  })

  it('classifies spam messages', () => {
    const result = AIAgent.analyzeMessage('Buy now and get a guaranteed discount!')
    expect(result.category).toBe('Spam')
    expect(result.priorityScore).toBeLessThanOrEqual(10)
  })

  it('classifies general messages', () => {
    const result = AIAgent.analyzeMessage('Hey, how are you doing today?')
    expect(result.category).toBe('General')
    expect(result.priorityScore).toBe(50)
  })

  it('detects hackathon as urgent', () => {
    const result = AIAgent.analyzeMessage('Join our hackathon this weekend!')
    expect(result.category).toBe('Urgent')
  })

  it('generates summary for long messages', () => {
    const longMessage = 'This is a very long message that should be summarized by the AI agent to show a preview of what the content is about.'
    const result = AIAgent.analyzeMessage(longMessage)
    expect(result.summary.split(' ').length).toBeLessThanOrEqual(10)
    expect(result.summary).toContain('...')
  })

  it('uses full content as summary for short messages', () => {
    const shortMessage = 'Hello world'
    const result = AIAgent.analyzeMessage(shortMessage)
    expect(result.summary).toBe(shortMessage)
  })
})
