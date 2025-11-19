# PromptHub - AI Prompt Organizer

A powerful Next.js 14 application for organizing and searching through 50,000+ AI prompts, powered by Supabase and PostgreSQL full-text search.

![Next.js](https://img.shields.io/badge/Next.js-14.0-black)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)
![License](https://img.shields.io/badge/license-MIT-blue)

---

## ✨ Features

- **🔍 Full-Text Search**: Lightning-fast search through 50,000+ prompts using PostgreSQL GIN indexes
- **📁 Category Filtering**: Organize prompts by categories (Writing, Development, Marketing, etc.)
- **🏷️ Tag System**: Multi-tag filtering with PostgreSQL array support
- **📊 Analytics Dashboard**: Real-time statistics on prompts, categories, and tags
- **⚡ Performance**: Built with Next.js 14 App Router for optimal performance
- **🌐 Production Ready**: Deployed on Vercel with Supabase backend
- **🔄 Bulk Import**: Python script for importing Notion Markdown exports
- **📱 Responsive**: Works seamlessly on desktop and mobile devices

---

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- Python 3.8+ (for data import)
- Supabase account
- Notion export (optional, for importing your own prompts)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/prompthub.git
   cd prompthub
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.local.example .env.local
   ```

   Edit `.env.local` and add your Supabase credentials:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

4. **Set up the database**

   - Go to your Supabase Dashboard
   - Open SQL Editor
   - Run the contents of `supabase_schema.sql`

5. **Import your prompts (optional)**

   ```bash
   # Generate CSV from Notion export
   python notion_to_csv.py /path/to/notion/export

   # Import into Supabase using the dashboard or psql
   ```

6. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📁 Project Structure

```
prompthub/
├── app/
│   ├── api/
│   │   ├── prompts/
│   │   │   └── route.js          # Prompts API endpoint
│   │   └── stats/
│   │       └── route.js          # Statistics API endpoint
│   ├── layout.js                 # Root layout
│   ├── page.js                   # Home page
│   └── globals.css               # Global styles
├── components/
│   ├── SearchBar.js              # Search component
│   ├── PromptList.js             # Prompt display component
│   └── Stats.js                  # Statistics component
├── lib/
│   ├── db.js                     # Supabase client configuration
│   └── queries.js                # Database query functions
├── public/                       # Static assets
├── notion_to_csv.py              # Notion import script
├── supabase_schema.sql           # Database schema
├── package.json                  # Node dependencies
├── next.config.js                # Next.js configuration
├── DEPLOYMENT.md                 # Deployment guide
└── README.md                     # This file
```

---

## 🗃️ Database Schema

```sql
CREATE TABLE prompts (
  id SERIAL PRIMARY KEY,
  title TEXT,
  content TEXT,
  category TEXT,
  tags TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Full-text search index
CREATE INDEX prompts_content_fts ON prompts
  USING GIN (to_tsvector('english', content));

-- Additional indexes for performance
CREATE INDEX prompts_category_idx ON prompts (category);
CREATE INDEX prompts_tags_idx ON prompts USING GIN (tags);
```

---

## 🔌 API Reference

### GET /api/prompts

Search and retrieve prompts.

**Query Parameters:**

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `query` | string | Search query (searches title and content) | `""` |
| `category` | string | Filter by category | `null` |
| `tags` | string | Comma-separated list of tags | `[]` |
| `limit` | number | Maximum results to return | `50` |
| `offset` | number | Pagination offset | `0` |

**Example Request:**

```bash
curl "https://prompthub.vercel.app/api/prompts?query=email&category=Writing&limit=10"
```

**Example Response:**

```json
{
  "prompts": [
    {
      "id": 1,
      "title": "Professional Email Template",
      "content": "Write a professional email about...",
      "category": "Writing",
      "tags": ["email", "business"],
      "created_at": "2024-06-15T12:00:00Z"
    }
  ],
  "count": 1,
  "query": {
    "query": "email",
    "category": "Writing",
    "tags": [],
    "limit": 10,
    "offset": 0
  }
}
```

### GET /api/stats

Get database statistics.

**Example Request:**

```bash
curl "https://prompthub.vercel.app/api/stats"
```

**Example Response:**

```json
{
  "total": 50247,
  "categories": 42,
  "tags": 387,
  "categoriesList": ["Writing", "Development", "Marketing", ...],
  "tagsList": ["email", "code", "copywriting", ...]
}
```

---

## 📥 Importing Data from Notion

The included Python script converts Notion Markdown exports to CSV format for bulk import.

### Usage

1. **Export from Notion**
   - In Notion, go to Settings & Members → Export all workspace content
   - Choose Markdown & CSV format
   - Download and extract the ZIP file

2. **Run the conversion script**

   ```bash
   python notion_to_csv.py /path/to/notion/export
   ```

   This creates `prompts.csv` in the current directory.

3. **Import to Supabase**

   **Option A: Supabase Dashboard**
   - Table Editor → prompts → Insert → Import CSV
   - Upload `prompts.csv`

   **Option B: psql (for large datasets)**
   ```bash
   psql "your-supabase-connection-string" \
     -c "\copy prompts (title, content, category, tags, created_at) \
         FROM 'prompts.csv' WITH (FORMAT csv, HEADER true);"
   ```

### Script Features

- ✅ Extracts title from filename
- ✅ Assigns category from parent directory
- ✅ Parses YAML frontmatter for tags
- ✅ Uses file modification time for timestamps
- ✅ Cleans Notion-specific artifacts
- ✅ Logs errors to `import_errors.log`
- ✅ Formats tags as PostgreSQL arrays

### CSV Output Format

```csv
title,content,category,tags,created_at
"Email Template","Write a professional email...","Writing",{"email","business"},2024-06-15T12:00:00Z
"Code Review","Review the following code...","Development",{"code","review"},2024-06-12T09:30:00Z
```

---

## 🚢 Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for comprehensive deployment instructions covering:

1. **Supabase Setup**: Database creation and data import
2. **Vercel Deployment**: Automatic deployments from GitHub
3. **Domain Configuration**: Custom domain setup with Namecheap DNS
4. **Verification**: Testing and monitoring

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/prompthub)

**Required Environment Variables:**

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_SITE_URL`

---

## 🧪 Development

### Running Tests

```bash
# Run linter
npm run lint

# Type checking (if using TypeScript)
npm run type-check

# Build for production
npm run build
```

### Local Development with Production Data

To test with production Supabase data locally:

1. Update `.env.local` with production Supabase credentials
2. Ensure RLS policies allow read access
3. Run `npm run dev`

**Warning:** Never commit production credentials to Git!

---

## 🛠️ Built With

- **[Next.js 14](https://nextjs.org/)** - React framework with App Router
- **[Supabase](https://supabase.com/)** - PostgreSQL database and backend
- **[PostgreSQL](https://www.postgresql.org/)** - Full-text search with GIN indexes
- **[Vercel](https://vercel.com/)** - Deployment and hosting
- **[Python 3](https://www.python.org/)** - Data processing scripts

---

## 📊 Performance

- **Search Speed**: <100ms for full-text queries across 50,000+ prompts
- **Page Load**: <2s first load, <500ms subsequent loads
- **Database**: Optimized with GIN indexes for text search and arrays
- **Caching**: Leverages Next.js automatic caching and Vercel Edge Network

---

## 🔒 Security

- **Row Level Security (RLS)**: Enabled on Supabase tables
- **Environment Variables**: Sensitive data stored in environment variables
- **HTTPS**: Enforced via Vercel automatic SSL
- **Input Validation**: Server-side validation on API routes
- **Rate Limiting**: Configured through Vercel and Supabase

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Notion for excellent export functionality
- Supabase team for amazing PostgreSQL tooling
- Vercel for seamless Next.js deployment
- Next.js team for the App Router architecture

---

## 📞 Support

- **Documentation**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Issues**: [GitHub Issues](https://github.com/yourusername/prompthub/issues)
- **Discussions**: [GitHub Discussions](https://github.com/yourusername/prompthub/discussions)

---

## 🗺️ Roadmap

- [ ] Advanced filtering (date ranges, custom fields)
- [ ] User authentication and private prompts
- [ ] Prompt collections and favorites
- [ ] Export functionality
- [ ] API rate limiting and usage tracking
- [ ] Prompt versioning and history
- [ ] Collaborative features
- [ ] Chrome extension for quick access

---

**Made with ❤️ by the PromptHub Team**
