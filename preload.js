const { contextBridge, ipcRenderer } = require('electron');

/** Main → renderer push channels (allowlist; prevents arbitrary IPC subscription). */
const ALLOWED_PUSH_CHANNELS = new Set([
  'job-progress',
  'job-log',
  'queue-update',
  'queue-error',
  'queue-finished',
  'job-done',
]);

contextBridge.exposeInMainWorld('cnvtr', {
  getDefaultOutputDir: () => ipcRenderer.invoke('get-default-output-dir'),
  selectOutputDir: () => ipcRenderer.invoke('select-output-dir'),
  openFolder: (dir) => ipcRenderer.invoke('open-folder', dir),
  checkRequirements: () => ipcRenderer.invoke('check-requirements'),
  validateUrls: (urls) => ipcRenderer.invoke('validate-urls', urls),
  fetchInfo: (url) => ipcRenderer.invoke('fetch-info', url),
  startJob: (options) => ipcRenderer.invoke('start-job', options),
  queuePause: () => ipcRenderer.invoke('queue-pause'),
  queueResume: () => ipcRenderer.invoke('queue-resume'),
  queueCancel: () => ipcRenderer.invoke('queue-cancel'),
  getQueueStatus: () => ipcRenderer.invoke('get-queue-status'),
  embedMetadata: (opts) => ipcRenderer.invoke('embed-metadata', opts),
  convertToFormat: (opts) => ipcRenderer.invoke('convert-to-format', opts),
  termsAccepted: () => ipcRenderer.invoke('terms-accepted'),
  termsCheck: () => ipcRenderer.invoke('terms-check'),
  historyGet: () => ipcRenderer.invoke('history-get'),
  historyAdd: (entry) => ipcRenderer.invoke('history-add', entry),
  on: (channel, fn) => {
    if (!ALLOWED_PUSH_CHANNELS.has(channel)) {
      console.error(`[CNVTR] Blocked subscription to disallowed IPC channel: ${channel}`);
      return () => {};
    }
    if (typeof fn !== 'function') return () => {};
    const subscription = (_e, ...args) => fn(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
