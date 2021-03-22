const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const jwt = require('jsonwebtoken');

const orderDao = require('../dao/orderDao');
const { constants } = require('buffer');

// exports.createOrder = async function (req, res) {
//   const { uId, cartId, totalAmt, paymentKind } = req.body;
//   try {
//     const response = await orderModel.createOrder(uId, cartId, totalAmt, paymentKind);
//     return res.json({jwt: token, isSuccess: true, code: 200, message: "주문 성공"});
//   } catch (error) {
//     return res.json({isSuccess: false, code: 400, message: "createOrder Query error" });
//   }
// };

//상세주문
exports.createOrderDetail = async function (req, res) {
  const { branchId, productId, qty, sizeId, cup} = req.body;
  const token = req.verifiedToken;
  try{
    //ordersId 가져오기
    const getOrdersId = await orderDao.selectOrdersId(token.userIdx);
    if(getOrdersId.isSuccess==false) return res.json(getOrdersId);

    if(!branchId) return res.json({isSuccess: false, code: 406, message: "branchId를 명시해주세요" });
    if(!qty) return res.json({isSuccess: false, code: 407, message: "구매 수량을 명시해주세요" });
    if(!cup) return res.json({isSuccess: false, code: 408, message: "내부/외부(in/out)를 명시해주세요" });
    if(cup == 'in' || cup == 'out'){
    // 상세주문 추가하기 
    const orderDetail = await orderDao.createOrderDetail(getOrdersId[0].ordersId, token.userIdx, branchId, productId, qty, sizeId, cup);
    if(orderDetail.isSuccess==false) return res.json(orderDetail);
    return res.json({isSuccess: true, code: 200, message: "상세주문 담기"});
    }
    else  return res.json({isSuccess: false, code: 309, message: "내부/외부(in/out)를 명시해주세요"});
  }
  catch (error) {
  return res.json({isSuccess: false, code: 400, message: "상세주문 담기 실패" });
  }
};


exports.orderOption = async function (req, res) {
  const { productId, temperatures, shotCnt, syrupCnt, whippingCnt, decaffeine } = req.body;
  const token = req.verifiedToken;

  try{
    //ordersId 가져오기
    if(shotCnt != 0 || syrupCnt!=0 || whippingCnt != 0){
      const getOrdersId = await orderDao.selectOrdersId(token.userIdx);
      if(getOrdersId.isSuccess==false) return res.json(getOrdersId);

      const checkOrdersId = await orderDao.checkOrdersId(getOrdersId[0].ordersId);
      if(checkOrdersId < 1) return res.json({isSuccess: false, code: 411, message: "유효하지 않은 ordersId입니다. ordersDetail에서 주문을 먼저 만들어주세요."});
      if(checkOrdersId.isSuccess==false) return res.json(checkOrdersId);

      const checkProductId = await orderDao.checkProductId(getOrdersId[0].ordersId, productId);
      if(checkProductId < 1) return res.json({isSuccess: false, code: 411, message: "유효하지 않은 productId입니다. ordersDetail에서 주문을 먼저 만들어주세요."});
      if(checkProductId.isSuccess==false) return res.json(checkProductId);

      const orderOption = await orderDao.ordersOption(getOrdersId[0].ordersId, productId, temperatures, shotCnt, syrupCnt, whippingCnt, decaffeine);
      if(orderOption.isSuccess==false) return res.json(orderOption);

      const orderOptionUpdate = await orderDao.ordersOptionUpdate(getOrdersId[0].ordersId, productId);
      if(orderOptionUpdate.isSuccess==false) return res.json(orderOptionUpdate);

      return res.json({isSuccess: true, code: 200, message: "옵션 설정 성공"});
    }
    else{
      return res.json({isSuccess: false, code: 410, message: "최소한 하나의 옵션을 추가해주세요" });
    }
  }
  catch (error) {
  const getOrdersId = await orderDao.selectOrdersId(token.userIdx);
  const deleteOrderOption = await orderDao.ordersOption(getOrdersId[0].ordersId, productId);
  if(deleteOrderOption.isSuccess==false) return res.json(deleteOrderOption);
  return res.json({isSuccess: false, code: 400, message: "옵션 설정 실패" });
  }
};


