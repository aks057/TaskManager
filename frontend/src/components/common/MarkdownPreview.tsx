import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import './MarkdownPreview.css';

interface MarkdownPreviewProps {
  content: string;
  className?: string;
}

export const MarkdownPreview: React.FC<MarkdownPreviewProps> = ({ content, className = '' }) => {
  return (
    <div className={`markdown-preview ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Customize link rendering to open in new tab
          a: (props) => <a {...props} target="_blank" rel="noopener noreferrer" />,
          // Customize code block rendering
          code: (props) => {
            const { children, className, ...rest } = props;
            const inline = !className;
            const match = /language-(\w+)/.exec(className || '');
            return inline ? (
              <code className="inline-code" {...rest}>
                {children}
              </code>
            ) : (
              <div className="code-block-wrapper">
                <div className="code-block-header">
                  {match && <span className="code-language">{match[1]}</span>}
                </div>
                <pre className="code-block">
                  <code className={className} {...rest}>
                    {children}
                  </code>
                </pre>
              </div>
            );
          },
          // Customize table rendering
          table: (props) => (
            <div className="table-wrapper">
              <table {...props} />
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};
