const jwt = require('jsonwebtoken');
const secret_config = require('./secret');

const jwtCheck = require('../src/app/dao/uDao')

const jwtMiddleware = (req, res, next) => {
    // read the token from header or url
    const token = req.headers['x-access-token'] || req.query.token;
    //위에꺼: 클라이언트에서 보낸 해더에 토큰을 읽어옴
    // token does not exist, 만약 없을 경우
    if(!token) {
        return res.status(403).json({
            isSuccess:false,
            code: 403,
            message: '로그인이 되어 있지 않습니다.'
        });
    }
    /* 로그인 하고 나서 그 유저가 가지고 있는 토큰값을 확인해야하는 절차가 매번 있기 때문에
    미들웨어로 하나의 모듈화를 시켜줘서 진행 */

    // create a promise: decodes the token, 들어왔을 때는
    const p = new Promise(
        (resolve, reject) => {
            jwt.verify(token, secret_config.jwtsecret , (err, verifiedToken) => {
                if(err) reject(err);

                if(verifiedToken.sub=="user"){
                    var userIdx = verifiedToken.userIdx;
                    var email = verifiedToken.email;
                    var password = verifiedToken.password;
                    const userCheck = jwtCheck.jwtUserCheck(userIdx, email,password);
                    if(userCheck.isSuccess==false) resolve(verifiedToken = {
                        isSuccess: false,
                        code: 100,
                        message: "유효하지 않은 토큰입니다."
                    });
                    resolve(verifiedToken);
                }
                resolve(verifiedToken)
                //jwt토큰을 만들 때 만들었떤 방식으로 다시 풀어서 볼 수 있도록.
            })
        }
    );

    //푸는 과정에서 검증이 실패했다면 토큰 검증 실패를 띄워주도록 미드웨어를 구성
    // if it has failed to verify, it will return an error message
    const onError = (error) => {
        res.status(404).json({
            isSuccess:false,
            code: 404,
            message:"검증 실패"
        });
    };

    // process the promise
    p.then((verifiedToken)=>{
        //비밀 번호 바꼇을 때 검증 부분 추가 할 곳
        req.verifiedToken = verifiedToken;
        next();
    }).catch(onError)
};

module.exports = jwtMiddleware;






// const jwt = require('jsonwebtoken');
// const secret_config = require('./secret');

// const userCheck = require('../src/app/daos/userDao')

// const jwtMiddleware = (req, res, next) => {
//     // read the token from header or url
//     const token = req.headers['x-access-token'] || req.query.token;
//     //위에꺼: 클라이언트에서 보낸 해더에 토큰을 읽어옴
//     // token does not exist, 만약 없을 경우
//     if(!token) {
//         return res.status(403).json({
//             isSuccess:false,
//             code: 403,
//             message: '로그인이 되어 있지 않습니다.'
//         });
//     }
//     /* 로그인 하고 나서 그 유저가 가지고 있는 토큰값을 확인해야하는 절차가 매번 있기 때문에
//     리들웨어?로 하나의 모듈화를 시켜줘서 진행 */

//     // create a promise that decodes the token, 들어왔을 때는
//     const p = new Promise(
//         (resolve, reject) => {
//             jwt.verify(token, secret_config.jwtsecret , (err, verifiedToken) => {
//                 if(err) reject(err);
//                 resolve(verifiedToken)
//                 //jwt토큰을 만들 때 만들었떤 방식으로 다시 풀어서 볼 수 있도록.
//             })
//         }
//     );

//     //푸는 과정에서 검증이 실패했다면 토큰 검증 실패를 띄워주도록 미드웨어를 구성
//     // if it has failed to verify, it will return an error message
//     const onError = (error) => {
//         res.status(403).json({
//             isSuccess:false,
//             code: 403,
//             message:"검증 실패"
//         });
//     };

//     // process the promise
//     p.then((verifiedToken)=>{
//         //비밀 번호 바꼇을 때 검증 부분 추가 할 곳
//         req.verifiedToken = verifiedToken;
//         next();
//     }).catch(onError)
// };

// module.exports = jwtMiddleware;