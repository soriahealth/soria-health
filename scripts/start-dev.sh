#!/bin/bash
# Soria Health — Dev Startup Script
# Detects LAN IP, updates .env, starts server + Expo, opens QR in browser

set -e

cd "$(dirname "$0")/.."

# Kill any existing processes on our ports
lsof -ti:3000 2>/dev/null | xargs kill 2>/dev/null || true
lsof -ti:8081 2>/dev/null | xargs kill 2>/dev/null || true
sleep 1

# Detect LAN IP
LAN_IP=$(ipconfig getifaddr en0 2>/dev/null || ipconfig getifaddr en1 2>/dev/null || echo "localhost")
echo "Detected LAN IP: $LAN_IP"

# Update .env with current IP
sed -i '' "s|^EXPO_PUBLIC_DOMAIN=.*|EXPO_PUBLIC_DOMAIN=${LAN_IP}:3000|" .env
echo "Updated .env → EXPO_PUBLIC_DOMAIN=${LAN_IP}:3000"

# Generate QR code HTML page
EXPO_URL="exp://${LAN_IP}:8081"
cat > /tmp/soria-qr.html <<QREOF
<!DOCTYPE html>
<html>
<head>
  <title>Soria — Scan to Open</title>
  <style>
    body { font-family: -apple-system, system-ui, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f9fafb; }
    h1 { font-size: 24px; color: #111827; margin-bottom: 8px; }
    p { color: #6b7280; margin-bottom: 24px; font-size: 16px; }
    code { background: #e5e7eb; padding: 4px 12px; border-radius: 6px; font-size: 14px; color: #374151; }
    #qr { margin: 24px 0; }
    .card { background: white; padding: 48px; border-radius: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.1); text-align: center; }
    .status { margin-top: 16px; font-size: 13px; color: #9ca3af; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Soria Health</h1>
    <p>Scan this QR code with your phone camera or Expo Go</p>
    <div id="qr"></div>
    <code>${EXPO_URL}</code>
    <div class="status">
      Server: http://${LAN_IP}:3000 &nbsp;·&nbsp; Metro: http://${LAN_IP}:8081
    </div>
  </div>
  <script src="https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js"></script>
  <script>
    var qr = qrcode(0, 'M');
    qr.addData('${EXPO_URL}');
    qr.make();
    document.getElementById('qr').innerHTML = qr.createSvgTag(8, 0);
  </script>
</body>
</html>
QREOF

# Open QR code in browser
open /tmp/soria-qr.html
echo ""
echo "QR code opened in browser — scan it with Expo Go"
echo "Expo URL: $EXPO_URL"
echo ""

# Start server and Expo
echo "Starting server + Expo..."
npx concurrently -n server,expo -c blue,green \
  "npm run server:dev" \
  "npx expo start --tunnel --go --clear"
