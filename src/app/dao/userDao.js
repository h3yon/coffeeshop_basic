// const { pool } = require("../../../config/database");
// //exports로 다른 데에서도 사용할 수 있게 했으니까.

// // Signup
// async function userEmailCheck(email) {
//   //async
//   const connection = await pool.getConnection(async (conn) => conn);
//   //connection맺어주고
//   const selectEmailQuery = `
//                 SELECT uEmail, uPhone 
//                 FROM User 
//                 WHERE uEmail = ?;
//                 `;//물음표 안엔 [email]값이 들어감 
//   const selectEmailParams = [email]; //다시 재정의, 스트링형식으로 재정의해주거나, @앞쪽만 사용해야될 때 등등 변환 가능한 것을 명시
//   const [emailRows] = await connection.query(
//     selectEmailQuery,
//     selectEmailParams
//   );
//   connection.release();

//   return emailRows; //결과값을 뱉어줌
// }

// async function userPhoneCheck(phone) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectPhoneQuery = `
//                 SELECT uEmail, uPhone 
//                 FROM User
//                 WHERE uPhone = ?;
//                 `;
//   const selectPhoneParams = [phone];
//   const [phoneRows] = await connection.query(
//     selectPhoneQuery,
//     selectPhoneParams
//   );
//   connection.release();
//   return phoneRows;
// }

// async function insertUserInfo(insertUserInfoParams) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const insertUserInfoQuery = `
//         INSERT INTO User(uEmail, uPw, uPhone)
//         VALUES (?, ?, ?);
//     `;
//   const insertUserInfoParams = [email, password, phone];
//   const insertUserInfoRow = await connection.query(
//     insertUserInfoQuery,
//     insertUserInfoParams
//   );
//   connection.release();
//   return insertUserInfoRow;
// }

// //SignIn
// async function selectUserInfo(email) {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectUserInfoQuery = `
//                 SELECT uId, uEmail , uPw, uPhone, state 
//                 FROM User 
//                 WHERE uEmail = ?;
//                 `;

//   let selectUserInfoParams = [email];
//   const [userInfoRows] = await connection.query(
//     selectUserInfoQuery,
//     selectUserInfoParams
//   );
//   return [userInfoRows];
// }

// module.exports = {
//   userEmailCheck,
//   userPhoneCheck,
//   insertUserInfo,
//   selectUserInfo,
// };
