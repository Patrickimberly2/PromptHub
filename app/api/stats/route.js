import { NextResponse } from 'next/server';
import { getPromptCount, getCategories, getTags } from '../../../lib/queries.js';

/**
 * GET /api/stats
 *
 * Get database statistics (total prompts, categories, tags)
 *
 * Returns:
 *   JSON object with statistics
 */
export async function GET() {
  try {
    // Fetch all stats in parallel
    const [total, categoriesList, tagsList] = await Promise.all([
      getPromptCount(),
      getCategories(),
      getTags()
    ]);

    return NextResponse.json({
      total,
      categories: categoriesList.length,
      tags: tagsList.length,
      categoriesList,
      tagsList
    });

  } catch (error) {
    console.error('Error in /api/stats:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch statistics',
        total: 0,
        categories: 0,
        tags: 0
      },
      { status: 500 }
    );
  }
}
