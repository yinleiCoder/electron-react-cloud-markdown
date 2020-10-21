// fs的异步编程promise
const fs = require('fs').promises
const path = require('path')

/**
 * 使用node的fs模块进行文件的持久化
 */
const fileHelper = {
    readFile: (path) =>{
        return fs.readFile(path, {encoding: 'utf8'})
    },
    writeFile: (path, content) => {
        return fs.writeFile(path, content, {encoding: 'utf8'})
    },
    renameFile: (path, newPath) => {
        return fs.rename(path, newPath)
    },
    deleteFile: (path) => {
        return fs.unlink(path)
    }
}

const testPath = path.join(__dirname, 'defaultFiles.js')
const testWriterPath = path.join(__dirname, 'hello.md')
const renamePath = path.join(__dirname, 'rename.md')
fileHelper.readFile(testPath).then(data => {
    console.log(data)
})
fileHelper.writeFile(testWriterPath, '## Hi! i am yinlei!!!').then(() => {
    console.log('write already success!!!')
})
fileHelper.renameFile(testWriterPath,renamePath).then(() => {
    console.log('rename already success!!!')
})
fileHelper.deleteFile(renamePath).then(() => {
    console.log('delete already success!!!')
})
// 运行：node fileHelper.js