const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const boardDao = require('../dao/boardDao');

exports.getBoard = async function (req, res) {
      try {
            const boardRows = await boardDao.selectBoard(); 

            console.log(boardRows);

            if (boardRows.length > 0) {
                return res.json({
                    isSuccess: true,
                    code: 200,
                    message: "게시물 조회 성공",
                    data: boardRows
                });
            }
            return res.json({
                isSuccess: false,
                code: 300,
                message: "게시물이 존재하지 않습니다."
            });
        } catch (err) {
            logger.error(`App - selectBoard Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
};