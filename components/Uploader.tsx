'use client'

import { useState } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import { StarterKit } from '@tiptap/starter-kit'
import DOMPurify from 'dompurify'
import { createClient } from '@/lib/supabase/client'

export default function Uploader() {
  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const supabase = createClient()

  const editor = useEditor({
    extensions: [StarterKit],
    content: '<p>Hello World! 🌎️</p>',
  })

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
        <label className="block text-sm font-medium mb-1">Content</label>
        <div className="rounded-md border border-gray-300 p-2">
          <EditorContent editor={editor} />
        </div>
      </div>
      <button
        type="submit"
        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Create Entry
      </button>
    </form>
  )
}