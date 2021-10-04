const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');

const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const uDao = require('../dao/uDao');
const isDupEmailDao = require('../dao/isDupEmailDao');
const { constants } = require('buffer');
////
require('dotenv').config();
const app = require('express').Router();
const axios = require('axios');
const Cache = require('memory-cache');
const request = require('request');
const CryptoJS = require('crypto-js');

// 환경변수 설정
const NCP_serviceID = 'ncp:sms:kr:263694435262:bunjang-project';
const NCP_accessKey = '';
const NCP_secretKey = '';

const date = Date.now().toString();
const uri = NCP_serviceID;
const secretKey = NCP_secretKey;
const accessKey = NCP_accessKey;
const method = 'POST';
const space = " ";
const newLine = "\n";
const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
const url2 = `/sms/v2/services/${uri}/messages`;

const  hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

hmac.update(method);
hmac.update(space);
hmac.update(url2);
hmac.update(newLine);
hmac.update(date);
hmac.update(newLine);
hmac.update(accessKey);

const hash = hmac.finalize();
const signature = hash.toString(CryptoJS.enc.Base64);

exports.send = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;

    Cache.del(phoneNumber);

    //인증번호 생성
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;

    Cache.put(phoneNumber, verifyCode.toString());

    axios({
        method: method,
        json: true,
        url,
        headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'x-ncp-iam-access-key': NCP_accessKey,
            'x-ncp-apigw-timestamp': date,
            'x-ncp-apigw-signature-v2': signature,
        },
        data: {
            type: 'SMS',
            contentType: 'COMM',
            countryCode: '82',
            from: '01032587579',
            content: `[하트링크] 인증번호는 ${verifyCode} 입니다.`,
            messages: [
                {
                to: `${phoneNumber}`,
                },
            ],
        },
    })
    .then(function (res) {
    res.status({isSuccess: false, code: 111, message: "데이터문제"}, res['data']);
    })
    .catch((err) => {
    res.status({isSuccess: false, code: 112, message: "err"}, res['data']);
    });
}

exports.verify = async function (req, res) {
    const phoneNumber = req.body.phoneNumber;
    const verifyCode = req.body.verifyCode;

    const CacheData = Cache.get(phoneNumber);

    if (!CacheData) {
        return res.send('fail');
    } else if (CacheData !== verifyCode) {
        return res.send('fail');
    } else {
        Cache.del(phoneNumber);
        return res.send('success');
    }
}


exports.signUp = async function (req, res) {
    const {
        email, password, name, birth, phone, addr, memNo
    } = req.body;

    // 이메일 체크
    if (!email) 
        return res.json({isSuccess: false, code: 105, message: "이메일을 입력해주세요."});
    if (email.length > 30) 
        return res.json({isSuccess: false,code: 109,message: "이메일은 30자리 미만으로 입력해주세요."});
    const isDuplicateEmail = await isDupEmailDao.isDuplicatedEmail(email); // 이메일 중복 체크
    if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 303, message: "이메일을 형식을 정확하게 입력해주세요."});
    if(isDuplicateEmail.isSuccess==false) return res.json(isDuplicateEmail);
    
    if (!password) 
        return res.json({isSuccess: false, code: 106, message: "비밀번호를 입력해주세요."});
    if (password.length < 8 || password.length > 20) 
        return res.json({isSuccess: false,code: 110,message: "비밀번호는 8~20자리를 입력해주세요."});
    var regexName = /^[가-힣]{2,4}|[a-zA-Z]{2,10}\s[a-zA-Z]{2,10}$/;
    if (!regexName.test(name)) return res.json({isSuccess: false, code: 311, message: "이름 형식을 정확하게 입력해주세요."});


    var regexPhone = /^[0-9]+$/;
    if (!regexPhone.test(phone)) return res.json({isSuccess: false, code: 310, message: "전화번호 형식을 정확하게 입력해주세요."});

    // 전화번호 체크
    if(!phone) 
        return res.json({isSuccess: false, code:107, message:"전화번호를 입력해주세요."}); 
     if (phone.length > 11) return res.json({
            isSuccess: false,
            code: 108,
            message: "전화번호는 최대 11자리를 입력해주세요."
        });
        
    
    const phoneRows = await uDao.uPhoneCheck(phone);
    if (phoneRows.length > 0) {
        return res.json({
            isSuccess: false,
            code: 309,
            message: "중복된 전화번호입니다."
        });
    }
    // const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
    // 회원가입 진행
    // console.log(email,hashedPassword, phone, nickname, petName, family, speciesIdx, petBirth, petWeight, petAge, metabolism)
    const signUpFinished = await uDao.insertUInfo(
        email, password, name, birth, phone, addr, memNo);
    if(signUpFinished.isSuccess==false) 
        return res.json(signUpFinished);

    const smsPushComplete = await uDao.insertSmsPush(email);
    if(smsPushComplete.isSuccess==false) 
        return res.json(smsPushComplete);
        
    // 토큰 생성
    return res.json({
        isSuccess: true,
        code: 200,
        message: "회원가입 성공"
    });
};




