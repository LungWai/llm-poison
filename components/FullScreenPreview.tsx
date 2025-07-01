'use client'

import { useEffect } from 'react'
import DOMPurify from 'dompurify'

interface FullScreenPreviewProps {
  isOpen: boolean
  onClose: () => void
  content: string
  title?: string
  slug?: string
}

export default function FullScreenPreview({ 
  isOpen, 
  onClose, 
  content, 
  title, 
  slug 
}: FullScreenPreviewProps) {
  const sanitizedContent = DOMPurify.sanitize(content)
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen, onClose])
  
  if (!isOpen) return null
  
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg w-full max-w-6xl h-[90vh] flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold">Full Screen Preview</h3>
            <div className="flex items-center bg-gray-100 rounded px-3 py-1 text-sm text-gray-600 font-mono">
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
              </svg>
              {slug ? `${slug}.${rootDomain}` : `your-slug.${rootDomain}`}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-hidden">
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
            className="w-full h-full"
            sandbox="allow-scripts"
          />
        </div>
      </div>
    </div>
  )
}