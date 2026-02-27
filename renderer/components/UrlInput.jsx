import { useState, useCallback } from 'react';
import './UrlInput.css';

const PLACEHOLDER = 'Paste one or more URLs (YouTube, Instagram, X, TikTok, SoundCloud, Vimeo, Facebook…)';

export function UrlInput({ onConvert, addLog }) {
  const [value, setValue] = useState('');
  const [validating, setValidating] = useState(false);
  const [validationResult, setValidationResult] = useState(null);

  const getUrls = useCallback(() => {
    return value
      .split(/[\n,;\s]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }, [value]);

  const handleValidate = useCallback(async () => {
    const urls = getUrls();
    if (!urls.length) {
      addLog('No URLs entered.');
      return;
    }
    setValidating(true);
    setValidationResult(null);
    try {
      const results = await window.cnvtr.validateUrls(urls);
      const valid = results.filter((r) => r.valid);
      const invalid = results.filter((r) => !r.valid);
      setValidationResult({ valid, invalid, results });
      invalid.forEach((r) => addLog(`Invalid: ${r.url} — ${r.error}`));
      if (valid.length) addLog(`Valid: ${valid.length} URL(s) ready.`);
    } catch (e) {
      addLog(`Validation error: ${e.message}`);
    } finally {
      setValidating(false);
    }
  }, [getUrls, addLog]);

  const handleConvert = useCallback(async () => {
    const urls = getUrls();
    if (!urls.length) {
      addLog('Paste at least one URL.');
      return;
    }
    const results = await window.cnvtr.validateUrls(urls);
    const validUrls = results.filter((r) => r.valid).map((r) => r.url);
    const invalid = results.filter((r) => !r.valid);
    invalid.forEach((r) => addLog(`Skipped: ${r.url} — ${r.error}`));
    if (validUrls.length) onConvert(validUrls);
    else addLog('No valid URLs to convert.');
  }, [getUrls, onConvert, addLog]);

  const handlePaste = useCallback((e) => {
    const text = e.clipboardData?.getData('text') || '';
    if (text.includes('http') && value === '') {
      setValue(text);
    }
  }, [value]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const text = e.dataTransfer?.getData('text') || '';
    if (text) setValue((v) => (v ? `${v}\n${text}` : text));
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  return (
    <div className="url-input-wrap">
      <div
        className="url-input-area"
        onPaste={handlePaste}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <textarea
          className="url-textarea"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={PLACEHOLDER}
          rows={4}
          spellCheck={false}
        />
      </div>
      <div className="url-actions">
        <button
          type="button"
          className="btn btn-secondary"
          onClick={handleValidate}
          disabled={validating || !value.trim()}
        >
          {validating ? 'Validating…' : 'Validate URLs'}
        </button>
        <button
          type="button"
          className="btn btn-convert"
          onClick={handleConvert}
          disabled={!value.trim()}
        >
          Convert
        </button>
      </div>
      {validationResult && (
        <div className="validation-summary">
          {validationResult.valid.length > 0 && (
            <span className="valid-count">{validationResult.valid.length} valid</span>
          )}
          {validationResult.invalid.length > 0 && (
            <span className="invalid-count">{validationResult.invalid.length} unsupported/invalid</span>
          )}
        </div>
      )}
    </div>
  );
}
