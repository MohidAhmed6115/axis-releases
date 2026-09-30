const { app, BrowserWindow, ipcMain, shell, protocol, net } = require('electron');
const path = require('path');
const http = require('http');
const url = require('url');

// Register custom privileged scheme before app ready
protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      standard: true,
      secure: true,
      supportFetchAPI: true,
      corsEnabled: true,
      stream: true,
    },
  },
]);

let mainWindow = null;
let loopbackServer = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 800,
    minHeight: 600,
    title: 'Axis - Accountability & Daily Productivity',
    backgroundColor: '#0b0f14',
    icon: path.join(__dirname, '../public/axis_logo.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      webSecurity: false,
      allowRunningInsecureContent: false,
    },
  });

  // Open external links in system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http:') || url.startsWith('https:')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  // Toggle DevTools on F12 or Ctrl+Shift+I
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' || (input.control && input.shift && input.key.toLowerCase() === 'i')) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Catch any load failures
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription, validatedURL) => {
    console.error('Failed to load:', validatedURL, errorCode, errorDescription);
  });

  // Load production dist or local dev server
  const devServerUrl = process.env.VITE_DEV_SERVER_URL;
  if (devServerUrl) {
    mainWindow.loadURL(devServerUrl);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Set up Google OAuth loopback redirect listener (RFC 8252 Desktop standard)
function startOAuthLoopbackServer(callback) {
  if (loopbackServer) {
    try {
      loopbackServer.close();
    } catch (e) {}
  }

  loopbackServer = http.createServer((req, res) => {
    const reqUrl = url.parse(req.url, true);
    if (reqUrl.pathname === '/oauth/callback') {
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`
        <!DOCTYPE html>
        <html>
        <head><title>Axis Authentication</title></head>
        <body style="font-family: sans-serif; background: #0b0f14; color: #ece9fb; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0;">
          <div style="text-align: center; padding: 24px; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; background: #131320;">
            <h2 style="color: #2dd4bf; margin: 0 0 8px 0;">Authentication Complete</h2>
            <p style="color: #7d7a96; font-size: 14px; margin: 0;">You can close this tab and return to Axis.</p>
          </div>
          <script>
            // Check for hash tokens or query code
            window.close();
          </script>
        </body>
        </html>
      `);

      callback(reqUrl.query);

      setTimeout(() => {
        if (loopbackServer) {
          loopbackServer.close();
          loopbackServer = null;
        }
      }, 2000);
    }
  });

  loopbackServer.listen(42813, '127.0.0.1', () => {
    console.log('OAuth loopback server listening on http://127.0.0.1:42813/oauth/callback');
  });
}

// In-app Google OAuth handler via BrowserWindow / Loopback
ipcMain.handle('start-google-oauth', async (event, authUrl) => {
  return new Promise((resolve) => {
    let completed = false;

    // Start loopback listener
    startOAuthLoopbackServer((queryData) => {
      if (!completed) {
        completed = true;
        resolve({ success: true, ...queryData });
      }
    });

    // Also open an in-app OAuth window with redirect interception
    const authWin = new BrowserWindow({
      width: 550,
      height: 650,
      show: true,
      parent: mainWindow || undefined,
      modal: true,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    authWin.loadURL(authUrl);

    // Intercept redirect to loopback or custom scheme
    const handleNavigation = (destUrl) => {
      if (
        destUrl.startsWith('http://127.0.0.1:42813/oauth/callback') ||
        destUrl.startsWith('com.axis.app://')
      ) {
        try {
          const parsed = new URL(destUrl);
          const params = Object.fromEntries(parsed.searchParams.entries());
          if (!completed) {
            completed = true;
            resolve({ success: true, ...params });
          }
          authWin.close();
        } catch (e) {
          console.error('Failed parsing OAuth redirect URL:', e);
        }
      }
    };

    authWin.webContents.on('will-navigate', (e, destUrl) => handleNavigation(destUrl));
    authWin.webContents.on('will-redirect', (e, destUrl) => handleNavigation(destUrl));

    authWin.on('closed', () => {
      if (!completed) {
        completed = true;
        resolve({ error: 'OAuth window closed by user' });
      }
    });
  });
});

app.whenReady().then(() => {
  // Protocol handler for app:// scheme
  try {
    protocol.handle('app', (request) => {
      const parsed = new URL(request.url);
      let pathname = decodeURIComponent(parsed.pathname);
      if (pathname === '/' || !pathname) {
        pathname = '/index.html';
      }
      const filePath = path.join(__dirname, '../dist', pathname);
      return net.fetch(url.pathToFileURL(filePath).toString());
    });
  } catch (err) {
    console.error('Failed registering app protocol handler:', err);
  }

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
