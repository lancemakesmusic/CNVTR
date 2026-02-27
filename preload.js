const { contextBridge, ipcRenderer } = require('electron');

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
    const subscription = (_e, ...args) => fn(...args);
    ipcRenderer.on(channel, subscription);
    return () => ipcRenderer.removeListener(channel, subscription);
  },
});
