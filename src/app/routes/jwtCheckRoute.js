// module.exports = function(app){
//     const jwtCheck = require('../controllers/jwtCheckController');
//     const jwtMiddleware = require('../../../config/jwtMiddleware');

//     // app.use('/user/auto', jwtMiddleware);
//     app.get('/user/auto', jwtMiddleware, jwtCheck.check);
// };