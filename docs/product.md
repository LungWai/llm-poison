
### **Comprehensive Project Guide: The Supabase & Next.js CMS/Benchmark Platform**

-----

### **Part 1: Executive Summary & Core Concepts**

#### **Project Vision**

This document outlines the architecture and implementation plan for a sophisticated, Supabase-powered Content Management System (CMS) and future-proof LLM Benchmark System. The platform's core function is to allow authenticated users to create and manage HTML content, which is then published to the public on unique, dynamically generated subdomains. The system is designed with security, scalability, and modularity at its heart, enabling future expansion to include complex benchmark tasks like code generation or question-answering analysis.

#### **Key Architectural Pillars**

  * **Decoupled Frontend/Backend:** A Next.js frontend handles all user interactions and rendering, while Supabase provides a complete backend-as-a-service (BaaS), managing the database, authentication, and storage.
  * **Server-Side Rendering (SSR) & Static Site Generation (SSG):** Next.js allows for optimal performance and SEO by pre-rendering pages where possible and rendering dynamic content on the server.
  * **Row-Level Security (RLS):** Supabase's powerful RLS will be used to enforce strict data access rules directly at the database level, ensuring users can only access and modify their own data.
  * **Wildcard Subdomains:** A professional approach where each published piece of content gets its own subdomain (e.g., `my-first-article.your-site.com`), handled seamlessly by Vercel and a Next.js catch-all route.

-----

### **Part 2: User Roles & Access Control (Emphasis Point)**

A critical design feature of this platform is the separation of public content consumption from protected user actions. This ensures a low-friction experience for viewers while securing the content creation and curation process.

| User State | Allowed Actions | Technical Implementation |
| :--- | :--- | :--- |
| **Anonymous / Public User** | ● View any `published` page on its unique subdomain.\<br\>● Browse the main page preview grid. | ● Public routes in Next.js.\<br\>● Supabase queries that filter for `status = 'published'`.\<br\>● **No login is required for these actions.** |
| **Authenticated / Logged-in User** | ● All public actions.\<br\>● **Upload** new content via the CMS editor.\<br\>● **Vote** ("like") on any entry.\<br\>● Manage their own content (edit, change status). | ● Protected routes in Next.js that redirect if not authenticated.\<br\>● Supabase RLS policies ensuring users can only `insert` content or `update`/`delete` their own entries.\<br\>● Supabase client calls that include the user's JWT for authentication. |

This distinction is fundamental: **Viewing is public; creating and interacting are protected.** We will enforce this at both the frontend (UI logic) and backend (database security) layers.

-----

### **Part 3: Deep Dive Implementation Plan**

This multi-phase plan provides a granular, step-by-step roadmap for development.

#### **Phase 1: Foundation, Schema, and Security**

**Goal:** Establish a secure, authenticated foundation for the application.

  * **Step 1: Project Initialization & Environment Setup**

      * Create a new Next.js project: `npx create-next-app@latest --typescript --tailwind --eslint`.
      * Install core dependencies: `npm install @supabase/supabase-js tiptap-react @tiptap/starter-kit dompurify`.
      * In your Supabase project, navigate to **Project Settings \> API**. Copy your `Project URL` and `anon (public)` key.
      * Create a `.env.local` file in your Next.js root and add your keys:
        ```
        NEXT_PUBLIC_SUPABASE_URL=YOUR_PROJECT_URL
        NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_ANON_KEY
        ```

  * **Step 2: Database Schema & Row Level Security (RLS)**

      * In the Supabase SQL Editor, run the scripts to create the `entries` and `votes` tables as detailed previously.
      * **Crucially, enable Row Level Security (RLS) on both tables.** Navigate to **Authentication \> Policies** in Supabase.
      * **Create RLS Policies for `entries`:**
          * **Public Read Access:** Allow anyone to read entries that are `published`.
            ```sql
            CREATE POLICY "Public can view published entries"
            ON entries FOR SELECT USING (status = 'published');
            ```
          * **Authenticated User Read Access:** Allow logged-in users to see their own drafts.
            ```sql
            CREATE POLICY "Users can view their own draft entries"
            ON entries FOR SELECT USING (auth.uid() = user_id);
            ```
          * **Authenticated User Write Access:** Allow logged-in users to create entries and update/delete their own.
            ```sql
            CREATE POLICY "Users can insert their own entries"
            ON entries FOR INSERT WITH CHECK (auth.uid() = user_id);

            CREATE POLICY "Users can update their own entries"
            ON entries FOR UPDATE USING (auth.uid() = user_id);
            ```
      * **Create RLS Policies for `votes`:**
          * Allow logged-in users to insert and delete their own votes.
            ```sql
            CREATE POLICY "Users can insert and manage their own votes"
            ON votes FOR ALL USING (auth.uid() = user_id);
            ```

  * **Step 3: Authentication Hooks & UI**

      * Set up the Supabase server and client helpers within your Next.js app (`/utils/supabase/`).
      * Create dedicated pages for `/login`, `/signup`, and a callback route for OAuth. Use Supabase Auth UI helpers or build custom forms.
      * Implement a central `AuthContext` or use a similar state management pattern to provide user session information throughout the app.

-----

#### **Phase 2: The CMS Core: Uploader & Dashboard**

