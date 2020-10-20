import React, {useState} from 'react';
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

/**
 * State分析：
 * 1. 文件列表
 * 2. 搜索后的文件列表
 * 3. 未保存的文件列表
 * 4. 已经打开的文件列表
 * 5. 当前被选中的文件
 */
function App() {

  const [files, setFiles] = useState(defaultFiles);
  const [activeFileID, setActiveFileID] = useState('');
  const [openedFileIDs, setOpenedFileIDs] = useState([]);
  const [unsavedFileIDs, setUnsavedFileIDs] = useState([]);

  const [searchedFiles, setSearchedFiles] = useState([])

  const openedFiles = openedFileIDs.map(openID => {
    return files.find(file => file.id === openID)
  })
  const activeFile = files.find(file => file.id === activeFileID)
  const fileListArr = (searchedFiles.length > 0) ? searchedFiles : files

  const fileClick = (fileID) => {
    setActiveFileID(fileID)
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
    const newFiles = files.filter(file=>file.id !== id)
    setFiles(newFiles)
    tabClose(id)
  }
  const saveFile = (id, title) => {
    const newFiles = files.map(file=>{
      if(file.id === id){
        file.title = title
        file.isNew = false
      }
      return file
    })
    setFiles(newFiles)
  }
  const fileSearch = (keyword) => {
    const newFiles = files.filter(file => file.title.includes(keyword))
    setSearchedFiles(newFiles)
  }
  const createNewFile = () => {
    const newID = uuidv4() //生成唯一uuid
    const newFiles = [
      ...files,
      {
        id: newID,
        title: '',
        body: '## Please input markdown sentence !!! ',
        createdAt: new Date().getTime(),
        isNew: true,
      }
    ]
    setFiles(newFiles)
  }
  // 更新markdown
  const fileChange = (id, value) => {
    const newFiles = files.map(file => {
      if(file.id === id) {
        file.body = value
      }
      return file
    })
    setFiles(newFiles)
    if(!unsavedFileIDs.includes(id)) {
      setUnsavedFileIDs([...unsavedFileIDs, id])
    }
  }

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
