
const qiniu = require('qiniu')
const axios = require('axios')
const fs = require('fs');
/**
 * 七牛云OSS SDK的二次封装通用的api
 */
class qiniuManager {
    constructor(accessKey, secretKey, bucket) {
        // 生成凭证
        this.mac = new qiniu.auth.digest.Mac(accessKey, secretKey);
        this.bucket = bucket;
        // 服务器直传
        this.config = new qiniu.conf.Config();
        // 空间对应的机房
        this.config.zone = qiniu.zone.Zone_z0;//我的是华东机房
        this.bucketManager = new qiniu.rs.BucketManager(this.mac, this.config);
    }

    /**
     * 上传文件
     * @param {string} 上传到七牛的名字 
     * @param {string} 本地上传路径 
     */
    uploadFile(key, localFilePath) {
        let options = {
            scope: this.bucket + ":" + key,
        };
        let putPolicy = new qiniu.rs.PutPolicy(options);
        let uploadToken=putPolicy.uploadToken(this.mac);
        let formUploader = new qiniu.form_up.FormUploader(this.config);
        let putExtra = new qiniu.form_up.PutExtra();
        return new Promise((resolve, reject) => {
            formUploader.putFile(uploadToken, key, localFilePath, putExtra, this.handleCallback(resolve,reject));
        });
    }

    /**
     * 删除文件
     * @param {string} key 文件名
     */
    deleteFile(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.delete(this.bucket, key,this.handleCallback(resolve,reject));
        })
    }

    /**
     * 获取七牛云oss桶bucket的domain
     */
    getBucketDomain() {
        const reqURL = `http://api.qiniu.com/v6/domain/list?tbl=${this.bucket}`
        const digest = qiniu.util.generateAccessToken(this.mac,reqURL)
        return new Promise((resolve, reject) => {
            qiniu.rpc.postWithoutForm(reqURL,digest,this.handleCallback(resolve,reject))
        })
    }

    /**
     * 获取oss指定文件的公共外链
     */
    generateDownloadLink(key) {
        // 缓存domain,domain是不变的，不想每次都去发送网络请求获取domain
        const domainPromise = this.publicBucketDomain ? Promise.resolve([this.publicBucketDomain]) : this.getBucketDomain()
        return domainPromise.then(data => {
            if(Array.isArray(data) && data.length > 0) {
                // 检测有没有http前缀
                const pattern = /^https?/
                this.publicBucketDomain = pattern.test(data[0]) ? data[0] : `http://${data[0]}`
                return this.bucketManager.publicDownloadUrl(this.publicBucketDomain, key)
            }else {
                throw new Error('域名未找到，请检查测试域名30天是否过期了?')
            }
        })
    }

    /**
     * 下载文件
     *      // 获取下载外链
        // 发起网络请求
        // 写入 stream to pipe
        // 返回请求结果
     * @param {string}} key 
     * @param {string} downloadPath 
     */
    downloadFile(key, downloadPath) {
        return this.generateDownloadLink(key).then(link => {
            const timeStamp = new Date().getTime()
            const url = `${link}?timestamp=${timeStamp}`
            return axios({
                url,
                method: 'GET',
                responseType: 'stream',
                headers: {'Cache-Control': 'no-cache'}
            }).then(res => {
                const writer = fs.createWriteStream(downloadPath)
                res.data.pipe(writer)
                return new Promise((resolve, reject) => {
                    writer.on('finish', resolve)
                    writer.on('error', reject)
                })
            }).catch(err => {
                return Promise.reject({err: err.response})
            })
        })
    }

    /**
     * 获取bucket里是否真的有该文件及其文件信息
     * @param {string} key 
     */
    getFileState(key) {
        return new Promise((resolve, reject) => {
            this.bucketManager.stat(this.bucket,key,this.handleCallback(resolve, reject))
        })
    }

    // hoc高阶函数：即闭包
    handleCallback(resolve, reject) {
        return (respErr, respBody, respInfo) => {
            if (respErr) {
                throw respErr;
            }
            if (respInfo.statusCode === 200) {
                resolve(respBody)
            } else {
                reject({
                    statusCode: respInfo.statusCode,
                    body: respBody
                })
            }
        }
    }
}

module.exports = qiniuManager;