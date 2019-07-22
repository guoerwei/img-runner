"use strict";

const cluster = require("cluster");

if (cluster.isMaster) {
  require("./src/workers/master");
} else {
  require("./src/workers/worker");
}
