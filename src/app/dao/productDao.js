const { pool } = require("../../../config/database");

async function selectProduct() {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectProductQuery = `
              select pId, Product.categoryId, categoryName, pName, pPrice, pImgLink
              from Product
              left join Category on Product.categoryId = Category.categoryId
                `;
  const [productRows] = await connection.query(
    selectProductQuery
  );
  connection.release();
  return productRows; //결과값을 뱉어줌
}

async function selectCategory(categoryId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectCategoryQuery = `
              select pId, Product.categoryId, categoryName, pName, pPrice, pImgLink
              from Product
              left join Category on Product.categoryId = Category.categoryId
              where Product.categoryId = ?
                `;
  let selectCategoryParams = [categoryId];
  const [categoryRows] = await connection.query(
    selectCategoryQuery, selectCategoryParams
  );
  connection.release();
  return categoryRows; //결과값을 뱉어줌
}

module.exports = {
  selectProduct,
  selectCategory
};