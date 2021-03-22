const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');

const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const itemDao = require('../dao/itemDao');
const { constants } = require('buffer');

exports.addCoupon = async function (req, res) {
    const { couponpin, barcordelink } = req.body;
    const token = req.verifiedToken;
    try{
      var regexPin= /^[0-9]/;
      if (!regexPin.test(couponpin)) return res.json({isSuccess: false, code: 407, message: "pin번호는 숫자만 입력해주세요"});
      if (couponpin.length != 16) return res.json({isSuccess: false, code: 406, message: "pin번호는 16자리로 해주세요" });
      const addToCoupon = await itemDao.insertCoupon(token.userIdx, couponpin, barcordelink);
      console.log(token.userIdx, couponpin, barcordelink);
      if(addToCoupon.isSuccess==false) return res.json(addToCoupon);

      const expireDateUpdate = await itemDao.expireDateUpdate(token.userIdx);
      if(expireDateUpdate.isSuccess==false) return res.json(expireDateUpdate);
      return res.json({isSuccess: true, code: 200, message: "쿠폰 추가 성공"});
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "쿠폰 추가 실패" });
    }
};

exports.getCoupon = async function (req, res) {
  const token = req.verifiedToken;
  console.log(token);
    try{
      const getCouponRows = await itemDao.selectCoupon(token.userIdx);
      if (getCouponRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, message: '쿠폰 조회 성공', result: getCouponRows });
      }
      else{ return res.json({ isSuccess: false, code: 300, message: "상품이 존재하지 않습니다." }); }
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "쿠폰 조회 실패" });
    }
};

exports.detailCoupon = async function (req, res) {
    const couponId = req.query.couponId;
    const token = req.verifiedToken;
    try{
      const detailCouponRows = await itemDao.selectDetailCoupon(token.userIdx, couponId);
      console.log(token.userIdx, couponId);
      if (detailCouponRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, result: detailCouponRows, message: '쿠폰 상세조회 성공' });
      }
    return res.json({ isSuccess: false, code: 300, message: "해당 쿠폰이 존재하지 않거나 유저의 쿠폰이 아닙니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "쿠폰 상세조회 실패" });
    }
};

exports.usedCoupon = async function (req, res) {
    const state = req.query.state;
    const token = req.verifiedToken;
    try{
      const usedcouponRows = await itemDao.selectUsedCoupon(state, token.userIdx);
      console.log(usedcouponRows);
      if (usedcouponRows.length < 1) {
        return res.json({ isSuccess: false, code: 300, message: "선택한 상태의 쿠폰이 존재하지 않습니다." });
      }
        else{
          return res.json({ isSuccess: true, code: 200, message: '선택한 상태의 쿠폰 조회 성공', result: usedcouponRows });
        }
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "선택한 상태의 쿠폰 조회 실패" });
    }
};

exports.givePresent = async function (req, res) {
    const { giftImgId, sendName, sendPhoneNumber, giftPrice, paymentKind, 
        giftcardNum, msgName, msgContent } = req.body;
    const token = req.verifiedToken;
    
    try{

      var regexPhone = /^[0-9]+$/;
      if (!regexPhone.test(sendPhoneNumber)){ return res.json({isSuccess: false, code: 310, message: "전화번호 형식을 정확하게 입력해주세요."}); }
      // 전화번호 체크
      if(!sendPhoneNumber) return res.json({isSuccess: false, code:107, message:"전화번호를 입력해주세요."}); 
      if (sendPhoneNumber.length > 11) return res.json({ isSuccess: false, code: 108, message: "전화번호는 최대 11자리를 입력해주세요." });

      var regexGiftcardNum = /^[0-9]+$/;
      if (!regexGiftcardNum.test(giftcardNum)){ return res.json({isSuccess: false, code: 310, message: "기프트 카드 번호 형식을 정확하게 입력해주세요."}); }
      if(!giftcardNum) return res.json({isSuccess: false, code:107, message:"기프트 카드 번호를 입력해주세요."}); 
      if (giftcardNum.length != 18) return res.json({ isSuccess: false, code: 108, message: "기프트 카드 번호는 18자리로 입력해주세요." });

      const givePresentComplete = await itemDao.givePresent(
        giftImgId, token.email, sendName, sendPhoneNumber, giftPrice, paymentKind, 
        giftcardNum, msgName, msgContent
      );
      if(givePresentComplete.isSuccess==false) return res.json(givePresentComplete);
      return res.json({isSuccess: true, code: 200, message: "선물 성공"});
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "선물 실패" });
    }
};
  

exports.getPresent = async function (req, res) {
  const token = req.verifiedToken;
    try{
      const getPresentRows = await itemDao.selectPresent(token.userIdx);
      console.log(token.userIdx);
      if (getPresentRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, message: '선물 내역 조회 성공', result: getPresentRows
        })
    }
    return res.json({ isSuccess: false, code: 300, message: "선물한 내역이 존재하지 않습니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "선물 내역 조회 실패" });
    }
};

