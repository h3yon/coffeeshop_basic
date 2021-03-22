const { pool } = require("../../../config/database");
const {logger} = require('../../../config/winston');
const crypto = require('crypto');


async function insertCoupon(userIdx, couponpin, barcordelink)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
      const insertCouponQuery = `
      insert Coupon(uId, couponPin, barcodeImgLink)
      values (?, ?, ?);
        `;
      let insertCouponParams = [userIdx, couponpin, barcordelink];
      await connection.query(insertCouponQuery, insertCouponParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`insertCoupon Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return res.json({ isSuccess: false, code: 401, message: "insertCoupon Query error" });
    }
}


async function expireDateUpdate(userIdx)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const expireDateUpdateQuery = `
      update Coupon set expireDate = (select DATE_ADD(now(), interval 1 MONTH)A)
      where couponId IN (select couponId from (select couponId from Coupon 
      where couponId =(select max(couponId)C from Coupon))B)
      and uId = ? and state != 'used';
        `;
      let expireDateUpdateParams = [userIdx];
      await connection.query(expireDateUpdateQuery, expireDateUpdateParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`expireDateUpdate Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return { isSuccess: false, code: 403, message: "expireDateUpdate Query error" };
        }
    }catch(err){
        logger.error(`expireDateUpdate DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 405, message: "expireDateUpdate DB Connection error" };
    }
}


async function selectCoupon(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCouponQuery = `
  select couponId, uId as UserIdx, couponName, couponPin,
  (select date_format(issueDate, '%Y.%m.%d')) as issueDate,
  (select date_format(expireDate, '%Y.%m.%d')) as expireDate,
  (select TO_DAYS(expireDate)-TO_DAYS(now())) as dDay,
  state
  from Coupon where uId = ? and state = 'added'
order by couponId desc;
                `;
  let selectCouponParams = [userIdx];
  const [selectCouponRows] = await connection.query( selectCouponQuery, selectCouponParams );
  await connection.commit();
  connection.release();
  return selectCouponRows; //결과값을 뱉어줌
}

async function selectDetailCoupon(userIdx, couponId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailCouponQuery = `
  select couponId, uId as UserIdx, couponName, couponPin,
  (select date_format(issueDate, '%Y.%m.%d')) as issueDate,
  (select date_format(expireDate, '%Y.%m.%d')) as expireDate,
  (select TO_DAYS(expireDate)-TO_DAYS(now())) as dDay,
  barcodeImgLink, IFNULL(couponDesc, 'no description')description
  from Coupon where Coupon.state = 'added' and uId = ? and couponId = ?;
                `;
  let selectDetailCouponParams = [userIdx, couponId];
  const [selectDetailCouponRows] = await connection.query( selectDetailCouponQuery, selectDetailCouponParams );
  await connection.commit();
  connection.release();
  return selectDetailCouponRows; //결과값을 뱉어줌
}


async function selectUsedCoupon(state, userId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUsedCouponQuery = `
  select couponId, uId as UserIdx, couponName, couponPin,
  (select date_format(issueDate, '%Y.%m.%d')) as issueDate,
  (select date_format(expireDate, '%Y.%m.%d')) as expireDate,
  Coupon.state
  from Coupon where Coupon.state = ? and uId = ?;
                `;
  let selectUsedCouponParams = [state, userId];
  const [selectUsedCouponRows] = await connection.query( selectUsedCouponQuery, selectUsedCouponParams );
  await connection.commit();
  connection.release();
  return selectUsedCouponRows; //결과값을 뱉어줌
}

async function givePresent(giftImgId, email, sendName, sendPhone, giftPrice, paymentKind, 
  giftcardNum, msgName, msgContent) {
  try{
  const connection = await pool.getConnection(async (conn) => conn);
  try{
    await connection.beginTransaction(); // START TRANSACTION
    const givePresentQuery = `
      insert Gift(giftImgId, uId, sendName, sendPhone, giftPrice, paymentKind, 
      giftcardNum, dealNum, msgName, msgContent)
      values(?,(select uId from User where uEmail=?),?, ?, ?, ?, ?
  , (select date_format(now(), '%Y%m%d%h%s%m%j%l')), ?, ?);
                  `;
    let givePresentParams = [giftImgId, email, sendName, sendPhone, giftPrice, paymentKind, 
      giftcardNum, msgName, msgContent];
    await connection.query( givePresentQuery, givePresentParams );
    await connection.commit();
    connection.release();
    return {isSuccess:true}; //결과값을 뱉어줌
  }catch(err) {
    await connection.rollback(); // ROLLBACK
    logger.error(`givePresent Query error\n: ${JSON.stringify(err)}`);
    connection.release();
    return { isSuccess: false, code: 401, message: "givePresent Query error" };
    }
  }catch(err){
    logger.error(`givePresent DB Connection error\n: ${err.message}`);
    return { isSuccess: false, code: 402, message: "givePresent DB Connection error" };
  }
}


async function selectPresent(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectPresentQuery = `
    select giftId, User.uId, uName,
       (select date_format(giftTime, '%Y.%m.%d | %h:%i:%s ')) as giftTime,
       Gift.state, giftPrice from User
    inner join Gift on Gift.uId = User.uId
    where Gift.uId =?;
                `;
  let selectPresentParams = [userIdx];
  const [selectPresentRows] = await connection.query( selectPresentQuery, selectPresentParams );
  await connection.commit();
  connection.release();
  return selectPresentRows; //결과값을 뱉어줌
}

async function selectDetailPresent(giftId, userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailPresentQuery = `
      select giftId, Gift.uId, uName,
      (select date_format(giftTime, '%Y.%m.%d | %h:%i:%s ')) as giftTime,
      CONCAT(SUBSTR(giftcardNum, 1, 4), '-****','-****','-****-', SUBSTR(giftcardNum, 17, 2)) as giftCardNum,
      dealNum,
      Gift.state, msgName, msgContent from Gift
      inner join User on User.uId = Gift.uId
      where Gift.giftId = ? and Gift.uId = ?;
                `;
  let selectDetailPresentParams = [giftId, userIdx];
  const [selectDetailPresentRows] = await connection.query( selectDetailPresentQuery, selectDetailPresentParams );
  await connection.commit();
  connection.release();
  return selectDetailPresentRows; //결과값을 뱉어줌
}


async function insertArCard(userIdx, pin, arcardMoney, isWellUse, isUse)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const insertArCardQuery = `
      insert Arcard(uId, arcardNum, pin, arcardMoney, isWellUse, isUse)
      values(?, (select date_format(now(), '%d%m%h%Y%s%m%l')), ?, IFNULL(?, 0), 
      IFNULL(?, 'N'), IFNULL(?,'N'));
        `;
      let insertArCardParams = [userIdx, pin, arcardMoney, isWellUse, isUse];
      await connection.query(insertArCardQuery, insertArCardParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`insertArCard Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return { isSuccess: false, code: 401, message: "insertArCard Query error" };
        }
    }catch(err){
        logger.error(`insertArCard DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "insertArCard DB Connection error" };
    }
}

async function isDuplicatedPin(pin)
{
    try{
        const connection = await pool.getConnection(async conn => conn);
        try {
            const selectPinQuery = `
            SELECT pin FROM Arcard WHERE pin = ?;
            `;
            const selectPinParams = [pin];
            const [pinRows] = await connection.query(selectPinQuery, selectPinParams);
            connection.release();

            if (pinRows.length > 0) return { isSuccess: false, code: 311, message: "중복된 PIN번호가 있습니다." };
            else return {isSuccess:true};
        } catch(err) {
            logger.error(`isDuplicatedEmail Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return { isSuccess: false, code: 405, message: "isDuplicatedPin Query error" };
        }
    } catch(err){
        logger.error(`isDuplicatedPin DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 406, message: "isDuplicatedPin DB Connection error" };
    }
}

async function isDuplicatedWellUse(userIdx)
{
    try{
        const connection = await pool.getConnection(async conn => conn);
        try {
            const selectIsWellUseQuery = `
            SELECT arcardId, isWellUse FROM Arcard WHERE uId = ? and isWellUse = 'Y';
            `;
            const selectIsWellUseParams = [userIdx];
            const [isWellUseRows] = await connection.query(selectIsWellUseQuery, selectIsWellUseParams);
            connection.release();

            console.log(isWellUseRows);

            if (isWellUseRows.length > 0){
              return { isSuccess: false, code: 312, message: "자주 쓰는 카드는 하나만 등록 가능합니다" };
            }else{
              return {isSuccess:true};
            }
        } catch(err) {
            logger.error(`isDuplicatedWellUse Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return { isSuccess: false, code: 407, message: "isDuplicatedWellUse Query error" };
        }
    } catch(err){
        logger.error(`isDuplicatedWellUse DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 408, message: "isDuplicatedWellUse DB Connection error" };
    }
}

async function updateArCard()
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const updateArCardQuery = `
      update Arcard set arCardMoney = 
      IFNULL((select giftPrice from Gift where Gift.giftCardNum = arcardNum),0)
      where arcardId=(select arcardId from (select max(arcardId) from Arcard)max);
        `;
      await connection.query(updateArCardQuery);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`updateArCard Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return res.json({ isSuccess: false, code: 403, message: "updateArCard Query error" });
        }
    }catch(err){
        logger.error(`updateArCard DB Connection error\n: ${err.message}`);
        return res.json({ isSuccess: false, code: 404, message: "updateArCard DB Connection error" });
    }
}

