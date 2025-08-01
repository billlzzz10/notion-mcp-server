import { Image, Grid3X3, Smile } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { useLanguage } from "@/contexts/LanguageContext";
import type { GenerationType } from "@/pages/home";

interface TypeSelectorProps {
  selectedType: GenerationType;
  onTypeSelect: (type: GenerationType) => void;
}

export function TypeSelector({ selectedType, onTypeSelect }: TypeSelectorProps) {
  const { t } = useLanguage();
  
  const types = [
    {
      type: 'sticker' as const,
      icon: Image,
      title: t('types.stickers'),
      description: t('types.stickerDesc'),
      bgColor: 'bg-coral',
    },
    {
      type: 'icon' as const,
      icon: Grid3X3,
      title: t('types.icons'),
      description: t('types.iconDesc'),
      bgColor: 'bg-turquoise',
    },
    {
      type: 'emoji' as const,
      icon: Smile,
      title: t('types.emojis'),
      description: t('types.emojiDesc'),
      bgColor: 'bg-sky-blue',
    },
  ];

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-dark font-['Poppins']">{t('selectType')}</h2>
        <div className="space-y-3">
          {types.map(({ type, icon: Icon, title, description, bgColor }) => (
            <div
              key={type}
              className={`p-4 rounded-lg cursor-pointer transition-all border-2 ${
                selectedType === type
                  ? 'bg-coral bg-opacity-10 border-coral'
                  : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
              }`}
              onClick={() => onTypeSelect(type)}
            >
              <div className="flex items-center space-x-3">
                <div className={`w-10 h-10 ${bgColor} rounded-lg flex items-center justify-center`}>
                  <Icon className="text-white" size={20} />
                </div>
                <div>
                  <h3 className="font-medium text-dark">{title}</h3>
                  <p className="text-sm text-gray-600">{description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
