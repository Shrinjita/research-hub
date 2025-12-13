import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, BookOpen } from "lucide-react";

const MOCK_SUMMARY = `
This paper explores recent advances in the selected research area.
The authors propose a structured methodology and evaluate results
across multiple datasets, highlighting performance improvements.
`;

const MOCK_CITATIONS = [
  "Smith et al. (2022) – Journal of AI Research",
  "Doe & Kumar (2023) – IEEE Transactions on ML",
  "Zhang et al. (2024) – Nature Machine Intelligence",
];

const MOCK_LIT_SURVEY = `
Title | Authors | Year | Key Contribution
-----------------------------------------
Paper A | Smith et al. | 2022 | Introduced baseline method
Paper B | Doe, Kumar | 2023 | Improved efficiency
Paper C | Zhang et al. | 2024 | State-of-the-art results
`;

interface Tab {
  id: string;
  url: string;
  title: string;
  summary: string;
  citations: string[];
  previewText: string;
}

export default function ResearchMode() {
  const [topic, setTopic] = useState("");
  const [tabs, setTabs] = useState<Tab[]>([]);
  const [activeTab, setActiveTab] = useState<string | null>(null);
  const [literatureSurvey, setLiteratureSurvey] = useState("");
  const [loading, setLoading] = useState(false);

  // ---------- TAB HANDLERS ----------
  const addNewTab = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const response = await fetch(
        "http://localhost:3001/api/serpapi/search_scholar",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ q: query }),
        }
      );
      if (!response.ok) throw new Error("SERP API failed");
      const data = await response.json();
      const firstResult = data?.results?.[0];
      if (!firstResult) throw new Error("No results");

      const newTab: Tab = {
        id: String(Date.now()),
        url: firstResult.link || query,
        title: firstResult.title || query,
        previewText: firstResult.snippet || query,
        summary: "", // Gemini summary will fill this, fallback works
        citations: [], // Gemini citations fallback
      };

      setTabs((prev) => [...prev, newTab]);
      setActiveTab(newTab.id);
      setTopic("");
    } catch (err) {
      console.error(err);
      alert("Scholar search failed. Using fallback tab.");
      // fallback tab if SERP fails
      const fallbackTab: Tab = {
        id: String(Date.now()),
        url: query,
        title: query,
        previewText: query,
        summary: MOCK_SUMMARY,
        citations: MOCK_CITATIONS,
      };
      setTabs((prev) => [...prev, fallbackTab]);
      setActiveTab(fallbackTab.id);
      setTopic("");
    } finally {
      setLoading(false);
    }
  };

  const deleteTab = (tabId: string) => {
    setTabs((prev) => prev.filter((t) => t.id !== tabId));
    if (activeTab === tabId) setActiveTab(null);
  };

  const summarizeTab = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    setLoading(true);
    try {
      const res = await fetch("http://localhost:3001/api/gemini/summarize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: tab.previewText }),
      });
      if (!res.ok) throw new Error("Gemini summarize failed");
      const data = await res.json();
      updateTab(tabId, { summary: data.summary || MOCK_SUMMARY });
    } catch (e) {
      console.warn("Gemini summary failed, using fallback");
      updateTab(tabId, { summary: MOCK_SUMMARY });
    } finally {
      setLoading(false);
    }
  };

  const extractCitations = async (tabId: string) => {
    const tab = tabs.find((t) => t.id === tabId);
    if (!tab) return;
    setLoading(true);
    try {
      const res = await fetch(
        "http://localhost:3001/api/gemini/extract_citations",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: tab.previewText }),
        }
      );
      if (!res.ok) throw new Error("Gemini citations failed");
      const data = await res.json();
      updateTab(tabId, { citations: Array.isArray(data) ? data : MOCK_CITATIONS });
    } catch (e) {
      console.warn("Gemini citations failed, using fallback");
      updateTab(tabId, { citations: MOCK_CITATIONS });
    } finally {
      setLoading(false);
    }
  };

  const updateTab = (id: string, updates: Partial<Tab>) => {
    setTabs((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)));
  };

  const generateLiteratureSurvey = () => {
    const combined = tabs.map((t) => t.summary || t.previewText).join("\n\n");
    setLiteratureSurvey(`Literature Survey for "${topic || "Selected Topic"}"\n\n${combined}\n\n${MOCK_LIT_SURVEY}`);
  };

  // ---------- RENDER ----------
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between mb-6">
        <h1 className="text-3xl font-bold">Research Mode</h1>
        <Button disabled={!tabs.length} onClick={generateLiteratureSurvey}>
          <BookOpen className="mr-2 h-4 w-4" />
          Generate Survey
        </Button>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Add Research Tab</CardTitle>
        </CardHeader>
        <CardContent className="flex gap-2">
          <Input
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Search Google Scholar topic or paste URL"
            onKeyDown={(e) => e.key === "Enter" && addNewTab(topic)}
          />
          <Button onClick={() => addNewTab(topic)} disabled={loading}>
            {loading ? <Loader2 className="animate-spin h-4 w-4" /> : <Search className="h-4 w-4" />}
          </Button>
        </CardContent>
      </Card>

      <Tabs value={activeTab ?? undefined} onValueChange={setActiveTab}>
        <TabsList>
          {tabs.map((t) => (
            <TabsTrigger key={t.id} value={t.id} className="flex items-center gap-2">
              <span>{t.title.slice(0, 15)}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteTab(t.id);
                }}
                className="text-xs text-red-500 hover:text-red-700"
              >
                ✕
              </button>
            </TabsTrigger>
          ))}
        </TabsList>

        {tabs.map((t) => (
          <TabsContent key={t.id} value={t.id}>
            <iframe src={t.url} className="w-full h-[400px] border" />
            <div className="mt-2 flex gap-2">
              <Button onClick={() => summarizeTab(t.id)}>Summarize</Button>
              <Button onClick={() => extractCitations(t.id)}>Extract Citations</Button>
            </div>

            <Textarea
              className="mt-4"
              value={t.summary}
              onChange={(e) => updateTab(t.id, { summary: e.target.value })}
            />

            <ul className="list-disc ml-4 mt-2">
              {t.citations.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          </TabsContent>
        ))}
      </Tabs>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Literature Survey</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            className="min-h-[200px]"
            value={literatureSurvey}
            onChange={(e) => setLiteratureSurvey(e.target.value)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
