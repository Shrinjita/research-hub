import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { mockApi, Source, Citation, ExtractResponse } from '@/services/mockApi';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import {
  BookOpen,
  ChevronLeft,
  Plus,
  Search,
  FileText,
  Sparkles,
  Save,
  Download,
  X,
  ExternalLink,
  Quote,
  Pin,
  Trash2,
  Highlighter,
  MessageSquare,
  Send,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  CheckCircle2,
  Globe,
  FileIcon,
} from 'lucide-react';

interface Project {
  id: string;
  name: string;
  sources: Source[];
  citations: Citation[];
  createdAt: Date;
}

interface Note {
  id: string;
  sourceId: string;
  text: string;
  highlight?: string;
  createdAt: Date;
}

export default function ResearchMode() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  // State
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [project, setProject] = useState<Project | null>(null);
  const [activeSourceId, setActiveSourceId] = useState<string | null>(null);
  const [citations, setCitations] = useState<Citation[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [chatMessages, setChatMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [isGeneratingSurvey, setIsGeneratingSurvey] = useState(false);
  const [surveyContent, setSurveyContent] = useState<string | null>(null);
  const [citationOverlay, setCitationOverlay] = useState<{ visible: boolean; status: 'loading' | 'success' | null; sourceId: string | null }>({
    visible: false,
    status: null,
    sourceId: null,
  });
  const [highlighterActive, setHighlighterActive] = useState(false);
  const [newProjectDialogOpen, setNewProjectDialogOpen] = useState(false);
  const [newProjectName, setNewProjectName] = useState('Quantum Computing Basics');

  const activeSource = project?.sources.find(s => s.sourceId === activeSourceId);

  // Create new project with demo sources
  const handleCreateProject = useCallback(async () => {
    const sessionId = `session-${Date.now()}`;
    
    // Demo sources
    const demoSources = [
      { url: 'https://en.wikipedia.org/wiki/Quantum_computing', type: 'web' as const },
      { url: '/mockApi/assets/quantum_basics.pdf', type: 'pdf' as const },
    ];

    try {
      const result = await mockApi.ingest(sessionId, demoSources);
      
      const newProject: Project = {
        id: sessionId,
        name: newProjectName,
        sources: result.sources,
        citations: [],
        createdAt: new Date(),
      };
      
      setProject(newProject);
      setActiveSourceId(result.sources[0]?.sourceId || null);
      setNewProjectDialogOpen(false);
      toast.success('Project created with demo sources');
    } catch (error) {
      toast.error('Failed to create project');
    }
  }, [newProjectName]);

  // Citation capture
  const handleCaptureCitation = useCallback(async (source: Source) => {
    setCitationOverlay({ visible: true, status: 'loading', sourceId: source.sourceId });
    
    try {
      const result: ExtractResponse = await mockApi.extract(source.url);
      
      const newCitation: Citation = {
        id: `cite-${Date.now()}`,
        sourceId: source.sourceId,
        title: result.title,
        authors: result.authors,
        year: result.year,
        apa: result.citationAPA,
        bibtex: result.bibtex,
        doi: result.doi || undefined,
      };
      
      setCitations(prev => [...prev, newCitation]);
      setCitationOverlay({ visible: true, status: 'success', sourceId: source.sourceId });
      
      setTimeout(() => {
        setCitationOverlay({ visible: false, status: null, sourceId: null });
      }, 2000);
      
      toast.success('Citation captured! See sidebar.');
    } catch (error) {
      setCitationOverlay({ visible: false, status: null, sourceId: null });
      toast.error('Failed to capture citation');
    }
  }, []);

  // Generate literature survey
  const handleGenerateSurvey = useCallback(async () => {
    if (!project || project.sources.length === 0) {
      toast.error('Add some sources first');
      return;
    }

    setIsGeneratingSurvey(true);
    setSurveyContent(null);

    try {
      const result = await mockApi.summarize(
        project.id,
        project.sources.map(s => s.sourceId)
      );
      setSurveyContent(result.summaryHtml);
      toast.success('Literature survey generated!');
    } catch (error) {
      toast.error('Failed to generate survey');
    } finally {
      setIsGeneratingSurvey(false);
    }
  }, [project]);

  // Export citations
  const handleExport = useCallback(async (format: 'bibtex' | 'json') => {
    if (citations.length === 0) {
      toast.error('No citations to export');
      return;
    }

    try {
      const blob = await mockApi.exportSession(project?.id || '', format, citations);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `citations.${format === 'bibtex' ? 'bib' : 'json'}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success(`Exported ${citations.length} citations`);
    } catch (error) {
      toast.error('Export failed');
    }
  }, [citations, project?.id]);

  // Chat functionality
  const handleSendChat = useCallback(() => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput.trim();
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    
    // Simulate AI response
    setTimeout(() => {
      setChatMessages(prev => [...prev, {
        role: 'assistant',
        content: `I can help you with your research on "${project?.name || 'your topic'}". Based on your sources, quantum computing leverages quantum mechanical phenomena like superposition and entanglement for computation. Would you like me to summarize a specific aspect or help find related sources?`
      }]);
    }, 1000);
  }, [chatInput, project?.name]);

  // Remove source
  const handleRemoveSource = useCallback((sourceId: string) => {
    if (!project) return;
    setProject({
      ...project,
      sources: project.sources.filter(s => s.sourceId !== sourceId)
    });
    if (activeSourceId === sourceId) {
      setActiveSourceId(project.sources[0]?.sourceId || null);
    }
    toast.success('Source removed');
  }, [project, activeSourceId]);

  // Create note from highlight
  const handleCreateNote = useCallback((text: string) => {
    if (!activeSourceId) return;
    const newNote: Note = {
      id: `note-${Date.now()}`,
      sourceId: activeSourceId,
      text: text,
      highlight: text,
      createdAt: new Date(),
    };
    setNotes(prev => [...prev, newNote]);
    toast.success('Note created');
  }, [activeSourceId]);

  // Empty state
  if (!project) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card transition-theme">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
                <ChevronLeft className="w-5 h-5" />
              </Button>
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <BookOpen className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-lg">Research Mode</span>
            </div>
          </div>
        </header>

        {/* Empty state */}
        <main className="container mx-auto px-6 py-24">
          <div className="max-w-md mx-auto text-center animate-fade-in">
            <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <BookOpen className="w-10 h-10 text-primary" />
            </div>
            <h1 className="text-2xl font-display font-bold text-foreground mb-3">
              Start Your Research
            </h1>
            <p className="text-muted-foreground mb-8">
              Create a new project to begin capturing citations, annotating sources, and generating literature surveys.
            </p>
            <Button size="lg" onClick={() => setNewProjectDialogOpen(true)}>
              <Plus className="w-5 h-5" />
              Start New Project
            </Button>
          </div>

          {/* New project dialog */}
          {newProjectDialogOpen && (
            <div className="fixed inset-0 bg-foreground/50 flex items-center justify-center z-50 animate-fade-in">
              <div className="bg-card rounded-2xl p-6 w-full max-w-md shadow-elevated animate-scale-in">
                <h2 className="text-xl font-display font-bold mb-4">New Research Project</h2>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium mb-2 block">Project Name</label>
                    <Input
                      value={newProjectName}
                      onChange={(e) => setNewProjectName(e.target.value)}
                      placeholder="Enter project name"
                      className="h-11"
                    />
                  </div>
                  <p className="text-sm text-muted-foreground">
                    This demo will create a project with sample sources: a Wikipedia article and a PDF on quantum computing.
                  </p>
                  <div className="flex gap-3 justify-end">
                    <Button variant="outline" onClick={() => setNewProjectDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateProject}>
                      Create Project
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-background overflow-hidden">
      {/* Topbar */}
      <header className="border-b bg-card flex-shrink-0 transition-theme">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/dashboard')}>
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display font-bold text-lg leading-tight">{project.name}</h1>
              <p className="text-xs text-muted-foreground">{project.sources.length} sources • {citations.length} citations</p>
            </div>
          </div>

          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search topic or add URL..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 h-9"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="glow"
              onClick={handleGenerateSurvey}
              disabled={isGeneratingSurvey}
            >
              {isGeneratingSurvey ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  Generate Survey
                </>
              )}
            </Button>
            <Button variant="outline" size="sm" onClick={() => toast.success('Session saved')}>
              <Save className="w-4 h-4" />
              Save
            </Button>
            <Button variant="outline" size="sm" onClick={() => handleExport('bibtex')}>
              <Download className="w-4 h-4" />
              Export
            </Button>
          </div>
        </div>
      </header>

      {/* Main workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`
            border-r bg-card flex-shrink-0 transition-all duration-300 overflow-hidden
            ${sidebarOpen ? 'w-56' : 'w-14'}
          `}
        >
          <div className="p-2 border-b flex items-center justify-between">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
            </Button>
            {sidebarOpen && <span className="text-sm font-medium">Tools</span>}
          </div>

          <nav className="p-2 space-y-1">
            <SidebarItem
              icon={Quote}
              label="Citations"
              count={citations.length}
              expanded={sidebarOpen}
              active
            />
            <SidebarItem
              icon={Highlighter}
              label="Highlighter"
              expanded={sidebarOpen}
              active={highlighterActive}
              onClick={() => setHighlighterActive(!highlighterActive)}
            />
            <SidebarItem
              icon={FileText}
              label="Notes"
              count={notes.length}
              expanded={sidebarOpen}
            />
            <SidebarItem
              icon={MessageSquare}
              label="AI Assistant"
              expanded={sidebarOpen}
            />
          </nav>
        </aside>

        {/* Left pane - Sources */}
        <div className="w-64 border-r bg-surface-sunken flex flex-col flex-shrink-0">
          <div className="p-3 border-b">
            <h2 className="font-semibold text-sm">Sources</h2>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2">
            {project.sources.map((source) => (
              <SourceCard
                key={source.sourceId}
                source={source}
                isActive={activeSourceId === source.sourceId}
                onClick={() => setActiveSourceId(source.sourceId)}
                onCaptureCitation={() => handleCaptureCitation(source)}
                onRemove={() => handleRemoveSource(source.sourceId)}
                showOverlay={citationOverlay.visible && citationOverlay.sourceId === source.sourceId}
                overlayStatus={citationOverlay.status}
              />
            ))}
          </div>
        </div>

        {/* Center pane - Reader */}
        <div className="flex-1 flex flex-col bg-background min-w-0">
          {surveyContent ? (
            <div className="flex-1 overflow-y-auto p-6">
              <div className="max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="font-display text-xl font-bold">Generated Literature Survey</h2>
                  <Button variant="outline" size="sm" onClick={() => setSurveyContent(null)}>
                    <X className="w-4 h-4" />
                    Close
                  </Button>
                </div>
                <div 
                  className="prose prose-sm max-w-none bg-card p-6 rounded-xl border shadow-card"
                  dangerouslySetInnerHTML={{ __html: surveyContent }}
                />
              </div>
            </div>
          ) : activeSource ? (
            <ReaderPane
              source={activeSource}
              highlighterActive={highlighterActive}
              onCreateNote={handleCreateNote}
            />
          ) : (
            <div className="flex-1 flex items-center justify-center text-muted-foreground">
              <p>Select a source to view</p>
            </div>
          )}
        </div>

        {/* Right pane - Tools panel */}
        <div className="w-80 border-l bg-card flex flex-col flex-shrink-0">
          {/* Tabs */}
          <div className="border-b flex">
            <button className="flex-1 px-4 py-3 text-sm font-medium border-b-2 border-primary text-primary">
              Citations
            </button>
            <button className="flex-1 px-4 py-3 text-sm font-medium text-muted-foreground hover:text-foreground">
              AI Chat
            </button>
          </div>

          {/* Citations list */}
          <div className="flex-1 overflow-y-auto p-3 space-y-3">
            {citations.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground text-sm">
                <Quote className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No citations yet</p>
                <p className="text-xs mt-1">Click "Capture" on a source to add citations</p>
              </div>
            ) : (
              citations.map((citation) => (
                <CitationCard key={citation.id} citation={citation} />
              ))
            )}
          </div>

          {/* AI Chat input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                placeholder="Ask AI about your sources..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                className="flex-1"
              />
              <Button size="icon" onClick={handleSendChat}>
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Sub-components

function SidebarItem({ 
  icon: Icon, 
  label, 
  count, 
  expanded, 
  active, 
  onClick 
}: { 
  icon: React.ElementType;
  label: string;
  count?: number;
  expanded: boolean;
  active?: boolean;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors
        ${active ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}
      `}
    >
      <Icon className="w-4 h-4 flex-shrink-0" />
      {expanded && (
        <>
          <span className="text-sm font-medium flex-1 text-left">{label}</span>
          {count !== undefined && (
            <span className="text-xs bg-muted px-1.5 py-0.5 rounded">{count}</span>
          )}
        </>
      )}
    </button>
  );
}

function SourceCard({
  source,
  isActive,
  onClick,
  onCaptureCitation,
  onRemove,
  showOverlay,
  overlayStatus,
}: {
  source: Source;
  isActive: boolean;
  onClick: () => void;
  onCaptureCitation: () => void;
  onRemove: () => void;
  showOverlay: boolean;
  overlayStatus: 'loading' | 'success' | null;
}) {
  return (
    <div
      className={`
        relative p-3 rounded-xl border bg-card cursor-pointer transition-all
        ${isActive ? 'border-primary shadow-card ring-1 ring-primary/20' : 'hover:border-primary/50'}
      `}
      onClick={onClick}
    >
      {/* Citation overlay */}
      {showOverlay && (
        <div className="absolute inset-0 bg-card/95 rounded-xl flex items-center justify-center z-10 animate-fade-in">
          {overlayStatus === 'loading' ? (
            <div className="text-center">
              <Loader2 className="w-6 h-6 animate-spin mx-auto text-primary mb-2" />
              <p className="text-sm font-medium">Generating APA Citation...</p>
            </div>
          ) : (
            <div className="text-center text-success">
              <CheckCircle2 className="w-6 h-6 mx-auto mb-2" />
              <p className="text-sm font-medium">Citation saved!</p>
              <p className="text-xs text-muted-foreground">See Sidebar →</p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${source.type === 'web' ? 'bg-primary/10' : 'bg-destructive/10'}`}>
          {source.type === 'web' ? (
            <Globe className="w-4 h-4 text-primary" />
          ) : (
            <FileIcon className="w-4 h-4 text-destructive" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm truncate">{source.title}</h3>
          <p className="text-xs text-muted-foreground truncate">{source.preview}</p>
        </div>
      </div>

      <div className="flex items-center gap-1 mt-2 pt-2 border-t">
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={(e) => {
            e.stopPropagation();
            window.open(source.url, '_blank');
          }}
        >
          <ExternalLink className="w-3 h-3" />
          Open
        </Button>
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs flex-1"
          onClick={(e) => {
            e.stopPropagation();
            onCaptureCitation();
          }}
        >
          <Quote className="w-3 h-3" />
          Capture
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
        >
          <Trash2 className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}

function ReaderPane({
  source,
  highlighterActive,
  onCreateNote,
}: {
  source: Source;
  highlighterActive: boolean;
  onCreateNote: (text: string) => void;
}) {
  const [selectedText, setSelectedText] = useState('');

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (selection && selection.toString().trim()) {
      setSelectedText(selection.toString().trim());
    }
  };

  return (
    <div className="flex-1 flex flex-col" onMouseUp={handleMouseUp}>
      {/* Reader toolbar */}
      <div className="border-b px-4 py-2 flex items-center justify-between bg-card">
        <div className="flex items-center gap-2">
          {source.type === 'web' ? (
            <Globe className="w-4 h-4 text-primary" />
          ) : (
            <FileIcon className="w-4 h-4 text-destructive" />
          )}
          <span className="text-sm font-medium truncate max-w-md">{source.title}</span>
        </div>
        {highlighterActive && (
          <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
            Highlighter active
          </span>
        )}
      </div>

      {/* Content area */}
      <div className="flex-1 relative">
        {source.type === 'web' ? (
          <iframe
            src={source.url}
            className="w-full h-full border-0"
            title={source.title}
            sandbox="allow-same-origin allow-scripts"
          />
        ) : (
          <div className="flex items-center justify-center h-full bg-muted/30">
            <div className="text-center">
              <FileIcon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
              <p className="font-medium">{source.title}</p>
              <p className="text-sm text-muted-foreground mt-1">PDF viewer would render here</p>
              <p className="text-xs text-muted-foreground mt-4">
                (PDF.js integration placeholder - loads on-demand)
              </p>
            </div>
          </div>
        )}

        {/* Selection popup */}
        {selectedText && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-card border shadow-elevated rounded-lg p-2 flex gap-2 animate-scale-in">
            <Button size="sm" onClick={() => {
              onCreateNote(selectedText);
              setSelectedText('');
            }}>
              <FileText className="w-4 h-4" />
              Create Note
            </Button>
            <Button variant="outline" size="sm" onClick={() => setSelectedText('')}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function CitationCard({ citation }: { citation: Citation }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(citation.apa);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="p-3 rounded-xl border bg-surface-elevated animate-slide-in-right">
      <h4 className="font-medium text-sm mb-1 line-clamp-2">{citation.title}</h4>
      <p className="text-xs text-muted-foreground mb-2">
        {citation.authors.join(', ')} ({citation.year})
      </p>
      <p className="text-xs text-muted-foreground line-clamp-3 mb-2 italic">
        {citation.apa}
      </p>
      <Button
        variant="outline"
        size="sm"
        className="w-full h-7 text-xs"
        onClick={handleCopy}
      >
        {copied ? (
          <>
            <CheckCircle2 className="w-3 h-3" />
            Copied!
          </>
        ) : (
          'Copy APA'
        )}
      </Button>
    </div>
  );
}
