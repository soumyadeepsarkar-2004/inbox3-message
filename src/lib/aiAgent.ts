export interface AITags {
  category: 'Urgent' | 'Opportunity' | 'General' | 'Spam'
  summary: string
  priorityScore: number // 1 to 100
}

export class AIAgent {
  static analyzeMessage(content: string): AITags {
    const text = content.toLowerCase()
    
    let category: AITags['category'] = 'General'
    let priorityScore = 50
    if (text.includes('urgent') || text.includes('immediate') || text.includes('asap') || text.includes('critical') || text.includes('hackathon')) {
      category = 'Urgent'
      priorityScore = 95
    } else if (text.includes('opportunity') || text.includes('offer') || text.includes('job') || text.includes('funding') || text.includes('invest') || text.includes('collab')) {
      category = 'Opportunity'
      priorityScore = 85
    } else if (text.includes('buy') || text.includes('discount') || text.includes('guaranteed') || text.includes('click here') || text.includes('free airdrop') || text.includes('presale')) {
      category = 'Spam'
      priorityScore = 10
    }

    const words = content.split(' ')
    const summary = words.length > 10 ? words.slice(0, 8).join(' ') + '...' : content

    return { category, summary, priorityScore }
  }
}
