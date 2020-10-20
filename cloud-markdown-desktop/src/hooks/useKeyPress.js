import React, { useState, useEffect, useRef } from 'react'
/**
 * 自定义hook: 用来处理和界面无关的按键事件
 */
const useKeyPress = (targetKeyCode) => {
    const [keyPressed, setKeyPressed] = useState(false) // 键有没有被按到

    const keyDownHandler = ({keyCode}) => {
        if(keyCode === targetKeyCode) {
            setKeyPressed(true)
        }
    }

    const keyUpHandler = ({keyCode}) => {
        if(keyCode === targetKeyCode) {
            setKeyPressed(false)
        }
    }

    useEffect(()=> {
        document.addEventListener('keydown', keyDownHandler)
        document.addEventListener('keyup', keyUpHandler)
        return () => {
            document.removeEventListener('keydown', keyDownHandler)
            document.removeEventListener('keyup', keyUpHandler)
        }
    }, [])

    return keyPressed
}

export default useKeyPress;