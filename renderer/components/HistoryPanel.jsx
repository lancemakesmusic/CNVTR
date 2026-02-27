import { useState, useEffect } from 'react';
import './HistoryPanel.css';

export function HistoryPanel({ onClose }) {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    window.cnvtr?.historyGet().then(setEntries);
  }, []);

  const handleOpenFolder = (dir) => {
    if (dir) window.cnvtr?.openFolder(dir);
  };

  return (
    <div className="history-panel-inner">
      <div className="history-header">
        <h3>History</h3>
        <button type="button" className="history-close" onClick={onClose} aria-label="Close history">
          ×
        </button>
      </div>
      <div className="history-list">
        {entries.length === 0 && (
          <p className="history-empty">No conversions yet.</p>
        )}
        {entries.map((entry) => {
          const dir = entry.outputPath?.replace(/\/[^/]+$/, '').replace(/\\[^\\]+$/, '');
          const name = entry.outputPath?.split(/[/\\]/).pop() || '—';
          return (
            <div key={entry.id || entry.at} className="history-item">
              <span className="history-item-name" title={entry.outputPath}>
                {name}
              </span>
              {dir && (
                <button
                  type="button"
                  className="history-item-open"
                  onClick={() => handleOpenFolder(dir)}
                  title="Open folder"
                >
                  Open folder
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
