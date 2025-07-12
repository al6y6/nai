class APIManager {
  constructor() {
    this.settings = this.loadSettings();
    this.isConnected = false;
    this.currentVendor = this.settings.defaultVendor;
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem('videoPromptSettings');
      return saved ? JSON.parse(saved) : {
        defaultVendor: 'trickle',
        apiKeys: {
          openai: '',
          anthropic: '',
          google: '',
          custom: '',
          trickle: 'built-in'
        },
        preferences: { autoSave: true, darkMode: true, notifications: true }
      };
    } catch {
      return { 
        defaultVendor: 'trickle', 
        apiKeys: {
          openai: '',
          anthropic: '',
          google: '',
          custom: '',
          trickle: 'built-in'
        }, 
        preferences: { autoSave: true, darkMode: true, notifications: true } 
      };
    }
  }

  saveSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    localStorage.setItem('videoPromptSettings', JSON.stringify(this.settings));
  }

  async testConnection(vendor = null) {
    const testVendor = vendor || this.currentVendor;
    try {
      if (testVendor === 'trickle') {
        // Test built-in Trickle AI
        const testResponse = await invokeAIAgent(
          'You are a test AI. Respond with "Connection successful"',
          'Test connection'
        );
        this.isConnected = testResponse.includes('successful') || testResponse.length > 0;
        return { success: true, message: 'Trickle AI connected successfully' };
      } else if (testVendor === 'google') {
        // Test Google Gemini API
        const apiKey = this.settings.apiKeys.google;
        if (!apiKey || apiKey.trim() === '') {
          return { success: false, message: 'Google Gemini API key required' };
        }
        const result = await this.testGoogleGemini(apiKey);
        return result;
      } else if (testVendor === 'openai') {
        // Test OpenAI API
        const apiKey = this.settings.apiKeys.openai;
        if (!apiKey || apiKey.trim() === '') {
          return { success: false, message: 'OpenAI API key required' };
        }
        const result = await this.testOpenAI(apiKey);
        return result;
      } else {
        // Other external APIs
        return { success: false, message: `${testVendor} API not implemented yet` };
      }
    } catch (error) {
      this.isConnected = false;
      return { success: false, message: error.message };
    }
  }

  async generatePrompt(systemPrompt, userPrompt, options = {}) {
    try {
      if (this.currentVendor === 'trickle') {
        // Use the built-in Trickle AI agent
        const response = await invokeAIAgent(systemPrompt, userPrompt);
        
        // Validate response
        if (!response || response.trim().length === 0) {
          throw new Error('Empty response from AI');
        }
        
        this.isConnected = true;
        return response;
      } else if (this.currentVendor === 'google') {
        // Use Google Gemini API
        const response = await this.callGoogleGemini(systemPrompt, userPrompt);
        this.isConnected = true;
        return response;
      } else if (this.currentVendor === 'openai') {
        // Use OpenAI API
        const response = await this.callOpenAI(systemPrompt, userPrompt);
        this.isConnected = true;
        return response;
      } else {
        throw new Error(`${this.currentVendor} API not implemented`);
      }
    } catch (error) {
      console.error('API Error:', error);
      this.isConnected = false;
      
      // Provide fallback response based on prompt type
      return this.getFallbackResponse(userPrompt, options);
    }
  }

  getFallbackResponse(userPrompt, options = {}) {
    const { topic, style = 'cinematic', duration = '30s', mood = 'energetic', quality = '4K' } = options;
    
    if (topic || userPrompt.includes('video')) {
      return `Professional ${style} video featuring ${topic || 'the specified subject'}. 
Duration: ${duration} with ${quality} quality resolution. 
${mood.charAt(0).toUpperCase() + mood.slice(1)} mood with professional camera work, 
dynamic lighting, and engaging composition. Modern video production techniques 
with attention to detail and visual storytelling. Smooth camera movements and 
professional grade cinematography.`;
    }
    
    return `High-quality video production with professional cinematography, 
dynamic camera work, and engaging visual storytelling. Modern techniques 
with attention to detail and creative composition.`;
  }

  getVendorInfo() {
    return {
      trickle: { name: 'Trickle AI (Built-in)', status: this.isConnected ? 'connected' : 'available', recommended: true },
      openai: { name: 'OpenAI GPT', status: 'available', external: true },
      anthropic: { name: 'Anthropic Claude', status: 'available', external: true },
      google: { name: 'Google Gemini', status: 'available', external: true },
      custom: { name: 'Custom API', status: 'configurable', external: true }
    };
  }

  async testGoogleGemini(apiKey) {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: 'Test connection. Respond with "Google Gemini connected successfully"'
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100
          }
        })
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorData}`);
      }

      const data = await response.json();
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        this.isConnected = true;
        return { success: true, message: 'Google Gemini connected successfully' };
      } else {
        throw new Error('Invalid response format from Gemini API');
      }
    } catch (error) {
      return { success: false, message: `Google Gemini connection failed: ${error.message}` };
    }
  }

  async callGoogleGemini(systemPrompt, userPrompt) {
    const apiKey = this.settings.apiKeys.google;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `${systemPrompt}\n\n${userPrompt}`
          }]
        }],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
          topP: 0.8,
          topK: 10
        }
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Google Gemini API error ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    
    if (data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) {
      return data.candidates[0].content.parts[0].text;
    } else {
      throw new Error('Invalid response format from Gemini API');
    }
  }

  async testOpenAI(apiKey) {
    try {
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-3.5-turbo',
          messages: [
            { role: 'user', content: 'Test connection. Respond with "OpenAI connected successfully"' }
          ],
          max_tokens: 50
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      this.isConnected = true;
      return { success: true, message: 'OpenAI connected successfully' };
    } catch (error) {
      return { success: false, message: `OpenAI connection failed: ${error.message}` };
    }
  }

  async callOpenAI(systemPrompt, userPrompt) {
    const apiKey = this.settings.apiKeys.openai;
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  getConnectionStatus() {
    return {
      isConnected: this.isConnected,
      currentVendor: this.currentVendor,
      vendorName: this.getVendorInfo()[this.currentVendor]?.name || 'Unknown'
    };
  }

  switchVendor(vendor) {
    this.currentVendor = vendor;
    this.settings.defaultVendor = vendor;
    this.saveSettings(this.settings);
    return this.testConnection(vendor);
  }
}

const apiManager = new APIManager();