**Goal:** Build the primary interface for content creation and management.

  * **Step 1: Create the CMS Dashboard Page**

      * Create a new route, e.g., `/dashboard`, that is protected and only accessible to logged-in users.
      * This page will host the content uploader and a list of the user's own entries (both draft and published).

  * **Step 2: Build the HTML Uploader Component**

      * Integrate the TipTap editor. Configure it with the `StarterKit` for basic formatting (bold, italic, lists, etc.).
      * Structure your form with React state (e.g., `useState`) to manage `title`, `slug`, and editor `content`.
      * **Submission Logic with Sanitization:**
        ```tsx
        // Example Submission Handler
        import DOMPurify from 'dompurify';

        const handleSubmit = async () => {
          // 1. Get raw HTML from TipTap editor instance
          const rawHtml = editor.getHTML();

          // 2. Sanitize on the client-side as a first line of defense
          const sanitizedHtml = DOMPurify.sanitize(rawHtml);

          // 3. Get user ID from Supabase session
          const { data: { user } } = await supabase.auth.getUser();

          if (user) {
            // 4. Insert into the database
            const { error } = await supabase.from('entries').insert({
              title,
              slug,
              content: sanitizedHtml,
              type: 'page',
              user_id: user.id,
              status: 'draft' // Default to draft
            });

            if (error) {
              // Handle error (e.g., display a toast notification)
            } else {
              // Handle success (e.g., clear form, show success message)
            }
          }
        };
        ```

  * **Step 3: Build the Main Page Public Preview Grid**

      * On the homepage (`/`), fetch and display all entries where `status = 'published'`.
      * Render each entry in a card. Use a secure, sandboxed `<iframe>` to show a mini-preview of the HTML content. This prevents any potentially malicious (though sanitized) CSS or JS from affecting your main site's layout or security.

-----

#### **Phase 3: Public Rendering via Subdomains**

**Goal:** Make published content available to the world on clean, unique URLs.

  * **Step 1: Vercel & DNS Configuration**

      * In Vercel, navigate to your project's **Settings \> Domains**.
      * Add your custom domain (e.g., `your-site.com`).
      * Add a second entry for the wildcard: `*.your-site.com`. Vercel will provide instructions for updating your DNS records (usually a CNAME or A record). *Note: DNS changes can take time to propagate.*

  * **Step 2: Local Development Setup (Optional but Recommended)**

      * To test subdomains locally, edit your computer's `hosts` file.
          * On macOS/Linux: `sudo nano /etc/hosts`
          * On Windows: `C:\Windows\System32\drivers\etc\hosts`
      * Add entries that point test subdomains to your local machine:
        ```
        127.0.0.1  my-first-article.localhost
        127.0.0.1  another-test.localhost
        ```
      * You can now access your running dev server at `http://my-first-article.localhost:3000`.

  * **Step 3: The Next.js Subdomain Catcher Route**

      * Implement the catch-all route handler (`/app/page.tsx` or similar) as described in the initial plan.
      * **Defense-in-Depth:** Although the HTML is sanitized on input, re-sanitize it on the backend before rendering as an added layer of security. This protects against any data that might have been inserted into the database through other means.
        ```tsx
        // Inside the SubdomainPage component, after fetching the page
        import DOMPurify from 'isomorphic-dompurify'; // Use isomorphic version on server

        // ... fetch page data
        if (!page) { notFound(); }

        const serverSanitizedHtml = DOMPurify.sanitize(page.content);

        return <div dangerouslySetInnerHTML={{ __html: serverSanitizedHtml }} />;
        ```

  * **Step 4: Implement Status Toggling**

      * In the `/dashboard`, next to each of the user's entries, add a "Publish" / "Unpublish" button.
      * This button triggers a Supabase `update` call to toggle the `status` column between `'draft'` and `'published'`.

-----

#### **Phase 4: Community Features & Scalability**

**Goal:** Add interactivity with a voting system and prepare the architecture for new benchmark types.

  * **Step 1: Voting Logic (Authenticated Action)**

      * On the public preview grid, display a "Like" button (e.g., a heart icon) on each entry. This button should be disabled or hidden if the user is not logged in.
      * **Frontend Logic:**
          * On click, call a server function or directly use the Supabase client to `insert` into the `votes` table.
          * Use the `UNIQUE` constraint to your advantage. The insert will succeed if it's a new vote or fail if it's a duplicate.
          * To implement "unlike," you would first attempt the `insert`. If it fails, you then run a `delete` from the `votes` table where `user_id` and `entry_id` match.

  * **Step 2: Efficient Vote Counting with a Postgres Function (RPC)**

      * Querying `count(*)` repeatedly can be inefficient. A better approach is to create a function in the Supabase SQL Editor.
        ```sql
        CREATE OR REPLACE FUNCTION get_vote_count(entry_id_param UUID)
        RETURNS INT AS $$
        BEGIN
          RETURN (SELECT COUNT(*) FROM votes WHERE entry_id = entry_id_param);
        END;
        $$ LANGUAGE plpgsql;
        ```
      * You can now call this function efficiently from your frontend:
        ```javascript
        const { data, error } = await supabase.rpc('get_vote_count', { entry_id_param: entry.id });
        ```

  * **Step 3: Architecting for Future Benchmark Types**

      * The `type` column in your `entries` table is the key. When you're ready to add a `'codegen'` benchmark:
        1.  **New Uploader:** Create a new component for submitting a prompt and other relevant data.
        2.  **Adapt Storage:** The `content` column could store a JSON object `{ "prompt": "...", "llm_output": "...", "verdict": "pass" }`.
        3.  **New Previewer:** Create a new component to display this structured data differently from an HTML page.
        4.  **Conditional Rendering:** Your application will use the `entry.type` field to decide which preview component to render in the grid and which full-page view to use.