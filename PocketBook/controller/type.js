const express = require("express");
const router = express.Router();
const typeModel = require("../models/type.js");
const SECRET_KEY = "login2023";
const jwt = require("jsonwebtoken");

router.get("/typelists", (req, res, next) => {
  const { token } = req.headers.authorization;
  const { username } = jwt.verify(token, SECRET_KEY);
  typeModel
    .find({ username })
    .then((data) => {
      res.json({
        flag: true,
        data: data,
        code: 200,
        msg: "列表获取成功",
      });
    })
    .catch((err) => {
      res.json({
        flag: false,
        code: 500,
        msg: "列表获取失败",
        data: null,
      });
    });
});

module.exports = router;
