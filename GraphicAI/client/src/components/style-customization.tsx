import { Sparkles, Cpu } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GenerationState, StyleType } from "@/pages/home";

interface StyleCustomizationProps {
  generationState: GenerationState;
  onUpdate: (updates: Partial<GenerationState>) => void;
}

export function StyleCustomization({ generationState, onUpdate }: StyleCustomizationProps) {
  const { t } = useLanguage();
  const colorPalette = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', 
    '#8B5CF6', '#F59E0B', '#EC4899', '#6366F1',
    '#10B981', '#F97316', '#EF4444', '#1F2937'
  ];

  const secondaryColorPalette = [
    '#FF7F7F', '#7DD3FC', '#A78BFA', '#FCD34D',
    '#FB7185', '#34D399', '#FBBF24', '#60A5FA',
    '#F472B6', '#A3A3A3', '#6B7280', '#374151'
  ];

  const styles: { value: StyleType; label: string }[] = [
    { value: 'cartoon', label: t('styles.cartoon') },
    { value: 'realistic', label: t('styles.realistic') },
    { value: 'minimalist', label: t('styles.minimalist') },
    { value: 'retro', label: t('styles.retro') },
  ];

  const toggleColor = (color: string) => {
    const currentColors = generationState.colors;
    if (currentColors.includes(color)) {
      onUpdate({ colors: currentColors.filter(c => c !== color) });
    } else {
      onUpdate({ colors: [...currentColors, color] });
    }
  };

  const toggleSecondaryColor = (color: string) => {
    const currentColors = generationState.secondaryColors || [];
    if (currentColors.includes(color)) {
      onUpdate({ secondaryColors: currentColors.filter(c => c !== color) });
    } else {
      onUpdate({ secondaryColors: [...currentColors, color] });
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-dark font-['Poppins']">{t('customizeStyle')}</h2>
        
        {/* Description Input */}
        <div className="mb-6">
          <Label htmlFor="description" className="text-sm font-medium text-dark mb-2 block">
            {t('description')}
          </Label>
          <Textarea
            id="description"
            rows={3}
            placeholder={t('descriptionPlaceholder')}
            value={generationState.description}
            onChange={(e) => onUpdate({ description: e.target.value })}
            className="resize-none"
          />
        </div>

        {/* Primary Colors */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-dark mb-3 block">{t('primaryColors')}</Label>
          <div className="grid grid-cols-6 gap-2 mb-3">
            {colorPalette.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  generationState.colors.includes(color)
                    ? 'border-coral scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => toggleColor(color)}
              />
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="color"
              className="w-8 h-8 rounded border-none cursor-pointer"
              onChange={(e) => toggleColor(e.target.value)}
            />
            <span className="text-sm text-gray-600">{t('customColor')}</span>
          </div>
        </div>

        {/* Secondary Colors */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-dark mb-3 block">{t('colors.secondary')}</Label>
          <div className="grid grid-cols-6 gap-2 mb-3">
            {secondaryColorPalette.map((color) => (
              <button
                key={color}
                className={`w-8 h-8 rounded-full border-2 transition-all ${
                  generationState.secondaryColors?.includes(color)
                    ? 'border-turquoise scale-110'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
                style={{ backgroundColor: color }}
                onClick={() => toggleSecondaryColor(color)}
              />
            ))}
          </div>
        </div>

        {/* Style Options */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-dark mb-3 block">{t('artStyle')}</Label>
          <div className="grid grid-cols-2 gap-2">
            {styles.map(({ value, label }) => (
              <Button
                key={value}
                variant={generationState.style === value ? "default" : "outline"}
                size="sm"
                onClick={() => onUpdate({ style: value })}
                className={generationState.style === value ? "bg-coral border-coral text-white" : ""}
              >
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* AI Provider Selection */}
        <div className="mb-6">
          <Label className="text-sm font-medium text-dark mb-3 block flex items-center space-x-2">
            <Cpu size={16} />
            <span>{t('aiProvider.title')}</span>
          </Label>
          <Select
            value={generationState.aiProvider || 'openai'}
            onValueChange={(value: 'openai' | 'gemini') => onUpdate({ aiProvider: value })}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('aiProvider.description')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="openai">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>{t('aiProvider.openai')}</span>
                </div>
              </SelectItem>
              <SelectItem value="gemini">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>{t('aiProvider.gemini')}</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-500 mt-1">{t('aiProvider.description')}</p>
        </div>
      </CardContent>
    </Card>
  );
}
