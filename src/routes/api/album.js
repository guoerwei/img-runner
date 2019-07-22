"use strict";

const Router = require("koa-router");
const { Op } = require("sequelize");

const inputValidation = require("../../middlewares/input-validation");
const { ResourceNotFoundError } = require("../../custom-errors/check-errors");

const AlbumModel = require("../../db/AlbumModel");
const AlbumImageModel = require("../../db/AlbumImageModel");
const ImageModel = require("../../db/ImageModel");

const router = new Router();

/**
 * 专辑列表
 */
router.get("/", inputValidation("/api/album/list.json"), async ctx => {
  const list = await AlbumModel.findAll({
    where: {
      name: {
        [Op.like]: `${ctx.input.query.name}%`
      }
    },
    offset: ctx.input.query.offset,
    limit: ctx.input.query.limit
  });
  ctx.apiResponse({
    list
  });
});

/**
 * 新增专辑
 */
router.post("/", inputValidation("/api/album/create.json"), async ctx => {
  await AlbumModel.create({
    name: ctx.input.body.name
  });
  ctx.apiResponse();
});

/**
 * 修改一个专辑，主要是改名
 */
router.put("/:id(\\d+)", inputValidation("/api/album/update"), async ctx => {
  const album = await AlbumModel.findByPk(ctx.input.params.id);
  if (!album) {
    throw new ResourceNotFoundError("专辑不存在");
  }
  album.name = ctx.input.body.name;
  await album.save();
  ctx.apiResponse();
});

/**
 * 删除一个专辑，把与图片的对应关系也删掉
 */
router.delete(
  "/:id(\\d+)",
  inputValidation("/api/album/delete.json"),
  async ctx => {
    const album = await AlbumModel.findByPk(ctx.input.params.id);
    if (!album) {
      throw new ResourceNotFoundError("专辑不存在");
    }
    await album.destroy();
    // 由于有设置外键，albumImage里对应的数据会自动被删除
    ctx.apiResponse();
  }
);

/**
 * 查看一个专辑，包含专辑信息和图片列表
 */
router.get(
  "/:id(\\d+)",
  inputValidation("/api/album/one-album.json"),
  async ctx => {
    const [album, list] = await Promise.all([
      AlbumModel.findByPk(ctx.input.params.id),
      AlbumImageModel.findAndCountAll({
        where: { albumID: ctx.input.params.id },
        offset: ctx.input.query.offset,
        limit: ctx.input.query.limit,
        include: [
          {
            model: ImageModel
            // attributes: ["id", "name", "size", "cover", "thumb", "status"]
          }
        ],
        order: [["imageId", "DESC"]]
      })
    ]);
    if (!album) {
      throw new ResourceNotFoundError("专辑不存在");
    }
    ctx.apiResponse({
      album,
      list // count, rows
    });
  }
);

/**
 * 将图片添加到专辑里
 */
router.put(
  "/:id(\\d+)/photos",
  inputValidation("/api/album/pick.json"),
  async ctx => {
    const [album, images] = await Promise.all([
      AlbumModel.findByPk(ctx.input.params.id),
      ImageModel.findAll({
        attributes: ["id"],
        where: { id: ctx.input.body.imageIds }
      })
    ]);
    if (!album) {
      throw new ResourceNotFoundError("专辑不存在");
    }
    if (images.length != ctx.input.body.imageIds.length) {
      throw new ResourceNotFoundError("存在无效的图片");
    }
    const existList = (await AlbumImageModel.findAll({
      attributes: ["imageId"],
      where: { albumId: ctx.input.params.id, imageId: ctx.input.body.imageIds }
    })).map(v => v.imageId);
    const newList = ctx.input.body.imageIds.filter(v => !existList.includes(v));
    if (newList) {
      await AlbumImageModel.bulkCreate(
        newList.map(v => ({
          albumId: ctx.input.params.id,
          imageId: v
        }))
      );
    }
    ctx.apiResponse();
  }
);

router.put(
  "/:id(\\d+)/photos-drop",
  inputValidation("/api/album/drop.json"),
  async ctx => {
    const album = await AlbumModel.findByPk(ctx.input.params.id);
    if (!album) {
      throw new ResourceNotFoundError("专辑不存在");
    }
    await AlbumImageModel.destroy({
      where: {
        albumId: ctx.input.params.id,
        imageId: ctx.input.body.imageIds
      }
    });

    ctx.apiResponse();
  }
);

module.exports = router;