async function selectMyArCard(userIdx) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectMyArCardQuery = `
  select arcardId, uId, arcardImgLink, arcardName, arcardBarcodeLink, arcardMoney, isWellUse, isUse
  from Arcard where uId = ? and isUse='Y';
                `;
  let selectMyArCardParams = [userIdx];
  const [selectMyArCardRows] = await connection.query( selectMyArCardQuery, selectMyArCardParams );
  await connection.commit();
  connection.release();
  return selectMyArCardRows; //결과값을 뱉어줌
}

async function selectDetailArCard(userIdx, arcardId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailArCardQuery = `
  select arcardId, uId, arcardNum, pin, arcardImgLink, arcardBarcodeLink, arcardName, arcardMoney, isWellUse, isUse,
       (select date_format(registerDate, '%Y년 %m월 %d일')) as registerDate, state
        from Arcard where uId = ? and arcardId = ?;
                `;
  let selectDetailArCardParams = [userIdx, arcardId];
  const [selectDetailArCardRows] = await connection.query( selectDetailArCardQuery, selectDetailArCardParams );
  await connection.commit();
  connection.release();
  return selectDetailArCardRows; //결과값을 뱉어줌
}

async function selectArCardHistory(userIdx, arcardId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectArCardHistoryQuery = `
  select arcardId, uId, money, state, 
  (select date_format(updatedAt, '%Y.%m.%d | %h:%i:%s')) as updatedAt
  from ArcardHistory where uId = ? and arcardId = ?
  order by updatedAt desc;
                `;
  let selectArCardHistoryParams = [userIdx, arcardId];
  const [selectArCardHistoryRows] = await connection.query( selectArCardHistoryQuery, selectArCardHistoryParams );
  await connection.commit();
  connection.release();
  return selectArCardHistoryRows; //결과값을 뱉어줌
}

