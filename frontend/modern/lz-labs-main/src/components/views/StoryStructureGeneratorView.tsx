
import React, { useState } from 'react';
import { PlotPoint, ViewName, PlotPointStatus } from '../../../types';
import { DEFAULT_PLOT_POINT_STATUS } from '../../../constants';
import Icon from '../Icon';

interface StoryStructureGeneratorViewProps {
  currentProjectId: string;
  addMultiplePlotPoints: (plotPointsToAdd: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>[]) => void;
  onNavigate: (view: ViewName) => void;
}

const StoryStructureGeneratorView: React.FC<StoryStructureGeneratorViewProps> = ({
  currentProjectId,
  addMultiplePlotPoints,
  onNavigate,
}) => {
  const [numEpisodes, setNumEpisodes] = useState(3);
  const [scenesPerEpisode, setScenesPerEpisode] = useState(5);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleGenerateStructure = () => {
    if (numEpisodes <= 0 || scenesPerEpisode <= 0) {
      alert('จำนวนตอนหลักและจำนวนฉากต่อตอนต้องมากกว่า 0');
      return;
    }

    setIsLoading(true);
    setSuccessMessage(null);

    const newPlotPoints: Omit<PlotPoint, 'id' | 'createdAt' | 'updatedAt' | 'projectId'>[] = [];
    let currentOrder = 0; // This will be handled by addMultiplePlotPoints logic

    for (let i = 1; i <= numEpisodes; i++) {
      for (let j = 1; j <= scenesPerEpisode; j++) {
        currentOrder++;
        newPlotPoints.push({
          title: `EP ${i}.${j}`,
          description: `รายละเอียดสำหรับ EP ${i}.${j}`,
          type: 'other', // Default type
          order: currentOrder, // This order is relative, App.tsx will re-calculate based on existing
          status: DEFAULT_PLOT_POINT_STATUS, // Add default status
          relatedNotes: [],
        });
      }
    }
    
    try {
        addMultiplePlotPoints(newPlotPoints);
        setSuccessMessage(`สร้างโครงสร้าง ${newPlotPoints.length} จุดสำเร็จ!`);
    } catch (error) {
        console.error("Error generating structure:", error);
        setSuccessMessage("เกิดข้อผิดพลาดในการสร้างโครงสร้าง");
    } finally {
        setIsLoading(false);
    }
  };

  const inputClass = "w-full p-3 bg-surface rounded-lg border border-border focus:ring-2 focus:ring-primary text-base";
  const labelClass = "block text-sm font-medium mb-1 text-text-secondary";

  return (
    <div className="space-y-6 text-text-primary animate-fade-in">
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center">
            <Icon name="magic-wand-sparkles" className="w-6 h-6 text-primary mr-3" /> เครื่องมือสร้างโครงสร้างเรื่อง
          </h1>
          <p className="text-text-secondary">กำหนดจำนวนตอนและฉากเพื่อสร้างโครงร่างเรื่องเบื้องต้น</p>
        </div>
      </header>

      <div className="bg-bg card p-6 md:p-8 max-w-lg mx-auto">
        <div className="space-y-4">
          <div>
            <label htmlFor="num-episodes" className={labelClass}>
              จำนวนตอนหลัก (Episodes/Acts):
            </label>
            <input
              type="number"
              id="num-episodes"
              value={numEpisodes}
              onChange={(e) => setNumEpisodes(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="50"
              className={inputClass}
            />
          </div>
          <div>
            <label htmlFor="scenes-per-episode" className={labelClass}>
              จำนวนฉากต่อตอนหลัก:
            </label>
            <input
              type="number"
              id="scenes-per-episode"
              value={scenesPerEpisode}
              onChange={(e) => setScenesPerEpisode(Math.max(1, parseInt(e.target.value) || 1))}
              min="1"
              max="30"
              className={inputClass}
            />
          </div>
          <button
            onClick={handleGenerateStructure}
            disabled={isLoading}
            className="px-6 py-2.5 bg-primary text-white rounded-md font-semibold hover:bg-primary-hover active:scale-95 transition-all duration-200 w-full text-base flex items-center justify-center"
          >
            {isLoading ? (
              <><Icon name="spinner" className="w-4 h-4 mr-2 animate-spin" /> กำลังสร้าง...</>
            ) : (
              <><Icon name="settings" className="w-4 h-4 mr-2" /> สร้างโครงสร้าง</>
            )}
          </button>
        </div>

        {successMessage && (
          <div className={`mt-6 p-4 rounded-md text-sm ${successMessage.includes('ผิดพลาด') ? 'bg-error-bg dark:bg-error-dark-bg text-error-dark dark:text-error' : 'bg-success-bg dark:bg-success-dark-bg text-success-dark dark:text-success'}`}>
            <p>{successMessage}</p>
            {!successMessage.includes('ผิดพลาด') && (
                 <button 
                    onClick={() => onNavigate(ViewName.LoreManager)}
                    className="mt-2 font-semibold hover:underline active:scale-95 active:brightness-95"
                >
                    ไปที่หน้า Lore Manager <Icon name="arrow-right" className="text-xs ml-1" />
                </button>
            )}
          </div>
        )}
      </div>
      
      <div className="bg-info-bg dark:bg-info-dark-bg border border-info dark:border-info-dark rounded-lg p-4 text-sm text-info-dark dark:text-info max-w-lg mx-auto">
        <div className="flex items-start">
          <Icon name="info-circle" className="w-5 h-5 mt-1 mr-3" />
          <div>
            <h4 className="font-medium text-info-dark dark:text-info mb-1">วิธีการทำงาน:</h4>
            <p>
              เครื่องมือนี้จะสร้าง "จุดในโครงเรื่อง (Plot Points)" ตามจำนวนตอนและฉากที่คุณกำหนดให้โดยอัตโนมัติ
              แต่ละจุดจะมีชื่อเป็น "EP [เลขตอน].[เลขฉาก]" และจะถูกเพิ่มเข้าไปในโปรเจกต์ปัจจุบันของคุณ
              คุณสามารถไปแก้ไขรายละเอียดเพิ่มเติมได้ที่หน้า "Lore Manager"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StoryStructureGeneratorView;
