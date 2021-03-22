const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const crypto = require('crypto');

//이메일 중복
async function isDuplicatedEmail(email)
{
    try{
        const connection = await pool.getConnection(async conn => conn);
        try {
            const selectEmailQuery = `
            SELECT uEmail FROM User WHERE uEmail = ?;
            `;
            const selectEmailParams = [email];
            const [emailRows] = await connection.query(selectEmailQuery, selectEmailParams);
            connection.release();

            if (emailRows.length > 0) return { isSuccess: false, code: 311, message: "중복된 이메일입니다." }; 
            else return {isSuccess:true}; 
        } catch(err) {
            logger.error(`isDuplicatedEmail Query error\n: ${JSON.stringify(err)}`);
            connection.release();
            return {
                isSuccess: false,
                code: 402,
                message: "isDuplicatedEmail Query error"
            };
        }
    } catch(err){
        logger.error(`isDuplicatedEmail DB Connection error\n: ${err.message}`);
        return {
            isSuccess: false,
            code: 401,
            message: "isDuplicatedEmail DB Connection error"
        };
    }
}

module.exports={
    isDuplicatedEmail
}