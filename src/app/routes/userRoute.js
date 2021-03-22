// module.exports = function(app){
//     const user = require('../controllers/userController');
//     const jwtMiddleware = require('../../../config/jwtMiddleware');

//     app.route('/app/signUp').post(user.signUp);
//     app.route('/app/signIn').post(user.signIn);

//     app.get('/check', jwtMiddleware, user.check);
//     //누구나 상관없이 보여지는 거면 jwtMiddleware는 지움
//     //조건이 있으면 jwtMiddleware필요
// };