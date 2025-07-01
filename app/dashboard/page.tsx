import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Uploader from '@/components/Uploader'
import EntryList from '@/components/EntryList'
import { Suspense } from 'react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return redirect('/login')
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        Welcome, {user.email || 'User'}!
      </h1>
      <p className="mb-8">
        Use the form below to create a new page for your site.
      </p>
      <Uploader />
      <Suspense fallback={<p>Loading entries...</p>}>
        <EntryList />
      </Suspense>
    </div>
  )
}