exports.getDetailPresent = async function (req, res) {
    const giftId = req.params.giftId;
    const token = req.verifiedToken;
    try{
      const getDetailPresentRows = await itemDao.selectDetailPresent(giftId, token.userIdx);
      if (getDetailPresentRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, message: '선물 상세내역 조회 성공', result: getDetailPresentRows });
    }
    return res.json({ isSuccess: false, code: 300, message: "선물의 상세내역이 존재하지 않거나 권한이 없습니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "선물 상세내역 조회 실패" });
    }
};

exports.makeArcard = async function (req, res) {
    const { pin, arcardMoney, isWellUse, isUse } = req.body;
    const token = req.verifiedToken;

    var regexPin = /^[0-9]+$/;
    if (!regexPin.test(pin)) return res.json({isSuccess: false, code: 310, message: "PIN번호 형식을 정확하게 입력해주세요."});
    if(!pin)  return res.json({isSuccess: false, code:107, message:"PIN번호를 입력해주세요."}); 
    if (pin.length != 7) return res.json({ isSuccess: false, code: 108, message: "PIN번호는 7자리로 입력해주세요."});

    const isDuplicatedPin = await itemDao.isDuplicatedPin(pin);
    if(isDuplicatedPin.isSuccess==false) return res.json(isDuplicatedPin);

    const isDuplicatedWellUse = await itemDao.isDuplicatedWellUse(token.userIdx);
    if(isDuplicatedWellUse.isSuccess==false) return res.json(isDuplicatedWellUse);
        
    try{
      const addToArCard = await itemDao.insertArCard(token.userIdx, pin, arcardMoney, isWellUse, isUse);
      if(addToArCard.isSuccess==false) return res.json(addToArCard);

      // const updateArCardComplete = await itemDao.updateArCard();
      // if(updateArCardComplete.isSuccess==false) return res.json(updateArCardComplete);

      return res.json({isSuccess: true, code: 200, message: "카드 추가 성공"});
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "카드 추가 실패" });
    }
};

exports.getMyArcard = async function (req, res) {
  const token = req.verifiedToken;
    try{
      const myArCardRows = await itemDao.selectMyArCard(token.userIdx);
      console.log(myArCardRows);
      if (myArCardRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, message: '내 카드 조회 성공', result: myArCardRows });
    }
    return res.json({ isSuccess: false, code: 300, message: "내 카드가 존재하지 않습니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "내 카드 조회 실패" });
    }
};

exports.getDetailArcard = async function (req, res) {
    const token = req.verifiedToken;
    const arcardId = req.params.arcardId;
    try{
      const detailArcardRows = await itemDao.selectDetailArCard(token.userIdx, arcardId);
      if (detailArcardRows.length > 0) 
        return res.json({ isSuccess: true, code: 200, message: '아티제 카드 상세내역 조회 성공', result: detailArcardRows});
    return res.json({ isSuccess: false, code: 300, message: '아티제 카드에 대한 상세내역이 존재하지 않거나 권한이 없습니다' });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: '아티제 카드 상세내역 조회 실패' });
    }
};

exports.getArcardHistory = async function (req, res) {
    const arcardId = req.params.arcardId;
    const token = req.verifiedToken;
    try{
      const arcardHistoryRows = await itemDao.selectArCardHistory(token.userIdx, arcardId);
      console.log(arcardHistoryRows);
      if (arcardHistoryRows.length > 0) {
        return res.json({ isSuccess: true, code: 200, message: '거래이력 조회 성공', result: arcardHistoryRows});
      }
    return res.json({ isSuccess: false, code: 300, message: "거래이력이 존재하지 않습니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "거래이력 조회 실패" });
    }
};


exports.getReservation = async function (req, res) {
  try {
    const reservationRow = await orderDao.selectReserved(); 
    if(reservationRow.isSuccess==false) {return res.json(reservationRow);}
    console.log(reservationRow);
    if (reservationRow.length > 0) {
      return res.json({ isSuccess: true, code: 200, result: reservationRow, message: '예약내역 조회 성공'});
        }
        return res.json({ isSuccess: false, code: 300, message: "예약내역이 존재하지 않습니다." });
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "예약내역 조회 실패" });
  }
};

exports.deleteArcard = async function (req, res) {
  const arcardId = req.params.arcardId;
    const token = req.verifiedToken;
    try{
      const deleteArcard = await itemDao.deleteArCard(token.userIdx, arcardId);
      if(deleteArcard.isSuccess==false) return res.json(deleteArcard);

      const deleteArcardCheck = await itemDao.deleteArCardCheck(arcardId);

      if(deleteArcardCheck.length > 0){
        return res.json({isSuccess: false, code: 407, message: "삭제할 수 있는 권한이 없습니다" });
      }
      else{
        return res.json({isSuccess: true, code: 200, message: "해당 아티제 카드 삭제 성공"});
      }
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "해당 아티제 카드 삭제 실패" });
    }
};
