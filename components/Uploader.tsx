'use client'

import { useState, useEffect } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import DOMPurify from 'dompurify'
import { createClient } from '@/lib/supabase/client'
import HTMLPreview from './HTMLPreview'
import FullScreenPreview from './FullScreenPreview'

export default function Uploader() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [showPreview, setShowPreview] = useState(false)
  const [showFullScreen, setShowFullScreen] = useState(false)
  const [previewHtml, setPreviewHtml] = useState('')
  const supabase = createClient()

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
    onUpdate: ({ editor }) => {
      const html = editor.getHTML()
      const sanitized = DOMPurify.sanitize(html)
      setPreviewHtml(sanitized)
    },
  })

  // Initialize preview on first load
  useEffect(() => {
    if (editor) {
      const html = editor.getHTML()
      const sanitized = DOMPurify.sanitize(html)
      setPreviewHtml(sanitized)
    }
  }, [editor])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!editor) {
      return
    }

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      const html = editor.getHTML()
      const sanitizedHtml = DOMPurify.sanitize(html)

      const { error } = await supabase.from('entries').insert([
        {
          title,
          slug,
          content: sanitizedHtml,
          user_id: user.id,
          status: 'draft',
          type: 'page',
        },
      ])

      if (error) {
        alert(`Error: ${error.message}`)
      } else {
        alert('Entry created successfully!')
        setTitle('')
        setSlug('')
        editor.commands.clearContent()
      }
    } else {
      alert('You must be logged in to create an entry.')
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <label htmlFor="slug" className="block text-sm font-medium">
          Slug
        </label>
        <input
          type="text"
          id="slug"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
          required
        />
      </div>
      <div>
        <div className="flex justify-between items-center mb-2">
          <label className="block text-sm font-medium">Content</label>
          <div className="flex space-x-3">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-indigo-600 hover:text-indigo-500 font-medium"
            >
              {showPreview ? 'Hide Preview' : 'Show Preview'}
            </button>
            {showPreview && (
              <button
                type="button"
                onClick={() => setShowFullScreen(true)}
                className="text-sm text-indigo-600 hover:text-indigo-500 font-medium flex items-center"
              >
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
                Full Screen
              </button>
            )}
          </div>
        </div>
        <div className={showPreview ? 'grid grid-cols-2 gap-4' : ''}>
          <div>
            <div className="rounded-md border border-gray-300 p-2">
              <EditorContent editor={editor} className="prose prose-sm max-w-none" />
            </div>
          </div>
          {showPreview && (
            <div>
              <HTMLPreview 
                content={previewHtml}
                title={title}
                slug={slug}
                className="h-full"
              />
            </div>
          )}
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Entry
      </button>
      <FullScreenPreview
        isOpen={showFullScreen}
        onClose={() => setShowFullScreen(false)}
        content={previewHtml}
        title={title}
        slug={slug}
      />
    </form>
  )
}