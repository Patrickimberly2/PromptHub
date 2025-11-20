# Notion Database Extractor

This script extracts data from a Notion database and saves it as a structured JSON file.

## Prerequisites

1. **Node.js** - Make sure you have Node.js installed
2. **Notion Integration** - You'll need to create a Notion integration and get an API key
3. **Database Access** - Your integration must have access to the database you want to extract

## Setup Instructions

### Step 1: Install Dependencies

```bash
npm install
```

This will install the required `@notionhq/client` package.

### Step 2: Create a Notion Integration

1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Click **"+ New integration"**
3. Give your integration a name (e.g., "PromptHub Extractor")
4. Select the workspace where your database lives
5. Click **"Submit"**
6. Copy the **"Internal Integration Token"** (it starts with `secret_`)

### Step 3: Share Database with Integration

1. Open your Notion database in a browser
2. Click the **"..."** menu in the top right
3. Scroll down and click **"Add connections"**
4. Find and select your integration from the list
5. Click **"Confirm"**

Your integration now has access to the database!

### Step 4: Get Your Database ID

The database ID is in the URL of your Notion database:

```
https://www.notion.so/2b0a3b31e44781338582c0e971f21019?v=2b0a3b31e44781e5bcb7000c2c50cae1
                      ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
                      This is your database ID
```

For the example URL above, the database ID is: `2b0a3b31e44781338582c0e971f21019`

### Step 5: Set Environment Variable

You can set the API key in two ways:

**Option A: Using .env.local file**

1. Copy `.env.local.example` to `.env.local`:
   ```bash
   cp .env.local.example .env.local
   ```

2. Edit `.env.local` and add your Notion API key:
   ```
   NOTION_API_KEY=secret_your_actual_token_here
   ```

3. Load environment variables before running:
   ```bash
   source .env.local
   ```

**Option B: Export directly in terminal**

```bash
export NOTION_API_KEY=secret_your_actual_token_here
```

## Usage

### Option 1: Extract Only Page IDs (Quick)

If you only need the page IDs from your database:

```bash
# Extract to default file (notion-ids.txt)
npm run notion:extract-ids 2b0a3b31e44781338582c0e971f21019

# Or specify custom output file
npm run notion:extract-ids 2b0a3b31e44781338582c0e971f21019 my-ids.txt
```

Or run directly with node:

```bash
node scripts/notion-extract-ids.js 2b0a3b31e44781338582c0e971f21019
```

**Output format:** One ID per line
```
2b0a3b31e44781118514f414e9ee5a60
2b0a3b31e447814fa72efd548f0f5cf5
2b0a3b31e447818fae16d9faec91bc22
...
```

### Option 2: Extract Full Database (Complete)

Extract database and save to default file (`notion-data.json`):

```bash
npm run notion:extract 2b0a3b31e44781338582c0e971f21019
```

Or run directly with node:

```bash
node scripts/notion-extractor.js 2b0a3b31e44781338582c0e971f21019
```

### Custom Output File

Specify a custom output filename:

```bash
npm run notion:extract 2b0a3b31e44781338582c0e971f21019 my-custom-output.json
```

Or with node:

```bash
node scripts/notion-extractor.js 2b0a3b31e44781338582c0e971f21019 output/prompts.json
```

### Complete Example

```bash
# 1. Install dependencies
npm install

# 2. Set your API key
export NOTION_API_KEY=secret_abc123...

# 3. Extract your database
npm run notion:extract 2b0a3b31e44781338582c0e971f21019 prompts-database.json

# Output:
# Starting Notion database extraction...
# Database ID: 2b0a3b31e44781338582c0e971f21019
#
# Database: My Prompts
#
# Fetching database pages...
# Fetched 25 pages so far...
# Total pages fetched: 25
#
# Processing pages...
# ✓ Extraction complete!
# ✓ Data saved to: /path/to/prompts-database.json
# ✓ Total entries: 25
```

## Output Format

The script generates a JSON file with the following structure:

```json
{
  "database": {
    "id": "database-id",
    "title": "Database Name",
    "created_time": "2024-01-01T00:00:00.000Z",
    "last_edited_time": "2024-01-15T00:00:00.000Z",
    "url": "https://www.notion.so/...",
    "properties": {
      "Name": { "type": "title", ... },
      "Status": { "type": "select", ... },
      ...
    }
  },
  "pages": [
    {
      "id": "page-id",
      "created_time": "2024-01-01T00:00:00.000Z",
      "last_edited_time": "2024-01-15T00:00:00.000Z",
      "url": "https://www.notion.so/...",
      "properties": {
        "Name": "Example Entry",
        "Status": "Active",
        "Tags": ["tag1", "tag2"],
        "Date": {
          "start": "2024-01-01",
          "end": null,
          "timezone": null
        },
        ...
      }
    },
    ...
  ],
  "metadata": {
    "extracted_at": "2024-01-15T12:00:00.000Z",
    "total_pages": 25
  }
}
```

## Supported Property Types

The script handles all Notion property types:

- **Title** - Extracted as string
- **Rich Text** - Extracted as string
- **Number** - Extracted as number
- **Select** - Extracted as string
- **Multi-select** - Extracted as array of strings
- **Date** - Extracted as object with start, end, timezone
- **People** - Extracted as array of user objects
- **Files** - Extracted as array with name and URL
- **Checkbox** - Extracted as boolean
- **URL** - Extracted as string
- **Email** - Extracted as string
- **Phone** - Extracted as string
- **Formula** - Extracted based on result type
- **Relation** - Extracted as array of page IDs
- **Rollup** - Extracted as is
- **Created time** - Extracted as ISO string
- **Created by** - Extracted as user object
- **Last edited time** - Extracted as ISO string
- **Last edited by** - Extracted as user object
- **Status** - Extracted as string

## Troubleshooting

### "NOTION_API_KEY environment variable is required"

Make sure you've set the environment variable:
```bash
export NOTION_API_KEY=secret_your_token
```

### "object_not_found" error

This means either:
1. The database ID is incorrect
2. Your integration doesn't have access to the database

**Solution:** Make sure you've shared the database with your integration (see Step 3 above)

### "unauthorized" error

Your API key is invalid or expired.

**Solution:**
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Find your integration
3. Generate a new token if needed
4. Update your `NOTION_API_KEY` environment variable

### Rate Limiting

If you have a very large database (1000+ pages), the script might hit Notion's rate limits. The script will automatically handle pagination, but if you encounter rate limit errors, you may need to add delays between requests.

## Advanced Usage

### Programmatic Use

You can also import and use the extractor in your own scripts:

```javascript
const { Client } = require('@notionhq/client');

const notion = new Client({ auth: process.env.NOTION_API_KEY });

async function extractDatabase(databaseId) {
  // Your custom extraction logic
}
```

### Filtering Results

To filter results, you can modify the script's `fetchDatabasePages` function to include filters:

```javascript
const response = await notion.databases.query({
  database_id: databaseId,
  filter: {
    property: "Status",
    select: {
      equals: "Published"
    }
  },
  start_cursor: startCursor,
});
```

### Sorting Results

Add sorting to the query:

```javascript
const response = await notion.databases.query({
  database_id: databaseId,
  sorts: [
    {
      property: "Created",
      direction: "descending"
    }
  ],
  start_cursor: startCursor,
});
```

## Resources

- [Notion API Documentation](https://developers.notion.com/)
- [Notion SDK for JavaScript](https://github.com/makenotion/notion-sdk-js)
- [Create an Integration](https://www.notion.so/my-integrations)

## License

This script is part of the PromptHub project.
