const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');
const isDupEmailDao = require('../dao/isDupEmailDao');

exports.isDuplicatedEmail = async function (req, res) {
    const email = req.query.email;

    // 닉네임 체크
    if (!email) return res.json({isSuccess: false, code: 105, message: "이메일을 입력해주세요."});
    const isDuplicatedEmail = await isDupEmailDao.isDuplicatedEmail(email); // 이메일 중복 체크
    if(isDuplicatedEmail.isSuccess==false) return res.json(isDuplicatedEmail);

    return res.json({
        isSuccess: true,
        code: 200,
        message: "이메일 중복 검사 성공"
    });
};
