class Compressor {
  /**
   * 消费次数，主要给tinypng用
   */
  async consume() {
    return true;
  }

  /**
   * 判断一个buff是否可以交由当前引擎处理
   */
  typeAvailable() {
    return true;
  }

  /**
   * 压缩的主方法
   * @param {buffer} buf
   */
  async doCompress(buf) {
    return buf;
  }

  do(...args) {
    return this.doCompress.apply(this, args);
  }
}

module.exports = Compressor;
