/**
 * Database Query Functions
 *
 * This module provides functions for querying prompts from Supabase.
 * Refactored from pg pool to use @supabase/supabase-js client.
 */

import { supabase } from './db.js';

/**
 * Search prompts with full-text search and filtering
 *
 * @param {Object} params - Search parameters
 * @param {string} params.query - Search query string (searches title and content)
 * @param {string} params.category - Filter by category (optional)
 * @param {string[]} params.tags - Filter by tags (optional)
 * @param {number} params.limit - Maximum number of results (default: 50)
 * @param {number} params.offset - Offset for pagination (default: 0)
 * @returns {Promise<Array>} Array of matching prompts
 */
export async function searchPrompts({
  query = '',
  category = null,
  tags = [],
  limit = 50,
  offset = 0
} = {}) {
  try {
    // Start building the query
    let dbQuery = supabase
      .from('prompts')
      .select('*')
      .order('created_at', { ascending: false });

    // Apply full-text search if query is provided
    if (query && query.trim() !== '') {
      // Use textSearch for full-text search on content column
      // Also search title using ilike for broader matching
      dbQuery = dbQuery.or(
        `content.fts.${query.trim()},title.ilike.%${query.trim()}%`
      );
    }

    // Filter by category if provided
    if (category && category.trim() !== '') {
      dbQuery = dbQuery.eq('category', category.trim());
    }

    // Filter by tags if provided (PostgreSQL array contains)
    if (tags && tags.length > 0) {
      dbQuery = dbQuery.contains('tags', tags);
    }

    // Apply pagination
    dbQuery = dbQuery.range(offset, offset + limit - 1);

    // Execute query
    const { data, error } = await dbQuery;

    if (error) {
      console.error('Error searching prompts:', error);
      return [];
    }

    return data || [];
  } catch (err) {
    console.error('Unexpected error in searchPrompts:', err);
    return [];
  }
}

/**
 * Get a single prompt by ID
 *
 * @param {number} id - Prompt ID
 * @returns {Promise<Object|null>} Prompt object or null if not found
 */
export async function getPromptById(id) {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching prompt:', error);
      return null;
    }

    return data;
  } catch (err) {
    console.error('Unexpected error in getPromptById:', err);
    return null;
  }
}

/**
 * Get all unique categories
 *
 * @returns {Promise<Array>} Array of category names
 */
export async function getCategories() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('category')
      .not('category', 'is', null);

    if (error) {
      console.error('Error fetching categories:', error);
      return [];
    }

    // Extract unique categories
    const uniqueCategories = [...new Set(data.map(item => item.category))];
    return uniqueCategories.sort();
  } catch (err) {
    console.error('Unexpected error in getCategories:', err);
    return [];
  }
}

/**
 * Get all unique tags
 *
 * @returns {Promise<Array>} Array of tag names
 */
export async function getTags() {
  try {
    const { data, error } = await supabase
      .from('prompts')
      .select('tags')
      .not('tags', 'is', null);

    if (error) {
      console.error('Error fetching tags:', error);
      return [];
    }

    // Flatten and get unique tags
    const allTags = data.flatMap(item => item.tags || []);
    const uniqueTags = [...new Set(allTags)];
    return uniqueTags.sort();
  } catch (err) {
    console.error('Unexpected error in getTags:', err);
    return [];
  }
}

/**
 * Get total count of prompts
 *
 * @returns {Promise<number>} Total number of prompts
 */
export async function getPromptCount() {
  try {
    const { count, error } = await supabase
      .from('prompts')
      .select('*', { count: 'exact', head: true });

    if (error) {
      console.error('Error getting prompt count:', error);
      return 0;
    }

    return count || 0;
  } catch (err) {
    console.error('Unexpected error in getPromptCount:', err);
    return 0;
  }
}
