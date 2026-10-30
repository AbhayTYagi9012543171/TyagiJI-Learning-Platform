import { AlertTriangle, RefreshCw } from 'lucide-react';
export default function ErrorState({ error, onRetry, className = '' }) {
  if (!error) return null;
  return (
    <div className={`notice error-notice tj-alert tj-alert--danger ${className}`.trim()} role="alert">
      <AlertTriangle size={17} aria-hidden="true" />
      <span>{error}</span>
      {onRetry && (
        <button type="button" className="btn quiet tj-alert__action" onClick={onRetry}>
          <RefreshCw size={15} aria-hidden="true" /> Retry
        </button>
      )}
    </div>
  );
}
