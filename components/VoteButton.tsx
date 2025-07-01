'use client'

import { handleVote } from '@/app/vote/actions'
import { createClient } from '@/lib/supabase/client'
import type { User } from '@supabase/supabase-js'
import { Heart } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useState, useTransition } from 'react'

export function VoteButton({
  entryId,
  voteCount: initialVoteCount,
}: {
  entryId: string
  voteCount: number
}) {
  const [voteCount, setVoteCount] = useState(initialVoteCount)
  const [hasVoted, setHasVoted] = useState(false)
  const [isPending, startTransition] = useTransition()
  const [user, setUser] = useState<User | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setUser(user)
      
      // Check if user has already voted
      if (user) {
        const { data } = await supabase.rpc('has_user_voted', {
          entry_id_param: entryId,
          user_id_param: user.id
        })
        setHasVoted(data || false)
      }
    }
    getUser()
  }, [entryId, supabase])

  const handleVoteClick = async () => {
    if (!user) {
      router.push('/login')
      return
    }

    startTransition(async () => {
      try {
        const result = await handleVote(entryId)
        
        if (result.success) {
          // Update based on actual action performed
          if (result.action === 'added') {
            setVoteCount(prev => prev + 1)
            setHasVoted(true)
          } else if (result.action === 'removed') {
            setVoteCount(prev => Math.max(0, prev - 1))
            setHasVoted(false)
          }
        }
      } catch (error) {
        console.error('Error voting:', error)
        // Optionally show user-friendly error message
      }
    })
  }

  return (
    <button
      onClick={handleVoteClick}
      disabled={isPending || !user}
      className={`flex items-center gap-1 transition-colors ${
        hasVoted 
          ? 'text-red-500 hover:text-red-600' 
          : 'text-gray-500 hover:text-red-500'
      } ${!user ? 'opacity-50 cursor-not-allowed' : ''}`}
      title={!user ? 'Sign in to vote' : hasVoted ? 'Remove vote' : 'Vote for this entry'}
    >
      <Heart className={`h-4 w-4 ${hasVoted ? 'fill-current' : ''}`} />
      <span>{voteCount}</span>
    </button>
  )
}