const { pool } = require("../../../config/database");
const {logger} = require('../../../config/winston');
const crypto = require('crypto');


//ordersId 선택하기
async function selectOrdersId(userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const selectOrdersIdQuery = 
      `
      select IFNULL(IFNULL((select min(ordersId) from Orders where uId = ? and state = 'added'),
    (select max(ordersId)+1 from Orders)),1) as ordersId;
      `;
      const selectOrdersIdParams = [userIdx];
      const [selectOrdersId] = await connection.query(selectOrdersIdQuery, selectOrdersIdParams);
      await connection.commit();
      connection.release();
      return selectOrdersId;
     }catch(err){
        logger.error(`selectOrdersId DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 401, message: "selectOrdersId DB Connection error"
        };
    }
}

async function checkOrdersId(ordersId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const checkOrdersIdQuery = 
      `
      select ordersId from OrdersDetail where ordersId = ?;
      `;
      const checkOrdersIdParams = [ordersId];
      const [checkOrdersId] = await connection.query(checkOrdersIdQuery, checkOrdersIdParams);
      await connection.commit();
      connection.release();
      return checkOrdersId;
     }catch(err){
        logger.error(`checkOrdersId DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 401, message: "checkOrdersId DB Connection error"};
    }
}


//상세주문 담기 
async function createOrderDetail(ordersId, userIdx, branchId, productId, qty, sizeId, cup){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const createOrderDetailQuery = 
      `
      insert OrdersDetail(ordersId, uId, ordersTime, branchId, pId, qty, sizeId, cup, amount)
    values (?, ?, IFNULL((select ordersTime from Orders where Orders.ordersId = ?),now()), ?, ?, ?, IFNULL(?,0), IFNULL(?,0),
    (select pPrice from Product where pId=?)*qty);
      `;
      const createOrderDetailParams = [ordersId, userIdx, ordersId, branchId, productId, qty, sizeId, cup, productId];
      await connection.query(createOrderDetailQuery, createOrderDetailParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
     }catch(err){
        logger.error(`createOrderDetail DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "createOrderDetail DB Connection error"
        };
    }
}

async function checkProductId(ordersId, productId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const checkProductIdQuery = 
      `
      select * from OrdersDetail where ordersId = ? and pId = ?;
      `;
      const checkProductIdParams = [ordersId, productId];
      const [checkProductId] = await connection.query(checkProductIdQuery, checkProductIdParams);
      await connection.commit();
      connection.release();
      return checkProductId;
     }catch(err){
        logger.error(`checkProductId DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 401, message: "checkProductId DB Connection error"};
    }
}


//상세주문옵션
async function ordersOption(ordersId, productId, temperatures, shotCnt, syrupCnt, whippingCnt, decaffeine){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const ordersOptionQuery = `
      insert OrdersOption(ordersId, pId, temperatures, shotCnt, syrupCnt, whippingCnt, decaffeine, surcharge)
      values(?, ?, ?, ?, ?, ?, ?, 500*(OrdersOption.shotCnt + OrdersOption.syrupCnt + OrdersOption.whippingCnt));
      `;
      const ordersOptionParams = [ordersId, productId, temperatures, shotCnt, syrupCnt, whippingCnt, decaffeine];
      await connection.query(ordersOptionQuery, ordersOptionParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`OrdersOption Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 403, message: "OrdersOption Query error" };
        }
    }catch(err){
        logger.error(`OrdersOption DB Connection error\n: ${err.message}`);
        connection.release();
        return { isSuccess: false, code: 405, message: "OrdersOption DB Connection error"
        };
    }
}

//잘못된 옵션 설정 행 삭제 
async function deleteOrdersOption(ordersId, productId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const deleteOrdersOptionQuery = `
      DELETE FROM OrdersOption WHERE ordersId = ? and pId = ?;
      `;
      const deleteOrdersOptionParams = [ordersId, productId];
      await connection.query(deleteOrdersOptionQuery, deleteOrdersOptionParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`deleteOrdersOption Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 406, message: "deleteOrdersOption Query error" };
        }
    }catch(err){
        logger.error(`deleteOrdersOption DB Connection error\n: ${err.message}`);
        connection.release();
        return { isSuccess: false, code: 407, message: "deleteOrdersOption DB Connection error"
        };
    }
}



