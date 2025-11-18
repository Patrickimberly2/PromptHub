'use client';

import { useState, useEffect } from 'react';
import SearchBar from '../components/SearchBar';
import PromptList from '../components/PromptList';
import Stats from '../components/Stats';

export default function Home() {
  const [prompts, setPrompts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({ total: 0, categories: 0, tags: 0 });

  // Fetch initial data on mount
  useEffect(() => {
    fetchPrompts();
    fetchStats();
  }, []);

  const fetchPrompts = async (searchParams = {}) => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        query: searchParams.query || '',
        category: searchParams.category || '',
        limit: searchParams.limit || 50,
        offset: searchParams.offset || 0,
      });

      if (searchParams.tags && searchParams.tags.length > 0) {
        queryParams.append('tags', searchParams.tags.join(','));
      }

      const response = await fetch(`/api/prompts?${queryParams}`);
      const data = await response.json();

      setPrompts(data.prompts || []);
    } catch (error) {
      console.error('Error fetching prompts:', error);
      setPrompts([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleSearch = (searchParams) => {
    fetchPrompts(searchParams);
  };

  return (
    <div style={{ minHeight: '100vh', padding: '2rem' }}>
      <header style={{ maxWidth: '1200px', margin: '0 auto', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 'bold', marginBottom: '1rem' }}>
          PromptHub
        </h1>
        <p style={{ color: '#666', marginBottom: '2rem' }}>
          Organize and search through 50,000+ AI prompts
        </p>
        <Stats {...stats} />
      </header>

      <main style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <SearchBar onSearch={handleSearch} />
        <PromptList prompts={prompts} loading={loading} />
      </main>

      <footer style={{ maxWidth: '1200px', margin: '3rem auto 0', textAlign: 'center', color: '#999' }}>
        <p>Powered by Next.js 14 &amp; Supabase</p>
      </footer>
    </div>
  );
}
