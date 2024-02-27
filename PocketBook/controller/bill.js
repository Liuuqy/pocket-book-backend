const billModel = require("../models/bill");
const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const SECRET_KEY = "login2023";
const moment = require("moment");
//添加账单
router.post("/addBill", async (req, res, next) => {
  const {
    amount,
    pay_type,
    date,
    type_id,
    type_name,
    //默认值
    remark = "",
  } = req.body;
  console.log("body:", req.body);
  // 判空处理，这里前端也可以做，但是后端也需要做一层判断。
  if (!amount || !type_id || !type_name || !date || !pay_type) {
    console.log("1");
    res.json({
      code: 400,
      msg: "参数错误",
      data: null,
    });
    return;
  }
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  // user_id 默认添加到每个账单项，作为后续获取指定用户账单的标示。
  // 可以理解为，我登录 A 账户，那么所做的操作都得加上 A 账户的 id，后续获取的时候，就过滤出 A 账户 id 的账单信息。
  user_id = decode._id;
  billModel
    .create({
      user_id,
      amount,
      pay_type,
      date,
      type_id,
      type_name,
      remark,
    })
    .then((data, err) => {
      if (err) {
        console.log(err);
        res.json({
          flag: false,
          code: 500,
          msg: "创建账单失败",
        });
        return;
      }
      res.json({
        flag: true,
        code: 200,
        msg: "账单创建成功",
        data: null,
      });
    });
});
//获取全部账单列表
router.get("/getBills", async (req, res, next) => {
  //获取信息
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  const { _id: user_id } = decode;
  billModel.find({ user_id }).then((data, err) => {
    if (err) {
      console.log(err);
      res.json({
        flag: false,
        msg: "获取账单失败",
        data: null,
        code: 500,
      });
      return;
    }
    res.json({
      flag: true,
      code: 200,
      msg: "获取账单成功",
      data: data,
    });
  });
});
//筛选账单列表数据
router.get("/getPagebill", async (req, res, next) => {
  //判断路由是否携带查询参数
  const { date, page = 1, page_size = 7, type_id = "all" } = req.query;
  //获取信息
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  const { _id: user_id } = decode;
  const list = await billModel.find({ user_id });
  // 过滤出月份和类型所对应的账单列表
  const _list = list.filter((item) => {
    if (type_id !== "all") {
      return (
        item.type_id === type_id &&
        moment(Number(item.date)).format("YYYY-MM") == date
      );
    } else {
      return moment(Number(item.date)).format("YYYY-MM") == date;
    }
  });
  // 格式化数据，将其变成我们之前设置好的对象格式
  let listMap = _list
    .reduce((curr, item) => {
      // curr 默认初始值是一个空数组 []
      // 待加入的账单项的时间格式化为 YYYY-MM-DD
      const date = moment(Number(item.date)).format("YYYY-MM-DD");
      // 如果能在累加的数组中找到当前项日期 date，即同一天的多笔消费放在一个数组里。
      if (
        curr &&
        curr.length &&
        curr.findIndex((item) => item.date == date) > -1
      ) {
        //找到下标
        const index = curr.findIndex((item) => item.date == date);
        curr[index].bills.push(item);
      }
      // 如果在累加的数组中找不到当前天的日期，那么再新建一项。
      if (
        curr &&
        curr.length &&
        curr.findIndex((item) => item.date == date) == -1
      ) {
        curr.push({
          date,
          bills: [item],
        });
      }
      // 如果 curr 为空数组，则默认添加第一个账单项 item ，格式化为下列模式
      if (!curr.length) {
        curr.push({
          date,
          bills: [item],
        });
      }
      return curr;
    }, [])
    .sort((a, b) => moment(b.date) - moment(a.date)); // 时间顺序为倒叙，时间越新的，在越上面
  //分页处理
  const filterListMap = listMap.slice((page - 1) * page_size, page * page_size);

  //计算当月总收入与总支出
  let __list = list.filter(
    (item) => moment(Number(item.date)).format("YYYY-MM") === date
  );
  //总花费
  let totalExpense = __list.reduce((curr, item) => {
    if (item.pay_type === "0") {
      curr = curr + item.amount;
      return curr;
    }
    return curr;
  }, 0);
  //总收入
  let totalIncome = __list.reduce((curr, item) => {
    if (item.pay_type === "1") {
      curr = curr + item.amount;
      return curr;
    }
    return curr;
  }, 0);
  res.json({
    flag: true,
    msg: "请求成功",
    data: {
      totalExpense,
      totalIncome,
      pageSize: Math.ceil(listMap.length / page_size), //总页数
      list: filterListMap || [],
    },
  });
});
//账单获取详情
router.get("/billDetails", async (req, res, next) => {
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  const { _id: user_id } = decode;
  const { _id } = req.query;
  billModel.find({ user_id, _id }).then((data, err) => {
    if (err) {
      console.log(err);
      res.json({
        flag: false,
        code: 500,
        msg: "获取账单详情失败",
        data: null,
      });
      return;
    }
    res.json({
      flag: true,
      code: 200,
      msg: "获取账单详情成功",
      data: data,
    });
  });
});
//账单修改
router.post("/updateBill", async (req, res, next) => {
  // 账单的相关参数，这里注意要把账单的 id 也传进来
  const {
    _id,
    amount,
    type_id,
    type_name,
    date,
    pay_type,
    remark = "",
  } = req.body;
  // 判空处理
  if (!amount || !type_id || !type_name || !date || !pay_type) {
    res.json({
      code: 400,
      msg: "参数错误",
      data: null,
    });
  }
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  //把人的信息的_id转为账单的user_id
  const { _id: user_id } = decode;
  //returnDocument 返回更新后的文档。它有两个可能的值：'before' 和 'after'。
  //默认行为是 'before'，这意味着返回文档在应用更新之前的状态。
  billModel
    .findOneAndUpdate(
      { user_id, _id },
      { amount, type_id, type_name, date, pay_type },
      { returnDocument: "after" }
    )
    .then((data, err) => {
      if (err) {
        console.log(err);
        res.json({
          flag: false,
          code: 500,
          msg: "更新失败",
        });
        return;
      }
      res.json({
        flag: true,
        code: 200,
        msg: "更新成功",
        data,
      });
    });
});
//账单删除
router.post("/removeBill", async (req, res, next) => {
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  //把人的信息的_id转为账单的user_id
  const { _id: user_id } = decode;
  const { _id } = req.query;
  billModel.deleteOne({ _id, user_id }).then((data, err) => {
    if (err) {
      console.log(err);
      res.json({
        flag: false,
        code: 500,
        msg: "系统错误",
        data: null,
      });
      return;
    }
    res.json({
      flag: true,
      code: 200,
      msg: "删除成功",
    });
  });
});
//数据图表接口
router.get("/getData", async (req, res, next) => {
  const token = req.headers.authorization;
  const decode = await jwt.verify(token, SECRET_KEY);
  //把人的信息的_id转为账单的user_id
  const { _id: user_id } = decode;

  const lists = await billModel.find({ user_id });
  const { date = "" } = req.query;
  console.log(date);
  // 根据时间参数，筛选出当月所有的账单数据
  const start = moment(date).startOf("month").unix() * 1000; // 选择月份，月初时间
  const end = moment(date).endOf("month").unix() * 1000; // 选择月份，月末时间
  console.log(start);
  console.log(end);
  const _data = lists.filter((item) => {
    return Number(item.date) >= start && Number(item.date) <= end;
  });
  console.log(_data);
  //总支出
  const totalExpense = _data.reduce((sum, item) => {
    if (item.pay_type === "0") {
      sum += item.amount;
    }
    return sum;
  }, 0);
  //总收入
  const totalIncome = _data.reduce((sum, item) => {
    if (item.pay_type === "1") {
      sum += item.amount;
    }
    return sum;
  }, 0);
  //不同类型的支出与收入
  const totalData = _data.reduce((arr, cur) => {
    //当前数组中是否含有cur的类型
    const index = arr.findIndex((item) => item.type_id === cur.type_id);
    if (index > -1) {
      arr[index].number += cur.amount;
      arr[index].details.push({ remark: cur.remark, _id: cur._id });
    }
    if (index === -1) {
      arr.push({
        type_id: cur.type_id,
        type_name: cur.type_name,
        number: cur.amount,
        pay_type: cur.pay_type,
        details: [{ remark: cur.remark, _id: cur._id }],
      });
    }
    return arr;
  }, []);
  res.json({
    flag: true,
    code: 200,
    msg: "请求成功",
    data: {
      totalExpense,
      totalIncome,
      totalData,
    },
  });
});
module.exports = router;
//修改账单
//删除账单
//账单详情
