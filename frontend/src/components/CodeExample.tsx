import React, { useState } from 'react';

interface CodeExampleProps {
  title?: string;
  language: string;
  code: string;
  className?: string;
}

const CodeExample: React.FC<CodeExampleProps> = ({ 
  title, 
  language, 
  code, 
  className = '' 
}) => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const getLanguageColor = () => {
    switch (language.toLowerCase()) {
      case 'javascript':
      case 'js':
        return 'bg-yellow-100 text-yellow-800';
      case 'typescript':
      case 'ts':
        return 'bg-blue-100 text-blue-800';
      case 'python':
      case 'py':
        return 'bg-green-100 text-green-800';
      case 'bash':
      case 'shell':
        return 'bg-gray-100 text-gray-800';
      case 'json':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center gap-3">
          {title && (
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
          )}
          <span className={`px-2 py-1 rounded text-xs font-medium ${getLanguageColor()}`}>
            {language}
          </span>
        </div>
        
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-green-600">Copied!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Content */}
      <div className="relative">
        <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto text-sm leading-relaxed">
          <code>{code}</code>
        </pre>
        
        {/* Gradient fade for long code */}
        <div className="absolute top-0 right-0 h-full w-8 bg-gradient-to-l from-gray-900 to-transparent pointer-events-none" />
      </div>
    </div>
  );
};

export default CodeExample;
