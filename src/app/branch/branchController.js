const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const branchDao = require('../dao/branchDao');

// exports.allBranch = async function (req, res) {
//       try {
//             const allBranchRows = await branchDao.selectAllBranch(); 
//             console.log(allBranchRows);

//             if (allBranchRows.length > 0) {
//                 return res.json({
//                     isSuccess: true,
//                     code: 200,
//                     message: "전체 지점 조회 성공",
//                     data: allBranchRows
//                 });
//             }
//             return res.json({
//                 isSuccess: false,
//                 code: 300,
//                 message: "전체 지점이 존재하지 않습니다."
//             });
//         } catch (err) {
//             logger.error(`App - selectProduct Query error\n: ${err.message}`);
//             return res.status(500).send(`Error: ${err.message}`);
//         }
// };

exports.userBranch = async function(req,res){
    const token = req.verifiedToken;

    const latitude = req.query.latitude;
    const longtitude = req.query.longtitude;
    const userIdx = token.userIdx;

    console.log(latitude, longtitude, latitude, userIdx);

    try {
        const userBranchRows = await branchDao.selectUserBranch(latitude, longtitude, latitude, userIdx);
        if (userBranchRows.length > 0) {
            return res.json({ isSuccess: true, code: 200, result: userBranchRows, message: '지점 조회 성공',
            })
        }
        return res.json({
            isSuccess: false,
            code: 300,
            message: "지점이 존재하지 않습니다."
        });
    } catch (err) {
        logger.error(`App - userBranch Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

exports.detailBranch = async function(req,res){
    const branchId = req.params.branchId;

    try {
        const detailBranchRows = await branchDao.selectDetailBranch(branchId);
        console.log(branchId);
        if (detailBranchRows.length > 0) {
            return res.json({ isSuccess: true, code: 200, result: detailBranchRows, message: '지점 상세조회 성공',
            })
        }
        return res.json({
            isSuccess: false,
            code: 300,
            message: "지점이 존재하지 않습니다."
        });
    } catch (err) {
        logger.error(`detailBranch Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}
