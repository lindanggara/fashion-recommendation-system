// src/components/Skeleton.tsx

export function SkeletonCard() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        borderRadius: 24,
        height: 280,
        width: '100%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  )
}

export function SkeletonRow() {
  return (
    <div style={{ animation: 'pulse 1.5s ease-in-out infinite' }}>
      <div style={{
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        borderRadius: 16,
        height: 80,
        width: '100%',
        animation: 'shimmer 1.5s infinite'
      }} />
    </div>
  )
}

export function SkeletonKPI() {
  return (
    <div style={{ 
      background: 'rgba(124, 90, 243, 0.05)',
      borderRadius: 24,
      padding: '24px 28px',
      animation: 'pulse 1.5s ease-in-out infinite'
    }}>
      <div style={{
        width: 48,
        height: 48,
        borderRadius: 16,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        marginBottom: 16,
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{
        height: 14,
        borderRadius: 8,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        marginBottom: 8,
        width: '40%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{
        height: 42,
        borderRadius: 8,
        background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
        backgroundSize: '200% 100%',
        marginBottom: 20,
        width: '60%',
        animation: 'shimmer 1.5s infinite'
      }} />
      <div style={{
        display: 'flex',
        gap: 20,
        paddingTop: 16,
        borderTop: '1px solid #e2e8f0'
      }}>
        <div style={{
          flex: 1,
          height: 40,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
        <div style={{
          flex: 1,
          height: 40,
          borderRadius: 8,
          background: 'linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%)',
          backgroundSize: '200% 100%',
          animation: 'shimmer 1.5s infinite'
        }} />
      </div>
      <style>{`
        @keyframes shimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
      `}</style>
    </div>
  )
}