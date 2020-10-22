const qiniuManager = require('./src/utils/qiniuManager')
const path = require('path')

const accessKey = '2XzYMlitdRR6q0OyafTlx6xpXSELVH9N5_FgSV9N';
const secretKey = 'ZrPdtjbjGMe0nnxgM2JSxJAJNs7aAKOeIai5XN3u';
let localFile = "F://test.md";
let key='react-electron-yinlei.md'; // 上传后的文件名
let publicBucketDomain = 'http://qijz78i2o.hd-bkt.clouddn.com'; // 测试域名30天有效期
let downloadPath = path.join(__dirname, key)

const manager = new qiniuManager(accessKey, secretKey, 'yinleilei-react')
// 上传文件到oss
// manager.uploadFile(key, localFile).then((data)=> {
//     console.log('上传成功',data)
//     return manager.deleteFile(key)
// }).then((data)=> {
//     console.error('删除成功！！！')
// })

// 获取bucket domain[不想手动复制粘贴，所以用七牛提供的api来做]
// manager.getBucketDomain().then(data => {
//     console.log(data)
// })

// 获取外链
// manager.generateDownloadLink(key).then(data=>{
//     console.log(data)
// })

//下载文件到本地
manager.downloadFile(key, downloadPath).then(()=> {
    console.log('下载并写入文件完成！')
}).catch(err => {
    console.error(err)
})

// 运行测试：node test-qiniumanager.js