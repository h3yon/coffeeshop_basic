module.exports = function(app){
    const board = require('../controllers/boardController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/app/board', board.getBoard);
};