// const {pool} = require('../../../config/database');
// const {logger} = require('../../../config/winston');
// const crypto = require('crypto');
// const { monitorEventLoopDelay } = require('perf_hooks');

// async function jwtUserCheck(email, password)
// {
//     try {
//         const connection = await pool.getConnection(async conn => conn);
//         try {
//             const selectUserInfoQuery = `
//                 SELECT uEmail, uPw, state
//                 FROM User
//                 WHERE uEmail = ?';
//                 `;

//             let selectUserInfoParams = [email];

//             const [userInfoRows] = await connection.query(selectUserInfoQuery, selectUserInfoParams);

//             const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

//             if (userInfoRows[0].uPw !== hashedPassword) {
//                 connection.release();
//                 return {
//                     isSuccess: false,
//                     code: 100,
//                     message: "유효하지 않은 토큰입니다."
//                 };
//             }
 
//             connection.release();
//             return userInfoRows;
//         } catch (err) {
//             logger.error(`App - jwtUserCheck Query error\n: ${JSON.stringify(err)}`);
//             connection.release();
//             return {
//                 isSuccess: false,
//                 code: 405,
//                 message: "App - jwtUserCheck Query error"
//             };
//         }
//     } catch (err) {
//         logger.error(`App - jwtUserCheck DB Connection error\n: ${JSON.stringify(err)}`);
//         return {
//             isSuccess: false,
//             code: 406,
//             message: "App - jwtUserCheck DB Connection error"
//         };
//     }
// }

// // async function jwtAdminCheck(id, password)
// // {
// //     try {
// //         const connection = await pool.getConnection(async conn => conn);
// //         try {
// //             const selectAdminInfoQuery = `
// //                 SELECT idx, id, password, status
// //                 FROM admin
// //                 WHERE id = ? and status='ACTIVATE';
// //                 `;

// //             let selectAdminInfoParams = [id];

// //             const [adminInfoRows] = await connection.query(selectAdminInfoQuery, selectAdminInfoParams);

// //             if (adminInfoRows.length < 1) {
// //                 connection.release();
// //                 return {
// //                     isSuccess: false,
// //                     code: 100,
// //                     message: "유효하지 않은 토큰입니다."
// //                 };
// //             }

// //             if (adminInfoRows[0].password !== password) {
// //                 connection.release();
// //                 return {
// //                     isSuccess: false,
// //                     code: 100,
// //                     message: "유효하지 않은 토큰입니다."
// //                 };
// //             }

// //             connection.release();
            
// //             return {isSuccess:true}
// //         } catch (err) {
// //             logger.error(`App - jwtAdminCheck Query error\n: ${JSON.stringify(err)}`);
// //             connection.release();
// //             return {
// //                 isSuccess: false,
// //                 code: 400,
// //                 message: "App - jwtAdminCheck Query error"
// //             };
// //         }
// //     } catch (err) {
// //         logger.error(`App - jwtAdminCheck DB Connection error\n: ${JSON.stringify(err)}`);
// //         return {
// //             isSuccess: false,
// //             code: 401,
// //             message: "App - jwtAdminCheck DB Connection error"
// //         };
// //     }
// // }

// module.exports={
//     jwtUserCheck
//     // jwtAdminCheck
// }