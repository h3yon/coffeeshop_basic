const mysql = require('mysql2/promise'); //이 모듈을 사용
const {logger} = require('./winston');

//계정정보를 가지고 있는 것에 pool을 해줌
const pool = mysql.createPool({ //데이터베이스의 정보를 담음 
    host: 'localhost',
    user: 'casey',
   // port: ,
    password: '',
    database: 'artiseeDB'
});

module.exports = { //다른 데에서도 사용할 수 있게 
    pool: pool //pool이란 이름으로 export해줌
};


const exampleNonTransaction = async (sql, params) => {
    try {
        //getConnection을 해줌, 
        const connection = await pool.getConnection(async conn => conn);
        try {
            const [rows] = await connection.query(sql, params); //결과값
            connection.release(); //결과값이 나왔다면 꼭 release를 해줘서 커넥션을 풀어줘야함
            return rows;
        } catch(err) {//만약 오류가 발생했다면
            logger.error(`example non transaction Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return false;
        }
    } catch(err) {
        logger.error(`example non transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

//트랜젝션인 경우
/*
    회원정보의 유저테이블에 저장했다가 유저의 관련된 배터리 정보를 컬럼에 넣어줘야함.
    API를 한번 실행했을 때 유저에 들어가고 배터리에 들어가야하는데
    회원정보에 들어가고 에러가 남. 그럼 베터리엔 잘 안 들어간 것.
    이럴 때 트랜잭션을 수행함
    2개 테이블에 들어가야하만 모든 게 잘 돼서 들어감.
    만약 회원 정보만 들어가게 됐다면 다시 모든 걸 복귀시켜서 처음 상태로 만들어준다.
    -> 트랜잭션도 찾아보고 오기.
*/
const exampleTransaction = async (sql, params) => {
    try {
        //pool을 바탕으로 커넥션을 해줌
        const connection = await pool.getConnection(async conn => conn);
        try {
            await connection.beginTransaction(); // START TRANSACTION
            const [rows] = await connection.query(sql, params);
            await connection.commit(); // COMMIT
            connection.release();
            return rows;
        } catch(err) {
            await connection.rollback(); // ROLLBACK
            connection.release();
            logger.error(`example transaction Query error\n: ${JSON.stringify(err)}`);
            return false;
        }
    } catch(err) {
        logger.error(`example transaction DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};