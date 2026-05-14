import { useRef, useEffect } from 'react';
import './LogPanel.css';

export function LogPanel({ lines, onClear }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [lines]);

  return (
    <div className="log-panel">
      <div className="log-header">
        <span id="log-panel-title">Log</span>
        {lines.length > 0 && (
          <button type="button" className="log-clear" onClick={onClear} aria-label="Clear log">
            Clear
          </button>
        )}
      </div>
      <div
        className="log-content"
        role="log"
        aria-live="polite"
        aria-relevant="additions"
        aria-labelledby="log-panel-title"
      >
        {lines.length === 0 && (
          <p className="log-empty">Activity will appear here.</p>
        )}
        {lines.map((l, i) => (
          <div key={`${l.t}-${i}`} className="log-line">
            {l.text}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
    </div>
  );
}
