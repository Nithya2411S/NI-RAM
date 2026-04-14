/**
 * Sidebar.tsx
 * Single Responsibility: Renders the collapsible navigation sidebar.
 * Fires onSectionChange when user clicks a section. No business logic.
 *
 * Rule 4, 6 | SOLID — Single Responsibility, Interface Segregation.
 */

import { clientLogger } from '../../lib/clientLogger';
import type { SidebarSection } from '../../types/vedic';

// ─── Nav Items ────────────────────────────────────────────────────────────────

interface NavItem {
  id: SidebarSection;
  label: string;
  icon: string;
  available: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'birthChart',    label: 'Birth Chart',    icon: '◉', available: true  },
  { id: 'navamsa',       label: 'Navamsa (D9)',   icon: '✦', available: false },
  { id: 'dashamsa',      label: 'Dashamsa (D10)', icon: '✧', available: false },
  { id: 'mahadasha',     label: 'Mahadasha',      icon: '◎', available: false },
  { id: 'ashtakavarga',  label: 'Ashtakavarga',   icon: '⬡', available: false },
  { id: 'transits',      label: 'Transits',       icon: '↻', available: false },
  { id: 'yogas',         label: 'Yogas',          icon: '꩜', available: false },
  { id: 'panchanga',     label: 'Panchanga',      icon: '☽', available: false },
];

// ─── Props ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: SidebarSection;
  onSectionChange: (section: SidebarSection) => void;
  collapsed: boolean;
  onToggle: () => void;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function Sidebar({
  activeSection,
  onSectionChange,
  collapsed,
  onToggle,
}: SidebarProps) {
  clientLogger.fn('Sidebar render', { collapsed, activeSection });

  function handleNavClick(item: NavItem) {
    clientLogger.fn('handleNavClick', { section: item.id });
    if (!item.available) {
      clientLogger.action(`User clicked unavailable section: ${item.id}`);
      return;
    }
    clientLogger.action(`User navigated to: ${item.id}`);
    onSectionChange(item.id);
  }

  function handleToggle() {
    clientLogger.fn('handleToggle');
    clientLogger.action(`Sidebar ${collapsed ? 'expanded' : 'collapsed'}`);
    onToggle();
  }

  return (
    <nav className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'space-between',
          padding: '1.25rem 1rem 1rem',
          borderBottom: '1px solid rgba(245,197,24,0.1)',
          minHeight: '64px',
        }}
      >
        {!collapsed && (
          <div>
            <p
              className="gold-glow"
              style={{
                color: '#f5c518',
                fontFamily: 'Georgia, serif',
                fontWeight: 700,
                fontSize: '1.1rem',
                letterSpacing: '0.2em',
              }}
            >
              NIRAM
            </p>
            <p style={{ color: 'rgba(245,197,24,0.4)', fontSize: '0.65rem', letterSpacing: '0.15em' }}>
              VEDIC ASTROLOGY
            </p>
          </div>
        )}
        <button
          onClick={handleToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          style={{
            background: 'none',
            border: '1px solid rgba(245,197,24,0.2)',
            borderRadius: '0.35rem',
            color: 'rgba(245,197,24,0.6)',
            cursor: 'pointer',
            padding: '0.3rem 0.5rem',
            fontSize: '0.8rem',
            transition: 'all 0.2s',
            lineHeight: 1,
          }}
        >
          {collapsed ? '▶' : '◀'}
        </button>
      </div>

      {/* Navigation */}
      <div style={{ padding: '0.75rem 0.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
        {!collapsed && (
          <p style={{
            color: 'rgba(245,197,24,0.3)',
            fontSize: '0.65rem',
            letterSpacing: '0.15em',
            textTransform: 'uppercase',
            padding: '0.25rem 0.5rem',
            marginBottom: '0.25rem',
          }}>
            Modules
          </p>
        )}

        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeSection === item.id ? 'active' : ''}`}
            onClick={() => handleNavClick(item)}
            title={collapsed ? item.label : undefined}
            style={{
              opacity: item.available ? 1 : 0.4,
              cursor: item.available ? 'pointer' : 'not-allowed',
              justifyContent: collapsed ? 'center' : 'flex-start',
            }}
          >
            <span className="nav-icon">{item.icon}</span>
            {!collapsed && (
              <span className="nav-label" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flex: 1 }}>
                {item.label}
                {!item.available && (
                  <span style={{
                    fontSize: '0.58rem',
                    color: 'rgba(245,197,24,0.3)',
                    background: 'rgba(245,197,24,0.06)',
                    border: '1px solid rgba(245,197,24,0.15)',
                    borderRadius: '0.25rem',
                    padding: '0.1rem 0.35rem',
                    letterSpacing: '0.08em',
                  }}>
                    Soon
                  </span>
                )}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      {!collapsed && (
        <div style={{
          position: 'absolute', bottom: '1rem', left: 0, right: 0,
          padding: '0 1rem',
          borderTop: '1px solid rgba(245,197,24,0.08)',
          paddingTop: '0.75rem',
        }}>
          <p style={{ color: 'rgba(245,197,24,0.25)', fontSize: '0.65rem', textAlign: 'center', letterSpacing: '0.08em' }}>
            Lahiri Ayanamsa · True Nodes
          </p>
        </div>
      )}
    </nav>
  );
}
