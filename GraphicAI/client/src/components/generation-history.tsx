import { Card, CardContent } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { useLanguage } from "@/contexts/LanguageContext";
import type { Generation } from "@shared/schema";

export function GenerationHistory() {
  const { t } = useLanguage();
  const { data: recentGenerations, isLoading } = useQuery<Generation[]>({
    queryKey: ["/api/generations/recent"],
  });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4 text-dark font-['Poppins']">{t('history.title')}</h2>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center space-x-3 p-2">
                <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-6">
        <h2 className="text-lg font-semibold mb-4 text-dark font-['Poppins']">{t('history.title')}</h2>
        <div className="space-y-3">
          {recentGenerations && recentGenerations.length > 0 ? (
            recentGenerations.map((generation) => (
              <div
                key={generation.id}
                className="flex items-center space-x-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-coral to-turquoise rounded-lg flex items-center justify-center">
                  {generation.imageUrls[0] ? (
                    <img 
                      src={generation.imageUrls[0]} 
                      alt="Generation preview"
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-coral to-turquoise rounded-lg"></div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-dark truncate">
                    {generation.description}
                  </p>
                  <p className="text-xs text-gray-600">
                    {formatDistanceToNow(new Date(generation.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-gray-600">{t('history.noRecent')}</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
