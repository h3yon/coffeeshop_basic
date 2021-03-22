/*
  터미널에 
*/

const express = require('express'); //bodyparser, qs 등을 사용. 
const compression = require('compression');
const methodOverride = require('method-override');
var cors = require('cors');
module.exports = function () {
    const app = express();

    app.use(compression());

    app.use(express.json());

    app.use(express.urlencoded({extended: true}));

    app.use(methodOverride());

    app.use(cors());
    // app.use(express.static(process.cwd() + '/public'));

    /* App (Android, iOS) */
    require('../src/app/routes/indexRoute')(app);
    require('../src/app/routes/uRoute')(app);
    require('../src/app/routes/boardRoute')(app);
    require('../src/app/routes/productRoute')(app);
    // require('../src/app/routes/jwtCheckRoute')(app);
    require('../src/app/routes/orderRoute')(app);
    require('../src/app/routes/branchRoute')(app);
    require('../src/app/routes/itemRoute')(app);
    require('../src/app/routes/authRoute')(app);
    /////////-> 이렇게 라우팅할 파일을 추가해주어야 함. 

    /* Web */
    // require('../src/web/routes/indexRoute')(app);

    /* Web Admin*/
    // require('../src/web-admin/routes/indexRoute')(app);
    return app;
};