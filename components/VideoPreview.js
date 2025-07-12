function VideoPreview({ prompt }) {
  try {
    const [isGenerating, setIsGenerating] = React.useState(false);
    const [videoUrl, setVideoUrl] = React.useState('');
    const [platform, setPlatform] = React.useState('veo3');
    const [error, setError] = React.useState('');

    const platforms = [
      { id: 'veo3', name: 'Google Veo 3', status: 'available' },
      { id: 'sora', name: 'OpenAI Sora', status: 'coming-soon' },
      { id: 'runway', name: 'Runway ML', status: 'available' },
      { id: 'pika', name: 'Pika Labs', status: 'available' }
    ];

    const generateVideo = async () => {
      if (!prompt) {
        setError('No prompt available for video generation');
        return;
      }

      setIsGenerating(true);
      setError('');
      
      try {
        // Simulate video generation process
        await new Promise((resolve, reject) => {
          setTimeout(() => {
            // Simulate occasional network errors
            if (Math.random() > 0.8) {
              reject(new Error('Network timeout'));
            } else {
              resolve();
            }
          }, 3000);
        });
        
        // Mock video URL - in real app would be actual generated video
        const videoId = Date.now();
        setVideoUrl(`https://example.com/generated-video-${videoId}.mp4`);
        
        alert(`Video generated successfully with ${platforms.find(p => p.id === platform)?.name}!`);
      } catch (error) {
        console.error('Video generation error:', error);
        setError(`Failed to generate video with ${platforms.find(p => p.id === platform)?.name}. Please try again or select a different platform.`);
      } finally {
        setIsGenerating(false);
      }
    };

    return (
      <div className="bg-gradient-to-r from-purple-900/30 to-blue-900/30 rounded-xl p-4 border border-purple-500/20 mb-6" data-name="video-preview" data-file="components/VideoPreview.js">
        <h3 className="text-white font-semibold mb-4 flex items-center">
          <div className="icon-play text-lg mr-2"></div>
          Generate Video Preview
        </h3>

        <div className="space-y-4">
          <div>
            <label className="block text-white/90 font-medium mb-2">Select Platform</label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {platforms.map(p => (
                <button
                  key={p.id}
                  onClick={() => setPlatform(p.id)}
                  disabled={p.status === 'coming-soon'}
                  className={`p-2 rounded-lg border transition-all duration-200 text-sm ${
                    platform === p.id
                      ? 'bg-indigo-600 border-indigo-500 text-white'
                      : p.status === 'coming-soon'
                      ? 'bg-gray-600 border-gray-500 text-gray-400 cursor-not-allowed'
                      : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                  }`}
                >
                  {p.name}
                  {p.status === 'coming-soon' && (
                    <div className="text-xs text-gray-400">Coming Soon</div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3">
              <p className="text-red-200 text-sm">{error}</p>
            </div>
          )}

          <button
            onClick={generateVideo}
            disabled={isGenerating || !prompt}
            className="btn-primary w-full disabled:opacity-50"
          >
            {isGenerating ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent mr-2"></div>
                Generating Video...
              </span>
            ) : (
              <span className="flex items-center justify-center">
                <div className="icon-video text-xl mr-2"></div>
                Generate Video with {platforms.find(p => p.id === platform)?.name}
              </span>
            )}
          </button>

          {videoUrl && (
            <div className="bg-white/5 rounded-lg p-4 border border-white/10">
              <h4 className="text-white font-medium mb-2">Generated Video</h4>
              <div className="bg-gray-800 rounded-lg p-8 text-center">
                <div className="icon-play text-4xl text-white/50 mb-2"></div>
                <p className="text-white/70">Video preview would appear here</p>
                <p className="text-white/50 text-sm mt-2">URL: {videoUrl}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  } catch (error) {
    console.error('VideoPreview component error:', error);
    return null;
  }
}