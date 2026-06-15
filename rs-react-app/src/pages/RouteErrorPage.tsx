import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export function RouteErrorPage() {
  const error = useRouteError();

  if (isRouteErrorResponse(error)) {
    return (
      <div style={{ padding: '3rem', textAlign: 'center' }}>
        <h1>{error.status} - {error.statusText}</h1>
        <p>{typeof error.data === 'string' ? error.data : 'Something went wrong.'}</p>
        <Link
          to="/"
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

  const message =
    error instanceof Error ? error.message : 'An unexpected application error occurred.';

  return (
    <div style={{ padding: '3rem', textAlign: 'center' }}>
      <h1>⚠️ Application Error</h1>
      <p>{message}</p>
      <Link
        to="/"
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
