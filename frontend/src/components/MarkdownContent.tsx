import React from 'react';

interface MarkdownContentProps {
  children: React.ReactNode;
  className?: string;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({ children, className = '' }) => {
  return (
    <div className={`prose-content ${className}`}>
      <style dangerouslySetInnerHTML={{
        __html: `
          .prose-content h1 {
            font-size: 1.875rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1.5rem;
            margin-top: 2rem;
          }
          .prose-content h1:first-child {
            margin-top: 0;
          }
          .prose-content h2 {
            font-size: 1.5rem;
            font-weight: bold;
            color: #111827;
            margin-bottom: 1rem;
            margin-top: 1.5rem;
          }
          .prose-content h2:first-child {
            margin-top: 0;
          }
          .prose-content h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.75rem;
            margin-top: 1.25rem;
          }
          .prose-content h3:first-child {
            margin-top: 0;
          }
          .prose-content h4 {
            font-size: 1.125rem;
            font-weight: 600;
            color: #111827;
            margin-bottom: 0.5rem;
            margin-top: 1rem;
          }
          .prose-content h4:first-child {
            margin-top: 0;
          }
          .prose-content p {
            color: #374151;
            margin-bottom: 1rem;
            line-height: 1.75;
          }
          .prose-content ul {
            margin-bottom: 1rem;
          }
          .prose-content ul li {
            color: #374151;
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .prose-content ul li::before {
            content: '';
            position: absolute;
            left: 0;
            top: 0.5rem;
            width: 0.5rem;
            height: 0.5rem;
            background-color: #2563eb;
            border-radius: 50%;
          }
          .prose-content ol {
            margin-bottom: 1rem;
          }
          .prose-content ol li {
            color: #374151;
            padding-left: 1.5rem;
            margin-bottom: 0.5rem;
          }
          .prose-content blockquote {
            border-left: 4px solid #3b82f6;
            padding-left: 1rem;
            padding-top: 0.5rem;
            padding-bottom: 0.5rem;
            margin-bottom: 1rem;
            background-color: #eff6ff;
            font-style: italic;
            color: #1f2937;
          }
          .prose-content code {
            background-color: #f3f4f6;
            padding: 0.25rem 0.5rem;
            border-radius: 0.25rem;
            font-size: 0.875rem;
            font-family: ui-monospace, SFMono-Regular, "SF Mono", Consolas, "Liberation Mono", Menlo, monospace;
            color: #1f2937;
          }
          .prose-content pre {
            background-color: #111827;
            color: #f3f4f6;
            padding: 1rem;
            border-radius: 0.5rem;
            overflow-x: auto;
            margin-bottom: 1rem;
          }
          .prose-content pre code {
            background-color: transparent;
            padding: 0;
            color: #f3f4f6;
          }
          .prose-content a {
            color: #2563eb;
            text-decoration: underline;
          }
          .prose-content a:hover {
            color: #1d4ed8;
          }
          .prose-content table {
            width: 100%;
            border-collapse: collapse;
            border: 1px solid #d1d5db;
            margin-bottom: 1rem;
          }
          .prose-content th {
            border: 1px solid #d1d5db;
            padding: 1rem;
            background-color: #f9fafb;
            font-weight: 600;
            text-align: left;
          }
          .prose-content td {
            border: 1px solid #d1d5db;
            padding: 1rem;
          }
          .prose-content hr {
            border: 0;
            border-top: 1px solid #e5e7eb;
            margin: 1.5rem 0;
          }
          .prose-content img {
            border-radius: 0.5rem;
            box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
          }
        `
      }} />
      {children}
    </div>
  );
};

export default MarkdownContent;
