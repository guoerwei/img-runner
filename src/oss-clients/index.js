"use strict";

const { ossConfig } = require("../config");

let _instances = {};

const getInstance = (configName = "main") => {
  if (!_instances[configName]) {
    const config = ossConfig[configName];
    switch (config.type) {
      case "aliyun":
        return new (require("./Aliyun"))(config);
      default:
        return new (require("./Base"))(config);
    }
  }
  return _instances[configName];
};

module.exports = {
  getInstance
};
