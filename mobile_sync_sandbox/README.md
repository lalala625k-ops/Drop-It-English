# Mobile Sync Sandbox

This experimental prototype runs separately from the desktop application. It stores received items in `mobile_sync_sandbox/inbox_data/`, which is excluded from Git. It is not included in the Windows release.

Run `mobile_sync_sandbox/start_sandbox.bat` from the project root, or run:

```powershell
python mobile_sync_sandbox/server.py
```

Open the desktop test canvas at `http://localhost:8088/`. The service prints a LAN address for the mobile page at `http://<desktop-ip>:8088/mobile`.

## Try sharing

1. Click **Simulate a mobile share** on the desktop test canvas, send an item from your phone, or add an image to the inbox folder.
2. Open the **Mobile inbox** and drag a card onto the canvas. Release to place it.
3. To use your phone, connect both devices to the same Wi-Fi and click **Pair your phone**. Scan the QR code with your camera, then choose a screenshot or send text and links.

## System sharing

On Android, open the mobile page in Chrome and choose **Add to Home screen** or **Install app**. The manifest defines a PWA share target. The `android_companion/` folder also contains a native `ACTION_SEND` prototype.

On iPhone, create a Shortcuts action that accepts images, text and URLs and appears in the Share Sheet. Use **Get Contents of URL** with POST to `http://<desktop-ip>:8088/api/share`.

## Files

- `server.py`: standalone FastAPI service on port 8088.
- `inbox_data/`: local received files; never publish its contents.
- `static/index.html`: desktop test canvas and inbox drawer.
- `static/mobile.html`: mobile companion page.
- `static/manifest.json`: Android PWA share target.
- `android_companion/`: native Android prototype source and manifest.
