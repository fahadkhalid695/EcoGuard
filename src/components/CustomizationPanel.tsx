import React, { useState, useEffect } from 'react';
import { X, Grid, Eye, EyeOff, ArrowUp, ArrowDown, RotateCcw, Save } from 'lucide-react';

interface CardLayout {
  id: string;
  visible: boolean;
  order: number;
}

interface CustomizationPanelProps {
  cardLayout: CardLayout[];
  setCardLayout: (layout: CardLayout[]) => void;
  onClose: () => void;
}

const CustomizationPanel: React.FC<CustomizationPanelProps> = ({
  cardLayout,
  setCardLayout,
  onClose
}) => {
  const [localLayout, setLocalLayout] = useState([...cardLayout]);
  const [scrollToTop, setScrollToTop] = useState(false);

  const cardNames = {
    stats: 'Quick Statistics',
    map: 'Environmental Map',
    alerts: 'Active Alerts',
    activity: 'Recent Activity',
    insights: 'Predictive Insights',
    performance: 'Performance Analytics'
  };

  useEffect(() => {
    // Scroll to top when panel opens
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setScrollToTop(true);
  }, []);

  const toggleVisibility = (id: string) => {
    setLocalLayout(prev => prev.map(card => 
      card.id === id ? { ...card, visible: !card.visible } : card
    ));
  };

  const moveCard = (id: string, direction: 'up' | 'down') => {
    setLocalLayout(prev => {
      const sortedCards = [...prev].sort((a, b) => a.order - b.order);
      const currentIndex = sortedCards.findIndex(card => card.id === id);
      
      if (direction === 'up' && currentIndex > 0) {
        const temp = sortedCards[currentIndex].order;
        sortedCards[currentIndex].order = sortedCards[currentIndex - 1].order;
        sortedCards[currentIndex - 1].order = temp;
      } else if (direction === 'down' && currentIndex < sortedCards.length - 1) {
        const temp = sortedCards[currentIndex].order;
        sortedCards[currentIndex].order = sortedCards[currentIndex + 1].order;
        sortedCards[currentIndex + 1].order = temp;
      }
      
      return sortedCards;
    });
  };

  const resetToDefault = () => {
    const defaultLayout = [
      { id: 'stats', visible: true, order: 1 },
      { id: 'map', visible: true, order: 2 },
      { id: 'alerts', visible: true, order: 3 },
      { id: 'activity', visible: true, order: 4 },
      { id: 'insights', visible: true, order: 5 },
      { id: 'performance', visible: true, order: 6 }
    ];
    setLocalLayout(defaultLayout);
  };

  const saveChanges = () => {
    setCardLayout(localLayout);
    onClose();
    // Scroll to top after saving changes
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const sortedCards = [...localLayout].sort((a, b) => a.order - b.order);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-start justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-hidden mt-20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-gray-700">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg">
              <Grid className="w-6 h-6 text-white" />
            </div>
            <h2 className="text-xl font-heading font-bold text-slate-900 dark:text-gray-100">
              Customize Dashboard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[60vh]">
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-6">
              <p className="text-slate-600 dark:text-gray-400">
                Customize your dashboard by showing/hiding cards and reordering them.
              </p>
              <button
                onClick={resetToDefault}
                className="flex items-center space-x-2 px-3 py-2 text-sm text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-gray-200 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-all duration-200"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reset</span>
              </button>
            </div>

            {sortedCards.map((card, index) => (
              <div
                key={card.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-300 ${
                  card.visible
                    ? 'bg-gradient-to-r from-emerald-50 to-green-50 dark:from-emerald-900/20 dark:to-green-900/20 border-emerald-200 dark:border-emerald-700'
                    : 'bg-slate-50 dark:bg-gray-800 border-slate-200 dark:border-gray-700 opacity-60'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col space-y-1">
                    <button
                      onClick={() => moveCard(card.id, 'up')}
                      disabled={index === 0}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ArrowUp className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => moveCard(card.id, 'down')}
                      disabled={index === sortedCards.length - 1}
                      className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      <ArrowDown className="w-4 h-4" />
                    </button>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                      {card.order}
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-gray-100">
                        {cardNames[card.id as keyof typeof cardNames]}
                      </h3>
                      <p className="text-sm text-slate-600 dark:text-gray-400">
                        {card.visible ? 'Visible' : 'Hidden'}
                      </p>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => toggleVisibility(card.id)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                    card.visible
                      ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-700'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
                  }`}
                >
                  {card.visible ? (
                    <>
                      <Eye className="w-4 h-4" />
                      <span>Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff className="w-4 h-4" />
                      <span>Hidden</span>
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end space-x-3 p-6 border-t border-slate-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-gray-400 border border-slate-300 dark:border-gray-600 rounded-lg hover:bg-slate-50 dark:hover:bg-gray-800 transition-colors duration-200"
          >
            Cancel
          </button>
          <button
            onClick={saveChanges}
            className="flex items-center space-x-2 px-6 py-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-lg hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <Save className="w-4 h-4" />
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomizationPanel;