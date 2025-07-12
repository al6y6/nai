class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Something went wrong</h1>
            <p className="text-gray-600 mb-4">We're sorry, but something unexpected happened.</p>
            <button
              onClick={() => window.location.reload()}
              className="btn btn-black"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

function App() {
  try {
    const [generatedPrompt, setGeneratedPrompt] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [activeTab, setActiveTab] = React.useState('generator');
    const [currentFormData, setCurrentFormData] = React.useState({});

    const handleGeneratePrompt = async (formData) => {
      setIsLoading(true);
      setCurrentFormData(formData);
      try {
        const prompt = await generateVideoPrompt(formData);
        setGeneratedPrompt(prompt);
        // Auto-navigate to result page
        setActiveTab('result');
      } catch (error) {
        alert(error.message);
      } finally {
        setIsLoading(false);
      }
    };

    const handleSelectPrompt = (prompt) => {
      setGeneratedPrompt(prompt);
      setActiveTab('result');
    };

    const handleSelectTemplate = (template) => {
      setGeneratedPrompt(template.Content);
      setCurrentFormData({
        topic: template.Title,
        style: template.Style,
        duration: template.Duration,
        quality: template.Quality
      });
      setActiveTab('generator');
    };

    const renderTabContent = () => {
      switch (activeTab) {
        case 'batch':
          return <BatchGenerator onSelectPrompt={handleSelectPrompt} />;
        case 'result':
          return (
            <div className="max-w-4xl mx-auto">
              <PromptDisplay 
                prompt={generatedPrompt}
                onCopy={() => {}}
                formData={currentFormData}
                onBack={() => setActiveTab('generator')}
              />
            </div>
          );
        case 'veo3':
          return <Veo3Generator onSelectPrompt={handleSelectPrompt} />;
        case 'image':
          return <ImagePromptGenerator onSelectPrompt={handleSelectPrompt} />;
        case 'templates':
          return <TemplatePresets onSelectTemplate={handleSelectTemplate} />;
        case 'enhancer':
          return <PromptEnhancer onSelectPrompt={handleSelectPrompt} />;
        case 'library':
          return <PromptLibrary onSelectPrompt={handleSelectPrompt} />;
        case 'favorites':
          return <FavoritesPanel onSelectPrompt={handleSelectPrompt} />;
        case 'history':
          return <HistoryPanel onSelectPrompt={handleSelectPrompt} />;
        case 'community':
          return <CommunityGallery onSelectPrompt={handleSelectPrompt} />;
        case 'export':
          return <ExportPanel prompt={generatedPrompt} formData={currentFormData} />;
        case 'preview':
          return <PreviewGenerator prompt={generatedPrompt} />;
        case 'workspace':
          return <TeamWorkspace onSelectPrompt={handleSelectPrompt} />;
        case 'analytics':
          return <AIAnalytics />;
        case 'marketplace':
          return <Marketplace onSelectTemplate={handleSelectTemplate} />;
        case 'settings':
          return <SettingsPanel />;
        default:
          return (
            <div className="max-w-4xl mx-auto">
              <PromptForm 
                onGenerate={handleGeneratePrompt}
                isLoading={isLoading}
              />
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen py-4 sm:py-8 lg:py-12 px-2 sm:px-4" data-name="app" data-file="app.js">
        <div className="max-w-7xl mx-auto">
          <Header />
          <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
          <div className="px-2 sm:px-0">
            {renderTabContent()}
          </div>
          {activeTab === 'generator' && <FeaturesSection />}
          <footer className="text-center mt-8 sm:mt-16 px-4">
            <p className="text-white/60 text-sm sm:text-base">
              © 2025 Video Prompt Generator - Powered by AI Technology
            </p>
          </footer>
        </div>
      </div>
    );
  } catch (error) {
    console.error('App component error:', error);
    return null;
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ErrorBoundary>
    <App />
  </ErrorBoundary>
);