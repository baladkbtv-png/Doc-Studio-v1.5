'use client';

import React from 'react';
import { ShieldAlert, Check, X } from 'lucide-react';

interface AIConsentModalProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  fileName?: string;
}

export const AIConsentModal: React.FC<AIConsentModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  fileName,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700/80 text-slate-100 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        <div className="flex items-center space-x-3 mb-4 text-amber-400">
          <div className="p-3 bg-amber-500/10 rounded-xl border border-amber-500/20">
            <ShieldAlert className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <h3 className="font-semibold text-lg text-slate-100">AI Privacy Notice</h3>
            <p className="text-xs text-slate-400">OpenRouter External Processing</p>
          </div>
        </div>

        <p className="text-sm text-slate-300 leading-relaxed mb-4">
          This content {fileName ? <strong className="text-amber-300">({fileName})</strong> : ''} will be sent to OpenRouter for AI processing.
        </p>

        <p className="text-xs text-slate-400 bg-slate-800/80 p-3 rounded-lg border border-slate-700/50 mb-6">
          🔒 Your data is transmitted securely to OpenRouter API endpoints and is not stored permanently.
        </p>

        <div className="flex items-center justify-end space-x-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition flex items-center space-x-1.5"
          >
            <X className="w-4 h-4" />
            <span>Cancel</span>
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl transition shadow-lg shadow-blue-500/20 flex items-center space-x-1.5"
          >
            <Check className="w-4 h-4" />
            <span>Continue</span>
          </button>
        </div>
      </div>
    </div>
  );
};
