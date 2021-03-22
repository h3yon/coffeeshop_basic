// const {pool} = require('../../../config/database');
// const {logger} = require('../../../config/winston');


// exports.check = async function(req, res)
// {
//     const token = req.verifiedToken;
//       const connection = await pool.getConnection(async (conn) => conn)
//       try {
//         const checkRows = await jwtCheckDao.jwtUserCheck(token.email, token.password);

//         if (checkRows.length < 1) {
//             connection.release();
//             return {
//                 isSuccess: false,
//                 code: 100,
//                 message: "유효하지 않은 토큰입니다."
//             };
//         }


//         if (checkRows[0].state === "deleted") {
//             connection.release();
//             return {
//                 isSuccess: false,
//                 code: 100,
//                 message: "유효하지 않은 토큰입니다."
//             };
//         }      
        
//         if (checkRows[0].state === "inactivate") {
//             connection.release();
//             return {
//                 isSuccess: false,
//                 code: 100,
//                 message: "유효하지 않은 토큰입니다."
//             };
//         }      


//         return res.json({
//             isSuccess: true,
//             code: 200,
//             message: "검증 성공",
//             result: req.verifiedToken
//         });
// }catch(error){
//     return res.json({isSuccess: false, code: 400, message: "검증 실패" });
// }
// }
