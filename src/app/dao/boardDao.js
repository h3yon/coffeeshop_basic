const { pool } = require("../../../config/database");
//exports로 다른 데에서도 사용할 수 있게 했으니까.

//selectBoard
async function selectBoard(email) {
  //async
  const connection = await pool.getConnection(async (conn) => conn);
  //connection맺어주고
  const selectBoardQuery = `
                SELECT user_id, first_name 
                FROM user_info;
                `;
  const [boardRows] = await connection.query(
    selectBoardQuery
  );
  connection.release();

  return boardRows; //결과값을 뱉어줌
}

module.exports = {
  selectBoard
};
