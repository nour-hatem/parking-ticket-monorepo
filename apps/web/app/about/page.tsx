import Link from 'next/link';

export default function AboutPage() {
  return (
    <main className="container">
      <header className="app-header">
        <div>
          <h1 className="app-title">About Parking Ticket System</h1>
          <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginTop: '0.25rem' }}>
            Enterprise Monorepo Architecture Overview
          </p>
        </div>
        <Link
          href="/"
          style={{
            color: '#38bdf8',
            textDecoration: 'none',
            fontSize: '0.9rem',
            fontWeight: 600,
          }}
        >
          ← Back to Live Feed
        </Link>
      </header>

      <section
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          padding: '1.5rem',
          borderRadius: '12px',
          lineHeight: '1.7',
        }}
      >
        <h3 style={{ color: '#38bdf8', marginBottom: '0.75rem' }}>Architecture Overview</h3>
        <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>
          This application connects a NestJS backend microservice with a Next.js 16 frontend via
          Socket.io WebSockets for real-time ticket issuance notifications.
        </p>

        <h4 style={{ color: '#f8fafc', marginBottom: '0.5rem' }}>Key System Components:</h4>
        <ul style={{ color: '#94a3b8', paddingLeft: '1.25rem', marginBottom: '1rem' }}>
          <li>
            <strong style={{ color: '#f8fafc' }}>NestJS API Gateway:</strong> Emits domain events upon
            ticket issuance.
          </li>
          <li>
            <strong style={{ color: '#f8fafc' }}>Socket.io Gateway:</strong> Broadcasts live updates
            instantly to active clients.
          </li>
          <li>
            <strong style={{ color: '#f8fafc' }}>Shared Workspace Package:</strong> Ensures TypeScript type
            integrity across the monorepo.
          </li>
        </ul>
      </section>
    </main>
  );
}