//옵션 업데이트 -> 금액 반영
async function ordersOptionUpdate(ordersId, productId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const ordersOptionUpdateQuery = `
      update OrdersDetail
        set amount = amount + (select OrdersOption.surcharge from OrdersOption where OrdersOption.ordersId = ?
            and OrdersDetail.pId = ?)
        where ordersId = ? and pId = ?;
       `;
      const ordersOptionUpdateParams = [ordersId, productId, ordersId, productId];
      await connection.query(ordersOptionUpdateQuery, ordersOptionUpdateParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`OrdersOptionUpdate Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 408, message: "OrdersOptionUpdate Query error" };
        }
    }catch(err){
        logger.error(`OrdersOptionUpdate DB Connection error\n: ${err.message}`);
        connection.release();
        return { isSuccess: false, code: 409, message: "OrdersOptionUpdate DB Connection error"
        };
    }
}




//branchId 선택하기
async function selectBranchId(ordersId, userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const selectbranchIdQuery = 
      `
     select branchId from OrdersDetail where ordersId = ? and uId = ?
      `;
      const selectbranchIdParams = [ordersId, userIdx];
      const [selectbranchsId] = await connection.query(selectbranchIdQuery, selectbranchIdParams);
      await connection.commit();
      connection.release();
      return selectbranchsId;
     }catch(err){
        logger.error(`selectbranchsId DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 401, message: "selectbranchsId DB Connection error"
        };
    }
}




//주문 추가 
async function createOrder(ordersId, userIdx, branchId, isPacking, useCouponCnt, useArCardMoney, paymentKind){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      // const addToCartQuery1 = 'INSERT INTO Cart(branchId) VALUES (?);';
      console.log(ordersId, userIdx, branchId, isPacking, useCouponCnt, useArCardMoney, paymentKind, ordersId);
      const createOrderQuery = 
      `
      insert Orders(ordersId, uId, branchId, isPacking, useCouponCnt, useArcardMoney, paymentKind, state, totalAmt)
        values(?, ?, ?, ?, IFNULL(sign(?),0), IFNULL(?,0), ?, 'accepted',
       (select sum(amount) from OrdersDetail where ordersId = ?));
      `;
      const createOrderParams = [ordersId, userIdx, branchId, isPacking, useCouponCnt, useArCardMoney, paymentKind, ordersId];
      await connection.query(createOrderQuery, createOrderParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`createOrder Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 402, message: "createOrder Query error" };
        }
    }catch(err){
        logger.error(`createOrder DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 403, message: "createOrder DB Connection error"
        };
    }
}




//상세주문 업데이트
async function updateOrderDetail(ordersId, userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      // const addToCartQuery1 = 'INSERT INTO Cart(branchId) VALUES (?);';
      const updateOrderDetailQuery = 
      `
      update OrdersDetail set state = 'accepted' where ordersId = ? and uId = ?;
      `;
      const updateOrderDetailParams = [ordersId, userIdx];
      await connection.query(updateOrderDetailQuery, updateOrderDetailParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`updateOrderDetail Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 402, message: "updateOrderDetail Query error" };
        }
    }catch(err){
        logger.error(`updateOrderDetail DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 403, message: "updateOrderDetail DB Connection error"
        };
    }
}



