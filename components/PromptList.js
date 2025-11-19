'use client';

export default function PromptList({ prompts, loading }) {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem', color: '#666' }}>
        <div style={{ fontSize: '1.2rem' }}>Loading prompts...</div>
      </div>
    );
  }

  if (!prompts || prompts.length === 0) {
    return (
      <div style={{
        textAlign: 'center',
        padding: '3rem',
        background: 'white',
        borderRadius: '8px',
        color: '#666'
      }}>
        <div style={{ fontSize: '1.2rem' }}>No prompts found</div>
        <p style={{ marginTop: '0.5rem' }}>Try adjusting your search criteria</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ color: '#666', marginBottom: '0.5rem' }}>
        Found {prompts.length} prompt{prompts.length !== 1 ? 's' : ''}
      </div>
      {prompts.map((prompt) => (
        <div
          key={prompt.id}
          style={{
            background: 'white',
            padding: '1.5rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'box-shadow 0.2s',
            cursor: 'pointer'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
          }}
        >
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', color: '#0070f3' }}>
            {prompt.title}
          </h3>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
            {prompt.category && (
              <span style={{
                background: '#e3f2fd',
                color: '#1976d2',
                padding: '0.25rem 0.75rem',
                borderRadius: '12px',
                fontWeight: '500'
              }}>
                {prompt.category}
              </span>
            )}
            {prompt.created_at && (
              <span style={{ color: '#999' }}>
                {new Date(prompt.created_at).toLocaleDateString()}
              </span>
            )}
          </div>

          <p style={{
            color: '#555',
            lineHeight: '1.6',
            marginBottom: '1rem',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical'
          }}>
            {prompt.content}
          </p>

          {prompt.tags && prompt.tags.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {prompt.tags.map((tag, idx) => (
                <span
                  key={idx}
                  style={{
                    background: '#f5f5f5',
                    color: '#666',
                    padding: '0.25rem 0.5rem',
                    borderRadius: '4px',
                    fontSize: '0.75rem'
                  }}
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
