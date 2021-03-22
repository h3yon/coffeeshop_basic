const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const productDao = require('../dao/productDao');

exports.getProduct = async function (req, res) {
      try {
            const productRows = await productDao.selectProduct(); 

            console.log(productRows);

            if (productRows.length > 0) {
                return res.json({ isSuccess: true, code: 200, message: "상품 조회 성공", result: productRows });
            }
            return res.json({
                isSuccess: false, code: 300, message: "상품이 존재하지 않습니다."
            });
        } catch (err) {
            logger.error(`selectProduct Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
};

exports.getCategory = async function(req,res){
    const categoryId = req.query.categoryId;
    try {
        const categoryRows = await productDao.selectCategory(categoryId);
        console.log(categoryId);
        if (categoryRows.length > 0) {
            return res.json({ isSuccess: true, code: 200, message: '카테고리별 상품 보기 성공', result: categoryRows 
            });
        }
        return res.json({
            isSuccess: false,
            code: 300,
            message: "상품이 존재하지 않습니다."
        });
    } catch (err) {
        logger.error(`selectCategory Query error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}
