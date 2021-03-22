# Artisee
Artisee Application Clone Coding

<h4>1. ERD Link </h4> 
https://aquerytool.com:443/aquerymain/index/?rurl=b8b4b7b1-b819-4c8f-bc31-c2da90d644aa

<h4>2. 명세서</h4> 
https://docs.google.com/spreadsheets/d/14VdZdc63ggYVlDzKennzdNXW8KiigHrSVm5xC9NFdYk/edit?usp=sharing

<h4>3. 기능</h4> 
```
1	POST	/user/signup	회원가입
2	POST 	/user/signin	로그인
3	GET	/user/:userIdx	유저상세정보
4	PATCH	/user/:userIdx	유저 정보 변경
5	PATCH	/user/:userIdx/delete	회원탈퇴
6	GET	/branch?latitude&longtitude	유저 주위 지점 조회
7	GET	/branch/:branchId	지점 상세조회
8	GET	/product	상품조회
9	GET	/category/product?categoryId	카테고리별 상품조회
10	POST	/orders/detail	상세주문에 상품 추가
11	POST	/orders/option	상세주문 옵션설정
12	POST	/orders/reservation	예약
13	POST	/orders	주문추가
14	GET	/orders	주문내역 조회
15	GET	/orders/state	상태별 주문내역 조회
16	GET	/orders/:ordersId	주문 상세내역 조회
17	POST	/coupon	쿠폰 추가
18	GET	/coupon	쿠폰 조회
19	GET	/coupon/detail?couponId	쿠폰 상세조회
20	GET	/coupon/history?state	상태별 쿠폰
21	POST	/gift	선물하기
22	GET	/gift/history	선물 내역
23	GET	/gift/:gifttId	선물 내역 상세조회
24	POST	/arcard	아티제 카드 추가
25	GET	/arcard	나의 아티제 카드 조회
26	GET	/arcard/:arcardId	아티제 카드 상세정보 조회
27	GET	/arcard/:arcardId/history	아티제 카드 거래이력 조회
28	DELETE	/arcard/:arcardId	아티제 카드 삭제
```
