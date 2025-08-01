import { useState } from "react";
import { RefreshCw, Download, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { GenerationState } from "@/pages/home";
import type { Generation } from "@shared/schema";

interface ResultsDisplayProps {
  generationState: GenerationState;
}

export function ResultsDisplay({ generationState }: ResultsDisplayProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentGeneration, setCurrentGeneration] = useState<Generation | null>(null);
  const { toast } = useToast();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const generateMutation = useMutation({
    mutationFn: async (state: GenerationState) => {
      const response = await apiRequest("POST", "/api/generate", {
        userId: null,
        type: state.type,
        description: state.description,
        colors: [...state.colors, ...(state.secondaryColors || [])],
        style: state.style,
        aiProvider: state.aiProvider || 'openai',
      });
      return response.json() as Promise<Generation>;
    },
    onSuccess: (data) => {
      setCurrentGeneration(data);
      queryClient.invalidateQueries({ queryKey: ["/api/generations/recent"] });
      queryClient.invalidateQueries({ queryKey: ["/api/usage"] });
      toast({
        title: t('success.generationComplete'),
        description: `${t('success.generationCompleteDesc')} ${data.imageUrls.length} ${data.type}s`,
      });
    },
    onError: (error) => {
      toast({
        title: t('errors.generationFailed'),
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      });
    },
    onSettled: () => {
      setIsGenerating(false);
    },
  });

  const handleGenerate = async () => {
    if (!generationState.description.trim()) {
      toast({
        title: t('errors.descriptionRequired'),
        description: t('errors.descriptionRequiredDesc'),
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    generateMutation.mutate(generationState);
  };

  const handleDownload = async (imageUrl: string, index: number) => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${generationState.type}-${index + 1}.png`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: t('errors.downloadFailed'),
        description: t('errors.downloadFailedDesc'),
        variant: "destructive",
      });
    }
  };

  const handleDownloadAll = async () => {
    if (!currentGeneration?.imageUrls) return;
    
    for (let i = 0; i < currentGeneration.imageUrls.length; i++) {
      await handleDownload(currentGeneration.imageUrls[i], i);
      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 500));
    }
  };

  const getTitle = () => {
    return t(`generatedResults.${generationState.type}s`);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-lg font-semibold text-dark font-['Poppins']">{getTitle()}</h2>
          <div className="flex items-center space-x-3">
            {currentGeneration && (
              <>
                <Button variant="ghost" size="sm" onClick={() => setCurrentGeneration(null)}>
                  <RefreshCw size={16} />
                </Button>
                <Button 
                  onClick={handleDownloadAll}
                  className="bg-mint-green hover:bg-mint-green/90 text-white"
                  size="sm"
                >
                  <Download size={16} className="mr-2" />
                  {t('actions.downloadAll')}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-16 h-16 border-4 border-coral border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-dark font-medium">{t('states.generating')}</p>
            <p className="text-gray-600 text-sm">{t('states.generatingDesc')}</p>
          </div>
        )}

        {/* Results Grid */}
        {currentGeneration && !isGenerating && (
          <div className={`grid gap-4 ${
            generationState.type === 'sticker' 
              ? 'grid-cols-2 md:grid-cols-2' 
              : 'grid-cols-2 md:grid-cols-4 lg:grid-cols-5'
          }`}>
            {currentGeneration.imageUrls.map((imageUrl, index) => (
              <div
                key={index}
                className="group relative bg-gray-50 rounded-xl p-4 hover:shadow-lg transition-all cursor-pointer"
              >
                <img
                  src={imageUrl}
                  alt={`Generated ${generationState.type} ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <Button
                    size="sm"
                    className="bg-white text-coral hover:bg-gray-50 rounded-full p-2 shadow-md"
                    onClick={() => handleDownload(imageUrl, index)}
                  >
                    <Download size={12} />
                  </Button>
                </div>
                <div className="text-center">
                  <p className="text-xs text-gray-600">PNG • 1024x1024</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!currentGeneration && !isGenerating && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Sparkles className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-semibold text-dark mb-2 font-['Poppins']">{t('states.readyToCreate')}</h3>
            <p className="text-gray-600 mb-6">{t('states.readyDesc')}</p>
            <Button 
              onClick={handleGenerate}
              className="bg-gradient-to-r from-coral to-turquoise text-white hover:opacity-90"
              disabled={isGenerating}
            >
              <Sparkles className="mr-2" size={16} />
              {t('actions.startCreating')}
            </Button>
          </div>
        )}

        {/* Generate Button for when there are results */}
        {currentGeneration && !isGenerating && (
          <div className="mt-6 text-center">
            <Button 
              onClick={handleGenerate}
              className="bg-gradient-to-r from-coral to-turquoise text-white hover:opacity-90"
              disabled={isGenerating}
            >
              <Sparkles className="mr-2" size={16} />
              {t('actions.generateNew')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
