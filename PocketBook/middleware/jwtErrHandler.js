//中间件，实现鉴权，即判定是否登录
//中间件本质是一个函数
const jwt = require("jsonwebtoken");
const SECRET_KEY = "login2023";
function tokenAuthMiddleware(req, res, next) {
  const token = req.headers.authorization;
  //存在token且不为空字符串
  if (token && token !== "null") {
    jwt.verify(token, SECRET_KEY, function (err, decoded) {
      if (err) {
        // console.log("token verify error：", err);
        res.json({
          flag: false,
          data: null,
          msg: "token已过期，请重新登录",
        });
        return;
      }
      console.log("token已验证");
      next();
    });
  } else {
    res.json({
      flag: false,
      code: 401,
      msg: "token不存在",
    });
    return;
  }
}
module.exports = {
  tokenAuthMiddleware,
};
