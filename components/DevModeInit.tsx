'use client';

import { useEffect } from 'react';
import { initDevMode, isDevMode } from '@/lib/dev-mode';

export default function DevModeInit() {
  useEffect(() => {
    initDevMode();
  }, []);

  if (!isDevMode) return null;

  return (
    <div className="fixed bottom-4 left-4 bg-yellow-500 text-black px-3 py-1 rounded-md text-sm font-bold z-50">
      DEV MODE
    </div>
  );
}