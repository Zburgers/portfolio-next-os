export default function NotFound() {
  return (
    <div style={{
      height: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--surface)',
      color: 'var(--text-primary)'
    }}>
      <div style={{textAlign: 'center'}}>
        <h1 style={{fontSize: '1.25rem', marginBottom: '0.5rem'}}>Page not found</h1>
        <p style={{opacity: 0.8}}>The page you requested could not be found.</p>
      </div>
    </div>
  );
}
