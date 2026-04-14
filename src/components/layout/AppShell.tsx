/**
 * AppShell.tsx
 * Single Responsibility: Top-level layout — sidebar + main content area.
 * Holds sidebar open/close state and active section routing.
 * Imports BirthChartApp directly to avoid render-function-as-children pattern
 * which breaks across the Astro/React SSR boundary.
 *
 * Rule 4, 6 | SOLID — Single Responsibility.
 */

import { useState } from 'react';
import Sidebar from './Sidebar';
import BirthChartApp from '../BirthChartApp';
import { clientLogger } from '../../lib/clientLogger';
import type { SidebarSection } from '../../types/vedic';

export default function AppShell() {
  clientLogger.fn('AppShell render');

  const [collapsed, setCollapsed]         = useState(false);
  const [activeSection, setActiveSection] = useState<SidebarSection>('birthChart');

  function handleSectionChange(section: SidebarSection) {
    clientLogger.fn('handleSectionChange', { section });
    clientLogger.action(`Section changed to: ${section}`);
    setActiveSection(section);
  }

  function handleToggle() {
    clientLogger.fn('handleToggle (AppShell)');
    setCollapsed((prev) => !prev);
  }

  return (
    <div className="app-shell">
      <Sidebar
        activeSection={activeSection}
        onSectionChange={handleSectionChange}
        collapsed={collapsed}
        onToggle={handleToggle}
      />
      <main className="main-content">
        {activeSection === 'birthChart' ? (
          <BirthChartApp />
        ) : (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            minHeight: '60vh', flexDirection: 'column', gap: '1rem',
          }}>
            <p style={{ color: 'rgba(245,197,24,0.5)', fontSize: '2rem' }}>✦</p>
            <p style={{ color: 'rgba(245,197,24,0.6)', fontFamily: 'Georgia,serif',
                        fontSize: '1rem', letterSpacing: '0.15em' }}>
              Coming Soon
            </p>
            <p style={{ color: 'rgba(200,190,230,0.4)', fontSize: '0.8rem' }}>
              This module is under development.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
