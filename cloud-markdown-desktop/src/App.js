import React, {useState, useEffect} from 'react';
import logo from './logo.svg';
import { faPlus, faFileImport } from '@fortawesome/free-solid-svg-icons'
import './App.css';
import { v4 as uuidv4 } from 'uuid';
import SimpleMDE from "react-simplemde-editor";
import "easymde/dist/easymde.min.css";
import 'bootstrap/dist/css/bootstrap.min.css';
import FileSearch from './components/FileSearch';
import FileList from './components/FileList';
import BottomBtn from './components/BottomBtn';
import TabList from './components/TabList';
import defaultFiles from './utils/defaultFiles';
import {flattenArr, objToArr} from './utils/flattenHelper';
import fileHelper from './utils/fileHelper';
import useIpcRenderer from './hooks/useIpcRenderer';


const {join,basename, extname, dirname} = window.require('path');
const {remote,ipcRenderer} = window.require('electron');
const Store = window.require('electron-store'); //electron-store持久化数据
const fileStore = new Store({name: 'Files Data'});
const settingsStore = new Store({name: 'Settings'})

// isNew状态信息等不需要存储到文件系统中
// alert(remote.app.getPath('userData'))
// C:\Users\10991\AppData\Roaming\cloud-markdown-desktop
const saveFilesToStore = (files) => {
  const filesStoreObj = objToArr(files).reduce((result, file) => {
    const {id, path, title, createdAt} = file
    result[id] = {
      id, 
      path,
      title,
      createdAt
    }
    return result 
  }, {})
  fileStore.set('files', filesStoreObj)
}

/**
 * State分析：
 * 1. 文件列表
 * 2. 搜索后的文件列表
 * 3. 未保存的文件列表
 * 4. 已经打开的文件列表
 * 5. 当前被选中的文件
 */
