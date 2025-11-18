import { NextResponse } from 'next/server';
import { searchPrompts } from '../../../lib/queries.js';

/**
 * GET /api/prompts
 *
 * Search and retrieve prompts with optional filtering
 *
 * Query Parameters:
 *   - query: Search query string (optional)
 *   - category: Filter by category (optional)
 *   - tags: Comma-separated list of tags (optional)
 *   - limit: Maximum results to return (default: 50)
 *   - offset: Pagination offset (default: 0)
 *
 * Returns:
 *   JSON object with prompts array
 */
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const query = searchParams.get('query') || '';
    const category = searchParams.get('category') || null;
    const tagsParam = searchParams.get('tags');
    const limit = parseInt(searchParams.get('limit') || '50', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Parse tags from comma-separated string
    const tags = tagsParam
      ? tagsParam.split(',').map(tag => tag.trim()).filter(Boolean)
      : [];

    // Search prompts using Supabase
    const prompts = await searchPrompts({
      query,
      category,
      tags,
      limit,
      offset
    });

    return NextResponse.json({
      prompts,
      count: prompts.length,
      query: {
        query,
        category,
        tags,
        limit,
        offset
      }
    });

  } catch (error) {
    console.error('Error in /api/prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts', prompts: [] },
      { status: 500 }
    );
  }
}
