import Link from 'next/link';

export function NotFoundPage() {
  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>⚠️ 404 - Page Not Found</h1>
      <p>The page you are looking for does not exist.</p>
      <Link
        href="/"
        style={{
          display: 'inline-block',
          marginTop: '1rem',
          padding: '0.5rem 1rem',
          background: '#007bff',
          color: '#fff',
          textDecoration: 'none',
          borderRadius: '4px',
        }}
      >
        Return to Home Page
      </Link>
    </div>
  );
}

export default NotFoundPage;