exports.createOrder = async function (req, res) {
  const { branchId, isPacking, useCouponCnt, useArCardMoney, paymentKind } = req.body;
  const token = req.verifiedToken;
  try{

    if(!isPacking) return res.json({isSuccess: false, code: 410, message: "packing 여부를 선택해주세요" });
    if(!paymentKind) return res.json({isSuccess: false, code: 411, message: "결제수단을 선택해주세요" });

    const getOrdersId = await orderDao.selectOrdersId(token.userIdx);
    if(getOrdersId.isSuccess==false) return res.json(getOrdersId);

    const getBranchId = await orderDao.selectBranchId(getOrdersId[0].ordersId, token.userIdx);
    if(getBranchId.isSuccess==false) return res.json(getBranchId);
    
    const order = await orderDao.createOrder(getOrdersId[0].ordersId, token.userIdx, branchId, 
      isPacking, useCouponCnt, useArCardMoney, paymentKind);
    if(order.isSuccess==false) return res.json(order);
    
    if(useArCardMoney>0){
      const arcardUpdate = await orderDao.updateArCard(getOrdersId[0].ordersId, token.userIdx);
      if(arcardUpdate.isSuccess==false) return res.json(arcardUpdate);
      const arcardHistoryUpdate = await orderDao.updateArCardHistory(token.userIdx, getOrdersId[0].ordersId);
      if(arcardHistoryUpdate.isSuccess==false) return res.json(arcardHistoryUpdate);
    }

    if(useCouponCnt>0){
      const getCouponId = await orderDao.selectCouponId(token.userIdx);
      if(getCouponId.isSuccess==false){
        const reduceCoupon = await orderDao.reduceCouponCnt(getOrdersId[0].ordersId);
        const completeUpdateOrderDetail = await orderDao.updateOrderDetail(getOrdersId[0].ordersId, token.userIdx);
        if(completeUpdateOrderDetail.isSuccess==false) return res.json(completeUpdateOrderDetail);

        const order = await orderDao.createOrder(getOrdersId[0].ordersId, token.userIdx, branchId, 
          isPacking, useCouponCnt, useArCardMoney, paymentKind);
        if(order.isSuccess==false) return res.json(order);
    
        return res.json({isSuccess: true, code: 200, message: "쿠폰 없이 주문 성공"});
        // if(reduceCoupon.isSuccess==false)
          // return res.json(reduceCoupon);
        // return res.json(getCouponId);
      }
      const couponUpdate = await orderDao.updateCoupon(getCouponId[0].couponId);
      if(couponUpdate.isSuccess==false) return res.json(couponUpdate);
    }


    const completeUpdateOrderDetail = await orderDao.updateOrderDetail(getOrdersId[0].ordersId, token.userIdx);
    if(completeUpdateOrderDetail.isSuccess==false) return res.json(completeUpdateOrderDetail);
    return res.json({isSuccess: true, code: 200, message: "주문 성공"});
  }
  catch (error) {
  return res.json({isSuccess: false, code: 400, message: "주문 실패" });
  }
};


exports.reserve = async function (req, res) {
  const { reservationTime, reservationDate } = req.body;
  const token = req.verifiedToken;
  // const token = req.verifiedToken
    try{
      const reserveCart = await orderDao.doReservation(token.userIdx, reservationTime, reservationDate);
      if(reserveCart.isSuccess==false) return res.json(reserveCart);

      const reservationRows = await orderDao.checkReserve(token.userIdx);
      if (reservationRows[0].cnt > 1) {
        return res.json({ isSuccess: false, code: 309, message: "중복된 예약입니다." });
      }
      else{
        return res.json({isSuccess: true, code: 200, message: "예약 성공"});
      }
  }
  catch (error) {
  return res.json({isSuccess: false, code: 400, message: "예약 실패" });
  }
};




exports.orderState = async function (req, res) {
  const token = req.verifiedToken;
  try {
      const orderStateComplete = await orderDao.selectOrderState(token.userIdx);
        if(orderStateComplete.isSuccess==false) {return res.json(orderStateComplete);}

        if (orderStateComplete.length > 0) {
          return res.json({ isSuccess: true,
              code: 200, message: '주문내역 조회 성공', orderInfo: orderStateComplete });
        }
        return res.json({
          isSuccess: false, code: 300, message: "주문내역이 존재하지 않습니다."
      });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "주문내역 조회 실패" });
  }
};


exports.getOneOrderState = async function (req, res) {
  const token = req.verifiedToken;
  const state = req.query.state;
  try {
      const selectedOrderRow = await orderDao.selectOneOrderState(token.userIdx, state);
        if(selectedOrderRow.isSuccess==false) {return res.json(selectedOrderRow);}

        if (selectedOrderRow.length > 0) {
          return res.json({ isSuccess: true,
              code: 200, message: '선택한 주문내역 조회 성공', orderInfo: selectedOrderRow });
        }
        return res.json({
          isSuccess: false, code: 300, message: "선택한 주문내역이 존재하지 않습니다."
      });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "선택한 주문내역 조회 실패" });
  }
};

exports.detailOrderState = async function (req, res) {
  const token = req.verifiedToken;
  const ordersId = req.params.ordersId;
  try {
      const detailOrderRow = await orderDao.detailOrderState(ordersId, token.userIdx);
        if(detailOrderRow.isSuccess==false) {return res.json(detailOrderRow);}

        if (detailOrderRow.length > 0) {
          return res.json({ isSuccess: true,
              code: 200, message: '주문 상세내역 조회 성공', orderInfo: detailOrderRow });
        }
        return res.json({
          isSuccess: false, code: 300, message: "주문의 상세내역이 존재하지 않거나 권한이 없습니다."
      });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "주문 상세내역 조회 실패" });
  }
};