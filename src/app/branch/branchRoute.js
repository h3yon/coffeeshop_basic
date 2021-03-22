module.exports = function(app){
    const branch = require('../controllers/branchController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    // app.get('/app/branch', branch.allBranch);
    app.get('/branch',jwtMiddleware , branch.userBranch);
    app.get('/branch/:branchId',jwtMiddleware, branch.detailBranch);
};