//예약 설정 
async function doReservation(userIdx, reservationTime, reservationDate){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const doReservationQuery = `
      insert Reservation(ordersId, reservationTime, reservationDate)
      values((select max(ordersId) from OrdersDetail where uId = ? and state='added'), ?,?);
       `;
      const doReservationParams = [userIdx, reservationTime, reservationDate];
      await connection.query(doReservationQuery, doReservationParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`doReservation Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 401, message: "doReservation Query error" };
        }
    }catch(err){
        logger.error(`doReservation DB Connection error\n: ${err.message}`);
        connection.release();
        return { isSuccess: false, code: 402, message: "doReservation DB Connection error"
        };
    }
}


async function checkReserve(userIdx)
{
    try{
        const connection = await pool.getConnection(async conn => conn);
        try {
            const checkReserveQuery = `
            select count(ordersId) as cnt from Reservation where 
            ordersId = (select max(OrdersDetail.ordersId) from OrdersDetail where uId = ? and state='added');
            `;
            const checkReserveParams = [userIdx];
            const [checkReserveRows] = await connection.query(checkReserveQuery, checkReserveParams);
            connection.release();
            return checkReserveRows;
        } catch(err) {
            logger.error(`checkReserve Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return { isSuccess: false, code: 402, message: "checkReserve Query error" };
        }
    } catch(err){
        logger.error(`checkReserve DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 401, message: "Web - checkReserve DB Connection error" };
    }
}


//ArCard에 있는 금액 반영
async function updateArCard(ordersId, userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const updateArCardQuery = 
      `
      update Arcard set arcardMoney =
      case when (arcardMoney - (select useArCardMoney from Orders
          where ordersId = ?)< 0)
          then arcardMoney
          else  (arcardMoney - (select useArCardMoney from Orders
                  where ordersId = ?))
          end
      , Arcard.updatedAt = now()
      where uId = ?
      and arcardId = (select arcardId from
                    (select arcardId from Arcard where isWellUse='Y' and uId = ?)B);
  `;
      let updateArCardParams = [ordersId, ordersId, userIdx, userIdx];
      await connection.query(updateArCardQuery, updateArCardParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`updateArCard Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 403, message: "updateArCard Query error" };
        }
    }catch(err){
        logger.error(`updateArCard DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 405, message: "updateArCard DB Connection error"
        };
    }
}


//ArCard 히스토리 추가 
async function updateArCardHistory(userIdx, ordersId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const updateArCardHistoryQuery = 
      `
      insert ArcardHistory(arcardId, money, state, uId)
      values( (select arcardId from
       (select arcardId from Arcard where isWellUse='Y' and uId = ?)B),
       (select useArCardMoney from Orders where ordersId = ? and useArCardMoney != 0), 'minus',
       ?);
       `;
      const updateArCardHistoryParams = [userIdx, ordersId, userIdx];
      await connection.query(updateArCardHistoryQuery, updateArCardHistoryParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`updateArCardHistory Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 406, message: "updateArCardHistory Query error" };
        }
    }catch(err){
        logger.error(`updateArCardHistory DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 407, message: "updateArCardHistory DB Connection error"
        };
    }
}

//couponId 선택하기
async function selectCouponId(userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const selectCouponIdQuery = 
      `
      select couponId from Coupon where uId = ? and expireDate = (select min(expireDate) limit 1)
      and state = 'added';
      `;
      const selectCouponIdParams = [userIdx];
      const [selectCouponIdRow] = await connection.query(selectCouponIdQuery, selectCouponIdParams);

      console.log(selectCouponIdRow);

      if(selectCouponIdRow.length < 1){
        connection.release();
        return { isSuccess: false, code: 408, message: "사용할 수 있는 쿠폰이 없습니다."};
      }
      await connection.commit();
      connection.release();
      return selectCouponIdRow;
     }catch(err){
        logger.error(`selectCouponId DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 409, message: "selectCouponId DB Connection error"
        };
    }
}

