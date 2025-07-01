'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function toggleStatus(formData: FormData) {
  const supabase = await createClient()

  const id = formData.get('id') as string
  const currentStatus = formData.get('status') as string
  const newStatus = currentStatus === 'draft' ? 'published' : 'draft'

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: 'You must be logged in to perform this action.' }
  }

  const { error } = await supabase
    .from('entries')
    .update({ status: newStatus })
    .eq('id', id)
    .eq('user_id', user.id) // Ensure users can only update their own entries

  if (error) {
    return { error: `Failed to update status: ${error.message}` }
  }

  revalidatePath('/dashboard')
  return { success: true }
}