'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function handleVote(entryId: string) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { error } = await supabase
    .from('votes')
    .insert({ entry_id: entryId, user_id: user.id })

  // if the user has already voted, delete the vote
  if (error && error.code === '23505') {
    const { error: deleteError } = await supabase
      .from('votes')
      .delete()
      .match({ entry_id: entryId, user_id: user.id })
    
    if (deleteError) {
      console.error('Error deleting vote:', deleteError)
      throw deleteError
    }
    
    revalidatePath('/')
    return { success: true, action: 'removed' as const }
  } else if (error) {
    console.error('Error inserting vote:', error)
    throw error
  }

  revalidatePath('/')
  return { success: true, action: 'added' as const }
}