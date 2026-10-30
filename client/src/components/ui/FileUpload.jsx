import { useState } from 'react';
import { UploadCloud } from 'lucide-react';
export default function FileUpload({ label = 'Choose files', accept, multiple = false, maxBytes = 5 * 1024 * 1024, onChange, disabled = false, className = '' }) {
  const [error, setError] = useState('');
  function handleChange(event) {
    const files = Array.from(event.target.files || []);
    const oversized = files.find((file) => file.size > maxBytes);
    if (oversized) {
      setError(`${oversized.name} exceeds the ${Math.round(maxBytes / 1024 / 1024)} MB file limit.`);
      event.target.value = '';
      onChange?.([]);
      return;
    }
    setError('');
    onChange?.(files);
  }
  return (
    <label className={`tj-upload ${className}`.trim()}>
      <input type="file" accept={accept} multiple={multiple} disabled={disabled} onChange={handleChange} />
      <UploadCloud size={22} aria-hidden="true" />
      <strong>{label}</strong>
      <small>{accept || 'Select a file'} · Max {Math.round(maxBytes / 1024 / 1024)} MB</small>
      {error && <span className="tj-field__error" role="alert">{error}</span>}
    </label>
  );
}

