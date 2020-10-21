import {useEffect, useRef} from 'react'

const {remote} = window.require('electron');
const {Menu, MenuItem} = remote

/**
 * 自定义hook: 创建上下文菜单
 * @param {*} itemArr 
 */
const useContextMenu = (itemArr, targetSelector,dep) => {
    // useref保持多次引用
    let clickedElement = useRef(null)
    useEffect(()=>{
        const menu = new Menu();
        itemArr.forEach(item => {
            menu.append(new MenuItem(item))
        })
        const handleContextMenu = (e) => {
            // 设置被点击的范围
            if(document.querySelector(targetSelector).contains(e.target)) {
                clickedElement.current = e.target // 记住是点击的谁
                menu.popup({window: remote.getCurrentWindow()})
            }
        }
        window.addEventListener('contextmenu',handleContextMenu )
        return () => {
            window.removeEventListener('contextmenu',handleContextMenu)
        }
    },dep)
    return clickedElement
}

export default useContextMenu;