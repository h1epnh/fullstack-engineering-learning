source .venv/bin/activate

/Applications/Postgres.app/Contents/Versions/16/bin/pg_dump -U postgres -h localhost -p 5432 -F p -b -v tthq | gzip > ttqh_20250216.sql.gz

760,Quận 1
769,Quận 2
770,Quận 3
773,Quận 4
774,Quận 5
775,Quận 6
778,Quận 7
776,Quận 8
763,Quận 9
771,Quận 10
772,Quận 11
761,Quận 12
777,Quận Bình Tân
765,Quận Bình Thạnh
764,Quận Gò Vấp
768,Quận Phú Nhuận
766,Quận Tân Bình
767,Quận Tân Phú
762,Quận Thủ Đức
785,Huyện Bình Chánh
787,Huyện Cần Giờ
783,Huyện Củ Chi
784,Huyện Hóc Môn
786,Huyện Nhà Bè
76905,Khu Đô Thị Mới Thủ Thiêm
78733,Khu Đô Thị Du Lịch Biển Cần Giờ 2870 ha
77801,Đồ án Khu dân cư phường Tân Hưng
762,Thành phố Thủ Đức







POST /computing/930/api/v3.1/a-z/all HTTP/1.1
Host: sqhkt-qlqh.tphcm.gov.vn
User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:137.0) Gecko/20100101 Firefox/137.0
Accept: application/json, text/plain, */*
Accept-Language: en-US,en;q=0.5
Accept-Encoding: gzip, deflate, br
Content-Type: application/x-www-form-urlencoded
Content-Length: 45
Origin: https://thongtinquyhoach.hochiminhcity.gov.vn
Referer: https://thongtinquyhoach.hochiminhcity.gov.vn/
Sec-Fetch-Dest: empty
Sec-Fetch-Mode: cors
Sec-Fetch-Site: cross-site
Priority: u=0
Te: trailers
Connection: keep-alive

Lat=10.811642470762976&Lon=106.69127807021141