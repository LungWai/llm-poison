'use client'

import { useState } from 'react'
import DOMPurify from 'dompurify'

interface HTMLPreviewProps {
  content: string
  title?: string
  slug?: string
  className?: string
}

export default function HTMLPreview({ content, title, slug, className = '' }: HTMLPreviewProps) {
  const [previewMode, setPreviewMode] = useState<'desktop' | 'mobile'>('desktop')
  const sanitizedContent = DOMPurify.sanitize(content)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  
  return (
    <div className={`${className}`}>
      <div className="bg-gray-100 rounded-t-lg p-3 border border-gray-300 border-b-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="flex space-x-1">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <div className="ml-4 flex items-center bg-white rounded px-3 py-1 text-xs text-gray-600 font-mono">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              {slug ? `https://${slug}.${rootDomain}` : `https://your-slug.${rootDomain}`}
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => setPreviewMode('desktop')}
              className={`px-2 py-1 rounded text-xs ${previewMode === 'desktop' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              title="Desktop view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </button>
            <button
              onClick={() => setPreviewMode('mobile')}
              className={`px-2 py-1 rounded text-xs ${previewMode === 'mobile' ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'}`}
              title="Mobile view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>
      <div className={`bg-white border border-gray-300 border-t-0 rounded-b-lg overflow-hidden ${
        previewMode === 'mobile' ? 'max-w-sm mx-auto' : 'w-full'
      }`}>
        <iframe
          srcDoc={`
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <title>${title || 'Preview'}</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                    line-height: 1.6;
                    color: #333;
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 2rem;
                  }
                  h1 { 
                    font-size: 2.5rem; 
                    font-weight: 700;
                    margin-bottom: 1rem;
                  }
                  h2 { font-size: 2rem; margin-top: 2rem; }
                  h3 { font-size: 1.5rem; margin-top: 1.5rem; }
                  p { margin-bottom: 1rem; }
                  a { color: #4F46E5; text-decoration: none; }
                  a:hover { text-decoration: underline; }
                  pre { background: #f4f4f4; padding: 1rem; border-radius: 4px; overflow-x: auto; }
                  code { background: #f4f4f4; padding: 0.2rem 0.4rem; border-radius: 3px; }
                  blockquote { 
                    border-left: 4px solid #ddd; 
                    padding-left: 1rem; 
                    margin-left: 0; 
                    color: #666;
                  }
                  img { max-width: 100%; height: auto; }
                  ul, ol { margin-bottom: 1rem; }
                  li { margin-bottom: 0.5rem; }
                </style>
              </head>
              <body>
                ${title ? `<h1>${title}</h1>` : ''}
                ${sanitizedContent}
              </body>
            </html>
          `}
          className={`w-full ${previewMode === 'mobile' ? 'h-[600px]' : 'h-[500px]'}`}
          sandbox="allow-scripts"
        />
      </div>
    </div>
  )
}