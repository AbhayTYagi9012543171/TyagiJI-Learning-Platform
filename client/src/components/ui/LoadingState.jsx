import { LoaderCircle } from 'lucide-react';
export default function LoadingState({ text = 'Loading your learning experience...', size = 25, className = '' }) {
  return (
    <div className={`loading-state tj-loading ${className}`.trim()} role="status" aria-live="polite">
      <LoaderCircle className="loading-spinner tj-spin" size={size} aria-hidden="true" />
      <span>{text}</span>
    </div>
  );
}
