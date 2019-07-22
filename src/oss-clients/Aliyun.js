"use strict";

const OSS = require("ali-oss");

const { UploadError } = require("../custom-errors/task-errors");

const Base = require("./Base");

class OssClient extends Base {
  constructor(ossConfig) {
    super();
    this.ossConfig = ossConfig;
    this.ossInstance = new OSS(ossConfig.ossOptions);
  }

  async doUpload(localPath, remotePath) {
    console.log(
      "to upload",
      localPath,
      remotePath,
      `${this.ossConfig.path}/${remotePath}`
    );
    const ret = await this.ossInstance.put(
      `${this.ossConfig.path}/${remotePath}`,
      localPath
    );
    if (ret.res && ret.res.status === 200) {
      return true;
    }
    throw new UploadError("上传失败");
  }
}

module.exports = OssClient;
