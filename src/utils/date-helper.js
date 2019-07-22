/**
 * 时间日期相关的一些常用方法
 */
"use strict";

/**
 * 前导零
 * @param {number} v
 */
const prefix = v => (v < 10 ? "0" : "") + v;

/**
 * 字符串转Data对象
 * @param {string} str
 */
const str2date = str => {
  let exec = /(\d{2,4})-(\d{1,2})-(\d{1,2})\s(\d{1,2}):(\d{1,2}):(\d{1,2})/.exec(
    str
  );
  let res = new Date(0);
  if (exec && exec[1]) {
    res.setFullYear(exec[1]);
    res.setMonth(parseInt(exec[2], 10) - 1);
    res.setDate(exec[3]);
    res.setHours(exec[4]);
    res.setMinutes(exec[5]);
    res.setSeconds(exec[6]);
  }
  return res;
};

/**
 * 把日期对象格式化成字符串
 * @param {Date} date
 * @param {string} format
 */
const date2str = (date, format = "") => {
  let newDate = new Date(date.getTime());
  let replace = v => {
    switch (v) {
      case "YYYY":
        return newDate.getFullYear();
      case "YY":
        return newDate.getFullYear().substr(-2);
      case "MM":
        return prefix(newDate.getMonth() + 1);
      case "M":
        return newDate.getMonth() + 1;
      case "DD":
        return prefix(newDate.getDate());
      case "D":
        return newDate.getDate();
      case "HH":
        return prefix(newDate.getHours());
      case "H":
        return newDate.getHours();
      case "mm":
        return prefix(newDate.getMinutes());
      case "m":
        return newDate.getMinutes();
      case "ss":
        return prefix(newDate.getSeconds());
      case "s":
        return newDate.getSeconds();
      case "w":
        return newDate.getDay();
      case "W":
        return "日一二三四五六"[newDate.getDay()];
    }
  };
  return format.replace(
    /Y{4}|Y{2}|M{1,2}|D{1,2}|H{1,2}|m{1,2}|s{1,2}|W|w/g,
    $0 => replace($0)
  );
};

module.exports = {
  str2date,
  date2str
};
