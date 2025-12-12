// File: /mnt/c/Users/Shrinjita Paul/Documents/GitHub/research-hub/src/pages/ResearchMode.tsx
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, BookOpen } from "lucide-react";

interface Tab {
  id: string;
  url: string;
  title: string;
  summary: string;
  citations: string[];
  previewText: string;
}

export default function ResearchMode() {
  const [urlInput, setUrlInput] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [literatureSurvey, setLiteratureSurvey] = useState("");
  const [loading, setLoading] = useState(false);

  const addNewTab = async (query: string) => {
  if (!query.trim()) return;

  setLoading(true);
  try {
    // Call SERP API for Google Scholar results
    const response = await fetch("http://localhost:3001/api/serpapi/search_scholar", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ q: query }),
    });
    const data = await response.json();

    // Extract first result (can expand later)
    const firstResult = data?.results?.[0];
    if (!firstResult) {
      alert("No results found");
      return;
    }

    const newTab: Tab = {
      id: `${Date.now()}`,
      url: firstResult.link || query,
      title: firstResult.title || query,
      previewText: firstResult.snippet || "Preview not available",
      summary: "Summary not generated yet",
      citations: [],
    };

    setTabs((prev) => [...prev, newTab]);
    setActiveTab(newTab.id);

    // Clear input
    setTopic("");
  } catch (err) {
    console.error(err);
    alert("Error fetching search results");
  } finally {
    setLoading(false);
  }
};


  const summarizeTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    setLoading(true);
    try {
      let summary = "Fallback summary: key points of this page...";

      try {
        const response = await fetch("http://localhost:3001/api/gemini/summarize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tab.previewText }),
        });
        const data = await response.json();
        summary = data.summary || summary;
      } catch {
        console.warn("Gemini summarize failed, using fallback");
      }

      updateTab(tabId, { summary });
    } finally {
      setLoading(false);
    }
  };

  const extractCitations = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;

    setLoading(true);
    try {
      let citations: string[] = ["Doe, 2025. Sample citation"]; // fallback

      try {
        const response = await fetch("http://localhost:3001/api/gemini/extract_citations", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tab.previewText }),
        });
        const data = await response.json();
        citations = Array.isArray(data) ? data : citations;
      } catch {
        console.warn("Gemini citations failed, using fallback");
      }

      updateTab(tabId, { citations });
    } finally {
      setLoading(false);
    }
  };

  const updateTab = (tabId: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === tabId ? { ...t, ...updates } : t)));
  };

  const generateLiteratureSurvey = () => {
    const combined = tabs.map((t) => t.summary || t.previewText).join("\n\n");
    setLiteratureSurvey(`Literature Survey for topic "${topic}":\n\n${combined}`);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Research Mode</h1>
          <p className="text-muted-foreground">Centralized research workspace</p>
        </div>
        <Button onClick={generateLiteratureSurvey} disabled={tabs.length === 0}>
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Literature Survey
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add a New Research Tab</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="Search topic..."
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addNewTab(topic)}
            />
            <Button onClick={() => addNewTab(topic)} disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
              Add Tab
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab || undefined} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.map((tab) => (
            <TabsTrigger key={tab.id} value={tab.id}>
              {tab.title.slice(0, 15)}...
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((tab) => (
          <TabsContent key={tab.id} value={tab.id}>
            <iframe src={tab.url} className="w-full h-[500px] border" />
            <div className="mt-4 space-x-2">
              <Button onClick={() => summarizeTab(tab.id)}>Generate Summary</Button>
              <Button onClick={() => extractCitations(tab.id)}>Extract Citations</Button>
            </div>
            <Card className="mt-4">
              <CardHeader>
                <CardTitle>Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={tab.summary}
                  onChange={(e) => updateTab(tab.id, { summary: e.target.value })}
                  className="min-h-[80px] font-mono"
                />
                <div className="mt-2">
                  <strong>Citations:</strong>
                  <ul className="list-disc ml-4">
                    {tab.citations?.map((c, i) => (
                      <li key={i}>{c}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Combined Literature Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            value={literatureSurvey}
            onChange={(e) => setLiteratureSurvey(e.target.value)}
            className="min-h-[200px] font-mono"
          />
        </CardContent>
      </Card>
    </div>
  );
}
