const { pool } = require("../../../config/database");
const {logger} = require('../../../config/winston');
const crypto = require('crypto');


// Signup
async function uEmailCheck(email) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectEmailQuery = `
       SELECT uEmail FROM User WHERE uEmail = ?;
                `;
  const selectEmailParams = [email];
  const [emailRows] = await connection.query(
    selectEmailQuery, selectEmailParams
  );
  connection.release();
  console.log(emailRows);
  return emailRows;
}
async function uPhoneCheck(phone) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectPhoneQuery = `
                SELECT CONCAT(LEFT(uPhone, 3), '-', MID(uPhone, 4, 4), '-', RIGHT(uPhone, 4)) FROM User WHERE uPhone = ?;
                `;
  const selectPhoneParams = [phone];
  const [phoneRows] = await connection.query(
    selectPhoneQuery, selectPhoneParams
  );
  connection.release();
  console.log(phoneRows);
  return phoneRows;
}
async function insertUInfo(email, password, name, birth, phone, addr, memNo)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const insertUQuery = `
        INSERT INTO User(uEmail, uPw, uName, uBirth, uPhone, uAddr, memNo, signUpDate)
        VALUES (?, ?, ?, ?, ?, ?, ?, now());
        `;

      const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
      console.log(hashedPassword);
      const insertUParams = [email, hashedPassword, name, birth, phone, addr, memNo];
      await connection.query(insertUQuery, insertUParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`SignUp Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return res.json({
          isSuccess: false,
          code: 400,
          message: "SignUp Query error"
          });
        }
    }catch(err){
        logger.error(`SignUp DB Connection error\n: ${err.message}`);
        return res.json({
            isSuccess: false,
            code: 401,
            message: "SignUp DB Connection error"
        });
    }
}



async function insertSmsPush(email)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const insertSmsPushQuery = `
        INSERT INTO SmsPush(uId)
        VALUES ((select uId From User where uEmail=?));
        `;
      const insertSmsPushParams = [email];
      await connection.query(insertSmsPushQuery, insertSmsPushParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`insertSmsPush Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return res.json({
          isSuccess: false, code: 400, message: "insertSmsPush Query error" });
        }
    }catch(err){
        logger.error(`insertSmsPush DB Connection error\n: ${err.message}`);
        return res.json({
            isSuccess: false, code: 401, message: "insertSmsPush DB Connection error" });
    }
}



async function selectuserIdx(userIdx)
{
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const selectuserIdxQuery = 
      ` SELECT uId FROM User where uId=?`;
      let selectuserIdxParams = [userIdx];
      const [userIdxRows] = await connection.query(selectuserIdxQuery, selectuserIdxParams);

        return userIdxRows;
    } catch (err) {
      logger.error(`selectUId Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return {
        isSuccess: false,
        code: 400,
        message: "selectUId Query error"
      };
    }
} catch (err) {
  logger.error(`selectUId DB Connection error\n: ${JSON.stringify(err)}`);
  return {
    isSuccess: false,
    code: 401,
    message: "selectUId DB Connection error"
  };
}
}



//login
async function selectUserInfo(email, hashedPassword){
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const selectUserInfoQuery = 
      ` SELECT uId, uEmail, uPw, state FROM User WHERE uEmail = ?`;
      let selectUserInfoParams = [email];
      const [userInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams);

      if (userInfoRows.length < 1) {
        connection.release();
        return { isSuccess: false, code: 305, message: "이메일을 확인해주세요." }; }
      if (userInfoRows[0].uPw !== hashedPassword) {
        connection.release();
          return { isSuccess: false, code: 306, message: "비밀번호를 확인해주세요." }; }
          else{
            return userInfoRows;
          }
    } catch (err) {
        logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return {
          isSuccess: false,
          code: 400,
          message: "App - SignIn Query error"
        };
      }
} catch (err) {
  logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
  return {
    isSuccess: false,
    code: 401,
    message: "App - SignIn DB Connection error"
  };
}
}


async function selectMyInfo(userIdx)
{
  try {
    const connection = await pool.getConnection(async conn => conn);
    try {
      const selectMyInfoQuery = `
      select User.uId, User.uEmail, uPw, uName,
      (select date_format(uBirth, '%Y년 %m월 %d일')) as ubirth, 
      CONCAT(LEFT(uPhone, 3), '-', MID(uPhone, 4, 4), '-', RIGHT(uPhone, 4)) as phone, uAddr, 
             isEmailPush, isSmsPush,
      (select date_format(signUpDate, '%Y년 %m월 %d일')) as signUpDate,
             isNoticePush, isAdPush, isNightPush, state, usageName, CashReceipt.phoneNum as receiptCall, isEmploy
      from User
          left join CashUserReceipt on User.uId = CashUserReceipt.uId
          left join SmsPush on User.uId = SmsPush.uId
          left join CashReceipt on CashReceipt.cashReceiptId = CashUserReceipt.cashReceiptId
          left join CashUsage on CashUsage.usageId = CashReceipt.usageId
          left join UserEmploy on User.uId = UserEmploy.uId
      where User.uId = ?
      order by User.uId;
                    `
      console.log(userIdx);
      let selectMyInfoParams = [userIdx];
      const [myInfoRows] = await connection.query(selectMyInfoQuery, selectMyInfoParams);
        
        connection.release();
        return myInfoRows;
    } catch (err) {
      logger.error(`App - myInfo Query error\n: ${JSON.stringify(err)}`);
      connection.release();
      return {
        isSuccess: false,
        code: 400,
        message: "App - myInfo Query error"
      };
    }
} catch (err) {
  logger.error(`App - myInfo DB Connection error\n: ${JSON.stringify(err)}`);
  return {
    isSuccess: false,
    code: 401,
    message: "App - myInfo DB Connection error"
  };
}
}


async function deleteUser(userIdx)
{
  try{
    const connection = await pool.getConnection(async conn => conn);
    try {
      await connection.beginTransaction(); // START TRANSACTION
      const deleteUserQuery = `
        update User set state = 'deleted'
        where uId = ?
        `;
      const deleteUserParams = [userIdx];
      await connection.query(deleteUserQuery, deleteUserParams);
      await connection.commit();
      connection.release();
      return {isSuccess:true};
      }catch(err) {
        await connection.rollback(); // ROLLBACK
        logger.error(`deleteUser Query error\n: ${JSON.stringify(err)}`);
        connection.release();
        return res.json({
          isSuccess: false,
          code: 401,
          message: "deleteUser Query error"
          });
        }
    }catch(err){
        logger.error(`deleteUser DB Connection error\n: ${err.message}`);
        return res.json({
            isSuccess: false,
            code: 402,
            message: "deleteUser DB Connection error"
        });
    }
}


module.exports = {
  uEmailCheck,
  uPhoneCheck,
  insertUInfo,
  insertSmsPush,

  selectuserIdx,
  selectUserInfo,
  selectMyInfo,
  deleteUser
};
