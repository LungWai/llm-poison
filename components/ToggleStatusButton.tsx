'use client'

import { useTransition } from 'react'
import { toggleStatus } from '@/app/dashboard/actions'

interface ToggleStatusButtonProps {
  id: string
  status: 'draft' | 'published'
}

export default function ToggleStatusButton({
  id,
  status,
}: ToggleStatusButtonProps) {
  const [isPending, startTransition] = useTransition()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    startTransition(() => {
      toggleStatus(formData)
    })
  }

  return (
    <form onSubmit={handleSubmit}>
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={status} />
      <button
        type="submit"
        disabled={isPending}
        className={`px-3 py-1 text-sm font-semibold rounded-full disabled:opacity-50 ${
          status === 'draft'
            ? 'bg-green-100 text-green-800 hover:bg-green-200'
            : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
        }`}
      >
        {isPending ? 'Updating...' : status === 'draft' ? 'Publish' : 'Unpublish'}
      </button>
    </form>
  )
}