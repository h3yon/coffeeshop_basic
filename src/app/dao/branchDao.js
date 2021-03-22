const { pool } = require("../../../config/database");

// async function selectAllBranch() {
//   const connection = await pool.getConnection(async (conn) => conn);
//   const selectAllbranchQuery = `
//               select * from Branch
//                 `;
//   const [allBranchRows] = await connection.query(
//     selectAllbranchQuery
//   );
//   connection.release();
//   return allBranchRows; //결과값을 뱉어줌
// }

async function selectUserBranch(latitude, longtitude, latitude, uId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectUserBranchQuery = `
      select Branch.branchId, branchName, branchCall, branchAddr,branchImgLink,
      concat(round((select(6371*acos(cos(radians(?))*cos(radians(branchLatitude))* #uLatitude
                        cos(radians(branchLongitude)
                            -radians(?)) #uLongtitude
                            +sin(radians(?))*sin(radians(branchLatitude)))) #uLatitude
        ),1),'km')AS distance, #distance컬럼 추가
      isNoCash,  #현금 없는 매장 여부
      (select state from Bookmark where User.uId = Bookmark.uId
          and Branch.branchId = Bookmark.branchId) as bookmarked
      , #즐겨찾기 여부
      (case when
          (select openTime from OpeningTime where Branch.branchId = OpeningTime.branchId
              and OpeningTime.week = ( case when weekday(now()) between 5 and 6 then 'weekend'
                else 'weekday' end))
                    < time(now())
              < (select closeTime from OpeningTime where Branch.branchId = OpeningTime.branchId
              and OpeningTime.week = ( case when weekday(now()) between 5 and 6 then 'weekend'
                else 'weekday' end))
    then 'Y'
    else 'N' end)as state
        from Branch inner join User on uId = ?
            inner join OpeningTime#u_id가 1인 사람 입장에서
    group by branchId
    order by distance;
                `;
  let selectUserBranchParams = [latitude, longtitude, latitude, uId];
  const [userBranchRows] = await connection.query(
    selectUserBranchQuery, selectUserBranchParams
  );
  connection.release();
  return userBranchRows; //결과값을 뱉어줌
}

async function selectDetailBranch(branchId) {
  const connection = await pool.getConnection(async (conn) => conn);
  const selectDetailBranchQuery = `
      select Branch.branchId, branchName, branchAddr, branchCall, branchLatitude, branchLongitude,
      week, openTime, closeTime
      from Branch inner join OpeningTime on Branch.branchId = OpeningTime.branchId
      where Branch.branchId = ?;
                `;
  let selectDetailBranchParams = [branchId];
  const [detailBranchRows] = await connection.query(
    selectDetailBranchQuery, selectDetailBranchParams
  );
  connection.release();
  return detailBranchRows; //결과값을 뱉어줌
}

module.exports = {
  selectUserBranch,
  selectDetailBranch
};