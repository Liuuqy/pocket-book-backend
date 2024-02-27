const fs = require("fs");
const moment = require("moment");
const path = require("path");
const multer = require("multer");
const express = require("express");
const mkdirp = require("mkdirp");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_KEY = "login2023";
const userModel = require(path.join(__dirname, "/../models/user.js"));
//dest:设置文件存储路径
const uploads = multer({ dest: "./public/uploads" });

router.get("/getuserInfo", async (req, res, next) => {
  //解析token
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  //获取到了信息
  const { username } = decode;
  const userInfo = await userModel.findOne({ username });
  if (userInfo && userInfo.username) {
    res.json({
      flag: true,
      code: 200,
      msg: "信息获取成功",
      data: {
        id: userInfo._id,
        username: userInfo.username,
        signature: userInfo.signature,
        avatar: userInfo.avatar,
      },
    });
  } else {
    res.json({
      flag: false,
      code: 500,
      data: null,
      msg: "信息获取失败",
    });
  }
});
router.post("/edituserInfo", uploads.single("avatar"), async (req, res) => {
  //查找原用户信息
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  let { username, avatar } = decode;
  const userInfo = await userModel.findOne({ username });
  console.log("userInfo:", userInfo);
  //!!!username不能修改
  console.log("body", req.body);
  //获取文件类型
  let file = req.file; //undefined or object
  console.log("file:", file);
  if (file) {
    // 1.获取当前日期
    let day = moment(new Date()).format("YYYYMMDD");
    let dir = path.join(file.destination, day);

    mkdirp.sync(dir); //不存在就创建文件夹
    let date = Date.now(); // 毫秒数
    let oldname = file.path;
    // 返回图片保存的路径
    uploadDir = path.join(dir, date + path.extname(file.originalname));
    // 重命名并保存
    fs.renameSync(oldname, uploadDir);
    //修改avatar
    avatar = file.path;
  }

  //更新信息
  userModel
    .updateOne({ username }, { ...req.body, avatar })
    .then((data, err) => {
      if (err) {
        res.json({
          flag: false,
          msg: "更新失败",
          code: 500,
          err: err,
        });
        return;
      }
      res.json({
        flag: true,
        msg: "修改成功",
        code: 200,
        data: { username, ...req.body, avatar, _id: userInfo._id },
      });
    });
});
module.exports = router;
