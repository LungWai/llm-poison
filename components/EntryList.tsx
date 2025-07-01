import { createClient } from '@/lib/supabase/server'
import ToggleStatusButton from './ToggleStatusButton'

export default async function EntryList() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>You need to be logged in to see your entries.</p>
  }

  const { data: entries, error } = await supabase
    .from('entries')
    .select('id, title, status')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    return <p>Error loading entries: {error.message}</p>
  }

  if (!entries || entries.length === 0) {
    return <p>You haven&apos;t created any entries yet.</p>
  }

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold mb-4">Your Entries</h2>
      <div className="space-y-4">
        {entries.map((entry) => (
          <div
            key={entry.id}
            className="flex items-center justify-between rounded-lg border bg-white p-4 dark:bg-neutral-800"
          >
            <div>
              <h3 className="font-semibold">{entry.title}</h3>
              <span
                className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  entry.status === 'published'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-800'
                }`}
              >
                {entry.status}
              </span>
            </div>
            <ToggleStatusButton id={entry.id} status={entry.status} />
          </div>
        ))}
      </div>
    </div>
  )
}