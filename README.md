# 说明

本项目为初期试验性版本，代码比较杂乱，里面也有许多无用代码，开个源，仅供娱乐。

项目使用 koa + mysql + redis 以及一系列相关依赖来实现图片的压缩以及 OSS 上传。

一般我们的项目都是在搭建前端工作流的时候，借用[imagemin](https://github.com/imagemin/imagemin)所提供的一系列工具对图片进行处理，但因为图片处理比较耗性能，很容易拖慢每次构建时间。于是这个项目是建立一个服务端处理图片的方案，搭配[https://github.com/guoerwei/img-runner-admin](https://github.com/guoerwei/img-runner-admin)做成web端上传，这样可以将图片从项目中分离出来，以后也可以把工具开放给别的团队使用。

## 大体内容

1. 使用 koa 作为服务端，接收由 web 端提交的文件，生成随机文件名，将文件信息记录至数据库，并将文件暂时保存在服务器上待处理。
2. 服务器定时扫描上传目录，对目录中的图片使用预设的压缩工具进行压缩，生成压缩后的图片存放至另一个目录等待发布 OSS。
3. 由于免费的 tinypng 账号有每月额度限制，后台可以配置多个账号提升额度。
4. 定时扫描待发布目录，将目录中的图片发布至 OSS。

## 未来计划

1. 逻辑调整，目前图片上传之后是先存放后排队等待处理，所以在图片未处理完成的时候，后台是看不到图片的。
2. 目前会提取 GIF 动图的首帧作为缩略图显示在后台，会需要加上动图的提示，否则用户可能以为图是坏的。
3. 增加专辑管理，目前后台里图片是按时间倒序显示在一起的，建立专辑可以单独管理某个项目的图片。
4. 回收站，现在处理失败的图片直接删除，未来处理失败的图片将移至回收站，可以找回。
5. 开放更多的配置，现在只有简单的几个压缩级别对应预设工具。
6. ...

## 本地试玩

目前可以用 docker 在本地环境试玩。

项目默认使用的是 80 端口，如果需要修改的话，在启动项目之前，修改`docker-compose.yml`文件，修改`img_flow`节点下的`ports`端口号，把第一个 80 改成你想要的端口号，第二个不用动，它是容器内部自己使用的端口号。

mysql和redis分别暴露出2个端口出来是为了方便调试用的，不要实际使用。

然后需要建一个 oss 的配置文件，在根目录里建立一个`.private-oss.json`文件，配置自己要使用的 oss 信息，像这样

```json
{
  "type": "aliyun",
  "path": "away-test/uploads",
  "host": "cdn.xxx.com",
  "ossOptions": {
    "region": "oss-cn-shanghai",
    "accessKeyId": "xxx",
    "accessKeySecret": "xxx",
    "bucket": "my-bucket"
  }
}
```

安装完 docker 客户端 后，在命令行中进入本项目根目录，执行

```bash
docker-compose up -d
```

这个命令会安装本项目所需要的镜像，分别是 `node:10.16.0`, `mysql:8`, `redis:5`，并在镜像安装完后，启动容器来运行本项目。这个过程可能会非常漫长，因为会从各个地方下载几个 G 的东西……像vips这东西我实在是装了2天没成功，最后只好下载了源码进来编译了。

docker 镜像建议使用阿里云加速器，登录阿里云后 进[https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors](https://cr.console.aliyun.com/cn-hangzhou/instances/mirrors)有介绍，可以得到一个镜像地址，配置到自己环境里就可以了。但这个仅限安装 docker 镜像的时候，从镜像启动容器之后还会安装很多别的东西……

跑起来之后，在浏览器里访问 `http://127.0.0.1` 就可以直接看到后台了（可能有一段时间的延迟，因为要等docker里的程序开始正常工作）。现在相当于在电脑上启动了虚拟机，里面跑了 mysql, redis 以及我们的 node 项目。

需要关闭的话，在项目根目录执行

```bash
docker-compose stop
```

因为 docker 镜像和容器会留在电脑上，所以第二次启动的时候就会快得多了。

但如果改了代码之类的，可以先删除容器

```bash
docker-compose rm
```

接着重新启动，这时会引起 npm install 等重新执行。
