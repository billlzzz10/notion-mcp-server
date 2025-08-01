import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { useLanguage } from "@/contexts/LanguageContext";

interface UsageData {
  current: number;
  limit: number;
  month: number;
  year: number;
}

export function UsageStats() {
  const { t } = useLanguage();
  const { data: usage, isLoading } = useQuery<UsageData>({
    queryKey: ["/api/usage"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  const percentage = usage ? Math.round((usage.current / usage.limit) * 100) : 0;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-semibold text-dark font-['Poppins']">{t('usage.title')}</h3>
            <p className="text-sm text-gray-600">{t('usage.subtitle')}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-coral font-['Poppins']">
              {usage?.current || 0}
            </p>
            <p className="text-sm text-gray-600">
              {t('usage.of')} {usage?.limit || 100} {t('usage.generations')}
            </p>
          </div>
        </div>
        <div className="mt-4">
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-coral to-turquoise h-2 rounded-full transition-all duration-300"
              style={{ width: `${percentage}%` }}
            ></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
