const express = require("express");
const path = require("path");
const router = express.Router();
const userModel = require(path.join(__dirname, "/../models/user.js"));
const jwt = require("jsonwebtoken");
const SECRET_KEY = "login2023";
const { tokenAuthMiddleware } = require("../middleware/jwtErrHandler");
//登录
router.post("/api/login", async (req, res, next) => {
  //前端控制信息完整性
  const { username, password } = req.body;
  console.log(username);
  //查找是否存在信息
  const userInfo = await userModel.findOne({ username });
  if (!userInfo || !userInfo._id) {
    res.json({
      flag: false,
      code: 500,
      msg: "账号不存在",
      data: null,
    });
    return;
  }
  //校验密码
  if (userInfo && password !== userInfo.password) {
    res.json({
      flag: false,
      code: 500,
      msg: "密码错误",
      data: null,
    });
    return;
  }
  //登陆成功发送token
  const token = jwt.sign({ username, password }, SECRET_KEY, {
    expiresIn: "24h",
  });
  res.json({
    flag: true,
    code: 200,
    msg: "登录成功",
    token: token,
  });
});

//已通过
//注册
router.post("/api/register", async (req, res, next) => {
  //前面内置了插件可以解析req请求
  //前端控制信息的完整性
  const { username, password } = req.body;
  //判断是否已经存有信息
  const userInfo = await userModel.findOne({ username });
  if (userInfo && userInfo._id) {
    res.json({
      flag: false,
      msg: "用户名已被注册，请重新输入",
      data: null,
    });
    return;
  }
  const ctime = new Date();
  userModel
    .create({ username, password, ctime })
    .then((data) => {
      res.json({
        flag: true,
        msg: "注册成功",
        data: data,
      });
    })
    .catch((err) => {
      console.log(err);
      res.json({
        flag: false,
        msg: "注册失败",
        data: null,
      });
    });
});

//测试token,中间件
router.get("/test", tokenAuthMiddleware, async (req, res, next) => {
  res.json("测试成功");
});

//获取用户信息

module.exports = router;