//쿠폰 못 사용할 땐 쿠폰수 줄이기
async function reduceCouponCnt(ordersId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
      const reduceCouponCntQuery = 
      `
      update Orders set useCouponCnt = 0 where ordersId = ?;
      `;
      const reduceCouponCntParams = [ordersId];
      await connection.query(reduceCouponCntQuery, reduceCouponCntParams);
      await connection.commit();
      connection.release();
      return { isSuccess: true };
     }catch(err){
        logger.error(`reduceCouponCnt DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 409, message: "reduceCouponCnt DB Connection error"
        };
    }
}


//쿠폰 사용한 거 반영
async function updateCoupon(couponId){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const updateCouponQuery = 
      `
      update Coupon set state = 'used'
      where couponId = ?;
      `;
      const updateCouponParams = [couponId];
      await connection.query(updateCouponQuery, updateCouponParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`updateCoupon Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 408, message: "updateCoupon Query error" };
        }
    }catch(err){
        logger.error(`updateCoupon DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 409, message: "updateCoupon DB Connection error"
        };
    }
}



//전체주문내역
async function selectOrderState(userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const selectOrderStateQuery = 
      `
      select Orders.ordersId, Orders.uId as userIdx, Orders.branchId, Branch.branchName, Orders.state,
       (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')) as ordersTime,
       isPacking
       kindName,
       concat((select sum(amount)),'원') as totalAmount
        from Orders
        left join Branch on Branch.branchId = Orders.branchId
        left join Payment on Orders.paymentKind = Payment.paymentKind
        left join OrdersDetail on Orders.ordersId = OrdersDetail.ordersId
        where Orders.uId = ? and Orders.state = 'accepted'
        group by Orders.ordersId, Orders.uId, Branch.branchName, Orders.branchId, Orders.state, (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')), isPacking
        order by ordersId desc;
      `;
      let selectOrderStateParams = [userIdx];
      const [selectOrderStateRows] = await connection.query(selectOrderStateQuery,selectOrderStateParams);
      await connection.commit();
      connection.release();
      return selectOrderStateRows;
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`selectOrderState Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 401, message: "selectOrderState Query error" };
        }
    }catch(err){
        logger.error(`selectOrderState DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "selectOrderState DB Connection error"
        };
    }
}



async function selectOneOrderState(userId, orderState){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const selectOneOrderStateQuery = 
      `
      select Orders.ordersId, Orders.uId as userIdx, Orders.branchId, Branch.branchName, Orders.state,
       (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')) as ordersTime,
       isPacking
       kindName,
       concat((select sum(amount)),'원') as totalAmount
        from Orders
        left join Branch on Branch.branchId = Orders.branchId
        left join Payment on Orders.paymentKind = Payment.paymentKind
        left join OrdersDetail on Orders.ordersId = OrdersDetail.ordersId
        where Orders.uId = ? and Orders.state = ?
        group by Orders.ordersId, Orders.uId, Branch.branchName, Orders.branchId, Orders.state, (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')), isPacking
        order by ordersId desc;
      `;
      let selectOneOrderStateParams = [userId, orderState];
      const [selectOneOrderStateRows] = await connection.query(selectOneOrderStateQuery,selectOneOrderStateParams);
      await connection.commit();
      connection.release();
      return selectOneOrderStateRows;
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`selectOneOrderState Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 401, message: "selectOneOrderState Query error" };
        }
    }catch(err){
        logger.error(`selectOneOrderState DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "selectOneOrderState DB Connection error"
        };
    }
}

async function detailOrderState(ordersId, userIdx){
  try{  
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const detailOrderStateQuery = 
      `
      select Orders.ordersId, Orders.uId as userIdx, branchName, Orders.state,
       (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')) as ordersTime,
       isPacking, kindName, OrdersDetail.pId as productIdx,
       pName as productName, concat(amount, '원') as 'amount', qty as quantity, sizeId, cup,
       IFNULL(temperatures,0) as temperatures, IFNULL(shotCnt,0) as shotcnt, IFNULL(syrupCnt,0) as syrupcnt, IFNULL(whippingCnt,0) as whippingcnt,
           IFNULL(decaffeine,0) as decaffeinecnt, concat(IFNULL(surcharge,0),'원') as 'surcharge',
       concat((select sum(amount)),'원') as totalAmount from Orders
        left join OrdersOption on orders.ordersId = OrdersOption.ordersId
        inner join Payment on orders.paymentKind = Payment.paymentKind
        inner join OrdersDetail on orders.ordersId = OrdersDetail.ordersId
        inner join Branch on orders.branchId = Branch.branchId
        inner join Product on ordersdetail.pId = Product.pId
        where Orders.ordersId = ? and Orders.uId = ?
        group by Orders.ordersId, Orders.uId, branchName, Orders.state, (select date_format(Orders.ordersTime, '%Y.%m.%d | %h:%i:%s')), isPacking, kindName, OrdersDetail.pId, pName, concat(amount, '원'), qty, sizeId, cup, IFNULL(temperatures,0), IFNULL(shotCnt,0), IFNULL(syrupCnt,0), IFNULL(whippingCnt,0), IFNULL(decaffeine,0), concat(IFNULL(surcharge,0),'원')
        order by ordersId desc;
      `;
      let detailOrderStateParams = [ordersId, userIdx];
      const [detailOrderStateRows] = await connection.query(detailOrderStateQuery,detailOrderStateParams);
      await connection.commit();
      connection.release();
      return detailOrderStateRows;
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`detailOrderState Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {isSuccess: false, code: 401, message: "detailOrderState Query error" };
        }
    }catch(err){
        logger.error(`detailOrderState DB Connection error\n: ${err.message}`);
        return { isSuccess: false, code: 402, message: "detailOrderState DB Connection error"
        };
    }
}

module.exports = {
  selectOrdersId,
  checkOrdersId,

  checkProductId,
  ordersOption,
  ordersOptionUpdate,
  deleteOrdersOption,

  selectBranchId,
  createOrder,
  createOrderDetail,
  checkReserve,
  updateOrderDetail,

  updateArCard,
  updateArCardHistory,
  selectCouponId,
  reduceCouponCnt,
  updateCoupon,
  doReservation,

  selectOrderState,
  selectOneOrderState,

  detailOrderState
};
