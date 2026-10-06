import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { PriceCheckModal } from '../common/PriceCheckModal';
import { AccessibilityProvider } from '../accessibility';

export default function DashboardLayout() {
  const [isPriceCheckOpen, setIsPriceCheckOpen] = useState(false);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // F3: Quick Price Check shortcut
      if (e.key === 'F3') {
        e.preventDefault();
        setIsPriceCheckOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  return (
    <AccessibilityProvider>
      <div className="flex h-screen bg-background overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header onOpenPriceCheck={() => setIsPriceCheckOpen(true)} />
          <main id="main-content" tabIndex={-1} className="flex-1 overflow-y-auto p-6 outline-none">
            <Outlet />
          </main>
        </div>

        <PriceCheckModal 
          isOpen={isPriceCheckOpen} 
          onClose={() => setIsPriceCheckOpen(false)} 
        />
      </div>
    </AccessibilityProvider>
  );
}

