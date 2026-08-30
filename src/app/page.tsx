'use client';

import React, { useState, useEffect } from 'react';
import { Navigation, NavTab } from '@/components/navigation';
import { HomeStudio } from '@/components/home-studio';
import { DocumentStudio } from '@/components/document-studio';
import { PDFStudio } from '@/components/pdf-studio';
import { SpreadsheetStudio } from '@/components/spreadsheet-studio';
import { PresentationStudio } from '@/components/presentation-studio';
import { ImageStudio } from '@/components/image-studio';
import { InvoiceStudio } from '@/components/invoice-studio';
import { TemplatesStudio } from '@/components/templates-studio';
import { FileManager } from '@/components/file-manager';
import { EncryptionStudio } from '@/components/encryption-studio';
import { SettingsStudio } from '@/components/settings-studio';
import { AIConsentModal } from '@/components/ai-consent-modal';
import { StudioFile } from '@/lib/types';
import { getSetting } from '@/lib/storage';

export default function DocumentStudioApp() {
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [activeFile, setActiveFile] = useState<StudioFile | null>(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [isOffline, setIsOffline] = useState(false);

  const [consentModal, setConsentModal] = useState<{
    isOpen: boolean;
    fileName: string;
    onConfirm: (() => void) | null;
  }>({
    isOpen: false,
    fileName: '',
    onConfirm: null,
  });

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
    getSetting<'dark' | 'light'>('theme', 'dark').then((t) => setTheme(t));
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRequestConsent = (fileName: string, onConfirm: () => void) => {
    setConsentModal({
      isOpen: true,
      fileName,
      onConfirm: () => {
        setConsentModal({ isOpen: false, fileName: '', onConfirm: null });
        onConfirm();
      },
    });
  };

  const handleOpenFile = (file: StudioFile) => {
    setActiveFile(file);
  };

  const handleCloseActiveFile = () => {
    setActiveFile(null);
  };

  return (
    <div
      className={`min-h-screen font-sans antialiased transition-colors duration-200 ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      <Navigation
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setActiveFile(null);
        }}
        sidebarCollapsed={sidebarCollapsed}
        setSidebarCollapsed={setSidebarCollapsed}
        theme={theme}
        setTheme={setTheme}
        isOffline={isOffline}
      />
      <main
        className={`transition-all duration-300 p-4 sm:p-6 pb-20 md:pb-6 ${
          sidebarCollapsed ? 'md:ml-16' : 'md:ml-60'
        }`}
      >
        {activeFile ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <button
                onClick={handleCloseActiveFile}
                className="text-xs font-semibold text-indigo-400 hover:underline flex items-center space-x-1"
              >
                ← Back to Workspace
              </button>
            </div>
            {activeFile.type === 'document' && (
              <DocumentStudio
                file={activeFile}
                onFileUpdated={setActiveFile}
                onClose={handleCloseActiveFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'pdf' && (
              <PDFStudio
                file={activeFile}
                onClose={handleCloseActiveFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'spreadsheet' && (
              <SpreadsheetStudio
                file={activeFile}
                onFileUpdated={setActiveFile}
                onClose={handleCloseActiveFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'presentation' && (
              <PresentationStudio
                file={activeFile}
                onFileUpdated={setActiveFile}
                onClose={handleCloseActiveFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'image' && (
              <ImageStudio
                file={activeFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'invoice' && (
              <InvoiceStudio
                file={activeFile}
                onFileUpdated={setActiveFile}
                onClose={handleCloseActiveFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeFile.type === 'encrypted' && <EncryptionStudio />}
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeStudio
                onOpenFile={handleOpenFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === 'files' && <FileManager onOpenFile={handleOpenFile} />}
            {activeTab === 'ai' && (
              <HomeStudio
                onOpenFile={handleOpenFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
                onNavigateTab={setActiveTab}
              />
            )}
            {activeTab === 'tools' && (
              <TemplatesStudio
                onOpenFile={handleOpenFile}
                onRequestConsent={handleRequestConsent}
                isOffline={isOffline}
              />
            )}
            {activeTab === 'settings' && <SettingsStudio theme={theme} setTheme={setTheme} />}
          </>
        )}
      </main>
      <AIConsentModal
        isOpen={consentModal.isOpen}
        fileName={consentModal.fileName}
        onConfirm={consentModal.onConfirm || (() => {})}
        onCancel={() => setConsentModal({ isOpen: false, fileName: '', onConfirm: null })}
      />
    </div>
  );
}
