import React from 'react';
import { FileText, Home, Settings } from 'lucide-react';
import { ActiveTab } from '../types';

interface NavigationProps {
  activeTab: ActiveTab;
  onTabChange: (tab: ActiveTab) => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  onTabChange,
}) => {
  const tabs = [
    { id: 'laporan' as ActiveTab, label: 'Laporan', icon: FileText },
    { id: 'beranda' as ActiveTab, label: 'Beranda', icon: Home },
    { id: 'setelan' as ActiveTab, label: 'Setelan', icon: Settings },
  ];

  return (
    <nav className="flex items-center justify-around px-3 pt-3 pb-2 text-white">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;

        return (
          <button
            key={tab.id}
            id={`nav-tab-${tab.id}`}
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
              isActive
                ? 'bg-white/25 text-white shadow-sm backdrop-blur-md'
                : 'text-white/80 hover:text-white hover:bg-white/10'
            }`}
          >
            <Icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
