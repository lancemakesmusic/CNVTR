import { useState, useEffect, useCallback } from 'react';
import { TermsModal } from './components/TermsModal';
import { UrlInput } from './components/UrlInput';
import { ConversionOptions } from './components/ConversionOptions';
import { QueuePanel } from './components/QueuePanel';
import { HistoryPanel } from './components/HistoryPanel';
import { LogPanel } from './components/LogPanel';
import './styles/App.css';

const defaultOptions = {
  outputFormat: 'mp3',
  qualityPreset: 'studio',
  bitrate: 320,
  sampleRate: 44100,
  normalize: false,
  trimStart: '',
  trimEnd: '',
  mono: false,
  removeSilence: false,
  fileNameTemplate: 'artist-title',
  openFolderWhenDone: true,
};

export default function App() {
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [termsChecked, setTermsChecked] = useState(false);
  const [outputDir, setOutputDir] = useState('');
  const [options, setOptions] = useState(defaultOptions);
  const [queue, setQueue] = useState({ jobs: [], running: false, paused: false });
  const [logLines, setLogLines] = useState([]);
  const [historyOpen, setHistoryOpen] = useState(true);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [requirements, setRequirements] = useState({ ytDlpOk: true });

  useEffect(() => {
    window.cnvtr.checkRequirements?.().then(setRequirements).catch(() => setRequirements({ ytDlpOk: false }));
  }, []);

  useEffect(() => {
    window.cnvtr.termsCheck().then((accepted) => {
      setTermsAccepted(accepted);
      setTermsChecked(true);
    });
    window.cnvtr.getDefaultOutputDir().then(setOutputDir);
  }, []);

  const handleTermsAccept = useCallback(() => {
    window.cnvtr.termsAccepted();
    setTermsAccepted(true);
  }, []);

  const addLog = useCallback((line) => {
    setLogLines((prev) => [...prev.slice(-500), { t: Date.now(), text: line }]);
  }, []);

  useEffect(() => {
    const unsub = window.cnvtr.on('job-log', ({ line }) => addLog(line));
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, [addLog]);

  useEffect(() => {
    const unsub = window.cnvtr.on('queue-update', (data) => setQueue((prev) => ({ ...prev, ...data })));
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, []);

  useEffect(() => {
    const unsub = window.cnvtr.on('queue-finished', () => {
      window.cnvtr.getQueueStatus().then((s) => setQueue((prev) => ({ ...prev, ...s })));
    });
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, []);

  useEffect(() => {
    const unsub = window.cnvtr.on('job-done', ({ success, outputPath, openFolderWhenDone }) => {
      if (success && outputPath) {
        addLog(`Saved: ${outputPath}`);
        window.cnvtr.historyAdd({ outputPath, success: true });
        if (openFolderWhenDone) window.cnvtr.openFolder(outputPath.replace(/\/[^/]+$/, '').replace(/\\[^\\]+$/, ''));
      }
    });
    return () => (typeof unsub === 'function' ? unsub() : undefined);
  }, [addLog]);

  const handleConvert = useCallback(
    async (urls) => {
      if (!urls.length) return;
      addLog(`Starting batch: ${urls.length} URL(s)`);
      await window.cnvtr.startJob({
        urls,
        outputDir: outputDir || undefined,
        ...options,
        openFolderWhenDone: options.openFolderWhenDone,
      });
      const unsub = window.cnvtr.on('queue-update', (data) => setQueue((prev) => ({ ...prev, ...data })));
      window.cnvtr.getQueueStatus().then((s) => setQueue((prev) => ({ ...prev, ...s })));
    },
    [outputDir, options, addLog]
  );

  const handleSelectDir = useCallback(async () => {
    const dir = await window.cnvtr.selectOutputDir();
    if (dir) setOutputDir(dir);
  }, []);

  if (!termsChecked) {
    return (
      <div className="app-loading">
        <div className="logo">CNVTR</div>
        <p>Loading…</p>
      </div>
    );
  }

  if (!termsAccepted) {
    return <TermsModal onAccept={handleTermsAccept} />;
  }

  return (
    <div className="app">
      <aside className={`sidebar history-panel ${historyOpen ? 'open' : ''}`}>
        <HistoryPanel onClose={() => setHistoryOpen(false)} />
      </aside>
      {!historyOpen && (
        <button type="button" className="history-toggle" onClick={() => setHistoryOpen(true)} aria-label="Open history">
          History
        </button>
      )}

      <main className="main">
        {!requirements.ytDlpOk && (
          <div className="requirements-banner" role="alert">
            <strong>yt-dlp not found.</strong>{' '}
            Install it and add it to your system PATH, or place <code>yt-dlp.exe</code> in the app&apos;s <code>yt-dlp</code> folder.
            {' '}
            <a href="https://github.com/yt-dlp/yt-dlp/releases" target="_blank" rel="noopener noreferrer">Download yt-dlp</a>
          </div>
        )}
        <header className="header">
          <div className="logo">CNVTR</div>
          <span className="tagline">URL → Audio</span>
        </header>

        <section className="section url-section">
          <UrlInput onConvert={handleConvert} addLog={addLog} />
        </section>

        <section className="section options-section">
          <ConversionOptions
            options={options}
            setOptions={setOptions}
            outputDir={outputDir}
            onSelectDir={handleSelectDir}
            advancedOpen={advancedOpen}
            setAdvancedOpen={setAdvancedOpen}
          />
        </section>

        <section className="section queue-section">
          <QueuePanel
            queue={queue}
            onPause={() => window.cnvtr.queuePause()}
            onResume={() => window.cnvtr.queueResume()}
            onCancel={() => window.cnvtr.queueCancel()}
          />
        </section>

        <LogPanel lines={logLines} onClear={() => setLogLines([])} />
      </main>
    </div>
  );
}
