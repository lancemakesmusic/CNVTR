# App icons

For a polished build, add:

- **Windows:** `icon.ico` (256×256 or multi-size)
- **macOS:** `icon.icns`
- **Window icon (all platforms):** `icon.png` (256×256 or 512×512)

Place them in this `assets/` folder. The build uses these for installers and the taskbar/dock.

You can generate icons from a single 1024×1024 PNG using tools like:
- [electron-icon-builder](https://www.npmjs.com/package/electron-icon-builder)
- [icoutils](https://www.npmjs.com/package/icoutils) (Windows .ico)
