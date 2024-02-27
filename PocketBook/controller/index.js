const express = require("express");
const router = express.Router();
const apiRouter = require("./api");
const userRouter = require("./user");
const billRouter = require("./bill");
const typeRouter = require("./type");
const { tokenAuthMiddleware } = require("../middleware/jwtErrHandler");
//中间件使用,验证token有效性
// router.use(tokenAuthMiddleware).unless({ path: [/^\/api\//] });
//用户路由
router.use("/", apiRouter);
router.use("/user", tokenAuthMiddleware, userRouter); //路径为'htpp://127.0.0.1/'
//账单路由
router.use("/bill", tokenAuthMiddleware, billRouter);
router.use("/type", tokenAuthMiddleware, typeRouter);
// router.get("/bill");//路径为http://127.0.0.1/bill
//类型路由
module.exports = router;
