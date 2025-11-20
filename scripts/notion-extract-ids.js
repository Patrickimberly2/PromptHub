#!/usr/bin/env node

/**
 * Notion Database ID Extractor
 *
 * This script extracts just the page IDs from a Notion database.
 *
 * Usage:
 *   node scripts/notion-extract-ids.js <database_id> [output_file]
 *
 * Environment Variables:
 *   NOTION_API_KEY - Your Notion integration token (required)
 *
 * Example:
 *   NOTION_API_KEY=secret_xxx node scripts/notion-extract-ids.js 2b0a3b31e44781338582c0e971f21019
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const databaseId = args[0];
const outputFile = args[1] || 'notion-ids.txt';

// Validate inputs
if (!databaseId) {
  console.error('Error: Database ID is required');
  console.log('Usage: node scripts/notion-extract-ids.js <database_id> [output_file]');
  process.exit(1);
}

const notionApiKey = process.env.NOTION_API_KEY;
if (!notionApiKey) {
  console.error('Error: NOTION_API_KEY environment variable is required');
  console.log('Please set it with: export NOTION_API_KEY=your_api_key');
  process.exit(1);
}

// Initialize Notion client
const notion = new Client({ auth: notionApiKey });

/**
 * Fetch all page IDs from a Notion database with pagination
 */
async function fetchDatabasePageIds(databaseId) {
  let allIds = [];
  let hasMore = true;
  let startCursor = undefined;

  console.log('Fetching page IDs from database...');

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
    });

    // Extract just the IDs (remove hyphens from the ID format)
    const pageIds = response.results.map(page => page.id.replace(/-/g, ''));
    allIds = allIds.concat(pageIds);

    hasMore = response.has_more;
    startCursor = response.next_cursor;

    console.log(`Fetched ${allIds.length} IDs so far...`);
  }

  return allIds;
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting Notion ID extraction...');
    console.log(`Database ID: ${databaseId}`);
    console.log('');

    // Fetch all page IDs
    const pageIds = await fetchDatabasePageIds(databaseId);
    console.log(`Total IDs fetched: ${pageIds.length}`);
    console.log('');

    // Save to file (one ID per line)
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, pageIds.join('\n') + '\n');

    console.log('✓ Extraction complete!');
    console.log(`✓ IDs saved to: ${outputPath}`);
    console.log(`✓ Total IDs: ${pageIds.length}`);
    console.log('');
    console.log('Preview (first 10 IDs):');
    pageIds.slice(0, 10).forEach(id => console.log(id));
    if (pageIds.length > 10) {
      console.log('...');
    }

  } catch (error) {
    console.error('Error extracting Notion IDs:');
    console.error(error.message);

    if (error.code === 'object_not_found') {
      console.error('\nMake sure:');
      console.error('1. The database ID is correct');
      console.error('2. Your Notion integration has access to this database');
    } else if (error.code === 'unauthorized') {
      console.error('\nMake sure your NOTION_API_KEY is valid and has the correct permissions');
    }

    process.exit(1);
  }
}

// Run the script
main();
