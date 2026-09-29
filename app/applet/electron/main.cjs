const { app, BrowserWindow, ipcMain, shell } = require('electron');
const path = require('path');
const http = require('http');
const url = require('url');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 960,
    minHeight: 640,
    title: 'Axis — Accountability & Daily Productivity',
    backgroundColor: '#0c0c14',
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  // Handle external link clicks safely
  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: 'deny' };
  });

  const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged;
  if (isDev && process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// -----------------------------------------------------------------------------
// Desktop OAuth Loopback Handler for Google Calendar / Auth
// -----------------------------------------------------------------------------
ipcMain.handle('oauth:start-loopback', async (_event, { clientId, scopes }) => {
  return new Promise((resolve, reject) => {
    // 1. Create a transient HTTP loopback server on ephemeral 127.0.0.1 port
    const server = http.createServer((req, res) => {
      try {
        const parsedUrl = url.parse(req.url, true);
        if (parsedUrl.pathname === '/oauth2callback') {
          const { code, error } = parsedUrl.query;

          res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
          res.end(`
            <html>
              <body style="font-family: system-ui, sans-serif; background: #0c0c14; color: #ece9fb; text-align: center; padding: 60px 20px;">
                <h2 style="color: #10b981; font-size: 24px; margin-bottom: 8px;">✓ Axis Authentication Successful</h2>
                <p style="color: #9490ad; font-size: 14px;">You can now close this tab and return to the Axis desktop app.</p>
                <script>window.setTimeout(() => window.close(), 1500);</script>
              </body>
            </html>
          `);

          // Clean up server
          server.close();

          if (error) {
            reject(new Error(`OAuth error: ${error}`));
          } else if (code) {
            resolve({ code: Array.isArray(code) ? code[0] : code });
          } else {
            reject(new Error('No authorization code received from callback'));
          }
        } else {
          res.writeHead(404);
          res.end();
        }
      } catch (err) {
        server.close();
        reject(err);
      }
    });

    server.listen(0, '127.0.0.1', () => {
      const address = server.address();
      const port = address.port;
      const redirectUri = `http://127.0.0.1:${port}/oauth2callback`;

      const scopeString = encodeURIComponent(
        (scopes || [
          'openid',
          'email',
          'profile',
          'https://www.googleapis.com/auth/calendar.events',
        ]).join(' ')
      );

      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
        `client_id=${encodeURIComponent(clientId)}&` +
        `redirect_uri=${encodeURIComponent(redirectUri)}&` +
        `response_type=code&` +
        `scope=${scopeString}&` +
        `access_type=offline&` +
        `prompt=consent`;

      // Open user's default desktop browser
      shell.openExternal(authUrl);

      // Auto-timeout after 3 minutes if user abandons flow
      setTimeout(() => {
        try {
          server.close();
        } catch (_) {}
        reject(new Error('OAuth loopback flow timed out after 180 seconds'));
      }, 180000);
    });

    server.on('error', (err) => {
      reject(err);
    });
  });
});

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
