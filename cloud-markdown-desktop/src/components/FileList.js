import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types';
import useKeyPress from '../hooks/useKeyPress'
import useContextMenu from '../hooks/useContextMenu'
import {getParentNode} from '../utils/domHelper'

// 创建上下文菜单
const {remote} = window.require('electron');
const {Menu, MenuItem} = remote

const FileList = ({ files, onFileClick, onSaveEdit, onFileDelete }) => {

    const [ editStatus, setEditStatus ] = useState(false)
    const [ value, setValue ] = useState('')
    const enterPressed = useKeyPress(13)
    const escPressed = useKeyPress(27)
    let node = useRef(null)

    const closeSearch = (editItem) => {
        setEditStatus(false)
        setValue('')
        // 如果正在编辑的文件esc撤销会撤销文件的创建
        if(editItem.isNew){
            onFileDelete(editItem.id)
        }
    }


    const clickedItem = useContextMenu([
        {
            label: '打开',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if(parentElement) {
                    onFileClick(parentElement.dataset.id)
                }
            }
        },
        {
            label: '重命名',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    const { id, title } = parentElement.dataset
                    setEditStatus(id)
                    setValue(title)
                }
            }
        },
        {
            label: '删除',
            click: () => {
                const parentElement = getParentNode(clickedItem.current, 'file-item')
                if (parentElement) {
                    onFileDelete(parentElement.dataset.id)
                }
            }
        }
    ], '.file-list', [files])

    useEffect(() => {
        const editItem = files.find(file => file.id === editStatus)
        if(enterPressed && editStatus && value.trim() !== '') {
            onSaveEdit(editItem.id, value, editItem.isNew)
            setEditStatus(false)
            setValue('')
        }
        if(escPressed && editStatus) {
            closeSearch(editItem)
        }
    })
    useEffect(()=> {
        const newFile = files.find(file => file.isNew)
        // console.log(newFile)
        if(newFile) {
            setEditStatus(newFile.id)
            setValue(newFile.title)
        }
    },[files])
    useEffect(() => {
        if(editStatus) {
            node.current.focus();
        }
    }, [editStatus])

    return (
        <ul className="list-group list-group-flush file-list">
            {
                files.map(file => (
                    <li
                        className="list-group-item bg-light row  d-flex align-items-center file-item mx-0"
                        key={file.id}
                        data-id={file.id}
                        data-title={file.title}
                    >
                        {   (file.id !== editStatus && !file.isNew) && 
                            <>
                                <span className="col-2"><FontAwesomeIcon size="lg" icon={faMarkdown} /></span>
                                <span 
                                    className="col-10 c-link"
                                    onClick = {() => {onFileClick(file.id)}}
                                >{file.title}</span>
                            </>
                        }
                        { ((file.id === editStatus) || file.isNew) && 
                            <>
                                <input 
                                    className="form-control col-10"
                                    value={value}
                                    placeholder="input file name"
                                    ref={node}
                                    onChange={(e) => {setValue(e.target.value)}}
                                />
                                <button
                                    type="button"
                                    className="icon-button col-2"
                                    onClick = {() => closeSearch(file)}
                                >
                                    <FontAwesomeIcon title="Close" size="lg" icon={faTimes} />
                                </button>
                            </>
                        }
                    </li>
                ))
            }
        </ul>
    )
}
FileList.propTypes = {
    files: PropTypes.array,
    onFileClick: PropTypes.func,
    onFileDelete: PropTypes.func,
    onSaveEdit: PropTypes.func,
}
FileList.defaultProps = {
}

export default FileList;