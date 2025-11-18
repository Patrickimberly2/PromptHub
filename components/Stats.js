'use client';

export default function Stats({ total = 0, categories = 0, tags = 0 }) {
  const stats = [
    { label: 'Total Prompts', value: total.toLocaleString() },
    { label: 'Categories', value: categories.toLocaleString() },
    { label: 'Tags', value: tags.toLocaleString() },
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
      gap: '1rem',
      marginBottom: '2rem'
    }}>
      {stats.map((stat, idx) => (
        <div
          key={idx}
          style={{
            background: 'white',
            padding: '1rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            textAlign: 'center'
          }}
        >
          <div style={{ fontSize: '2rem', fontWeight: 'bold', color: '#0070f3' }}>
            {stat.value}
          </div>
          <div style={{ fontSize: '0.875rem', color: '#666', marginTop: '0.25rem' }}>
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
}