function App() {

  const savedLocation =settingsStore.get('savedFileLocation') || remote.app.getPath('documents') // 交给electron渲染进程去做

  // const [files, setFiles] = useState(flattenArr(defaultFiles));
  const [files, setFiles] = useState(fileStore.get('files') || {});
  const [activeFileID, setActiveFileID] = useState('');
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);

  const [searchedFiles, setSearchedFiles] = useState([])

  const filesArr = objToArr(files)


  const openedFiles = openedFileIDs.map(openID => {
    // return files.find(file => file.id === openID)
    return files[openID]
  })
  // const activeFile = files.find(file => file.id === activeFileID)
  const activeFile = files[activeFileID]
  // const fileListArr = (searchedFiles.length > 0) ? searchedFiles : files
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : filesArr

  const fileClick = (fileID) => {
    // console.log(files[fileID].body)
    setActiveFileID(fileID)
    const currentFile = files[fileID]
    if(currentFile.isLoaded) { // 第一次读取该文件
      fileHelper.readFile(currentFile.path).then((value)=>{
        const newFile = {...files[fileID], body: value, isLoaded: true}
        setFiles({...files,[fileID]: newFile })
      })
    }

    if(!openedFileIDs.includes(fileID)) {
      setOpenedFileIDs([...openedFileIDs, fileID])
    }
  }
  const tabClick = (fileID) => {
    setActiveFileID(fileID)
  }
  const tabClose = (id) => {
    const tabsWithout = openedFileIDs.filter(fileID => fileID !== id)
    setOpenedFileIDs(tabsWithout)
    if(tabsWithout.length>0) {
      setActiveFileID(tabsWithout[0])
    }else {
      setActiveFileID('')
    }
  } 
  const deleteFile = (id) => {
    if(files[id].isNew) {
      const { [id]: value, ...afterDelete } = files
      setFiles(afterDelete)
    }else {
      fileHelper.deleteFile(files[id].path).then(()=> {
        const { [id]: value, ...afterDelete } = files
        setFiles(afterDelete)
        saveFilesToStore(afterDelete)
        tabClose(id)
      })
    }
  }
  const saveFile = (id, title, isNew) => {
    const newPath = isNew ?  join(savedLocation,`${title}.md`)
        : join(dirname(files[id].path),`${title}.md`)
    const modifiedFile = {...files[id], title, isNew: false, path: newPath}
    const newFiles = {...files, [id]: modifiedFile}
    if(isNew) {
      fileHelper.writeFile(newPath, files[id].body).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }else {
      const oldPath = files[id].path
      fileHelper.renameFile(oldPath,newPath ).then(() => {
        setFiles(newFiles)
        saveFilesToStore(newFiles)
      })
    }
  }
  const saveCurrentFile = () => {
      fileHelper.writeFile(activeFile.path,
      activeFile.body).then(() => {
        setUnsavedFileIDs(unsavedFileIDs.filter(id => id !== activeFile.id))
      })
  }
  const fileSearch = (keyword) => {
    const newFiles = filesArr.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const createNewFile = () => {
    const newID = uuidv4() //生成唯一uuid
    const newFile  =  {
      id: newID,
      title: '',
      body: '## Please input markdown sentence !!! ',
      createdAt: new Date().getTime(),
      isNew: true,
    }
    setFiles({...files, [newID]: newFile})
  }
  // 更新markdown
  const fileChange = (id, value) => {
    if(value !== files[id].body ) {
      const newFile = {...files[id], body: value}
      setFiles({ ...files, [id]: newFile})
      if(!unsavedFileIDs.includes(id)) {
        setUnsavedFileIDs([...unsavedFileIDs, id])
      }
    }
  }

  // 使用electron打开原生的dialog
  const importFiles =() => {
    remote.dialog.showOpenDialog({
      title: '选择将要导入的markdown文件',
      properties: ['openFile', 'multiSelections'],
      filters: [
        {name: 'Markdown files', extensions: ['md']}
      ]
    }).then((result)=>{
      //canceled filePaths
      const {canceled,filePaths} = result
      if(!canceled) {
        // 查找是否已经在electron store添加过
        const filteredPaths = filePaths.filter(path => {
          const alreayAdded = Object.values(files).find(file => {
            return file.path === path 
          })
          return !alreayAdded
        })
        // 包装为electron store里每个file格式
        const importFilesArr = filteredPaths.map(path => {
          return {
            id: uuidv4(),
            title: basename(path, extname(path)),
            path
          }
        })
        // console.log(importFilesArr)
        // 获取flattenarray
        const newFiles = {...files, ...flattenArr(importFilesArr)}
        // console.log(newFiles)
        // 更新在electron store
        setFiles(newFiles)
        saveFilesToStore(newFiles)
        if(importFilesArr.length>0) {
          remote.dialog.showMessageBox({
            type: 'info',
            title: `导入提示`,
            message: `成功导入了${importFilesArr.length}个文件 !!!`,
          })
        }
      }
    })
  }

  useIpcRenderer({
    'create-new-file': createNewFile,
    'import-file': importFiles,
    'save-edit-file': saveCurrentFile,
  })

  return (
    <div className="App container-fluid px-0">
      <div className="row no-gutters">
        <div className="col-3 bg-light left-panel">
          <FileSearch 
            title='我的云文档'
            onFileSearch={fileSearch}
          />
          <FileList
            files={fileListArr}
            onFileClick={fileClick}
            onFileDelete={deleteFile}
            onSaveEdit={saveFile}
          />
          <div className="row no-gutters button-group">
            <div className="col">
              <BottomBtn
                text="新建"
                colorClass="btn-primary"
                icon={faPlus}
                onBtnClick={createNewFile}
              />
            </div>
            <div className="col">
              <BottomBtn
                text="导入"
                colorClass="btn-success"
                icon={faFileImport}
                onBtnClick={importFiles}
              />
            </div>
          </div>
        </div>
        <div className="col-9 right-panel">
          {!activeFile && 
            <div className="start-page">
              Choose or make a new 'Markdown document' !!!
            </div>
          }
          { activeFile && 
            <>
              <TabList
                files={openedFiles}
                activeId={activeFileID}
                unsaveIds={unsavedFileIDs}
                onTabClick={tabClick}
                onCloseTab={tabClose}
              />
              <SimpleMDE 
                key={activeFile && activeFile.id}
                value={activeFile && activeFile.body}
                onChange={(value) => {fileChange(activeFile.id, value)}}
                options={{
                  minHeight: '515px',
                }}
              />
            </>
          }
        </div>
      </div>
    </div>
  );
}

export default App;
