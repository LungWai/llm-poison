import { createClient } from '@/lib/supabase/server'
import { headers } from 'next/headers'
import { notFound } from 'next/navigation'
import { VoteButton } from '@/components/VoteButton'
import DOMPurify from 'isomorphic-dompurify'

export const revalidate = 0

export default async function Home() {
  const supabase = await createClient()
  const headersList = await headers()
  const host = headersList.get('host')

  // The root domain is the domain without any subdomains.
  // On localhost, it's `localhost:3000`. On production, it should be your-site.com.
  // You should configure this in your Vercel project environment variables.
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || 'localhost:3000'
  const slug = host && host.endsWith(`.${rootDomain}`) ? host.replace(`.${rootDomain}`, '') : null

  // If there's a slug, we're on a subdomain page.
  if (slug) {
    const { data: entry, error } = await supabase
      .from('entries')
      .select('title, content')
      .eq('slug', slug)
      .eq('status', 'published')
      .single()

    if (error || !entry) {
      notFound()
    }

    // Sanitize the HTML on the server before rendering.
    const sanitizedContent = DOMPurify.sanitize(entry.content)

    return (
      <main className="p-8">
        <h1 className="text-4xl font-bold mb-4">{entry.title}</h1>
        <div
          className="prose dark:prose-invert"
          dangerouslySetInnerHTML={{ __html: sanitizedContent }}
        />
      </main>
    )
  }

  // Otherwise, we're on the main grid page.
  const { data: entriesData, error } = await supabase
    .from('entries')
    .select('*')
    .eq('status', 'published')

  if (error) {
    console.error('Error fetching entries:', error)
    return <div>Error loading entries.</div>
  }

  const entries = await Promise.all(
    (entriesData || []).map(async (entry) => {
      const { data: voteCount, error: voteError } = await supabase.rpc(
        'get_vote_count',
        { entry_id_param: entry.id }
      )

      if (voteError) {
        console.error(`Error fetching vote count for entry ${entry.id}:`, voteError)
      }
      return {
        ...entry,
        voteCount: voteCount || 0,
      }
    })
  )

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="z-10 w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex">
        <p className="fixed left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30">
          Published Entries
        </p>
      </div>

      <div className="mt-12 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {entries?.map((entry) => (
          <div key={entry.id} className="rounded-lg border border-gray-300 bg-white p-4 shadow-md dark:border-neutral-700 dark:bg-neutral-800/30">
            <div className="flex justify-between items-start">
              <a href={`http://${entry.slug}.${rootDomain}`} target="_blank" rel="noopener noreferrer">
                  <h2 className="mb-2 text-xl font-bold hover:underline">{entry.title}</h2>
              </a>
              <VoteButton entryId={entry.id} voteCount={entry.voteCount} />
            </div>
            <div className="aspect-video w-full overflow-hidden rounded-md border">
              <iframe
                sandbox="allow-scripts"
                srcDoc={entry.content}
                className="h-full w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
