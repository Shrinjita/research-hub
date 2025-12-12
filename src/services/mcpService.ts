// src/services/mcpService.ts
export interface MCPSource {
  url: string;
  title: string;
  content: string;
}

export interface Citation {
  text: string;
  style: 'APA' | 'MLA';
}

export interface LiteratureSurvey {
  introduction: string;
  keyFindings: string;
  comparativeAnalysis: string;
  gaps: string;
  conclusion: string;
}

class MCPService {
  private baseUrl: string;

  constructor(baseUrl: string = 'http://localhost:3001/mcp') {
    this.baseUrl = baseUrl;
  }

  async crawlTopic(topic: string): Promise<MCPSource[]> {
    const response = await fetch(`${this.baseUrl}/crawl`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic })
    });
    return response.json();
  }

  async summarize(text: string): Promise<string> {
    const response = await fetch(`${this.baseUrl}/summarize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    const data = await response.json();
    return data.summary;
  }

  async extractCitations(text: string): Promise<Citation[]> {
    const response = await fetch(`${this.baseUrl}/extract_citations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });
    return response.json();
  }

  async generateLiteratureSurvey(sources: MCPSource[]): Promise<LiteratureSurvey> {
    const response = await fetch(`${this.baseUrl}/combine_sources`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ sources })
    });
    return response.json();
  }

  async suggestReferences(keywords: string[]): Promise<MCPSource[]> {
    const response = await fetch(`${this.baseUrl}/suggest_references`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keywords })
    });
    return response.json();
  }
}

export const mcpService = new MCPService();