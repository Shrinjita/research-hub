// src/pages/ResearchMode.tsx
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, Search, Plus, FileText, Link, BookOpen } from 'lucide-react';

interface ResearchCard {
  id: string;
  title: string;
  url: string;
  summary?: string;
  citations: string[];
  notes: string;
  addedToSurvey: boolean;
  keywords: string[];
}

export default function ResearchMode() {
  const [researchTopic, setResearchTopic] = useState('');
  const [cards, setCards] = useState<ResearchCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [literatureSurvey, setLiteratureSurvey] = useState('');

  // Fetch top links based on topic
  const fetchResearchSources = async () => {
    if (!researchTopic.trim()) return;
    
    setLoading(true);
    try {
      // TODO: Call MCP crawl endpoint
      // const response = await fetch('/api/mcp/crawl', {
      //   method: 'POST',
      //   body: JSON.stringify({ topic: researchTopic })
      // });
      // const data = await response.json();
      
      // Mock data for now
      const mockData: ResearchCard[] = [
        {
          id: '1',
          title: 'Research Paper on Topic',
          url: 'https://example.com/paper1',
          summary: '',
          citations: [],
          notes: '',
          addedToSurvey: false,
          keywords: ['keyword1', 'keyword2']
        },
        // Add more mock cards
      ];
      
      setCards(mockData);
    } catch (error) {
      console.error('Error fetching sources:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateSummary = async (cardId: string) => {
    // TODO: Call MCP summarize endpoint
    console.log('Generating summary for:', cardId);
  };

  const extractCitations = async (cardId: string) => {
    // TODO: Call MCP extract_citations endpoint
    console.log('Extracting citations for:', cardId);
  };

  const generateLiteratureSurvey = async () => {
    const selectedCards = cards.filter(card => card.addedToSurvey);
    if (selectedCards.length === 0) return;
    
    setLoading(true);
    try {
      // TODO: Call MCP combine_sources endpoint
      // const response = await fetch('/api/mcp/combine_sources', {
      //   method: 'POST',
      //   body: JSON.stringify({ sources: selectedCards })
      // });
      // const survey = await response.json();
      
      // Mock survey
      setLiteratureSurvey(`Literature Survey for ${researchTopic}\n\nKey findings from ${selectedCards.length} sources...`);
    } catch (error) {
      console.error('Error generating survey:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Research Mode</h1>
          <p className="text-muted-foreground">Centralized research workspace</p>
        </div>
        <Button onClick={generateLiteratureSurvey} disabled={cards.length === 0}>
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Literature Survey
        </Button>
      </div>

      {/* Topic Search */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Start Your Research</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Enter research topic..."
              value={researchTopic}
              onChange={(e) => setResearchTopic(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && fetchResearchSources()}
            />
            <Button onClick={fetchResearchSources} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Search
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="workspace" className="space-y-4">
        <TabsList>
          <TabsTrigger value="workspace">
            <FileText className="mr-2 h-4 w-4" />
            Research Workspace
          </TabsTrigger>
          <TabsTrigger value="survey">
            <BookOpen className="mr-2 h-4 w-4" />
            Literature Survey
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workspace">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cards.map((card) => (
              <ResearchCardComponent
                key={card.id}
                card={card}
                onUpdate={(updated) => {
                  setCards(cards.map(c => c.id === updated.id ? updated : c));
                }}
                onGenerateSummary={() => generateSummary(card.id)}
                onExtractCitations={() => extractCitations(card.id)}
              />
            ))}
            {cards.length === 0 && (
              <Card className="col-span-full p-8 text-center">
                <p className="text-muted-foreground">No research sources yet. Start by entering a topic above.</p>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="survey">
          <Card>
            <CardHeader>
              <CardTitle>Literature Survey</CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={literatureSurvey}
                onChange={(e) => setLiteratureSurvey(e.target.value)}
                className="min-h-[400px] font-mono"
                placeholder="Generated literature survey will appear here..."
              />
              <div className="flex justify-end gap-2 mt-4">
                <Button variant="outline">Save</Button>
                <Button>Export as Markdown</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ResearchCardComponent({ 
  card, 
  onUpdate,
  onGenerateSummary,
  onExtractCitations 
}: { 
  card: ResearchCard;
  onUpdate: (card: ResearchCard) => void;
  onGenerateSummary: () => void;
  onExtractCitations: () => void;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <CardTitle className="text-lg">{card.title}</CardTitle>
          <Badge variant={card.addedToSurvey ? "default" : "outline"}>
            {card.addedToSurvey ? 'In Survey' : 'Not Added'}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Link className="h-3 w-3 mr-1" />
          <a href={card.url} target="_blank" rel="noopener noreferrer" className="truncate hover:underline">
            {card.url}
          </a>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-semibold mb-2">Summary</h4>
          {card.summary ? (
            <p className="text-sm">{card.summary}</p>
          ) : (
            <Button size="sm" onClick={onGenerateSummary}>
              Generate Summary
            </Button>
          )}
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <h4 className="font-semibold">Citations</h4>
            <Button size="sm" variant="outline" onClick={onExtractCitations}>
              Extract
            </Button>
          </div>
          <ScrollArea className="h-24 border rounded p-2">
            {card.citations.map((citation, index) => (
              <p key={index} className="text-xs mb-1">{citation}</p>
            ))}
          </ScrollArea>
        </div>

        <div>
          <h4 className="font-semibold mb-2">Notes</h4>
          <Textarea
            placeholder="Add notes..."
            value={card.notes}
            onChange={(e) => onUpdate({ ...card, notes: e.target.value })}
            className="min-h-[80px] text-sm"
          />
        </div>

        <div className="flex justify-between">
          <Button
            size="sm"
            variant={card.addedToSurvey ? "default" : "outline"}
            onClick={() => onUpdate({ ...card, addedToSurvey: !card.addedToSurvey })}
          >
            {card.addedToSurvey ? 'Remove from Survey' : 'Add to Survey'}
          </Button>
        </div>

        {card.keywords.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {card.keywords.map((keyword, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}