// electron的主进程
const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

// 原生应用菜单及其快捷键
const menuTemplate = require('./src/menuTemplate')

// 封装窗口
const CustomAppWindow = require('./src/CustomAppWindow')

let mainWindow,settingsWindow;

app.on('ready', ()=>{
    const mainWindowConfig = {
        width: 1440,
        height: 768,
    }
    // mainWindow.webContents.openDevTools()
    const urlLocation = isDev ? 'http://localhost:3000': '线上环境';
    mainWindow = new CustomAppWindow(mainWindowConfig, urlLocation)
    mainWindow.on('closed', () => {
        mainWindow = null;
    })

    // 处理ipcMain原生菜单发送的事件,打开设置页面，创建新的窗口
    ipcMain.on('open-settings-window', ()=> {
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new CustomAppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        })
    })


    // 创建原生菜单
    const menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)
})

