import { Sparkles, Crown, HelpCircle, Globe } from "lucide-react";
import { TypeSelector } from "@/components/type-selector";
import { StyleCustomization } from "@/components/style-customization";
import { ResultsDisplay } from "@/components/results-display";
import { UsageStats } from "@/components/usage-stats";
import { GenerationHistory } from "@/components/generation-history";
import { useLanguage } from "@/contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export type GenerationType = 'sticker' | 'icon' | 'emoji';
export type StyleType = 'cartoon' | 'realistic' | 'minimalist' | 'retro';

export interface GenerationState {
  type: GenerationType;
  description: string;
  colors: string[];
  secondaryColors: string[];
  style: StyleType;
  aiProvider: 'openai' | 'gemini';
}

export default function Home() {
  const { language, setLanguage, t } = useLanguage();
  const [generationState, setGenerationState] = useState<GenerationState>({
    type: 'sticker',
    description: '',
    colors: ['#FF6B6B'],
    secondaryColors: [],
    style: 'cartoon',
    aiProvider: 'openai',
  });

  const updateGenerationState = (updates: Partial<GenerationState>) => {
    setGenerationState(prev => ({ ...prev, ...updates }));
  };

  return (
    <div className="min-h-screen bg-light">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-coral to-turquoise rounded-lg flex items-center justify-center">
                <Sparkles className="text-white text-sm" size={16} />
              </div>
              <h1 className="text-xl font-bold text-dark font-['Poppins']">{t('title')}</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setLanguage(language === 'en' ? 'th' : 'en')}
                className="text-gray-600 hover:text-dark transition-colors"
              >
                <Globe size={16} className="mr-2" />
                {language === 'en' ? 'ไทย' : 'EN'}
              </Button>
              <button className="text-gray-600 hover:text-dark transition-colors">
                <HelpCircle size={20} />
              </button>
              <button className="bg-coral text-white px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity flex items-center space-x-2">
                <Crown size={16} />
                <span>{t('actions.upgrade')}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Left Panel - Controls */}
          <div className="lg:col-span-1 space-y-6">
            <TypeSelector 
              selectedType={generationState.type}
              onTypeSelect={(type) => updateGenerationState({ type })}
            />
            
            <StyleCustomization
              generationState={generationState}
              onUpdate={updateGenerationState}
            />
            
            <GenerationHistory />
          </div>

          {/* Right Panel - Results */}
          <div className="lg:col-span-2 space-y-6">
            <ResultsDisplay 
              generationState={generationState}
            />
            
            <UsageStats />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-coral to-turquoise rounded-lg flex items-center justify-center">
                  <Sparkles className="text-white text-sm" size={16} />
                </div>
                <h3 className="font-bold text-dark font-['Poppins']">AI Graphics Generator</h3>
              </div>
              <p className="text-gray-600 text-sm">Create stunning custom stickers, icons, and emojis with the power of AI. Perfect for designers, marketers, and creative professionals.</p>
            </div>
            <div>
              <h4 className="font-semibold text-dark mb-3">Features</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>AI-Powered Generation</li>
                <li>Custom Color Schemes</li>
                <li>Multiple Art Styles</li>
                <li>High-Quality Downloads</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-dark mb-3">Support</h4>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>Help Center</li>
                <li>API Documentation</li>
                <li>Contact Support</li>
                <li>Feature Requests</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-6 text-center text-sm text-gray-600">
            <p>&copy; 2024 AI Graphics Generator. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
