module.exports = function(app){
  require('dotenv').config();
  const axios = require('axios');
  const Cache = require('memory-cache');
  const request = require('request');
  const CryptoJS = require('crypto-js');

  // 네이버 Signiture API
  const date = Date.now().toString();
  const uri = 'ncp:sms:kr:263694435262:bunjang-project';
  const secretKey = 'cCx5MiZ4zm7mY9uHl2qefWKSi85jscUdRCYdc9M5';
  const accessKey = 'X2xF0fxOitdmCuJgaouw';
  const method = 'POST';
  const space = ' ';
  const newLine = '\n';
  const url = `https://sens.apigw.ntruss.com/sms/v2/services/${uri}/messages`;
  const url2 = `/sms/v2/services/${uri}/messages`;

  const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

  hmac.update(method);
  hmac.update(space);
  hmac.update(url2);
  hmac.update(newLine);
  hmac.update(date);
  hmac.update(newLine);
  hmac.update(accessKey);

  const hash = hmac.finalize();
  const signature = hash.toString(CryptoJS.enc.Base64);

  app.post('/auth', function async(req, res) {
    const phoneNumber = req.body.phoneNumber;
  
    Cache.del(phoneNumber);
  
    //인증번호 생성
    const verifyCode = Math.floor(Math.random() * (999999 - 100000)) + 100000;
  
    Cache.put(phoneNumber, verifyCode.toString());
  
    axios({
      method: method,
      json: true,
      url: url,
      headers: {
        'Content-Type': 'application/json',
        'x-ncp-iam-access-key': accessKey,
        'x-ncp-apigw-timestamp': date,
        'x-ncp-apigw-signature-v2': signature,
      },
      data: {
        type: 'SMS',
        contentType: 'COMM',
        countryCode: '82',
        from: '01033543945',
        content: `[NICE ID 본인 확인] 인증번호 [${verifyCode}]를 입력해주세요.`,
        messages: [
          {
            to: `${phoneNumber}`,
          },
        ],
      }, 
      // function(err, res, html) {
        // if(err) console.log(err);
        // else {
          // resultCode = 200;
          // console.log(html);
        // }
      })
    .then(function (res) {
      console.log('response',res.data, res['data']);
      res.json({isSuccess: true, code: 202, message: "본인인증 문자 발송 성공", result: res.data });
    })
    .catch((err) => {
      console.log(err.res);
      if(err.res == undefined){
        res.json({isSuccess: true, code: 200, message: "본인인증 문자 발송 성공", result: res.data });
      }
      else res.json({isSuccess: true, code: 204, message: "본인인증 문자 발송에 문제가 있습니다.", result: err.res });
    });
});
    // });
// res.json({ 'code' : resultCode });

app.post('/verify', (req, res) => {
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
  });}