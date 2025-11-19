#!/usr/bin/env python3
"""
Notion Markdown to CSV Converter for PromptHub
===============================================

This script processes a directory of Notion-exported Markdown files and generates
a CSV file ready for bulk import into Supabase/PostgreSQL.

Features:
- Extracts title from filename
- Assigns category based on parent directory
- Parses YAML frontmatter for tags
- Uses file modification time for created_at
- Logs errors to import_errors.log

Usage:
    python notion_to_csv.py /path/to/notion/export

Output:
    - prompts.csv (in current directory)
    - import_errors.log (if errors occur)
"""

import os
import sys
import csv
import re
from pathlib import Path
from datetime import datetime
import logging

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('import_errors.log'),
        logging.StreamHandler()
    ]
)

logger = logging.getLogger(__name__)


class NotionMarkdownProcessor:
    """Process Notion Markdown files and convert to CSV format."""

    def __init__(self, source_directory, output_csv='prompts.csv'):
        """
        Initialize the processor.

        Args:
            source_directory: Path to directory containing Notion Markdown files
            output_csv: Output CSV filename (default: prompts.csv)
        """
        self.source_directory = Path(source_directory)
        self.output_csv = output_csv
        self.processed_count = 0
        self.error_count = 0

    def extract_frontmatter(self, content):
        """
        Extract YAML frontmatter from Markdown content.

        Args:
            content: Full file content as string

        Returns:
            tuple: (frontmatter_dict, content_without_frontmatter)
        """
        frontmatter_pattern = r'^---\s*\n(.*?)\n---\s*\n'
        match = re.match(frontmatter_pattern, content, re.DOTALL)

        if not match:
            return {}, content

        frontmatter_text = match.group(1)
        content_without_frontmatter = content[match.end():]

        # Simple YAML parser for tags
        frontmatter = {}
        for line in frontmatter_text.split('\n'):
            if ':' in line:
                key, value = line.split(':', 1)
                key = key.strip()
                value = value.strip()

                # Parse tags as array
                if key.lower() == 'tags':
                    # Handle both "tag1, tag2" and "[tag1, tag2]" formats
                    value = value.strip('[]')
                    tags = [tag.strip().strip('"\'') for tag in value.split(',')]
                    frontmatter[key] = [tag for tag in tags if tag]
                else:
                    frontmatter[key] = value

        return frontmatter, content_without_frontmatter

    def clean_markdown_content(self, content):
        """
        Clean Markdown content for database storage.

        Args:
            content: Raw Markdown content

        Returns:
            Cleaned content string
        """
        # Remove excessive whitespace
        content = re.sub(r'\n{3,}', '\n\n', content)
        content = content.strip()

        # Remove Notion-specific artifacts (database IDs, etc.)
        content = re.sub(r'\[[\w-]{32,}\]', '', content)

        return content

    def get_category_from_path(self, file_path):
        """
        Extract category from parent directory name.

        Args:
            file_path: Path object for the file

        Returns:
            Category name or 'Uncategorized'
        """
        parent_dir = file_path.parent.name

        # Skip if parent is the root export directory
        if parent_dir == self.source_directory.name or parent_dir == '.':
            return 'Uncategorized'

        return parent_dir

    def format_postgres_array(self, tags_list):
        """
        Format Python list as PostgreSQL array string.

        Args:
            tags_list: List of tag strings

        Returns:
            PostgreSQL array format string (e.g., '{"tag1","tag2"}')
        """
        if not tags_list:
            return '{}'

        # Escape quotes and format as PostgreSQL array
        escaped_tags = [tag.replace('"', '""') for tag in tags_list]
        return '{' + ','.join(f'"{tag}"' for tag in escaped_tags) + '}'

    def get_file_timestamp(self, file_path):
        """
        Get file modification time as ISO 8601 timestamp.

        Args:
            file_path: Path object for the file

        Returns:
            ISO 8601 formatted timestamp string
        """
        try:
            mtime = file_path.stat().st_mtime
            dt = datetime.fromtimestamp(mtime)
            return dt.strftime('%Y-%m-%dT%H:%M:%SZ')
        except Exception as e:
            logger.warning(f"Could not get timestamp for {file_path}: {e}")
            return ''

    def process_file(self, file_path):
        """
        Process a single Markdown file.

        Args:
            file_path: Path object for the Markdown file

        Returns:
            dict: Processed prompt data or None if error
        """
        try:
            # Read file content
            with open(file_path, 'r', encoding='utf-8') as f:
                raw_content = f.read()

            # Extract frontmatter and content
            frontmatter, content = self.extract_frontmatter(raw_content)

            # Get title from filename (remove extension)
            title = file_path.stem

            # Clean Notion ID suffixes from title (e.g., "Title abc123" -> "Title")
            title = re.sub(r'\s+[a-f0-9]{32}$', '', title)

            # Get category from parent directory
            category = self.get_category_from_path(file_path)

            # Get tags from frontmatter or use empty array
            tags = frontmatter.get('tags', frontmatter.get('Tags', []))
            if isinstance(tags, str):
                tags = [tag.strip() for tag in tags.split(',')]

            # Clean content
            content = self.clean_markdown_content(content)

            # Skip empty files
            if not content or len(content.strip()) < 10:
                logger.warning(f"Skipping {file_path}: content too short or empty")
                return None

            # Get creation timestamp
            created_at = self.get_file_timestamp(file_path)

            return {
                'title': title,
                'content': content,
                'category': category,
                'tags': self.format_postgres_array(tags),
                'created_at': created_at
            }

        except Exception as e:
            logger.error(f"Error processing {file_path}: {str(e)}")
            self.error_count += 1
            return None

    def process_directory(self):
        """
        Process all Markdown files in the source directory.

        Returns:
            list: List of processed prompt dictionaries
        """
        prompts = []

        if not self.source_directory.exists():
            logger.error(f"Source directory does not exist: {self.source_directory}")
            return prompts

        logger.info(f"Processing Markdown files from: {self.source_directory}")

        # Find all .md files recursively
        md_files = list(self.source_directory.rglob('*.md'))
        logger.info(f"Found {len(md_files)} Markdown files")

        for file_path in md_files:
            prompt_data = self.process_file(file_path)

            if prompt_data:
                prompts.append(prompt_data)
                self.processed_count += 1

                if self.processed_count % 100 == 0:
                    logger.info(f"Processed {self.processed_count} files...")

        logger.info(f"Processing complete: {self.processed_count} successful, {self.error_count} errors")
        return prompts

    def write_csv(self, prompts):
        """
        Write prompts to CSV file.

        Args:
            prompts: List of prompt dictionaries
        """
        if not prompts:
            logger.warning("No prompts to write to CSV")
            return

        fieldnames = ['title', 'content', 'category', 'tags', 'created_at']

        try:
            with open(self.output_csv, 'w', newline='', encoding='utf-8') as csvfile:
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(prompts)

            logger.info(f"CSV file created: {self.output_csv} ({len(prompts)} prompts)")

        except Exception as e:
            logger.error(f"Error writing CSV: {str(e)}")

    def run(self):
        """Execute the full processing pipeline."""
        logger.info("=" * 70)
        logger.info("Notion Markdown to CSV Converter")
        logger.info("=" * 70)

        prompts = self.process_directory()
        self.write_csv(prompts)

        logger.info("=" * 70)
        logger.info("Processing Summary:")
        logger.info(f"  Total processed: {self.processed_count}")
        logger.info(f"  Total errors: {self.error_count}")
        logger.info(f"  Output file: {self.output_csv}")
        if self.error_count > 0:
            logger.info(f"  Error log: import_errors.log")
        logger.info("=" * 70)


def main():
    """Main entry point."""
    if len(sys.argv) < 2:
        print("Usage: python notion_to_csv.py <path_to_notion_export_directory>")
        print("\nExample:")
        print("  python notion_to_csv.py ./notion_export")
        print("\nThis will create prompts.csv in the current directory.")
        sys.exit(1)

    source_dir = sys.argv[1]
    processor = NotionMarkdownProcessor(source_dir)
    processor.run()


if __name__ == '__main__':
    main()
