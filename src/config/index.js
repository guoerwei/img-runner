"use strict";

const APP_ENV = process.env.APP_ENV;

module.exports =
  APP_ENV === "local"
    ? require("./local")
    : APP_ENV === "daily"
    ? require("./daily")
    : APP_ENV === "pre"
    ? require("./pre")
    : require("./production");
