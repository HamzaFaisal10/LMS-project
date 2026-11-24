import { Link } from 'react-router-dom';

// LearnHub "play cap" mark: a graduation cap with a play button for video lessons.
export function LogoMark({ light, className = 'h-9 w-9' }) {
  const ink = light ? '#F8FAFC' : '#0B1220';
  return (
    <svg viewBox="0 0 72 72" className={className} aria-hidden="true">
      <path d="M36 12 L66 26 L36 40 L6 26 Z" fill={ink} />
      <path
        d="M18 32 V46 C18 52 54 52 54 46 V32"
        fill="none"
        stroke={ink}
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path d="M31 21 L43 26 L31 31 Z" fill="#A3E635" />
      <path d="M62 28 V44" stroke="#4F46E5" strokeWidth="4" strokeLinecap="round" />
      <circle cx="62" cy="47" r="4" fill="#4F46E5" />
    </svg>
  );
}

export default function Logo({ light }) {
  return (
    <Link to="/" className="flex items-center gap-2.5" aria-label="LearnHub home">
      <LogoMark light={light} />
      <span
        className={`font-serif text-2xl font-semibold tracking-tight ${light ? 'text-white' : 'text-ink'}`}
      >
        LearnHub
      </span>
    </Link>
  );
}
