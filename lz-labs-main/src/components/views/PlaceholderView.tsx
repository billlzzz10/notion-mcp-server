

import React from 'react';
import Icon from '../Icon';

interface PlaceholderViewProps {
  title: string;
  iconClass: string; // Kept for simplicity, maps to icon name
  message?: string;
  children?: React.ReactNode;
}

const PlaceholderView: React.FC<PlaceholderViewProps> = ({ title, iconClass, message, children }) => {
  return (
    <div className="text-center py-16 md:py-20 text-text-primary bg-surface rounded-xl shadow-sm border border-border">
      <Icon name={iconClass.replace(/fas fa-/g, '')} className="text-5xl md:text-6xl text-text-disabled mb-4" />
      <h2 className="text-xl md:text-2xl font-semibold text-text-primary mb-2">{title}</h2>
      <p className="text-text-secondary mb-6">{message || 'คุณสมบัตินี้กำลังพัฒนา หรือยังไม่มีเนื้อหาให้แสดงผล'}</p>
      {children && <div className="mt-4 max-w-md mx-auto">{children}</div>}
    </div>
  );
};

export default PlaceholderView;
