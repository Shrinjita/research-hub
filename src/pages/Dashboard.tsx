import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { 
  BookOpen, 
  ShoppingCart, 
  Target, 
  LogOut, 
  ChevronRight,
  Sparkles,
  FileText,
  Clock
} from 'lucide-react';

const modes = [
  {
    id: 'research',
    title: 'Research Mode',
    description: 'Capture citations, annotate PDFs, and generate literature surveys',
    icon: BookOpen,
    color: 'bg-primary',
    href: '/research-mode',
    features: ['Citation Capture', 'PDF Viewer', 'AI Assistant', 'BibTeX Export'],
    available: true,
  },
  {
    id: 'shopping',
    title: 'Shopping Mode',
    description: 'Compare products, track prices, and save deals',
    icon: ShoppingCart,
    color: 'bg-warning',
    href: '/shopping-mode',
    features: ['Price Tracking', 'Product Compare', 'Wishlist'],
    available: false,
  },
  {
    id: 'focus',
    title: 'Focus Mode',
    description: 'Block distractions and stay productive',
    icon: Target,
    color: 'bg-success',
    href: '/focus-mode',
    features: ['Site Blocker', 'Pomodoro Timer', 'Analytics'],
    available: false,
  },
];

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleModeClick = (mode: typeof modes[0]) => {
    if (mode.available) {
      navigate(mode.href);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xl font-display font-bold">Taskoscope</span>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={logout}>
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Welcome section */}
          <div className="mb-12 animate-fade-in">
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground mb-3">
              Welcome back, {user?.name?.split(' ')[0]}
            </h1>
            <p className="text-lg text-muted-foreground">
              Choose a mode to get started with your tasks.
            </p>
          </div>

          {/* Mode cards */}
          <div className="grid gap-6 md:grid-cols-3">
            {modes.map((mode, index) => (
              <button
                key={mode.id}
                onClick={() => handleModeClick(mode)}
                disabled={!mode.available}
                className={`
                  group relative p-6 rounded-2xl text-left transition-all duration-200
                  bg-card border shadow-card hover:shadow-elevated
                  ${mode.available ? 'hover:-translate-y-1 cursor-pointer' : 'opacity-60 cursor-not-allowed'}
                  animate-fade-in
                `}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Coming soon badge */}
                {!mode.available && (
                  <div className="absolute top-4 right-4 px-2 py-1 bg-muted rounded-full">
                    <span className="text-xs font-medium text-muted-foreground">Coming soon</span>
                  </div>
                )}

                {/* Icon */}
                <div className={`w-12 h-12 rounded-xl ${mode.color} flex items-center justify-center mb-4`}>
                  <mode.icon className="w-6 h-6 text-primary-foreground" />
                </div>

                {/* Content */}
                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {mode.title}
                </h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">
                  {mode.description}
                </p>

                {/* Features */}
                <div className="flex flex-wrap gap-2 mb-4">
                  {mode.features.slice(0, 3).map((feature) => (
                    <span
                      key={feature}
                      className="px-2 py-1 bg-muted rounded-md text-xs text-muted-foreground"
                    >
                      {feature}
                    </span>
                  ))}
                </div>

                {/* Arrow */}
                {mode.available && (
                  <div className="flex items-center text-primary text-sm font-medium">
                    Get started
                    <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                  </div>
                )}
              </button>
            ))}
          </div>

          {/* Quick stats */}
          <div className="mt-12 grid gap-4 sm:grid-cols-3 animate-fade-in" style={{ animationDelay: '300ms' }}>
            <div className="p-4 rounded-xl bg-card border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Projects</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0</p>
                <p className="text-sm text-muted-foreground">Citations</p>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-card border flex items-center gap-4">
              <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">0h</p>
                <p className="text-sm text-muted-foreground">Time saved</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
