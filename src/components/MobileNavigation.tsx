import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, ChevronRight } from 'lucide-react';
import { useSettingsStore } from '../stores/settingsStore';
import { useTranslationStore } from '../stores/translationStore';
import { useNavigationStore } from '../stores/navigationStore';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useFocusTrap } from '../hooks/useFocusTrap';

export function MobileNavigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const lastActiveElement = useRef<HTMLElement | null>(null);

  const { isDarkMode } = useSettingsStore();
  const { t } = useTranslationStore();
  const { sections, activeSection, activeSubsection, navigateTo } = useNavigationStore();

  // Trap focus within menu when open
  useFocusTrap(menuRef, isMenuOpen);

  // Handle scroll lock
  useEffect(() => {
    if (isMenuOpen) {
      lastActiveElement.current = document.activeElement as HTMLElement;
      document.body.style.overflow = 'hidden';
      
      // Focus first interactive element after menu opens
      setTimeout(() => {
        const firstButton = menuRef.current?.querySelector('button');
        firstButton?.focus();
      }, 100);
    } else {
      document.body.style.overflow = '';
      lastActiveElement.current?.focus();
    }
    
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMenuOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };
    
    if (isMenuOpen) {
      window.addEventListener('keydown', handleEscape);
      return () => window.removeEventListener('keydown', handleEscape);
    }
  }, [isMenuOpen]);

  // Handle clicks outside menu
  useOnClickOutside(menuRef, (e) => {
    if (!buttonRef.current?.contains(e.target as Node)) {
      setIsMenuOpen(false);
    }
  });

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const handleNavigation = (sectionId: string, subsectionId: string | null = null) => {
    navigateTo(sectionId, subsectionId);
    setIsMenuOpen(false);
  };

  const toggleSection = (sectionId: string, event: React.MouseEvent) => {
    event.preventDefault();
    setExpandedSection(expandedSection === sectionId ? null : sectionId);
  };

  return (
    <>
      <button
        ref={buttonRef}
        onClick={toggleMenu}
        className="p-3 -ml-3 rounded-lg transition-colors duration-150 lg:hidden
                 text-gray-600 hover:bg-gray-100 hover:text-gray-900
                 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100"
        aria-label={t('mobileNav.toggleMenuLabel')}
        aria-expanded={isMenuOpen}
        aria-controls="mobile-menu"
        aria-haspopup="dialog"
      >
        <Menu size={24} aria-hidden="true" />
      </button>

      {/* Backdrop */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          aria-hidden="true"
          onClick={() => setIsMenuOpen(false)}
        />
      )}

      {/* Navigation Panel */}
      <div
        ref={menuRef}
        id="mobile-menu"
        role="dialog"
        aria-modal="true"
        aria-label={t('mobileNav.menuTitle')}
        className={`fixed top-0 left-0 h-screen w-[280px] bg-white dark:bg-gray-900 
                   shadow-xl z-50 transform transition-transform duration-200 ease-out 
                   lg:hidden ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <h2 id="mobile-menu-title" className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            ENMG. DeepLuxMed
          </h2>
          <button
            onClick={() => setIsMenuOpen(false)}
            className="p-2 rounded-lg transition-colors duration-150
                     text-gray-500 hover:bg-gray-100 hover:text-gray-700
                     dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
            aria-label={t('mobileNav.closeMenuLabel')}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        <nav 
          className="overflow-y-auto overscroll-contain h-[calc(var(--app-height,100vh)-73px)] p-4 space-y-1"
          role="navigation"
          aria-labelledby="mobile-menu-title"
        >
          {sections.map((section) => (
            <div key={section.id} role="none">
              <button
                onClick={(e) => section.subsections ? toggleSection(section.id, e) : handleNavigation(section.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg
                           transition-colors duration-150 ${
                             activeSection === section.id && !section.subsections
                               ? 'bg-primary-50 text-primary-900 font-medium dark:bg-primary-900/50 dark:text-primary-100'
                               : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-800 dark:hover:text-gray-100'
                           }`}
                aria-expanded={section.subsections ? expandedSection === section.id : undefined}
                aria-controls={section.subsections ? `section-${section.id}-content` : undefined}
              >
                <span>{t(`sections.${section.id}`)}</span>
                {section.subsections && (
                  <ChevronRight
                    size={18}
                    className={`transform transition-transform duration-200 ${
                      expandedSection === section.id ? 'rotate-90' : ''
                    }`}
                    aria-hidden="true"
                  />
                )}
              </button>

              {section.subsections && expandedSection === section.id && (
                <div 
                  id={`section-${section.id}-content`}
                  className="mt-1 ml-4 pl-4 border-l border-gray-200 dark:border-gray-700 space-y-1"
                  role="group"
                  aria-label={t(`sections.${section.id}`)}
                >
                  {section.subsections.map((subsection) => (
                    <button
                      key={subsection.id}
                      onClick={() => handleNavigation(section.id, subsection.id)}
                      className={`w-full text-left px-4 py-2 text-sm rounded-lg
                                transition-colors duration-150 ${
                                  activeSubsection === subsection.id
                                    ? 'bg-primary-50 text-primary-900 font-medium dark:bg-primary-900/50 dark:text-primary-100'
                                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200'
                                }`}
                      aria-current={activeSubsection === subsection.id ? 'page' : undefined}
                    >
                      {t(`subsections.${subsection.id}`)}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>
    </>
  );
}