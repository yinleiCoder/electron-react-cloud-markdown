import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTimes } from '@fortawesome/free-solid-svg-icons'
import PropTypes from 'prop-types';
import classnames from 'classnames';
import './TabList.scss';

const TabList = ({files, activeId, unsaveIds, onTabClick, onCloseTab}) => {
    return (
        <ul className="nav nav-pills tablist-component">
            {
                files.map(file => {
                    const withUnsavedMark = unsaveIds.includes(file.id)
                    const fClassName = classnames({ ///classnames工具可以动态拼接class
                        'nav-link': true,
                        'active': file.id === activeId,
                        'withUnSaved': withUnsavedMark,
                    })
                    return (
                        <li className="nav-item" key={file.id}>
                            <a 
                                href="#"
                                className={fClassName}
                                onClick={(e) => {e.preventDefault();onTabClick(file.id);}}
                            >
                                {file.title}
                                <span 
                                    className="ml-2 close-icon"
                                    onClick={(e)=> {e.stopPropagation();onCloseTab(file.id);}}
                                >
                                    <FontAwesomeIcon  icon={faTimes} />
                                </span>
                                { withUnsavedMark && <span className="rounded-circle unsaved-icon ml-2"></span> }
                            </a>
                        </li>
                    )
                })
            }
        </ul>
    )
}


TabList.propTypes = {
    files: PropTypes.array,
    activeId: PropTypes.string,
    unsaveIds: PropTypes.array,
    onTabClick: PropTypes.func.isRequired,
    onCloseTab: PropTypes.func.isRequired,
}
TabList.defaultProps = {
    unsaveIds: []
}

export default TabList;