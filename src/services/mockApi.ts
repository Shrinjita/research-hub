// Mock API service for Taskoscope prototype
// Replace baseUrl with real backend when ready

const MOCK_USERS = [
  { id: '1', name: 'Demo User', email: 'demo@taskoscope.io', password: 'demo123' }
];

const MOCK_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjEiLCJuYW1lIjoiRGVtbyBVc2VyIiwiZW1haWwiOiJkZW1vQHRhc2tvc2NvcGUuaW8ifQ.mock';

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface Source {
  sourceId: string;
  title: string;
  url: string;
  type: 'web' | 'pdf';
  favicon?: string;
  preview?: string;
}

export interface Citation {
  id: string;
  sourceId: string;
  title: string;
  authors: string[];
  year: string;
  apa: string;
  bibtex: string;
  doi?: string;
}

export interface ExtractResponse {
  title: string;
  authors: string[];
  year: string;
  doi: string | null;
  text: string;
  citationAPA: string;
  bibtex: string;
}

// Simulated delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const mockApi = {
  async login(email: string, password: string): Promise<LoginResponse> {
    await delay(800);
    const user = MOCK_USERS.find(u => u.email === email && u.password === password);
    if (!user) {
      throw new Error('Invalid email or password');
    }
    return {
      token: MOCK_TOKEN,
      user: { id: user.id, name: user.name, email: user.email }
    };
  },

  async register(name: string, email: string, password: string): Promise<LoginResponse> {
    await delay(800);
    const exists = MOCK_USERS.find(u => u.email === email);
    if (exists) {
      throw new Error('Email already registered');
    }
    const newUser = { id: String(MOCK_USERS.length + 1), name, email, password };
    MOCK_USERS.push(newUser);
    return {
      token: MOCK_TOKEN,
      user: { id: newUser.id, name: newUser.name, email: newUser.email }
    };
  },

  async getMe(token: string): Promise<User> {
    await delay(300);
    if (token !== MOCK_TOKEN) {
      throw new Error('Invalid token');
    }
    return { id: '1', name: 'Demo User', email: 'demo@taskoscope.io' };
  },

  async ingest(sessionId: string, sources: { url: string; type: 'web' | 'pdf' }[]): Promise<{ status: string; sources: Source[] }> {
    await delay(1000);
    return {
      status: 'ok',
      sources: sources.map((s, i) => ({
        sourceId: `src-${Date.now()}-${i}`,
        title: s.type === 'pdf' ? 'Quantum Computing Basics.pdf' : 'Quantum computing - Wikipedia',
        url: s.url,
        type: s.type,
        favicon: s.type === 'web' ? 'https://www.wikipedia.org/favicon.ico' : undefined,
        preview: s.type === 'web' 
          ? 'Quantum computing is a type of computation whose operations can harness quantum mechanical phenomena...'
          : 'Introduction to quantum computing fundamentals, qubits, and quantum gates.'
      }))
    };
  },

  async extract(url: string): Promise<ExtractResponse> {
    await delay(1500);
    
    if (url.includes('wikipedia.org/wiki/Quantum_computing')) {
      return {
        title: 'Quantum computing',
        authors: ['Wikipedia contributors'],
        year: '2024',
        doi: null,
        text: 'Quantum computing is a type of computation whose operations can harness quantum mechanical phenomena, such as superposition, interference, and entanglement. Devices that perform quantum computations are known as quantum computers.',
        citationAPA: 'Wikipedia contributors. (2024). Quantum computing. In Wikipedia, The Free Encyclopedia. Retrieved from https://en.wikipedia.org/wiki/Quantum_computing',
        bibtex: `@misc{wiki:quantum_computing,
  author = "{Wikipedia contributors}",
  title = "Quantum computing --- {Wikipedia}{,} The Free Encyclopedia",
  year = "2024",
  url = "https://en.wikipedia.org/wiki/Quantum_computing",
  note = "[Online; accessed ${new Date().toLocaleDateString()}]"
}`
      };
    }

    // Default PDF response
    return {
      title: 'Introduction to Quantum Computing',
      authors: ['John Smith', 'Jane Doe'],
      year: '2023',
      doi: '10.1234/quantum.2023.001',
      text: 'This paper provides a comprehensive introduction to quantum computing principles...',
      citationAPA: 'Smith, J., & Doe, J. (2023). Introduction to Quantum Computing. Journal of Quantum Science, 15(3), 42-58. https://doi.org/10.1234/quantum.2023.001',
      bibtex: `@article{smith2023quantum,
  author = {Smith, John and Doe, Jane},
  title = {Introduction to Quantum Computing},
  journal = {Journal of Quantum Science},
  year = {2023},
  volume = {15},
  number = {3},
  pages = {42--58},
  doi = {10.1234/quantum.2023.001}
}`
    };
  },

  async summarize(sessionId: string, sourceIds: string[]): Promise<{ summaryHtml: string; references: { sourceId: string; excerpt: string }[] }> {
    await delay(2500);
    return {
      summaryHtml: `
        <h2>Literature Survey: Quantum Computing</h2>
        <h3>Abstract</h3>
        <p>This survey examines the foundational principles and recent advances in quantum computing, synthesizing information from ${sourceIds.length} sources.</p>
        
        <h3>Introduction</h3>
        <p>Quantum computing represents a paradigm shift in computational theory, leveraging quantum mechanical phenomena to perform calculations that would be intractable for classical computers. The field has seen rapid advancement since Feynman's initial proposal in 1982.</p>
        
        <h3>Key Concepts</h3>
        <p><strong>Qubits:</strong> Unlike classical bits, qubits can exist in superposition states, enabling parallel computation across multiple states simultaneously [1].</p>
        <p><strong>Entanglement:</strong> Quantum entanglement allows qubits to be correlated in ways that have no classical analog, providing computational advantages for certain algorithms [2].</p>
        <p><strong>Quantum Gates:</strong> Operations on qubits are performed through quantum gates, which are unitary transformations preserving the quantum state's normalization.</p>
        
        <h3>Applications</h3>
        <ul>
          <li>Cryptography and security (Shor's algorithm)</li>
          <li>Optimization problems (QAOA)</li>
          <li>Machine learning (quantum neural networks)</li>
          <li>Drug discovery and molecular simulation</li>
        </ul>
        
        <h3>Conclusion</h3>
        <p>Quantum computing continues to advance toward practical applications, with recent demonstrations of quantum advantage in specific problem domains. Continued research in error correction and qubit coherence will be critical for achieving fault-tolerant quantum computation.</p>
      `,
      references: sourceIds.map((id, i) => ({
        sourceId: id,
        excerpt: i === 0 
          ? 'Quantum computing is a type of computation whose operations can harness quantum mechanical phenomena...'
          : 'This paper provides a comprehensive introduction to quantum computing principles...'
      }))
    };
  },

  async exportSession(sessionId: string, format: 'bibtex' | 'json', citations: Citation[]): Promise<Blob> {
    await delay(500);
    
    if (format === 'bibtex') {
      const bibtex = citations.map(c => c.bibtex).join('\n\n');
      return new Blob([bibtex], { type: 'application/x-bibtex' });
    }
    
    return new Blob([JSON.stringify(citations, null, 2)], { type: 'application/json' });
  }
};

export default mockApi;
