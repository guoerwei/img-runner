"use strict";

const os = require("os");
const cluster = require("cluster");
const mkdir = require("make-dir");
const { compressTaskConfig, uploadTaskConfig } = require("../config");

cluster.on("exit", worker => {
  console.log("worker exit: ", worker.id);
});

cluster.on("fork", worker => {
  console.log("worker fork: ", worker.id);
});

(async () => {
  await require("../db").authenticate();
  await require("../db/init")();

  await Promise.all([
    mkdir(compressTaskConfig.directory),
    mkdir(uploadTaskConfig.directory.main),
    mkdir(uploadTaskConfig.directory.thumb),
    mkdir(uploadTaskConfig.directory.cover)
  ]);

  // 启动子进程
  os.cpus().forEach(() => {
    cluster.fork();
  });
})();
