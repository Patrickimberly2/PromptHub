# PromptHub Deployment Guide

This guide walks you through deploying PromptHub to production using Vercel and Supabase.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Phase 1: Code & Data Preparation](#phase-1-code--data-preparation)
3. [Phase 2: Vercel Deployment](#phase-2-vercel-deployment)
4. [Phase 3: Domain Configuration](#phase-3-domain-configuration)
5. [Phase 4: Verification](#phase-4-verification)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Before starting, ensure you have:

- ✅ Supabase account with a project created
- ✅ Vercel account (free tier works)
- ✅ GitHub account
- ✅ Custom domain (e.g., from Namecheap)
- ✅ All prompt data imported into Supabase

---

## Phase 1: Code & Data Preparation

### Step 1.1: Set Up Supabase Database

1. **Log into Supabase Dashboard**
   - Navigate to https://supabase.com/dashboard
   - Select your project or create a new one

2. **Create Database Schema**
   - Go to SQL Editor in the Supabase Dashboard
   - Open the `supabase_schema.sql` file from this repository
   - Copy and paste the entire SQL script
   - Click "Run" to execute
   - Verify the `prompts` table was created in the Table Editor

3. **Import Prompt Data**

   **Option A: Using Supabase Dashboard (Recommended for <10,000 prompts)**

   ```bash
   # First, generate the CSV from your Notion export
   python notion_to_csv.py /path/to/notion/export
   ```

   - Go to Table Editor → `prompts` table
   - Click "Insert" → "Import data from CSV"
   - Upload `prompts.csv`
   - Verify import in Table Editor

   **Option B: Using psql (Recommended for 50,000+ prompts)**

   ```bash
   # Get your direct database connection string from Supabase:
   # Settings → Database → Connection string (Direct connection)

   # Use psql to import
   psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres" \
     -c "\copy prompts (title, content, category, tags, created_at) FROM 'prompts.csv' WITH (FORMAT csv, HEADER true);"
   ```

   **Option C: Using Supabase CLI (Advanced)**

   ```bash
   # Install Supabase CLI
   npm install -g supabase

   # Login
   supabase login

   # Link to your project
   supabase link --project-ref [YOUR-PROJECT-REF]

   # Run migration with data
   supabase db push
   ```

4. **Verify Data Import**

   Run this SQL in the Supabase SQL Editor:

   ```sql
   -- Check total count
   SELECT COUNT(*) FROM prompts;

   -- Check sample records
   SELECT id, title, category, array_length(tags, 1) as tag_count
   FROM prompts
   LIMIT 10;

   -- Check categories distribution
   SELECT category, COUNT(*) as count
   FROM prompts
   GROUP BY category
   ORDER BY count DESC;
   ```

### Step 1.2: Prepare Code for Deployment

1. **Configure Environment Variables Locally**

   ```bash
   # Copy the example env file
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://[YOUR-PROJECT-REF].supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

   Find these values in Supabase Dashboard:
   - Settings → API → Project URL
   - Settings → API → Project API keys → `anon` `public`

2. **Test Locally**

   ```bash
   # Install dependencies
   npm install

   # Run development server
   npm run dev
   ```

   - Open http://localhost:3000
   - Verify prompts load correctly
   - Test search functionality
   - Check that stats display properly

3. **Create GitHub Repository**

   ```bash
   # Initialize git if not already done
   git init

   # Add all files
   git add .

   # Commit
   git commit -m "Initial commit: PromptHub with Supabase integration"

   # Create new repo on GitHub (make it public)
   # Then add remote and push
   git remote add origin https://github.com/YOUR_USERNAME/prompthub.git
   git branch -M main
   git push -u origin main
   ```

---

## Phase 2: Vercel Deployment

### Step 2.1: Import Project to Vercel

1. **Log into Vercel**
   - Go to https://vercel.com
   - Sign in with your GitHub account

2. **Import Repository**
   - Click "Add New..." → "Project"
   - Select your GitHub repository (`prompthub`)
   - Click "Import"

3. **Configure Project**

   Vercel should auto-detect Next.js. Verify these settings:

   - **Framework Preset**: Next.js
   - **Build Command**: `next build`
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install`

### Step 2.2: Configure Environment Variables

In the Vercel project configuration, add these environment variables:

| Key | Value | Environment |
|-----|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://[YOUR-PROJECT-REF].supabase.co` | Production, Preview |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Production, Preview |
| `NEXT_PUBLIC_SITE_URL` | `https://promptvault.com` (your domain) | Production |
| `NEXT_PUBLIC_SITE_URL` | (leave empty for preview) | Preview |

**Important Notes:**
- Copy these EXACTLY from your Supabase Dashboard
- DO NOT use quotes around the values
- Make sure there are no trailing spaces

### Step 2.3: Deploy

1. Click "Deploy"
2. Wait for build to complete (2-5 minutes)
3. Once deployed, you'll get a URL like: `https://prompthub-abc123.vercel.app`

### Step 2.4: Verify Deployment

1. **Open the Vercel deployment URL**

   Click "Visit" in the Vercel dashboard

2. **Check the following:**
   - ✅ Page loads without errors
   - ✅ Prompts are displayed
   - ✅ Search functionality works
   - ✅ Stats show correct numbers
   - ✅ No console errors in DevTools

3. **Verify API Endpoints**

   Test these URLs in your browser:

   ```
   https://your-app.vercel.app/api/prompts
   https://your-app.vercel.app/api/stats
   ```

   Both should return JSON data.

4. **Check DevTools Network Tab**

   - Open DevTools (F12)
   - Go to Network tab
   - Reload the page
   - Verify that:
     - API calls to `/api/prompts` return 200 status
     - Response contains your prompt data
     - No 500 errors or failed requests

---

## Phase 3: Domain Configuration

### Step 3.1: Add Domain in Vercel

1. **Navigate to Domains**
   - In Vercel dashboard, go to your project
   - Click "Settings" → "Domains"

2. **Add Your Domain**
   - Enter your domain: `promptvault.com`
   - Click "Add"
   - Also add `www.promptvault.com` if desired

3. **Get DNS Records**

   Vercel will provide DNS records. They'll look something like:

   **For apex domain (promptvault.com):**
   ```
   Type: A
   Name: @
   Value: 76.76.21.21
   ```

   **For www subdomain:**
   ```
   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```

   **Note:** Keep this page open for reference!

### Step 3.2: Configure Namecheap DNS

1. **Log into Namecheap**
   - Go to https://www.namecheap.com
   - Navigate to Domain List
   - Click "Manage" next to your domain

2. **Remove Old DNS Records**

   - Go to "Advanced DNS" tab
   - **Important:** Delete any conflicting records:
     - Old A records pointing to Hostinger
     - Old CNAME records for `@` or `www`
     - Any URL Redirect Records

   Keep only these if present:
   - Email-related records (MX, TXT for email)
   - Any other services you need

3. **Add New Vercel DNS Records**

   Click "Add New Record" for each:

   **A Record (for root domain):**
   ```
   Type: A Record
   Host: @
   Value: 76.76.21.21  (use the IP Vercel provided)
   TTL: Automatic
   ```

   **CNAME Record (for www):**
   ```
   Type: CNAME Record
   Host: www
   Value: cname.vercel-dns.com  (use the value Vercel provided)
   TTL: Automatic
   ```

4. **Save All Changes**
   - Click the green checkmark to save each record
   - Verify both records are listed under "Host Records"

### Step 3.3: Wait for DNS Propagation

DNS changes can take time to propagate:

- **Minimum**: 5-10 minutes
- **Typical**: 30-60 minutes
- **Maximum**: 24-48 hours (rare)

**Check propagation status:**

```bash
# Check A record
dig promptvault.com

# Check CNAME record
dig www.promptvault.com

# Or use online tools
# https://www.whatsmydns.net
```

---

## Phase 4: Verification

### Step 4.1: Verify Domain Access

Once DNS has propagated, verify your domain works:

1. **Browser Test**
   - Open `https://promptvault.com` in your browser
   - Verify the site loads
   - Check for SSL certificate (padlock icon)

2. **CLI Verification**

   ```bash
   # Test HTTP headers
   curl -I https://promptvault.com
   ```

   **Expected output:**
   ```
   HTTP/2 200
   server: Vercel
   content-type: text/html; charset=utf-8
   x-vercel-id: ...
   ```

   **Required for submission:** Take a screenshot of this output OR save the output to a file:

   ```bash
   curl -I https://promptvault.com > domain_verification.txt
   ```

3. **Full Response Test**

   ```bash
   # Get full page
   curl https://promptvault.com
   ```

   Should return HTML content with "PromptHub" in the title.

### Step 4.2: Verify All Functionality

Create a verification checklist:

- [ ] Domain loads at `https://promptvault.com`
- [ ] SSL certificate is valid (green padlock)
- [ ] Home page displays prompt count
- [ ] Search returns results
- [ ] Category filtering works
- [ ] Individual prompts display correctly
- [ ] No console errors in DevTools
- [ ] API endpoints respond correctly
- [ ] Mobile view looks good
- [ ] Page load time is acceptable (<3 seconds)

### Step 4.3: Monitor and Validate

1. **Check Vercel Analytics**
   - Go to Vercel Dashboard → Your Project → Analytics
   - Monitor traffic and performance

2. **Check Supabase Logs**
   - Go to Supabase Dashboard → Logs
   - Monitor database queries
   - Check for any errors

3. **Test from Different Locations**
   - Use different networks (WiFi, mobile data)
   - Test from different countries (use VPN)
   - Verify consistent performance

---

## Troubleshooting

### Issue: "Module not found" error during build

**Solution:**
```bash
# Ensure all dependencies are in package.json
npm install
npm run build  # Test locally first

# If still failing, check import paths
# Use relative imports: './lib/db.js' not 'lib/db.js'
```

### Issue: Environment variables not working

**Solution:**
1. Check they start with `NEXT_PUBLIC_` for client-side access
2. Redeploy after adding variables
3. Clear Vercel cache: Settings → General → Clear Cache & Redeploy

### Issue: DNS not propagating

**Solution:**
```bash
# Check nameservers
dig NS promptvault.com

# Ensure Namecheap nameservers are active:
# dns1.registrar-servers.com
# dns2.registrar-servers.com

# If using custom nameservers, switch back to Namecheap default
```

### Issue: SSL certificate error

**Solution:**
- Wait for Vercel to provision SSL (can take 24 hours)
- Ensure DNS is correctly configured
- Check Vercel Domains tab for status

### Issue: Prompts not loading from Supabase

**Solution:**
1. Check RLS policies in Supabase:
   ```sql
   -- Ensure public read access is enabled
   SELECT * FROM pg_policies WHERE tablename = 'prompts';
   ```

2. Verify API keys are correct in Vercel environment variables

3. Check Supabase logs for connection errors

### Issue: Build succeeds but page shows 500 error

**Solution:**
1. Check Vercel Function Logs:
   - Vercel Dashboard → Your Project → Functions
   - Look for error messages

2. Common causes:
   - Invalid Supabase credentials
   - Database connection timeout
   - Missing environment variables

---

## Post-Deployment Checklist

After successful deployment:

- [ ] Update `NEXT_PUBLIC_SITE_URL` in production environment
- [ ] Set up Vercel Analytics (optional)
- [ ] Configure custom error pages (optional)
- [ ] Set up monitoring alerts (Vercel + Supabase)
- [ ] Back up your Supabase database regularly
- [ ] Document any custom configuration
- [ ] Update README with production URL
- [ ] Test mobile responsiveness
- [ ] Run Lighthouse audit for performance
- [ ] Set up uptime monitoring (UptimeRobot, etc.)

---

## Verification Output Format

When submitting verification, provide **one** of the following:

### Option 1: Screenshot
- Take a screenshot of `curl -I https://promptvault.com` output
- Ensure the HTTP status code is visible (200 OK)
- Include timestamp if possible

### Option 2: CLI Output
Save the output to a file:
```bash
curl -I https://promptvault.com > domain_verification.txt
```

The file should contain headers like:
```
HTTP/2 200
server: Vercel
date: [timestamp]
content-type: text/html; charset=utf-8
...
```

---

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
- [Supabase Documentation](https://supabase.com/docs)
- [Namecheap DNS Guide](https://www.namecheap.com/support/knowledgebase/article.aspx/319/2237/how-can-i-set-up-an-a-address-record-for-my-domain/)

---

## Support

If you encounter issues:

1. Check the [Troubleshooting](#troubleshooting) section
2. Review Vercel deployment logs
3. Check Supabase database logs
4. Verify environment variables
5. Test locally with production environment variables

---

**Last Updated:** 2024-11-18
**Version:** 1.0.0
