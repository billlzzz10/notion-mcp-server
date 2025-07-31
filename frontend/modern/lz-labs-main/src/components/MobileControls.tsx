import React from 'react';

interface MobileControlsProps {
  onMenuToggle: () => void;
}

const MobileControls: React.FC<MobileControlsProps> = ({ onMenuToggle }) => {
  return (
    <div className="md:hidden bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-4">
      <button
        onClick={onMenuToggle}
        className="p-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
        aria-label="Open menu"
      >
        ☰
      </button>
    </div>
  );
};

export default MobileControls;
