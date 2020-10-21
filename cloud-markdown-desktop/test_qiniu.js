// 七牛测试: electron可以使用node(服务器)
const qiniu = require('qiniu')

// 1.generate mac
const accessKey = '2XzYMlitdRR6q0OyafTlx6xpXSELVH9N5_FgSV9N';
const secretKey = 'ZrPdtjbjGMe0nnxgM2JSxJAJNs7aAKOeIai5XN3u';
const mac = new qiniu.auth.digest.Mac(accessKey, secretKey);

//2.最简单的上传凭证只需要AccessKey，SecretKey和Bucket就可以。
let options = {
    scope: 'yinleilei-react',
};
let putPolicy = new qiniu.rs.PutPolicy(options);
let uploadToken=putPolicy.uploadToken(mac);

// 3.服务器直传
let config = new qiniu.conf.Config();
// 空间对应的机房
config.zone = qiniu.zone.Zone_z0;//我的是华东机房

// 文件上传
let localFile = "F://test.md";
let formUploader = new qiniu.form_up.FormUploader(config);
let putExtra = new qiniu.form_up.PutExtra();
let key='react-electron.md'; // 上传后的文件名

// formUploader.putFile(uploadToken, key, localFile, putExtra, function(respErr,
//     respBody, respInfo) {
//     if (respErr) {
//         throw respErr;
//     }
//     if (respInfo.statusCode === 200) {
//         console.log(respBody);
//     } else {
//         console.log(respInfo.statusCode);
//         console.log(respBody);
//     }
// });


//文件下载【公共空间】
let bucketManager = new qiniu.rs.BucketManager(mac, config);
let publicBucketDomain = 'http://qijz78i2o.hd-bkt.clouddn.com'; // 测试域名30天有效期
let publicDownloadUrl = bucketManager.publicDownloadUrl(publicBucketDomain, key); // 外链
console.log(publicDownloadUrl);

// 运行：node test_qiniu.js