import React, { useState, useEffect, useRef } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faEdit, faTrash, faTimes } from '@fortawesome/free-solid-svg-icons'
import { faMarkdown } from '@fortawesome/free-brands-svg-icons'
import PropTypes from 'prop-types';

const BottomBtn = ({text, colorClass, icon, onBtnClick}) => (
    <button
        type="button"
        className={`btn btn-block no-border ${colorClass}`}
        onClick={onBtnClick}
    >
        <FontAwesomeIcon className="mr-2" size="lg" icon={icon} />
        {text}
    </button>
)

BottomBtn.propTypes = {
    text: PropTypes.string,
    colorClass: PropTypes.string,
    // icon: PropTypes.element.isRequired,
    onBtnClick: PropTypes.func,
}
BottomBtn.defaultProps = {
    text: 'New'
}

export default BottomBtn;