<template>
  <div
    class="CosUpload"
    :class="type === 'avatar' ? 'avatarUpload' : ''"
  >
    <el-upload
      ref="upload"
      class="upload-demo"
      :http-request="cosUpload"
      :drag="type === 'drag'"
      :action="action"
      :multiple="multiple"
      :show-file-list="showFileList"
      :list-type="listType"
      :auto-upload="autoUpload"
      :file-list="fileList"
      :limit="limit"
      :accept="accept"
      :on-preview="onPreview"
      :on-remove="onRemove"
      :on-success="onSuccess"
      :on-error="onError"
      :on-progress="onProgress"
      :on-change="onChange"
      :before-upload="onBeforeUpload"
      :before-remove="onBeforeRemove"
      :on-exceed="onExceed"
      :disabled="disabled"
      :data="uploadData"
    >
      <slot name="default" />
      <slot
        v-if="type === 'file'"
        name="file"
      />
      <slot
        v-if="type === 'drag'"
        name="drag"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
      </slot>
      <slot
        v-if="type === 'avatar'"
        name="avatar"
      >
        <div
          v-if="imageUrl"
          class="avatarWrap"
          :style="{ width, height }"
        >
          <img
            :src="imageUrl"
            class="avatar"
          >
          <div class="avatarMask"><span>重新上传</span></div>
        </div>
        <i
          v-else
          class="el-icon-plus avatar-uploader-icon"
          :style="{ width, height, lineHeight: height }"
        />
      </slot>
      <slot
        v-if="listType === 'picture-card'"
        name="pictureCard"
      >
        <i class="el-icon-plus" />
      </slot>
      <!-- <slot name="tip" class="el-upload__tip"></slot> -->
    </el-upload>
  </div>
</template>

