#!/usr/bin/env node

/**
 * Notion Database Extractor
 *
 * This script extracts data from a Notion database and saves it as JSON.
 *
 * Usage:
 *   node scripts/notion-extractor.js <database_id> [output_file]
 *
 * Environment Variables:
 *   NOTION_API_KEY - Your Notion integration token (required)
 *
 * Example:
 *   NOTION_API_KEY=secret_xxx node scripts/notion-extractor.js 2b0a3b31e44781338582c0e971f21019
 */

const { Client } = require('@notionhq/client');
const fs = require('fs');
const path = require('path');

// Get command line arguments
const args = process.argv.slice(2);
const databaseId = args[0];
const outputFile = args[1] || 'notion-data.json';

// Validate inputs
if (!databaseId) {
  console.error('Error: Database ID is required');
  console.log('Usage: node scripts/notion-extractor.js <database_id> [output_file]');
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
 * Extract text from Notion rich text objects
 */
function extractText(richText) {
  if (!richText || !Array.isArray(richText)) return '';
  return richText.map(text => text.plain_text).join('');
}

/**
 * Parse Notion property value based on type
 */
function parseProperty(property) {
  if (!property) return null;

  switch (property.type) {
    case 'title':
      return extractText(property.title);

    case 'rich_text':
      return extractText(property.rich_text);

    case 'number':
      return property.number;

    case 'select':
      return property.select ? property.select.name : null;

    case 'multi_select':
      return property.multi_select ? property.multi_select.map(s => s.name) : [];

    case 'date':
      if (!property.date) return null;
      return {
        start: property.date.start,
        end: property.date.end,
        timezone: property.date.time_zone
      };

    case 'people':
      return property.people ? property.people.map(p => ({
        id: p.id,
        name: p.name,
        email: p.person?.email
      })) : [];

    case 'files':
      return property.files ? property.files.map(f => ({
        name: f.name,
        url: f.file?.url || f.external?.url
      })) : [];

    case 'checkbox':
      return property.checkbox;

    case 'url':
      return property.url;

    case 'email':
      return property.email;

    case 'phone_number':
      return property.phone_number;

    case 'formula':
      return parseProperty({ type: property.formula.type, ...property.formula });

    case 'relation':
      return property.relation ? property.relation.map(r => r.id) : [];

    case 'rollup':
      return property.rollup;

    case 'created_time':
      return property.created_time;

    case 'created_by':
      return {
        id: property.created_by.id,
        name: property.created_by.name
      };

    case 'last_edited_time':
      return property.last_edited_time;

    case 'last_edited_by':
      return {
        id: property.last_edited_by.id,
        name: property.last_edited_by.name
      };

    case 'status':
      return property.status ? property.status.name : null;

    default:
      return property;
  }
}

/**
 * Fetch all pages from a Notion database with pagination
 */
async function fetchDatabasePages(databaseId) {
  let allPages = [];
  let hasMore = true;
  let startCursor = undefined;

  console.log('Fetching database pages...');

  while (hasMore) {
    const response = await notion.databases.query({
      database_id: databaseId,
      start_cursor: startCursor,
    });

    allPages = allPages.concat(response.results);
    hasMore = response.has_more;
    startCursor = response.next_cursor;

    console.log(`Fetched ${allPages.length} pages so far...`);
  }

  return allPages;
}

/**
 * Get database schema
 */
async function getDatabaseSchema(databaseId) {
  console.log('Fetching database schema...');
  const database = await notion.databases.retrieve({ database_id: databaseId });
  return database;
}

/**
 * Process pages and extract data
 */
function processPages(pages) {
  return pages.map(page => {
    const properties = {};

    // Extract all properties
    for (const [key, value] of Object.entries(page.properties)) {
      properties[key] = parseProperty(value);
    }

    return {
      id: page.id,
      created_time: page.created_time,
      last_edited_time: page.last_edited_time,
      url: page.url,
      properties
    };
  });
}

/**
 * Main execution function
 */
async function main() {
  try {
    console.log('Starting Notion database extraction...');
    console.log(`Database ID: ${databaseId}`);
    console.log('');

    // Get database schema
    const schema = await getDatabaseSchema(databaseId);
    console.log(`Database: ${extractText(schema.title)}`);
    console.log('');

    // Fetch all pages
    const pages = await fetchDatabasePages(databaseId);
    console.log(`Total pages fetched: ${pages.length}`);
    console.log('');

    // Process pages
    console.log('Processing pages...');
    const processedData = processPages(pages);

    // Prepare output
    const output = {
      database: {
        id: schema.id,
        title: extractText(schema.title),
        created_time: schema.created_time,
        last_edited_time: schema.last_edited_time,
        url: schema.url,
        properties: schema.properties
      },
      pages: processedData,
      metadata: {
        extracted_at: new Date().toISOString(),
        total_pages: processedData.length
      }
    };

    // Save to file
    const outputPath = path.resolve(outputFile);
    fs.writeFileSync(outputPath, JSON.stringify(output, null, 2));

    console.log('✓ Extraction complete!');
    console.log(`✓ Data saved to: ${outputPath}`);
    console.log(`✓ Total entries: ${processedData.length}`);

  } catch (error) {
    console.error('Error extracting Notion data:');
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
