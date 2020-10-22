// electron的主进程
const { app, BrowserWindow,dialog, Menu, ipcMain } = require('electron');
const isDev = require('electron-is-dev');
const path = require('path');

// electron store持久化
const Store = require('electron-store')
const settingsStore = new Store({ name: 'Settings'})//获取设置界面的store
const fileStore = new Store({name: 'Files Data'});

// 七牛
const qiniuManager = require('./src/utils/qiniuManager')
const createQiniuManager = () => {
    const accessKey = settingsStore.get('accessKey')
    const secretKey = settingsStore.get('secretKey')
    const bucketName = settingsStore.get('bucketName')
    return new qiniuManager(accessKey,secretKey,bucketName)
}

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
    // 创建原生菜单
    let menu = Menu.buildFromTemplate(menuTemplate)
    Menu.setApplicationMenu(menu)

    // 处理ipcMain原生菜单发送的事件,打开设置页面，创建新的窗口
    ipcMain.on('open-settings-window', ()=> {
        const settingsWindowConfig = {
            width: 500,
            height: 400,
            parent: mainWindow
        }
        const settingsFileLocation = `file://${path.join(__dirname, './settings/settings.html')}`
        settingsWindow = new CustomAppWindow(settingsWindowConfig,settingsFileLocation)
        settingsWindow.removeMenu()
        settingsWindow.on('closed', () => {
            settingsWindow = null;
        })
    })

    // 七牛云配置参数保存
    /**
     * 如果设置界面配置了七牛的bucket信息，那么菜单的自动同步是enable的，否则就disable
     */
    ipcMain.on('config-is-saved', () => {
        // 菜单监听七牛配置参数变化而变化
        let qiniuMenu = process.platform === 'darwin' ? menu.items[3] :menu.items[2] // mac和windows适配
        const switchItems = (toggle) => {
            [1,2,3].forEach(number => {
                qiniuMenu.submenu.items[number].enabled=toggle
            })
        }
        const qiniuIsConfiged =  ['accessKey', 'secretKey', 'bucketName'].every(key => !!settingsStore.get(key))
        if(qiniuIsConfiged) {
            switchItems(true)
        }else {
            switchItems(false)
        }
    });

    /**
     * 上传文件
     */
    ipcMain.on('upload_file', (event, data) => {
        const manager = createQiniuManager()
        manager.uploadFile(data.key, data.path).then(data => {
            console.log('上传成功！', data)
            mainWindow.webContents.send('active-file-uploaded')
        }).catch(() => {
            dialog.showErrorBox('同步失败', '请检查您当前的七牛云对象存储的参数配置是否正确！')
        })
    })

    /**
     * 获取bucket里的文件信息,比较如果是落后远端就拉取远端到本地
     */
    ipcMain.on('download-file', (event, data) => {
        const manager = createQiniuManager()
        const fileObj = fileStore.get('files')
        const {key, path, id} = data
        manager.getFileState(key).then(res => {
            const serverUpdatedTime = Math.round(res.putTime / 10000)
            const localUpdatedTime = fileObj[id].updatedAt
            if(serverUpdatedTime > localUpdatedTime || !localUpdatedTime) {
                manager.downloadFile(key, path).then(() => {
                    mainWindow.webContents.send('file-downloaded', {status: 'download-success', id})
                })
            }else {
                mainWindow.webContents.send('file-downloaded', {status: 'no-newfile', id})
            }
        }).catch(err => {
            console.error(err)
            if(err.statusCode === 612) { // oss不存在该文件
                mainWindow.webContents.send('file-downloaded', {status: 'no-file', id})
            }
        })
    })

})

