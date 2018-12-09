const Menubar = require('menubar');
const { globalShortcut, Menu } = require('electron');

const menubar = Menubar({
  preloadWindow: true,
  index: `file://${__dirname}/index.jade`,
});

menubar.on('ready', () => {
  const secondaryMenu = Menu.buildFromTemplate([
    {
      label: 'Quit',
      click() {
        menubar.app.quit();
      },
      accelerator: 'CommandOrControl+Q',
    },
  ]);

  menubar.tray.on('right-click', () => {
    menubar.tray.popUpContextMenu(secondaryMenu);
  });

  const createClipping = globalShortcut.register('CmdOrCtrl+Alt+!', () => {
    menubar.window.webContents.send('create-new-clipping');
  });

  const writeClipping = globalShortcut.register('CmdOrCtrl+Alt+@', () => {
    menubar.window.webContents.send('write-to-clipboard');
  });

  if (!createClipping) {
    console.error('Registration failed', 'createClipping');
  }
  if (!writeClipping) {
    console.error('Registration failed', 'writeClipping');
  }
});
