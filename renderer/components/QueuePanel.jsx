import { useState, useEffect } from 'react';
import './QueuePanel.css';

export function QueuePanel({ queue, onPause, onResume, onCancel }) {
  const [jobs, setJobs] = useState(queue.jobs || []);
  const [progressMap, setProgressMap] = useState({});

  useEffect(() => {
    setJobs(queue.jobs || []);
  }, [queue.jobs]);

  useEffect(() => {
    const unsub = window.cnvtr?.on('job-progress', ({ id, percent }) => {
      setProgressMap((m) => ({ ...m, [id]: percent }));
    });
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, []);

  const running = queue.running;
  const paused = queue.paused;
  const hasJobs = jobs.length > 0;
  const completed = jobs.filter((j) => j.status === 'completed').length;
  const failed = jobs.filter((j) => j.status === 'failed').length;

  return (
    <div className="queue-panel">
      <div className="queue-header">
        <h3>Queue</h3>
        {hasJobs && (
          <span className="queue-summary">
            {completed}/{jobs.length} done
            {failed > 0 && ` · ${failed} failed`}
          </span>
        )}
        {running && (
          <div className="queue-controls">
            {paused ? (
              <button type="button" className="btn btn-secondary btn-small" onClick={onResume}>
                Resume
              </button>
            ) : (
              <button type="button" className="btn btn-secondary btn-small" onClick={onPause}>
                Pause
              </button>
            )}
            <button type="button" className="btn btn-cancel btn-small" onClick={onCancel}>
              Cancel
            </button>
          </div>
        )}
      </div>
      <div className="queue-list">
        {!hasJobs && (
          <p className="queue-empty">No items. Paste URLs and click Convert.</p>
        )}
        {jobs.map((job) => (
          <div
            key={job.id}
            className={`queue-item queue-item--${job.status}`}
          >
            <div className="queue-item-info">
              <span className="queue-item-title">
                {job.info?.title || job.url?.slice(0, 50) || job.id}
              </span>
              {job.info?.uploader && (
                <span className="queue-item-artist">{job.info.uploader}</span>
              )}
              {job.status === 'failed' && job.error && (
                <span className="queue-item-error">{job.error}</span>
              )}
            </div>
            <div className="queue-item-progress-wrap">
              {(job.status === 'pending' || job.status === 'downloading' || job.status === 'converting') && (
                <div className="queue-item-progress-bar">
                  <div
                    className="queue-item-progress-fill"
                    style={{ width: `${progressMap[job.id] ?? job.progress ?? 0}%` }}
                  />
                </div>
              )}
              {job.status === 'completed' && (
                <span className="queue-item-done">Done</span>
              )}
              {job.status === 'failed' && (
                <span className="queue-item-fail">Failed</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