<script>
import COS from 'cos-js-sdk-v5';
import TcVod from 'vod-js-sdk-v6';
export default {
    name: 'CosUpload',
    props: {
        action: {
            type: String,
            default: '#' // 上传的地址
        },
        type: {
            type: String, // file 可根据插槽自定义上传模式 avatar 单图片模式  drag 可拖拽上传文件
            default: 'file' // 是否是单图片上传模式
        },
        imageUrl: {
            type: String,
            default: '' // 上传的单图片url
        },
        multiple: {
            type: Boolean,
            default: false // 是否支持多选文件
        },
        headers: {
            type: Object,
            default: () => {} // 设置的请求头
        },
        uploadData: {
            type: Object,
            default: () => {} // 设置的请求参数
        },
        showFileList: {
            type: Boolean,
            default: true // 是否显示上传列表
        },
        listType: {
            type: String,
            default: 'text' // 文件列表的类型
        },
        autoUpload: {
            type: Boolean,
            default: true // 是否选取文件后立即上传
        },
        fileList: {
            type: Array,
            default: () => [] // 上传的文件列表
        },
        limit: {
            type: Number,
            default: 2 // 最大上传个数
        },
        replace: {
            type: Boolean,
            default: true // 每次上传会替换之前的文件
        },
        accept: {
            type: String, // 接受上传文件的类型
            default: '*' // '.pdf,.doc,.docx'
        },
        beforeUpload: {
            type: Function, // 传入的上传前的回调函数
            default: () => {}
        },
        disabled: {
            type: Boolean,
            default: false // 是否禁用
        },
        beforeRemoveFun: {
            type: Function, // 删除之前的回调函数
            default: () => {}
        },
        width: {
            type: String,
            default: '138px'
        },
        height: {
            type: String,
            default: '138px'
        },
        fileSize: {
            type: Number,
            default: 100 // MB
        },
        fileNumber: { // 记录上传的文件,只统计本次上传的文件数,多文件上传必传
            type: Number,
            default: 1
        }
    },
    data() {
        return {
            fileSuccessTotal: 0,
            fileErrorTotal: 0,
            allFiles: [],
            errFiles: []
        };
    },
    methods: {
    // 生成唯一uuid
        generateUUID() {
            let d = new Date().getTime();
            if (window.performance && typeof window.performance.now === 'function') {
                d += performance.now(); // use high-precision timer if available
            }
            const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(
                /[xy]/g,
                function(c) {
                    var r = (d + Math.random() * 16) % 16 | 0;
                    d = Math.floor(d / 16);
                    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
                }
            );
            return uuid;
        },
        /**
     * 点击文件列表中已上传的文件时的钩子
     * @param file 当前文件
     */
        onPreview(file) {
            this.$emit('onPreview', file);
        },
        /**
     * 文件列表移除文件时触发的钩子
     * @param file 当前文件
     * @param fileList 当前文件列表
     */
        onRemove(file, fileList) {
            this.$emit('onRemove', file, fileList);
        },
        /**
     * 文件上传成功时触发的钩子
     * @param file 当前文件
     * @param fileList 当前文件列表
     * @param response 接口的回调
     */
        onSuccess(response, file, fileList) {
            console.log('success', response, file, fileList);
            this.$emit('onSuccess', response, file, fileList);
        },
        /**
     * 文件上传失败时触发的钩子
     * @param file 当前文件
     * @param fileList 当前文件列表
     * @param err 接口的回调
     */
        onError(err, file, fileList) {
            console.log('err:', err);
            this.$emit('onError', err, file, fileList);
        },
        /**
     * 文件上传时触发的钩子，用于进度展示
     * @param file 当前文件
     * @param fileList 当前文件列表
     * @param event
     */
        onProgress(progressData, file, fileList) {
            this.$emit('onProgress', progressData, file, fileList);
        },
        /**
     * 文件状态改变时触发的钩子（包括成功、失败、上传时）
     * @param file 当前文件
     * @param fileList 当前文件列表
     */
        onChange(file, fileList) {
            // replace为true 替换文件
            if (this.replace && fileList.length > 1) {
                fileList.splice(0, 1);
            }
            this.$emit('onChange', file, fileList);
        },
        /**
     * 文件上传前的回调  若返回 false 或者返回 Promise 且被 reject，则停止上传
     * @param file 当前文件
     */
        onBeforeUpload(file) {
            this.allFiles = []; // 再次上传清空
            // 判断文件类型 大小
            let isAccept = true;
            if (this.accept !== '*') {
                const acceptList = this.accept.split(',');
                const fileSuffix = '.' + file.name.replace(/.+\./, ''); // 文件尾缀, 用于判断文件类型
                isAccept = acceptList.indexOf(fileSuffix) !== -1;
            }
            // 基础单位 byte（B）
            const isLtSize = file.size / 1024 / 1024 < this.fileSize;
            if (!isAccept) {
                this.$message.error('上传文件格式与要求不符！');
                return false;
            }
            if (!isLtSize) {
                this.$message.error(`上传文件过大！最大可上传${this.fileSize}M的文件!`);
                return false;
            }
            this.$emit('beforeUpload', file);
            // 兼容传入函数写法
            if (this.beforeUpload) {
                return this.beforeUpload(file);
            }
            return true;
        },
        /**
     * 文件移除前的回调  若返回 false 或者返回 Promise 且被 reject，则停止删除
     * @param file 当前文件
     * @param fileList 当前文件列表
     */
        onBeforeRemove(file, fileList) {
            this.$emit('beforeRemove', file, fileList);
            // 兼容传入函数写法
            if (this.beforeRemoveFun) {
                return this.beforeRemoveFun(file, fileList);
            }
            return true;
        },
        /**
     * 文件超出个数时的回调
     * @param file 当前文件
     * @param fileList 当前文件列表
     */
        onExceed(file, fileList) {
            this.$message.error(`最多可上传${this.limit}个文件！`);
            this.$emit('onExceed', file, fileList);
        },
        // 手动执行上传
        submit() {
            this.$refs.upload.submit();
        },
        // 手动取消上传
        abort() {
            this.$refs.upload.abort();
        },
        clearFiles() {
            this.$refs.upload.clearFiles();
        },
        // 覆盖默认的上传行为，自定义上传的实现
        cosUpload(options) {
            const _this = this;
            const file = options.file; // 拿到 file
            // const fileName = file.name.substr(0, file.name.lastIndexOf('.')) // 拿到 文件名称
            const fileName = this.generateUUID(); // 用uuid代替文件名
            const fileSuffix = '.' + file.name.replace(/.+\./, ''); // 文件尾缀, 用于判断文件类型
            // const date = new Date().getTime() //  当前时间戳
            // 调接口 获取COS配置信息
            const params = {
                filePath: `/jztb/${fileName}${fileSuffix}`
            };
            this.$api.toolsApi.getCosOption(params).then((res) => {
                const MediaArr = [
                    '.wmv',
                    '.mp4',
                    '.flv',
                    '.avi',
                    '.rmvb',
                    '.mpg',
                    '.mkv',
                    '.mov',
                    '.mts',
                    '.w4v',
                    '.m4a',
                    '.wma',
                    '.wav',
                    '.mp3',
                    '.amr'
                ];
                const cosRes = JSON.parse(res.data.config);
                if (MediaArr.indexOf(fileSuffix) !== -1) {
                    // 媒体文件（视频或音频） 需要上传到云点播
                    const tcVod = new TcVod({
                        getSignature: () => {
                            return res.data.uploadSign;
                        } // 获取上传签名的函数
                    });
                    const tcVodUpload = tcVod.upload({
                        mediaFile: file // 媒体文件（视频或音频或图片），类型为 File
                    });
                    tcVodUpload.on('media_progress', function(progressData) {
                        options.onProgress(progressData); // 进度
                    });
                    // 回调结果说明
                    // type doneResult = {
                    //   fileId: string,
                    //   video: {
                    //     url: string
                    //   },
                    //   cover: {
                    //     url: string
                    //   }
                    // }
                    tcVodUpload
                        .done()
                        .then(function(doneResult) {
                            _this.fileSuccessTotal = _this.fileSuccessTotal + 1;
                            // 上传成功
                            const res = {
                                fileId: doneResult.fileId,
                                fileUrl: doneResult.video.url
                            };
                            if (_this.multiple) { // 多文件上传
                                doneResult.file = file;
                                _this.allFiles.push(doneResult);
                                if ((_this.fileSuccessTotal + _this.fileErrorTotal) === _this.fileNumber) { // 上传全部成功
                                    _this.fileSuccessTotal = 0;
                                    _this.fileErrorTotal = 0;
                                    if (_this.fileErrorTotal > 0) { // 最后一次成功，中间有失败
                                        _this.onError(_this.errFiles);
                                    } else { // 全部成功
                                        _this.onSuccess(_this.allFiles);
                                    }
                                }
                            } else {
                                options.onSuccess(res);
                            }
                        })
                        .catch(function(err) {
                            // 多文件上传失败
                            if (_this.multiple) {
                                _this.fileErrorTotal = _this.fileErrorTotal + 1;
                                _this.errFiles.push(file);
                                if ((_this.fileSuccessTotal + _this.fileErrorTotal) === _this.fileNumber) { // 最后一次上传失败
                                    _this.fileSuccessTotal = 0;
                                    _this.fileErrorTotal = 0;
                                    _this.onError(_this.errFiles);
                                }
                            } else {
                                options.onError(err);
                            }
                        });
                } else {
                    // 普通文件
                    const cos = new COS({
                        getAuthorization: function(options, callback) {
                            callback({
                                TmpSecretId: cosRes.credentials.tmpSecretId,
                                TmpSecretKey: cosRes.credentials.tmpSecretKey,
                                XCosSecurityToken: cosRes.credentials.sessionToken,
                                StartTime: cosRes.startTime,
                                ExpiredTime: cosRes.expiredTime,
                                expiration: cosRes.expiration,
                                requestId: cosRes.requestId
                            });
                        }
                    });
                    cos.uploadFile(
                        {
                            Bucket: res.data.bucketName /* 填入您自己的存储桶，必须字段 */,
                            Region:
                res.data.region /* 存储桶所在地域，例如ap-beijing，必须字段 */,
                            Key: `/jztb/${fileName}${fileSuffix}` /* 存储在桶里的对象键（例如1.jpg，a/b/test.txt），必须字段 */,
                            Body: options.file, // 上传文件对象
                            SliceSize:
                1024 *
                1024 *
                5 /* 触发分块上传的阈值，超过5MB使用分块上传，非必须 */,
                            onProgress: function(progressData) {
                                /* 非必须 */
                                options.onProgress(progressData); // 进度
                            }
                            // onFileFinish: function (err, data, options) {
                            //   console.log(options.Key + '上传' + (err ? '失败' : '完成'))
                            // },
                        },
                        function(err, doneResult) {
                            console.log(err || doneResult);
                            if (err) {
                                // 上传失败
                                options.onError(err);
                            } else {
                                // 上传成功
                                const res = {
                                    fileId: '',
                                    fileUrl: `https://${doneResult.Location}`
                                };
                                options.onSuccess(res);
                            }
                        }
                    );
                }
            });
        }
    }
};
</script>

<style scoped lang="scss">
.avatarUpload {
  ::v-deep .el-upload {
    border: 1px dashed #d9d9d9;
    border-radius: 6px;
    cursor: pointer;
    position: relative;
    overflow: hidden;
  }
  ::v-deep .el-upload:hover {
    border-color: #409eff;
  }

  .avatarWrap {
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    .avatarMask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      text-align: center;
      color: #fff;
      background: rgba(0, 0, 0, 0.5);
      opacity: 0;
      transition: 0.5s opacity;
      span {
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translateX(-50%) translateY(-50%);
      }
    }
    .avatarMask:hover {
      opacity: 1;
    }
    .avatar {
      max-width: 100%;
      /* height: 100%; */
      display: block;
    }
    .avatar-uploader-icon {
      font-size: 28px;
      color: #8c939d;
      text-align: center;
    }
  }
}
</style>
