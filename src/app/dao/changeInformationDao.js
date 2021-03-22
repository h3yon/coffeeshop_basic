const { pool } = require("../../../config/database");
const {logger} = require('../../../config/winston');
const crypto = require('crypto');


//비밀번호 변경
async function changeMyInfo(password, phone, address, userIdx) {
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
        await connection.beginTransaction(); // START TRANSACTION
        // const connection = await pool.getConnection(async (conn) => conn);
        const changeMyInfoQuery = `
        update User set uPw = IFNULL(?, (select uPw where uId = ?)),
        uPhone = IFNULL(?, (select uPhone where uId = ?)),
        uAddr = IFNULL(?, (select uAddr where uId = ?))
          where uId =? and state = 'added'
                      `;
        const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
        let changeMyInfoParams = [hashedPassword, userIdx, phone, userIdx, address, userIdx, userIdx];
        await connection.query(changeMyInfoQuery, changeMyInfoParams);
        await connection.commit();
        connection.release();
        return {isSuccess:true}; 
    } catch(err) {
      // await connection.rollback(); // ROLLBACK
      connection.release();
      logger.error(`App - changeMyInfo Query error\n: ${JSON.stringify(err)}`);
      return {
          isSuccess: false,
          code: 401,
          message: "App - changeMyInfo Query error"
      };
    }
  } catch(err){
    logger.error(`App - changeMyInfo DB Connection error\n: ${err.message}`);
    return {
      isSuccess: false,
      code: 402,
      message: "App - changeMyInfo DB Connection error"
    };
  }
}



// //휴대폰 번호 변경
// async function changePhoneNum(phoneNum, email) {
//   try{
//     const connection = await pool.getConnection(async conn => conn);
//     try {
//         await connection.beginTransaction(); // START TRANSACTION
//         // const connection = await pool.getConnection(async (conn) => conn);
//         const changePhoneNumQuery = `
//         UPDATE User SET uPhone = ?, 
//         updatedAt = now() WHERE uEmail = ? and state='added';
//                       `;
//         const changePhoneNumParams = [phoneNum, email];
//         await connection.query(changePhoneNumQuery, changePhoneNumParams);
//         await connection.commit();
//         connection.release();
//         return {isSuccess:true}; //결과값을 뱉어줌
//     } catch(err) {
//       // await connection.rollback(); // ROLLBACK
//       connection.release();
//       logger.error(`App - changePhoneNum Query error\n: ${JSON.stringify(err)}`);
//       return {
//           isSuccess: false,
//           code: 400,
//           message: "App - changePhoneNum Query error"
//       };
//     }
//   } catch(err){
//     logger.error(`App - changePhoneNum DB Connection error\n: ${err.message}`);
//     return {
//       isSuccess: false,
//       code: 401,
//       message: "App - changePhoneNum DB Connection error"
//     };
//   }
// }



// //주소 변경
// async function changeAddr(address, email) {
//   try{
//     const connection = await pool.getConnection(async conn => conn);
//     try {
//         await connection.beginTransaction(); // START TRANSACTION
//         const changeAddrQuery = `
//         UPDATE User SET uAddr = ?, 
//         updatedAt = now() WHERE uEmail = ? and state='added';
//                       `;
//         const changeAddrParams = [address, email];
//         await connection.query(changeAddrQuery, changeAddrParams);
//         await connection.commit();
//         connection.release();
//         return {isSuccess:true};
//     } catch(err) {
//       // await connection.rollback(); // ROLLBACK
//       connection.release();
//       logger.error(`App - changeAddr Query error\n: ${JSON.stringify(err)}`);
//       return {
//           isSuccess: false,
//           code: 400,
//           message: "App - changeAddr Query error"
//       };
//     }
//   } catch(err){
//     logger.error(`App - changeAddr DB Connection error\n: ${err.message}`);
//     return {
//       isSuccess: false,
//       code: 401,
//       message: "App - changeAddr DB Connection error"
//     };
//   }
// }




module.exports = {
  changeMyInfo
  // ,
  // isValidEmail
};