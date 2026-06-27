/**
 * Admin Analytics Dashboard Page.
 * Accessible only to authenticated site-owner accounts.
 * Displays traffic sources, top 10 pages by unique visitors,
 * and conversion paths (visitor → exercise completion).
 *
 * Validates: Requirements 16.5
 */

import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth/options';
import { getAnalyticsDashboardData } from '@/lib/analytics/dashboard';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Analytics Dashboard - AimTrainerPro Admin',
  robots: { index: false, follow: false },
};

/**
 * Checks if the current user is a site owner.
 * Uses an email whitelist from the SITE_OWNER_EMAILS environment variable.
 * Format: comma-separated emails (e.g., "admin@example.com,owner@example.com")
 */
function isSiteOwner(email: string | null | undefined): boolean {
  if (!email) return false;

  const ownerEmails = process.env.SITE_OWNER_EMAILS || '';
  const whitelist = ownerEmails
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);

  return whitelist.includes(email.toLowerCase());
}

export default async function AnalyticsDashboardPage() {
  const session = await getServerSession(authOptions);

  // Redirect unauthenticated users to sign in
  if (!session?.user?.email) {
    redirect('/api/auth/signin');
  }

  // Redirect non-owner users to home
  if (!isSiteOwner(session.user.email)) {
    redirect('/');
  }

  const data = await getAnalyticsDashboardData();

  return (
    <div style={{ minHeight: '100vh', padding: '40px 5%', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '40px' }}>
        <h1 style={{
          fontSize: '1.8rem',
          fontWeight: 800,
          letterSpacing: '2px',
          textTransform: 'uppercase',
          background: 'linear-gradient(90deg, #fff, #bbb)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          margin: 0,
        }}>
          Analytics Dashboard
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '8px', fontSize: '0.85rem' }}>
          Data range: {data.dateRange.from} to {data.dateRange.to} (last 30 days)
        </p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px' }}>
        {/* Traffic Sources */}
        <section style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>
            Traffic Sources
          </h2>
          {data.trafficSources.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available yet.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {data.trafficSources.map((source) => (
                <div key={source.source} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.9rem', color: '#fff', textTransform: 'capitalize' }}>
                      {source.source}
                    </span>
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                      {source.visitors} visitors ({(source.percentage * 100).toFixed(1)}%)
                    </span>
                  </div>
                  <div style={{
                    height: '6px',
                    background: 'rgba(255,255,255,0.05)',
                    borderRadius: '3px',
                    overflow: 'hidden',
                  }}>
                    <div style={{
                      height: '100%',
                      width: `${source.percentage * 100}%`,
                      background: 'var(--primary)',
                      borderRadius: '3px',
                      transition: 'width 0.3s ease',
                    }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Top 10 Pages */}
        <section style={{
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>
            Top 10 Pages by Unique Visitors
          </h2>
          {data.topPages.length === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available yet.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{
                    textAlign: 'left',
                    padding: '8px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                  }}>
                    #
                  </th>
                  <th style={{
                    textAlign: 'left',
                    padding: '8px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                  }}>
                    Page
                  </th>
                  <th style={{
                    textAlign: 'right',
                    padding: '8px 0',
                    fontSize: '0.75rem',
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '1px',
                    fontWeight: 700,
                  }}>
                    Visitors
                  </th>
                </tr>
              </thead>
              <tbody>
                {data.topPages.map((page, index) => (
                  <tr key={page.path} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                    <td style={{ padding: '10px 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      {index + 1}
                    </td>
                    <td style={{ padding: '10px 0', fontSize: '0.85rem', color: '#fff' }}>
                      {page.path || '/'}
                    </td>
                    <td style={{
                      padding: '10px 0',
                      fontSize: '0.85rem',
                      color: 'var(--primary)',
                      textAlign: 'right',
                      fontWeight: 600,
                    }}>
                      {page.visitors.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        {/* Conversion Path */}
        <section style={{
          gridColumn: '1 / -1',
          background: 'var(--bg-panel)',
          border: '1px solid var(--border)',
          borderRadius: '8px',
          padding: '24px',
        }}>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '20px', color: '#fff' }}>
            Conversion Funnel: Visitor → Exercise Completion
          </h2>
          {data.conversionPath.steps[0]?.count === 0 ? (
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>No data available yet.</p>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '16px', height: '220px' }}>
              {data.conversionPath.steps.map((step, index) => {
                const heightPercent = Math.max(step.percentage, 5);
                return (
                  <div
                    key={step.label}
                    style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      height: '100%',
                      justifyContent: 'flex-end',
                    }}
                  >
                    {/* Count and percentage label */}
                    <span style={{
                      fontSize: '0.8rem',
                      color: 'var(--text-muted)',
                      marginBottom: '6px',
                      textAlign: 'center',
                    }}>
                      {step.count.toLocaleString()} ({step.percentage.toFixed(1)}%)
                    </span>
                    {/* Bar */}
                    <div style={{
                      width: '100%',
                      maxWidth: '120px',
                      height: `${heightPercent}%`,
                      background: index === data.conversionPath.steps.length - 1
                        ? 'var(--primary)'
                        : `rgba(255, 70, 85, ${0.3 + (index * 0.2)})`,
                      borderRadius: '4px 4px 0 0',
                      transition: 'height 0.3s ease',
                    }} />
                    {/* Step label */}
                    <span style={{
                      fontSize: '0.75rem',
                      color: '#fff',
                      marginTop: '8px',
                      textAlign: 'center',
                      fontWeight: 600,
                    }}>
                      {step.label}
                    </span>
                    {/* Arrow between steps */}
                    {index < data.conversionPath.steps.length - 1 && (
                      <span style={{
                        position: 'absolute',
                        display: 'none',
                      }}>
                        →
                      </span>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
