module.exports = function(app){
    const product = require('../controllers/productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.get('/product', jwtMiddleware, product.getProduct);
    app.get('/category/product', jwtMiddleware, product.getCategory);
};