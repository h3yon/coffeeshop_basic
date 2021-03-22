
module.exports = function(app){
  const orders = require('../controllers/orderController');
  const jwtMiddleware = require('../../../config/jwtMiddleware');
  
//상세주문
  app.use('/orders/detail', jwtMiddleware);
  app.route('/orders/detail').post(orders.createOrderDetail);
//주문아이템 옵션
  app.use('/orders/option', jwtMiddleware);
  app.route('/orders/option').post(orders.orderOption);
//주문
  app.use('/orders', jwtMiddleware);
  app.route('/orders').post(orders.createOrder);
//예약 
  app.use('/orders/reservation', jwtMiddleware);
  app.route('/orders/reservation').post(orders.reserve);

  app.get('/orders',jwtMiddleware, orders.orderState);
  app.get('/orders/state',jwtMiddleware, orders.getOneOrderState);
  app.get('/orders/:ordersId',jwtMiddleware, orders.detailOrderState);

};

  // app.route('/app/order/create').post(ordersController.createOrder);
  // app.get('/app/order/:id', ordersController.fetchOrder);
  // app.route('/app/order/:id').put(ordersController.updateOrder);

// // shipments
// router.post('/ship', authenticator, async (req, res, next) => {
//   const response = await ordersController.createShipment(req.body)
//   return res.status(response.status).send(response)
// })

// router.get('/ship/:id', authenticator, async (req, res, next) => {
//   req.body.id = Number(req.params.id);
//   const response = await ordersController.fetchUserShipment(req.body)
//   return res.status(response.status).send(response)
// })

// router.put('/ship/:id', authenticator, async (req, res, next) => {
//   req.body.id = Number(req.params.id);
//   const response = await ordersController.updateUserShipment(req.body)
//   return res.status(response.status).send(response)
// });

// // warehouse
// router.post('/warehouse', authenticator, allowAdmin, async (req, res, next) => {
//   const response = await ordersController.createWarehouse(req.body)
//   return res.status(response.status).send(response)
// })

// module.exports = router;