async function deleteArCard(userIdx, arcardId)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const deleteArCardQuery = `
      delete from Arcard where uId = ? and arcardId = ?
        `;
      let deleteArCardParams = [userIdx, arcardId];
      await connection.query(deleteArCardQuery, deleteArCardParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`deleteArCard Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return { isSuccess: false, code: 401, message: "deleteArCard Query error" };
        }
    }catch(err){
        logger.error(`deleteArCard DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "deleteArCard DB Connection error" };
    }
}

async function deleteArCardCheck(arcardId)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const deleteArCardCheckQuery = `
      select * from Arcard where arcardId = ?;
        `;
      let deleteArCardCheckParams = [arcardId];
      const [deleteCheckRows] = await connection.query(deleteArCardCheckQuery, deleteArCardCheckParams);
      await connection.commit();
      connection.release();
      return deleteCheckRows;
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`deleteArCardCheck Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return { isSuccess: false, code: 405, message: "deleteArCardCheck Query error" };
        }
    }catch(err){
        logger.error(`deleteArCardCheck DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 406, message: "deleteArCardCheck DB Connection error" };
    }
}

// async function selectReserved() {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectReservedQuery = 'select branchName, pName, cartTime, Reservation.state from Reservation inner join CartItem on reservation.cartId = CartItem.cartId inner join Branch on cartitem.branchId = Branch.branchId inner join Product on cartitem.pId = Product.pId;';
//   const [selectReservedRows] = await connection.query( selectReservedQuery );
//   console.log(selectReservedRows);
//   await connection.commit();
//   connection.release();
//   return selectReservedRows; //결과값을 뱉어줌
// }

module.exports = {
  insertCoupon,
  expireDateUpdate,
  selectCoupon,
  selectDetailCoupon,
  selectUsedCoupon,

  givePresent,
  selectPresent,
  selectDetailPresent,
  insertArCard,

  isDuplicatedPin,
  isDuplicatedWellUse,

  updateArCard,
  selectMyArCard,selectDetailArCard,
  selectArCardHistory,
  deleteArCard,
  deleteArCardCheck
  // selectReserved
  
};
