const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const changeInformationDao = require('../dao/changeInformationDao');
const { isNull } = require('util');

//비밀번호 변경 
exports.changeMyInfo = async function (req, res) {
    const { password, repassword, phone, address } = req.body;
    const userIdx = req.params.userIdx;

    try{
        console.log(password, repassword, phone, address);
    var regexPhone = /^[0-9]+$/;
    if ((phone != undefined)&&(phone != null)&&(!regexPhone.test(phone))) 
        return res.json({isSuccess: false, code: 310, message: "전화번호 형식을 정확하게 입력해주세요."});
    
    if (phone.length > 11) return res.json({
            isSuccess: false,
            code: 108,
            message: "전화번호는 최대 11자리를 입력해주세요."
        });

    // 비밀번호 체크
    if (password.length < 8 || password.length > 20) return res.json({isSuccess: false,code: 110,message: "비밀번호는 8~20자리를 입력해주세요."});
    if(password!==repassword) return res.json({isSuccess: false, code: 315, message: "비밀번호가 일치하지 않습니다."});

    // 비밀번호 변경
    const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
    if(hashedPassword==req.verifiedToken.password){ 
        return res.json({isSuccess: false, code: 335, message: "이전과 다른 비밀번호를 입력해주세요."}); 
    }

    if(userIdx != req.verifiedToken.userIdx){
        return res.json({ isSuccess: true, code: 412, message: "권한이 없습니다" });
    }

    const changeMyInfoComplete = await changeInformationDao.changeMyInfo(password, phone, address, userIdx);
    if(changeMyInfoComplete.isSuccess==false) 
    {return res.json(changeMyInfoComplete);}

    // 토큰 생성
    let token = await jwt.sign({
        userIdx: req.verifiedToken.userIdx, 
        email: req.verifiedToken.email,
        password: hashedPassword
    }, // 토큰의 내용(payload)
        secret_config.jwtsecret, // 비밀 키
        {
            expiresIn: '365d',
            subject: 'user',
        } // 유효 시간은 365일
    );

    return res.json({
        result: {jwt: token}, isSuccess: true, code: 200, message: "정보 변경 성공"
    });

    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "정보 변경 실패" });
    }
};



// //휴대폰번호 변경 
// exports.changePhoneNumber = async function (req, res) {
//     try{
//         const { phoneNum } = req.body;

//         // console.log(req.verifiedToken);

//         // 휴대폰번호 변경
//         const changePhoneNumComplete = await changeInformationDao.changePhoneNum(phoneNum, req.verifiedToken.email);
//         console.log(phoneNum, req.verifiedToken.email);
//         if(changePhoneNumComplete.isSuccess==false) {return res.json(changePhoneNumComplete);}

//         return res.json({
//             // jwt: token,
//             isSuccess: true,
//             code: 200,
//             message: "전화번호 변경 성공"
//         });
//     }
//     catch (error) {
//     return res.json({isSuccess: false, code: 400, message: "전화번호 변경 실패" });
//     }
// };


// //주소 변경
// exports.changeAddress = async function (req, res) {
//     const { address } = req.body;

//     try{
//         const changeAddrComplete = await changeInformationDao.changeAddr(address, req.verifiedToken.email);
//         console.log(address, req.verifiedToken.email);
//         if(changeAddrComplete.isSuccess==false) {return res.json(changeAddrComplete);}

//         return res.json({
//             // jwt: token,
//             isSuccess: true,
//             code: 200,
//             message: "주소 변경 성공"
//         });
//     }
//     catch (error) {
//     return res.json({isSuccess: false, code: 400, message: "주소 변경 실패" });
//     }
// };
