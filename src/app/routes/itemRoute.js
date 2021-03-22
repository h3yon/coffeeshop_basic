module.exports = function(app){
    const item = require('../controllers/itemController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    //쿠폰 등록
    app.use('/coupon', jwtMiddleware);
    app.route('/coupon').post(item.addCoupon);
    // 쿠폰 보유내역
    app.get('/coupon', jwtMiddleware, item.getCoupon); 
    // 쿠폰 보유내역 상세정보
    app.get('/coupon/detail', jwtMiddleware, item.detailCoupon); 
    //쿠폰 사용내역 
    app.get('/coupon/history', jwtMiddleware, item.usedCoupon); 

    //선물하기
    app.use('/gift', jwtMiddleware); 
    app.route('/gift').post(item.givePresent);
    //선물조회
    app.get('/gift/history', jwtMiddleware, item.getPresent);
    app.get('/gift/:giftId', jwtMiddleware, item.getDetailPresent);

    //카드 등록 
    app.use('/arcard', jwtMiddleware); 
    app.route('/arcard').post(item.makeArcard);
    //내카드 조회
    app.get('/arcard', jwtMiddleware, item.getMyArcard);
    //카드 상세정보
    app.get('/arcard/:arcardId', jwtMiddleware, item.getDetailArcard);
    //카드 거래이력
    app.get('/arcard/:arcardId/history', jwtMiddleware, item.getArcardHistory);
    //카드 삭제 
    app.use('/arcard/:arcardId', jwtMiddleware);
    app.delete('/arcard/:arcardId', item.deleteArcard);

    // app.get('reservation',item.getReservation);


};