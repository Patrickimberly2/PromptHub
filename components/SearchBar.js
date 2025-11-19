'use client';

import { useState } from 'react';

export default function SearchBar({ onSearch }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({ query, category });
  };

  const handleClear = () => {
    setQuery('');
    setCategory('');
    onSearch({ query: '', category: '' });
  };

  return (
    <div style={{
      background: 'white',
      padding: '2rem',
      borderRadius: '8px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
      marginBottom: '2rem'
    }}>
      <form onSubmit={handleSubmit}>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <input
            type="text"
            placeholder="Search prompts..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: '1',
              minWidth: '250px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <input
            type="text"
            placeholder="Category (optional)"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            style={{
              width: '200px',
              padding: '0.75rem',
              border: '1px solid #ddd',
              borderRadius: '4px',
              fontSize: '1rem'
            }}
          />
          <button
            type="submit"
            style={{
              padding: '0.75rem 1.5rem',
              background: '#0070f3',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Search
          </button>
          <button
            type="button"
            onClick={handleClear}
            style={{
              padding: '0.75rem 1.5rem',
              background: '#666',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: 'pointer',
              fontWeight: '500'
            }}
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
