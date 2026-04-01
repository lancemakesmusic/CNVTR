import './ConversionOptions.css';

const FORMATS = [
  { value: 'mp3', label: 'MP3' },
  { value: 'wav', label: 'WAV (lossless)' },
  { value: 'flac', label: 'FLAC' },
  { value: 'mp4', label: 'MP4 (video)' },
];

const QUALITY = [
  { value: 'standard', label: 'Standard (192 kbps)' },
  { value: 'high', label: 'High (256 kbps)' },
  { value: 'studio', label: 'Studio (320 kbps)' },
  { value: 'lossless', label: 'Lossless (WAV)' },
];

const SAMPLE_RATES = [
  { value: 44100, label: '44.1 kHz' },
  { value: 48000, label: '48 kHz' },
];

const FILE_TEMPLATES = [
  { value: 'artist-title', label: '{Artist} - {Title}' },
  { value: 'title', label: '{Title}' },
];

export function ConversionOptions({
  options,
  setOptions,
  outputDir,
  onSelectDir,
  advancedOpen,
  setAdvancedOpen,
}) {
  const update = (key, value) => setOptions((o) => ({ ...o, [key]: value }));

  return (
    <div className="conversion-options">
      <div className="options-row main-options">
        <div className="option-group">
          <label>Output format</label>
          <select
            value={options.outputFormat}
            onChange={(e) => update('outputFormat', e.target.value)}
          >
            {FORMATS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div className="option-group">
          <label>Quality</label>
          <select
            value={options.qualityPreset}
            onChange={(e) => update('qualityPreset', e.target.value)}
          >
            {QUALITY.map((q) => (
              <option key={q.value} value={q.value}>{q.label}</option>
            ))}
          </select>
        </div>
        <div className="option-group output-dir">
          <label>Output folder</label>
          <div className="output-dir-row">
            <input
              type="text"
              value={outputDir}
              readOnly
              className="output-dir-input"
              placeholder="Default: Downloads/CNVTR"
            />
            <button type="button" className="btn btn-secondary btn-small" onClick={onSelectDir}>
              Browse
            </button>
          </div>
        </div>
      </div>

      <div className="options-row checkboxes">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={options.openFolderWhenDone}
            onChange={(e) => update('openFolderWhenDone', e.target.checked)}
          />
          Open folder after download
        </label>
      </div>

      <div className="advanced-toggle-wrap">
        <button
          type="button"
          className="advanced-toggle"
          onClick={() => setAdvancedOpen(!advancedOpen)}
          aria-expanded={advancedOpen}
        >
          {advancedOpen ? '▼' : '▶'} Advanced settings
        </button>
      </div>

      {advancedOpen && (
        <div className="advanced-options">
          <div className="options-row">
            <div className="option-group">
              <label>Bitrate (MP3)</label>
              <select
                value={options.bitrate}
                onChange={(e) => update('bitrate', Number(e.target.value))}
              >
                <option value={192}>192 kbps</option>
                <option value={256}>256 kbps</option>
                <option value={320}>320 kbps</option>
              </select>
            </div>
            <div className="option-group">
              <label>Sample rate</label>
              <select
                value={options.sampleRate}
                onChange={(e) => update('sampleRate', Number(e.target.value))}
              >
                {SAMPLE_RATES.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="option-group">
              <label>File name</label>
              <select
                value={options.fileNameTemplate}
                onChange={(e) => update('fileNameTemplate', e.target.value)}
              >
                {FILE_TEMPLATES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="options-row checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.normalize}
                onChange={(e) => update('normalize', e.target.checked)}
              />
              Normalize audio
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.mono}
                onChange={(e) => update('mono', e.target.checked)}
              />
              Convert to mono
            </label>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={options.removeSilence}
                onChange={(e) => update('removeSilence', e.target.checked)}
              />
              Remove silence at start
            </label>
          </div>
          <div className="options-row trim">
            <div className="option-group">
              <label>Trim start (seconds)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={options.trimStart}
                onChange={(e) => update('trimStart', e.target.value)}
                placeholder="0"
              />
            </div>
            <div className="option-group">
              <label>Trim end (seconds)</label>
              <input
                type="number"
                min={0}
                step={0.1}
                value={options.trimEnd}
                onChange={(e) => update('trimEnd', e.target.value)}
                placeholder="full"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
