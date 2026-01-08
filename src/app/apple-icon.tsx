import { ImageResponse } from 'next/og'

// Taille recommandée pour Apple Touch Icon
export const size = {
  width: 180,
  height: 180,
}
export const contentType = 'image/png'

// Génère l'icône Apple Touch automatiquement
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #f97316 0%, #fbbf24 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: 32,
        }}
      >
        {/* Cercle blanc central */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'rgba(255, 255, 255, 0.95)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        />
        {/* Rayons du soleil */}
        <svg
          width="180"
          height="180"
          viewBox="0 0 180 180"
          style={{
            position: 'absolute',
          }}
        >
          {/* Rayons */}
          <line x1="90" y1="30" x2="90" y2="50" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="90" y1="130" x2="90" y2="150" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="30" y1="90" x2="50" y2="90" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="130" y1="90" x2="150" y2="90" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="47" y1="47" x2="60" y2="60" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="120" y1="120" x2="133" y2="133" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="47" y1="133" x2="60" y2="120" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <line x1="120" y1="60" x2="133" y2="47" stroke="url(#grad)" strokeWidth="8" strokeLinecap="round"/>
          <defs>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f97316"/>
              <stop offset="100%" stopColor="#fbbf24"/>
            </linearGradient>
          </defs>
        </svg>
      </div>
    ),
    {
      ...size,
    }
  )
}