exports.signIn = async function (req, res) {
    const { email, password } = req.body;
    try{
        // 이메일 체크
        if (!email) return res.json({isSuccess: false, code: 105, message: "이메일을 입력해주세요."});
        if (email.length > 30) return res.json({isSuccess: false,code: 109,message: "이메일은 30자리 미만으로 입력해주세요."});
        if (!regexEmail.test(email)) return res.json({isSuccess: false, code: 303, message: "이메일 형식을 정확하게 입력해주세요."});

        // 비밀번호 체크
        if (!password) return res.json({isSuccess: false, code: 106, message: "비밀번호를 입력 해주세요."});

        const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');

        // 로그인
        const signInComplete = await uDao.selectUserInfo(email, hashedPassword);
        if(signInComplete.isSuccess==false) return res.json(signInComplete);

        console.log(signInComplete);

        if (signInComplete[0].state === "deleted") {
            return res.json({ isSuccess: false, code: 332, message: "탈퇴된 계정입니다. 고객센터에 문의해주세요." });
        }

        if (signInComplete[0].state === 'inactivate') {
            return res.json({ isSuccess: false, code: 312, message: '비활성화된 계정입니다. 고객센터에 문의해주세요.' });
        }

        // const userIdxComplete = await uDao.selectuserIdx(email);
        // if(signInComplete.isSuccess==false) return res.json(signInComplete);

        // 토큰 생성
        let token = await jwt.sign({
            userIdx: signInComplete[0].uId,
            email: email,
            password: hashedPassword
        }, // 토큰의 내용(payload)
            secret_config.jwtsecret, // 비밀 키
            {
                expiresIn: '365d',
                subject: 'userInfo',
            } // 유효 시간은 365일
        );

        // 토큰 정보
        const tokenInfo = await jwt.verify(token,secret_config.jwtsecret);

        return res.json({result : {jwt: token, tokenInfo}, isSuccess: true, code: 200, message: "로그인 성공"});
    }catch (error) {
        return res.json({isSuccess: false, code: 400, message: "로그인 실패" });
        }
    };


exports.myInfo = async function (req, res) {
    const userIdx = req.params.userIdx;
    const token = req.verifiedToken;
    try {
      const connection = await pool.getConnection(async (conn) => conn)
      try {
        const myInfoRows = await uDao.selectMyInfo(userIdx);
        console.log(myInfoRows);

        console.log(userIdx);
        console.log(token.userIdx);

        if(userIdx != token.userIdx){
            return res.json({ isSuccess: true, code: 412, message: "권한이 없습니다" });
        }

        connection.release();
        res.json({
          myInfoRows, isSuccess: true, code: 200, message: '상세 정보 조회 성공'
        });
      } catch (err) {
        logger.error(`App - myInfo Query error\n: ${JSON.stringify(err)}`);
        console.log(err);
        connection.release();
        return false;
      }
    } catch (err) {
      logger.error(`App - myInfo DB Connection error\n: ${JSON.stringify(err)}`);
      return false;
    }
}




exports.delete = async function (req, res) {
      const userIdx = req.params.userIdx;
      try{
        
        const deleteComplete = await uDao.deleteUser(userIdx);
        console.log(userIdx);
        if(deleteComplete.isSuccess==false) return res.json(deleteComplete);
        
        return res.json({ isSuccess: true, code: 200, message: '탈퇴 성공'});
    }
    catch (error) {
    return res.json({isSuccess: false, code: 400, message: "탈퇴실패" });
    }
    
};




