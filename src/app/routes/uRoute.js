module.exports = function(app){
    const user = require('../controllers/uController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');
    const isDupEmail = require('../controllers/isDupEmailController');
    const changeInformation = require('../controllers/changeInformationController');
    const bodyParser = require('body-parser');

    app.route('/user/signup').post(user.signUp); //회원가입
    app.route('/user/signin').post(user.signIn); //로그인
    app.get('/isduplicatedemail',isDupEmail.isDuplicatedEmail); //이메일 검사

    //내정보조회
    app.use('/user/:userIdx', jwtMiddleware);
    app.get('/user/:userIdx',user.myInfo);

    //비밀번호 변경
    app.use('/user/:userIdx', jwtMiddleware);
    app.route('/user/:userIdx').patch(changeInformation.changeMyInfo);

    //회원탈퇴
    app.use('/user/:userIdx/delete', jwtMiddleware);
    app.route('/user/:userIdx/delete').patch(user.delete);

    // app.get('/check', jwtMiddleware, user.check);

    // app.use(bodyParser.json());
    // app.post("/send",user.send);

    // app.post('/send', user.send);
    // app.post('/verify', user.verify);
};