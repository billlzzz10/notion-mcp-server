

import React from 'react';
import { AiPersonality } from '../../../types';
import { APP_ROADMAP_MARKDOWN } from '../../../constants';
import PlaceholderView from './PlaceholderView'; 
import { getSafeHtml } from '../../../utils';
import Icon from '../Icon';

const getSafeRoadmapHtml = (markdown: string): { __html: string } => {
  let html = getSafeHtml(markdown).__html;
  html = html.replace(/<h3>(.*?)<\/h3>/g, '<h3 class="text-lg font-bold font-heading text-primary mt-6 mb-3">$1</h3>');
  html = html.replace(/<ul>/g, '<ul class="list-disc list-inside space-y-1 text-sm">');
  html = html.replace(/<li><input type="checkbox" disabled(?: checked)?> (.*?)<\/li>/g, (match, itemText) => {
    const isChecked = match.includes('checked');
    return `<li class="flex items-center ${isChecked ? 'text-green-600 dark:text-green-500 line-through' : 'text-text-secondary'}"><span class="mr-2 text-lg">${isChecked ? '✅' : '⬜️'}</span><span>${itemText.trim()}</span></li>`;
  });
  return { __html: html };
};

interface SettingsViewProps {
  defaultAiPersonalityId: string;
  onSetDefaultAiPersonalityId: (id: string) => void;
  allAiPersonalities: AiPersonality[];
}

const SettingsView: React.FC<SettingsViewProps> = ({
  defaultAiPersonalityId,
  onSetDefaultAiPersonalityId,
  allAiPersonalities,
}) => {
  return (
    <div className="space-y-8 text-text-primary">
      <div>
        <h1 className="text-2xl font-bold font-heading mb-6 flex items-center">
            <Icon name="settings" className="w-6 h-6 text-primary mr-3" />Settings
        </h1>
      </div>

      {/* AI Settings */}
      <div className="bg-surface rounded-xl shadow-card p-6">
        <h2 className="text-xl font-semibold font-heading mb-1">AI Writer Settings</h2>
        <p className="text-sm text-text-secondary mb-4">เลือกบุคลิกภาพเริ่มต้นสำหรับ AI Writer ของคุณ</p>
        
        <div className="space-y-3">
            <label htmlFor="ai-personality-select" className="block text-sm font-medium text-text-secondary">
                Default AI Personality:
            </label>
            <select
                id="ai-personality-select"
                value={defaultAiPersonalityId}
                onChange={(e) => onSetDefaultAiPersonalityId(e.target.value)}
                className="w-full md:w-1/2 p-2.5 bg-bg-subtle border border-border rounded-md focus:ring-primary focus:border-primary"
            >
                {allAiPersonalities.map(personality => (
                <option key={personality.id} value={personality.id}>
                    {personality.name}
                </option>
                ))}
            </select>
            {allAiPersonalities.find(p => p.id === defaultAiPersonalityId) && (
                 <p className="text-xs text-text-secondary mt-1">
                    {allAiPersonalities.find(p => p.id === defaultAiPersonalityId)?.description}
                </p>
            )}
        </div>
         <div className="mt-6 p-4 bg-info-bg dark:bg-info-dark-bg border border-info dark:border-info-dark rounded-lg">
            <div className="flex items-start">
                <Icon name="info-circle" className="w-5 h-5 text-info dark:text-info-dark mt-1 mr-3" />
                <div>
                    <h4 className="font-medium text-info-dark dark:text-info">หมายเหตุ:</h4>
                    <p className="text-sm text-info-dark dark:text-info">
                        คุณสามารถเปลี่ยนบุคลิกภาพ AI ได้ตลอดเวลาระหว่างการใช้งานในหน้า AI Writer โดยตรง การตั้งค่านี้จะใช้เป็นค่าเริ่มต้นเมื่อคุณเปิด AI Writer ใหม่
                    </p>
                </div>
            </div>
        </div>
      </div>
      
      {/* Other Settings Placeholder */}
      <PlaceholderView 
        title="Other Settings" 
        iconClass="fas fa-ellipsis-h"
        message="ส่วนการจัดการบัญชี, การเชื่อมต่อ, และการแจ้งเตือน จะถูกเพิ่มเข้ามาในอนาคต"
      />

      {/* Roadmap Section */}
      <div className="bg-surface rounded-xl shadow-card p-6">
        <h2 className="text-xl font-semibold font-heading mb-4 flex items-center">
          <Icon name="road" className="w-5 h-5 text-primary mr-3" /> Roadmap
        </h2>
        <div 
            className="prose prose-sm dark:prose-invert max-w-none text-text-primary markdown-content"
            dangerouslySetInnerHTML={getSafeRoadmapHtml(APP_ROADMAP_MARKDOWN)}
        >
        </div>
      </div>

    </div>
  );
};

export default SettingsView;
