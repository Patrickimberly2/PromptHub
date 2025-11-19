# PromptHub Quick Start Guide

Get your PromptHub instance up and running in 15 minutes.

---

## Step 1: Set Up Supabase (5 minutes)

### 1.1 Create a Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in:
   - **Name**: PromptHub
   - **Database Password**: (save this securely!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: Free tier is fine for testing
5. Click "Create new project"
6. Wait 2-3 minutes for setup to complete

### 1.2 Create the Database Schema

1. In your Supabase dashboard, click **SQL Editor** (left sidebar)
2. Click "New query"
3. Copy the entire contents of `supabase_schema.sql` from this repo
4. Paste into the SQL editor
5. Click **Run** (or press Ctrl+Enter)
6. Verify success: Go to **Table Editor** → you should see the `prompts` table

### 1.3 Get Your API Credentials

1. Click **Settings** (gear icon in left sidebar)
2. Click **API**
3. Copy these two values (you'll need them in Step 2):
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGc...` (long string)

---

## Step 2: Local Development Setup (5 minutes)

### 2.1 Clone and Install

```bash
# Clone the repository
git clone https://github.com/yourusername/prompthub.git
cd prompthub

# Install dependencies
npm install
```

### 2.2 Configure Environment Variables

```bash
# Copy the example environment file
cp .env.local.example .env.local
```

Edit `.env.local` with your favorite text editor:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...your-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Replace:**
- `https://xxxxx.supabase.co` with your Project URL from Step 1.3
- `eyJhbGc...your-key-here` with your anon public key from Step 1.3

### 2.3 Start the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

You should see the PromptHub interface (with 0 prompts for now).

---

## Step 3: Import Sample Data (5 minutes)

### Option A: Add Sample Prompts via SQL (Quick Test)

1. Go back to Supabase → **SQL Editor**
2. Run this query to add sample data:

```sql
INSERT INTO prompts (title, content, category, tags) VALUES
  (
    'Professional Email Template',
    'Write a professional email to a client about project delays. Be apologetic but confident. Include: 1) Acknowledgment of delay, 2) Explanation, 3) New timeline, 4) Compensation offer',
    'Writing',
    ARRAY['email', 'business', 'professional']
  ),
  (
    'Code Review Checklist',
    'Review the following code for: 1) Security vulnerabilities (SQL injection, XSS), 2) Performance issues, 3) Code style and conventions, 4) Error handling, 5) Test coverage',
    'Development',
    ARRAY['code', 'review', 'quality']
  ),
  (
    'Social Media Post Generator',
    'Create an engaging social media post for [PRODUCT]. Include: 1) Hook (first line), 2) Value proposition, 3) Call to action, 4) Relevant hashtags. Keep it under 280 characters.',
    'Marketing',
    ARRAY['social-media', 'copywriting', 'marketing']
  ),
  (
    'Meeting Summary',
    'Summarize the following meeting notes into: 1) Key decisions made, 2) Action items with owners, 3) Open questions, 4) Next steps. Format as bullet points.',
    'Productivity',
    ARRAY['meetings', 'summary', 'work']
  ),
  (
    'Bug Report Template',
    'Create a detailed bug report including: 1) Steps to reproduce, 2) Expected behavior, 3) Actual behavior, 4) Environment (OS, browser, version), 5) Screenshots/logs, 6) Severity level',
    'Development',
    ARRAY['bug', 'testing', 'qa']
  );
```

3. Go back to [http://localhost:3000](http://localhost:3000)
4. Refresh the page
5. You should see 5 sample prompts!

### Option B: Import from Notion Export (For Your Real Data)

If you have a Notion export:

```bash
# Generate CSV from your Notion export
python notion_to_csv.py /path/to/your/notion/export

# This creates prompts.csv in the current directory
```

**Then import via Supabase Dashboard:**

1. Go to **Table Editor** → `prompts` table
2. Click **Insert** → **Import data from CSV**
3. Upload `prompts.csv`
4. Click **Import**
5. Wait for import to complete
6. Refresh your local app at [http://localhost:3000](http://localhost:3000)

---

## Step 4: Test the Application

### ✅ Verification Checklist

Open [http://localhost:3000](http://localhost:3000) and verify:

- [ ] Stats at the top show the correct prompt count
- [ ] Prompts are displayed in the list
- [ ] Search bar is visible
- [ ] Searching for a keyword (e.g., "email") returns relevant results
- [ ] Category filter works
- [ ] No errors in the browser console (F12 → Console tab)

### 🔍 Test Search Functionality

Try these searches to verify everything works:

1. **Full-text search**: Type "email" → should find the email template
2. **Category filter**: Type "Development" in category → should show code-related prompts
3. **Clear filters**: Click "Clear" → should show all prompts again

---

## Step 5: Next Steps

Now that you have PromptHub running locally:

### 📚 Learn More

- **Add more prompts**: Import your full Notion export or add manually via Supabase
- **Customize UI**: Edit components in `components/` directory
- **Modify queries**: Update search logic in `lib/queries.js`
- **Add features**: Check the [Roadmap](README.md#-roadmap) for ideas

### 🚀 Deploy to Production

When ready to deploy:

1. Read [DEPLOYMENT.md](./DEPLOYMENT.md) for full instructions
2. Push your code to GitHub
3. Deploy to Vercel (free tier available)
4. Configure your custom domain

---

## Common Issues & Solutions

### Issue: "Missing Supabase environment variables"

**Solution:**
- Verify `.env.local` exists and contains correct values
- Ensure no extra spaces in the values
- Restart the dev server (`npm run dev`)

### Issue: "Error fetching prompts"

**Solution:**
- Check that you ran `supabase_schema.sql` successfully
- Verify the `prompts` table exists in Supabase Table Editor
- Check browser console (F12) for specific error messages
- Ensure Row Level Security policy allows public reads

### Issue: "No prompts showing"

**Solution:**
- Verify data was imported successfully in Supabase Table Editor
- Check the stats at the top of the page - does it show 0 total prompts?
- Try running the sample data SQL from Step 3

### Issue: Python script errors

**Solution:**
```bash
# Ensure you have Python 3.8+
python --version

# Run with full error output
python notion_to_csv.py /path/to/export 2>&1 | tee debug.log

# Check import_errors.log for skipped files
cat import_errors.log
```

---

## 🎉 Success!

You now have a working PromptHub instance!

**What's next?**

- ⭐ Star the repo on GitHub
- 📖 Read the full [README.md](./README.md)
- 🚀 Follow [DEPLOYMENT.md](./DEPLOYMENT.md) to deploy to production
- 🤝 Contribute improvements

---

**Questions?** Open an issue on GitHub or check the [Support section](README.md#-support).
