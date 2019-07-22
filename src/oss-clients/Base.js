"use strict";

const { UploadError } = require("../custom-errors/task-errors");

class OssClient {
  async doUpload() {
    throw new UploadError("上传失败");
  }
}

module.exports = OssClient;
