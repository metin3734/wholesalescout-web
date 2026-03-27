export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'var(--muted)',
      padding: '1rem',
    }}>
      <a href="/" style={{
        fontWeight: 800, fontSize: '1.3rem', color: 'var(--primary)',
        textDecoration: 'none', marginBottom: '2rem',
      }}>
        WholesaleScout
      </a>
      {children}
    </div>
  );
}
