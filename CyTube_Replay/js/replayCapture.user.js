// ==UserScript==
// @name         CyTube Replay Capture
// @namespace    http://tampermonkey.net/
// @version      1.1.0
// @description  CyTube Replay Capture
// @author       firlin123
// @match        https://cytu.be/r/*
// @match        https://cytube.xyz/r/*
// @icon         data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' xmlns:xlink='http://www.w3.org/1999/xlink' width='333' height='416' viewBox='0 0 33253 41593' shape-rendering='geometricPrecision' image-rendering='optimizeQuality' fill-rule='evenodd' xmlns:v='https://vecta.io/nano'%3E%3Cdefs%3E%3Cmask id='A'%3E%3ClinearGradient id='B' gradientUnits='userSpaceOnUse' x1='9355.85' y1='19888.3' x2='11105.4' y2='30919.8'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-opacity='0' stop-color='%23fff'/%3E%3C/linearGradient%3E%3Cpath d='M6534 19415h7393v11978H6534z' fill='url(%23B)'/%3E%3C/mask%3E%3Cmask id='C'%3E%3ClinearGradient id='D' gradientUnits='userSpaceOnUse' x1='25152.8' y1='19391.4' x2='24472.8' y2='29982.8'%3E%3Cstop offset='0' stop-color='%23fff'/%3E%3Cstop offset='1' stop-opacity='0' stop-color='%23fff'/%3E%3C/linearGradient%3E%3Cpath d='M21261 18872h7104v11629h-7104z' fill='url(%23D)'/%3E%3C/mask%3E%3Cpath id='E' d='M25118 11947c24-1891 118-7165 2729-7401 2613-236 4413 4530 4862 6671 785 3739 243 7320-2011 10451-139 184-402 220-586 80-185-140-220-403-80-587 1249-1735 1893-3406 2104-5538 295-2977-636-7813-3032-9759-2975-2416-3131 4720-3148 6084 0 231-188 419-419 418-231 0-419-187-419-419z'/%3E%3Cpath id='F' d='M25948 11868c40 754 105 1091-134 1817-435-616-464-948-688-1657-44-227 104-447 331-491 227-45 447 104 491 331z'/%3E%3C/defs%3E%3Cpath d='M31689 24597c596-1665 887-3166 499-4742-142 99-328 192-539 279-251 479-539 949-862 1410 41 2117-100 4168-552 6186 572-1021 1073-2070 1454-3133zm166-4873c113 4 217 11 306 25-37-138-79-278-127-418-57 132-117 263-179 393z' fill='%233932ab'/%3E%3Cpath d='M32388 18026c1142 2386 889 4424 23 6831-1050 2923-2938 5743-4761 8235-138 186-400 225-586 87s-225-400-87-586c1695-2316 3418-4877 4473-7560 884-2248 1295-4324 207-6598-113-202-41-457 161-570s457-41 570 161z' fill='%23322a91'/%3E%3Cg fill='%238ac8ea'%3E%3Cpath d='M25901 11741c22 38 38 81 47 127l7 114c39 676 85 1015-141 1703-416-590-461-920-660-1569-13-28-22-58-28-88l-6-40v-1c-1-14-2-27-2-40 0-5 0-10 1-15 2-62 18-122 46-176l92 81c79 73 180 110 280 111 114 0 228-45 311-136 21-22 39-46 53-71zM3822 23430c41 41 91 74 145 95-1 0-2-1-3-1-52-21-100-52-142-94zm347 121c-8 1-17 2-25 2 8 0 17-1 25-2zm7921 13800a394.3 394.3 0 0 0-36-45 394.3 394.3 0 0 1 36 45zm61 138c-12-49-33-95-61-138 1 2 2 3 2 4 27 40 47 85 59 134zm11 85c-2-22-5-44-7-66 4 22 6 44 7 66zm11585-411c-88-214 15-459 229-546 179-73 380-13 492 134 3522-2783 6034-7841 5908-14918 122-3 242-60 322-165l89-124c2179-3101 2697-6638 1922-10327-449-2141-2249-6907-4862-6671-2144 193-2591 3782-2695 6108-4062-3255-9010-4178-13824-1680-401 208-785 431-1154 669l-22-48c-2518-5262-6265-4062-8151 770-1653 4236-1322 9415 1723 12953 682 5442 2780 11393 7456 14432l192-355c-42 81-58 175-40 271l59 218 62 232 170 628c154 545 321 1027 652 1691 87-860 54-1394-20-2063l-61-521c3734 2076 8081 1802 11588-596-12-30-24-61-35-92zm-12356 198c31-47 69-87 113-117 1-1 2-2 4-3-47 32-87 73-117 120zM4228 23540c-3 0-6 1-9 2-14 3-28 6-42 8-2 0-5 1-8 1 20-2 40-6 59-11zm111-48c-17 11-35 20-53 27 3-1 5-2 7-3 16-7 31-15 46-24zm66-51c-17 17-36 32-56 45-4 2-7 4-10 6 23-14 45-31 66-51zm7103 13800c40-28 87-49 137-61-2 1-4 1-6 2-47 12-91 32-131 59zm218-72c22-1 45 0 68 2h-8c-20-3-40-3-60-2zm-62 7c21-4 41-6 62-7h-2c-20 1-40 3-60 7z'/%3E%3Cpath d='M25814 13685l-203-1325-74-412c-76-1-134-18-185-45-34-17-66-39-95-66-4-3-7-6-10-9-27-22-53-47-82-72-28 54-44 114-46 176 0 5-1 10-1 15 0 7 1 14 1 21a487.6 487.6 0 0 0 12 75l23 73c199 649 244 979 660 1569z'/%3E%3Cpath d='M25901 11741c-3 5-6 11-10 16 4-5 7-11 10-16zM10701 41477h-863c335-1378 675-2453 1342-3727-4676-3039-6774-8990-7456-14432-3045-3538-3376-8717-1723-12953 1886-4832 5633-6032 8151-770l22 48c369-238 753-461 1154-669 4814-2498 9762-1575 13824 1680 104-2326 551-5915 2695-6108 2613-236 4413 4530 4862 6671 775 3689 257 7226-1922 10327l-89 124c-80 105-200 162-322 165 126 7077-2386 12135-5908 14918-112-147-313-207-492-134-214 87-317 332-229 546l35 92 142 396c437 1247 758 2540 1064 3826H10701zm15241-29636c-9-34-22-67-39-97 21 37 33 68 39 97zm7 47c-1-16-3-31-7-47 3 9 5 18 6 27 1 6 1 13 1 20zm5 90c-1-29-3-59-5-90 3 27 3 55 5 90zm-789-222c29 25 55 50 82 72l-82-72zm82 72c34 29 67 55 105 75-34-17-66-39-95-66l-10-9zm290 120l74 412 203 1325c-416-590-461-920-660-1569-13-28-22-58-28-88l-6-40c0-7-1-14-1-20v-2c-1-18-1-36 0-53 4-52 18-103 46-157 29 25 55 50 82 72 3 3 6 6 10 9 29 27 61 49 95 66 51 27 109 44 185 45zM3822 23430l145 95c-1 0-2-1-3-1-1-1-2-1-4-2-52-21-99-53-138-92zm347 121l59-11c-19 5-39 9-59 11zm7923 13804c27 40 47 85 59 134-1-2-2-5-2-7-12-45-31-88-57-127zm63 153c4 22 6 44 7 66-2-22-5-44-7-66zm-818-21c-8 33-13 67-12 102 0-34 4-69 12-102zm28-80c2-4 4-8 7-12-16 29-27 60-35 92 7-30 16-58 28-80zm-33 259c-5-23-8-50-7-77 0 26 2 51 7 77zm291 1078c28 99 56 195 86 292 1 4 2 8 4 12-32-101-61-201-90-304zm632-372l-25-222-22-185c-5-37-9-75-14-114l61 521zm-864-1011c30-47 70-88 117-120l-117 120h0zm335-192c20-1 40-1 60 2h8l-66-2h-2zM4339 23492c-15 9-30 17-46 24-2 1-4 2-7 3l53-27zm66-51c-17 17-36 32-56 45-4 2-7 4-10 6l66-51zm7259 13735c20-4 40-6 60-7l-60 7zm-273 185c31-47 69-87 113-117l2-2c1 0 1-1 2-1-47 32-87 73-117 120z'/%3E%3Cpath d='M25849 41477c-347-1463-708-2930-1221-4345-34-95-70-190-106-285-14-35-32-68-54-96-112-147-313-207-492-134-214 87-317 332-229 546 11 31 23 62 35 92l143 396c222 636 417 1291 594 1950l12 46c163 608 312 1220 457 1830h861z'/%3E%3C/g%3E%3Cg fill='%234a7cb6'%3E%3Cpath d='M4490 22653c673 6250 3245 13542 9837 15673 6399 2069 12064-2271 14304-8153 1082-2841 1386-5726 1315-8745-7-231 174-425 406-432 231-7 424 174 432 405 73 3134-247 6121-1370 9070-2402 6307-8514 10861-15344 8652-6939-2243-9703-9787-10414-16387-22-230 146-436 376-458 230-23 435 145 458 375z'/%3E%3Cuse xlink:href='%23E'/%3E%3Cuse xlink:href='%23F'/%3E%3Cpath d='M3702 23159c-237-5851 2300-11422 7626-14185 5083-2638 10315-1461 14496 2246 170 157 181 422 24 592-156 170-421 182-591 25-3783-3355-8453-4537-13145-2317-5268 2492-7803 7923-7574 13591 13 231-163 429-394 442s-429-163-442-394z'/%3E%3Cpath d='M3813 23420C685 19880 331 14642 2001 10365c1886-4832 5633-6032 8151-770l233 513c92 212-6 459-218 550-212 92-459-5-551-218l-219-483c-1888-3944-4460-3925-6320 23-1913 4060-1692 9428 1349 12869 158 170 149 435-21 592-169 158-434 149-592-21zm6025 18057c368-1511 741-2659 1545-4104 119-199 376-264 574-146 199 118 265 375 147 574-720 1292-1073 2350-1403 3676h-863z'/%3E%3Cpath d='M12155 37508c131 1170 241 1734 120 2927-526-1056-638-1652-943-2769-43-227 105-446 332-490 228-44 447 105 491 332zm12367-661c570 1502 956 3068 1327 4630h-861c-346-1454-712-2918-1241-4314-88-214 15-459 229-546 215-87 459 15 546 230z'/%3E%3C/g%3E%3Cpath d='M26875 34942c-1107 2213-714 4309 65 6535h-887c-240-708-428-1374-556-2158-303-1842-180-3129 663-4813 121-198 378-260 576-140 197 121 260 378 139 576z' fill='%23322a91'/%3E%3Cpath d='M23028 38211c161 1168 347 2144 721 3266h1239 861c-347-1463-708-2930-1221-4345-34-95-70-190-106-285-14-35-32-68-54-96-112-147-313-207-492-134-214 87-317 332-229 546 11 31 23 62 35 92l142 396c437 1247 758 2540 1064 3826-306-1286-627-2579-1064-3826-291 200-590 387-896 560zm1600-1079c513 1415 874 2882 1221 4345h225c-50-160-96-321-161-567-447-1679-635-3098-336-4600-305 290-622 564-949 822z' fill='%233932ab'/%3E%3Cpath d='M22987 37918c203 1294 371 2358 764 3559h-878c-351-1144-517-2174-714-3433-35-229 122-442 351-477s442 122 477 351z' fill='%23322a91'/%3E%3Cpath d='M4490 22653c673 6250 3245 13542 9837 15673 6399 2069 12064-2271 14304-8153 1082-2841 1386-5726 1315-8745-7-231 174-425 406-432 231-7 424 174 432 405 73 3134-247 6121-1370 9070-2402 6307-8514 10861-15345 8652-6938-2243-9702-9787-10413-16387-22-230 146-436 376-458 230-23 435 145 458 375z' fill='%234a7cb6'/%3E%3Cpath d='M5365 24746c-620-4480 777-8354 3118-8653 2342-300 4742 3089 5361 7568 620 4480-776 8354-3118 8653-2341 300-4742-3089-5361-7568z' fill='%23fff'/%3E%3Cpath d='M7558 25776c-273-2642 957-4934 2747-5119 1128-117 2209 631 2923 1861 151 261 285 542 400 842 123 321 224 662 299 1019-22-237-49-477-83-718-64-461-146-912-246-1347-85-184-177-362-273-532-146-257-303-497-471-719-855-1128-1973-1768-3114-1629-11 1-23 3-35 5-1006 136-1848 858-2410 1930-620 1181-901 2787-692 4505 400 3297 2455 5759 4589 5500 740-90 1393-496 1913-1126 228-469 416-1004 559-1591 98-400 175-824 230-1267l-25 96c-39 146-83 288-131 425-25 70-51 139-78 206-477 1184-1328 2001-2366 2108-1790 185-3463-1807-3736-4449z' fill='%235165c7'/%3E%3Cpath d='M7558 25776c-273-2642 957-4934 2747-5119 1128-117 2209 631 2923 1861 151 261 285 542 400 842 123 321 224 662 299 1019-22-237-49-477-83-718-64-461-146-912-246-1347-85-184-177-362-273-532-146-257-303-497-471-719-855-1128-1973-1768-3114-1629-11 1-23 3-35 5-1006 136-1848 858-2410 1930-620 1181-901 2787-692 4505 400 3297 2455 5759 4589 5500 740-90 1393-496 1913-1126 228-469 416-1004 559-1591 98-400 175-824 230-1267l-25 96c-39 146-83 288-131 425-25 70-51 139-78 206-477 1184-1328 2001-2366 2108-1790 185-3463-1807-3736-4449z' fill='%23201c5b' mask='url(%23A)'/%3E%3Cpath d='M8721 30455l605-919c-215-183-417-399-603-643l-772 677c236 336 495 633 770 885z' fill='%23dad9fc'/%3E%3Cpath d='M8723 28893c-465-610-828-1394-1029-2284l-909 287c244 1029 652 1943 1166 2674l772-677z' fill='%23a7a3f4'/%3E%3Cpath d='M5537 21283c336-1926 1529-6142 4413-4498 3013 1719 3742 7126 3723 10238l-9 1634c278-1200 337-2440 303-3668-83-2920-1233-8285-4558-9154-3060-799-4311 3167-4731 5313-39 228 121 443 359 481 237 37 461-117 500-346z'/%3E%3Cpath d='M5138 20798c-714-1-2576-93-3195 146 627 418 2362 579 3133 689 240 17 448-157 466-388 17-230-164-431-404-447zm775-2684c-836-217-2899-846-3717-761 598 544 2637 1241 3439 1555 228 73 475-45 552-264 76-219-46-457-274-530zm1138-1397c-564-499-1898-1802-2593-2031 198 681 1474 2036 1960 2606 165 168 441 176 616 17s183-424 17-592zm6177 5801c-714-1230-1795-1978-2923-1861-1790 185-3020 2477-2747 5119s1946 4634 3736 4449c1038-107 1889-924 2366-2108 27-67 53-136 78-206 48-137 92-279 131-425 9-32 17-64 25-96 99-807 125-1678 66-2587-9-140-20-282-33-424-75-357-176-698-299-1019-115-300-249-581-400-842z'/%3E%3Cg fill='%233932ab'%3E%3Cpath d='M3724 23318c-655-761-1184-1597-1595-2484-437 1321-810 2647-1100 4010 943-471 1752-928 2696-1521 0-2-1-3-1-5z'/%3E%3Cpath d='M19424 13714c60 19 114 51 158 91 0 1 1 1 2 2-46-42-100-74-160-93zm286 480c6-32 9-65 7-96 1 1 1 2 1 3 1 31-2 63-8 93zm935-4106c-7765 1427-12809 3695-18159 9708-593 1667-1092 3327-1457 5048 998-498 1846-981 2862-1627 9-5 17-10 26-16 159-103 362-84 499 33 294-215 563-427 809-635 1371-1463 3068-2838 5091-4125 2387-1680 5105-3164 8529-4223l454-137-92 466h1l-492 2481-166 835-182 901 551-618 26-129 159-795c1773-1973 4078-3892 6017-5506 9-596 29-1440 118-2342-1542 185-3062 399-4594 681z'/%3E%3C/g%3E%3Cpath d='M25790 6636c-2545-2177-5104-2661-8444-2473-9 1-19 2-28 2l-693 59c-1552 19-3013-629-4327-1467 309 436 650 853 1059 1351 1 1 3 3 4 5 18 21 33 43 47 68 12 23 23 47 31 72 6 21 11 41 15 62 10 63 5 126-12 185-16 56-45 109-84 155-15 17-31 33-49 48-20 17-43 33-68 46-23 13-47 24-72 31-2 1-4 2-5 2-7849 2638-9732 6104-10540 13621 5206-5537 10287-7745 17869-9139 1618-297 3221-520 4850-713 98-663 240-1325 447-1915z' fill='%23cdcfea'/%3E%3Cg fill='%239e9ad9'%3E%3Cpath d='M1664 19626c773-8764 2613-12742 11247-15642 220-72 457 49 528 269s-50 456-270 527C4880 7565 3241 11271 2499 19694c-19 231-221 402-452 384-230-19-402-221-383-452z'/%3E%3Cpath d='M12719 4651c-940-1144-1494-1837-2150-3210-84-216 23-459 238-543s458 22 542 238c597 1246 1154 1934 2012 2977 149 177 126 441-52 590-177 148-441 125-590-52z'/%3E%3Cpath d='M11221 961c1834 1424 3599 2580 6025 2372 228-38 444 116 482 345 37 228-117 443-345 481l-758 65c-2215 26-4245-1303-5927-2609-181-144-210-407-66-588 145-181 408-210 589-66z'/%3E%3Cpath d='M17283 3328c3687-208 6484 377 9291 2882 168 159 176 424 17 592s-424 176-592 17c-2614-2333-5222-2849-8653-2656-231 18-432-155-449-385-18-231 155-432 386-450z'/%3E%3C/g%3E%3Cg fill='%234a7cb6'%3E%3Cpath d='M15413 10472c1508-441 2914-783 4464-1090-440-2050-1809-8033-3012-8495-672-259-1180 3995-1211 4309-171 1753-223 3515-241 5276zm-294 961c-21 7-42 12-64 16h-4 0c-46 7-92 6-137-2h-2l-7-1-5-2h-3c-56-13-108-37-153-69l-4-3-4-3-6-5h-1c-41-33-77-74-103-121l-2-2-3-5-3-6-1-2-4-8-1-1c-17-37-30-76-37-117v-5h0c-4-24-6-49-5-74 15-2172 52-9387 1600-10725 2260-1954 4093 6914 4369 8170 345 1571 556 1523-772 1786-1601 318-3088 706-4648 1179z'/%3E%3Cpath d='M15278 6778c1416 832 2273 666 3381-689l482-671c94-146 288-189 434-95s188 288 94 434c-497 693-882 1288-1635 1750-1167 717-2016 430-3119-217-141-100-175-296-74-438 100-141 296-174 437-74zm281-2923c1209 817 1930-21 2797-1010 108-135 306-157 441-48 135 108 157 306 49 441l-466 531c-1066 1094-1957 1421-3223 569-133-112-151-310-40-443s309-151 442-40z'/%3E%3C/g%3E%3Cpath d='M18034 7507c-958 589-1702 501-2548 92-43 957-64 1915-73 2873 1508-441 2914-783 4464-1090-144-673-389-1769-694-2954-315 411-652 774-1149 1079zm-2512-593c1273 672 2094 450 3137-825l317-441c-177-648-370-1301-571-1907l-25 28c-900 924-1676 1301-2659 881l-67 546c-55 572-99 1145-132 1718zm291-2907c975 500 1628-128 2353-947-421-1141-872-2008-1301-2173-462-178-847 1778-1052 3120z' fill='%238ac8ea'/%3E%3Cg fill='%23322a91'%3E%3Cpath d='M18023 18560c1861-2470 4856-4945 7247-6935 178-147 442-123 589 55 148 178 124 442-54 590-2293 1908-5310 4402-7091 6763-131 191-392 240-583 109-190-131-239-391-108-582z'/%3E%3Cpath d='M17958 18714l930-4680c44-227 264-375 491-331s375 264 331 491l-931 4685c-46 227-267 374-493 328-227-46-374-266-328-493z'/%3E%3Cpath d='M3867 23239c5101-4507 8603-7482 15314-9527 222-65 455 62 520 284s-62 455-284 520c-6572 2002-9999 4936-14996 9351-173 153-438 137-591-37-153-173-137-438 37-591z'/%3E%3Cpath d='M277 25210c1360-645 2366-1199 3640-2009 194-125 453-69 579 125 125 194 69 453-125 579-1307 830-2343 1402-3739 2064-209 98-458 8-557-202-98-209-7-459 202-557z'/%3E%3Cpath d='M42 25517c395-2136 991-4157 1726-6202 81-217 322-328 538-247 217 80 328 321 247 538-716 1993-1301 3973-1686 6055-40 228-257 381-484 341-228-40-381-257-341-485z'/%3E%3Cpath d='M1801 19305c5501-6204 10710-8574 18692-10041 1723-316 3429-549 5168-750 230-25 437 140 463 370 25 230-140 437-370 463-1719 198-3406 428-5109 741-7791 1432-12843 3711-18213 9768-152 174-417 192-591 40s-192-417-40-591z'/%3E%3C/g%3E%3Cg fill='%234a7cb6'%3E%3Cuse xlink:href='%23E'/%3E%3Cuse xlink:href='%23F'/%3E%3Cpath d='M15274 34001c607 1849 1931 5123 3461 3929 983-767 1426-2775 1642-4276-1261 1340-2856 1803-4672 651-165-104-305-204-431-304zm-844-848c-3-13-6-25-8-38h0l-1-7h0l-1-7c-5-38-1-76 10-111v-2l2-5v-2l1-3 2-5h0c10-27 24-52 43-76l3-4c22-27 50-50 81-67l1-1 4-2 4-2 1-1c26-13 53-21 80-26h0l7-1h0 7c38-5 76-1 112 10h1l5 2h2l3 1 5 2h0c27 10 53 24 76 42l4 4c12 9 22 20 32 31 300 308 391 423 726 685 3021 2366 4791-1022 5052-1113 560-196 311 843 299 941-187 1495-722 4339-2146 5134-2413 1348-3984-3894-4407-5379z'/%3E%3Cpath d='M14459 33255c-234-1009-182-524-191-1450 504 759 260 344 714 1253a279.7 279.7 0 0 1-163 360c-144 54-305-19-360-163zm6043-591c315-902 123-497 550-1230 83 843 74 395-3 1344-32 151-180 248-331 216-150-31-247-179-216-330z'/%3E%3C/g%3E%3Cpath d='M20377 33654c-1261 1340-2856 1803-4672 651-165-104-305-204-431-304 607 1849 1931 5123 3461 3929 983-767 1426-2775 1642-4276z' fill='%23ad0273'/%3E%3Cpath d='M19060 37611c-688-827-1425-905-2210-236 556 728 1200 1090 1885 555 116-90 224-198 325-319z' fill='%23e56734'/%3E%3Cpath d='M29428 8043c1599 2438 1985 6518 378 9045 45-845-4-286 114-1105 213-1479 161-2314 83-3780-86-1587-421-2685-575-4160zM15817 29754c527-469 651-564 1369-734 566-134 1364-50 1874 253l378 321c-855 140-2773 236-3621 160zm-160 1542c73 88 326 498 434 487-42 114 358 339 453 414l-234 262c-247 150-744 72-896-219-218-417-37-672 243-944zm3330 727c72-119 377-519 377-649 184-158 125-290 197-638l328 108c288 204 389 796 68 1073-389 335-576 236-970 106z' fill='%234a7cb6'/%3E%3Cpath d='M29438 23919c98-4518-1665-8220-3936-8269-2272-49-4192 3573-4289 8091-98 4518 1665 8220 3936 8269 2272 49 4192-3573 4289-8091z' fill='%23fff'/%3E%3Cpath d='M24489 18873c-909 0-1748 465-2413 1245-133 156-260 324-378 504-57 87-113 176-166 268-126 600-218 1235-271 1895 58-211 125-414 201-608 99-252 213-489 341-706 531-905 1293-1481 2157-1512 1715-62 3184 2049 3281 4715 96 2667-1217 4879-2932 4941-960 34-1842-611-2450-1652-38-65-75-132-111-200-58-111-113-225-165-343-10-21-19-43-28-64 179 798 423 1526 719 2156 619 625 1367 990 2173 990 2152-2 3906-2606 3918-5817 11-3212-1724-5814-3876-5812z' fill='%235165c7'/%3E%3Cpath d='M22076 20118c-133 156-260 324-378 504-57 87-113 176-166 268-126 600-218 1235-271 1895 58-211 125-414 201-608 99-252 213-489 341-706 531-905 1293-1481 2157-1512 1715-62 3184 2049 3281 4715 96 2667-1217 4879-2932 4941-960 34-1842-611-2450-1652-38-65-75-132-111-200-58-111-113-225-165-343-10-21-19-43-28-64 179 798 423 1526 719 2156 619 625 1367 990 2173 990 2152-2 3906-2606 3918-5817 11-3212-1724-5814-3876-5812-909 0-1748 465-2413 1245z' fill='%23201c5b' mask='url(%23C)'/%3E%3Cpath d='M26198 28504l701 706c218-261 416-556 591-879l-846-563c-131 270-280 516-446 736z' fill='%23dad9fc'/%3E%3Cpath d='M27227 25475c-60 856-267 1641-583 2293l846 563c411-755 698-1665 815-2662l-1078-194z' fill='%23a7a3f4'/%3E%3Cpath d='M28892 20496c-535-1879-2141-5943-4716-4002-2691 2029-2790 7479-2428 10570 65 562 138 1054 188 1623-398-1163-592-2389-694-3613-243-2910 263-8365 3346-9582 2837-1120 4471 2690 5110 4777 62 223-67 454-290 517-223 62-454-68-516-290z'/%3E%3Cpath d='M29219 19971c683-77 2453-366 3071-195-554 482-2194 827-2919 1018-228 42-446-108-488-336-42-227 108-445 336-487zm-1037-2586c775-304 2678-1148 3470-1150-512 603-2385 1513-3117 1910-210 97-459 6-556-204-98-209-7-458 203-556zm-1243-1267c485-556 1616-1992 2255-2294-114 698-1184 2180-1586 2799-139 184-402 221-586 82-185-140-222-402-83-587zm-5678 6667c-25 313-42 633-48 956-9 390-3 773 15 1148 43 872 155 1702 327 2467l28 64c52 118 107 232 165 343 36 68 73 135 111 200 608 1041 1490 1686 2450 1652 1715-62 3028-2274 2932-4941-97-2666-1566-4777-3281-4715-864 31-1626 607-2157 1512-128 217-242 454-341 706-76 194-143 397-201 608z'/%3E%3Cpath d='M12523 24798c735-427 756-1766 45-2991-711-1224-1884-1871-2619-1444-736 427-756 1766-46 2991 711 1224 1884 1871 2620 1444zm-2169-113c-321-352-799-438-1067-192-268 245-225 729 96 1080s799 437 1067 192c269-245 226-729-96-1080zm12595-1268c-245 264-132 766 251 1121s892 428 1137 164c245-265 133-767-251-1122-383-355-892-428-1137-163zm967-753c907 1169 2161 1714 2800 1218 638-496 420-1846-487-3014-908-1169-2161-1714-2800-1218s-421 1846 487 3014z' fill='%23fff'/%3E%3C/svg%3E
// @grant        none
// @homepage     https://firlin123.github.io/
// @updateURL    https://firlin123.github.io/cytube-replay/assets/replay-capture.user.js
// @downloadURL  https://firlin123.github.io/cytube-replay/assets/replay-capture.user.js
// @run-at       document-start
// ==/UserScript==

(function () {
    let scriptName = 'cytubeReplayCapture';
    let scriptVersion = { major: 1, minor: 1, patch: 0 };
    let scriptUpdateUrl = 'https://firlin123.github.io/cytube-replay/assets/replay-capture.user.js';

    function main(name, fromLocalStorage, updateUrl) {
        'use strict';
        let versionStr = versionToString(window[name + 'Version']);
        let replayCapture = {
            eventsLog: [],
            channelPath: '',
            channelName: '',
            replayFileType: 'data',
            replayFileVersion: '1.0.0'
        }
        let capName = 'replayCapturing';
        let capRex = location.pathname.match(/^\/r\/(.*)$/);
        if (capRex != null) {
            if (typeof capRex[1] === 'string') capName = capRex[1] + 'ReplayCapturing';
        }
        let replayCapturing = localStorage[capName] === 'true';
        let styleMinCss =
            "@keyframes pulse{0%{opacity:.25}50%{opacity:1}100%{opacity:.25}}.capture-window.op" +
            "en{width:50rem;height:50rem}.capture-window:not(.open){background-color:transparen" +
            "t;box-shadow:0 0 0 #000;border-color:transparent}.capture-window{position:fixed;bo" +
            "ttom:.5rem;left:.5rem;width:4rem;height:4rem;z-index:999;display:flex;flex-directi" +
            "on:column;overflow:hidden;transition:all .35s ease}.capture-window>:not(:first-chi" +
            "ld){padding:.5rem}.open .capture-btn-collapse{border-bottom:1rem solid #AAA;border" +
            "-left:1rem solid #AAA;border-top:0 solid #AAA;border-right:0 solid #AAA;padding-to" +
            "p:1rem;padding-right:1rem}.capture-btn-collapse{width:3rem;height:3rem;position:ab" +
            "solute;right:.5rem;top:.5rem;background:transparent;border-top:1rem solid #AAA;bor" +
            "der-right:1rem solid #AAA;border-bottom:0 solid #AAA;border-left:0 solid #AAA;padd" +
            "ing-bottom:1rem;padding-left:1rem;transition:all .35s ease}.capturing .capture-btn" +
            "-collapse::before{content:'';animation:pulse 1.5s ease-in-out infinite}.open .capt" +
            "ure-btn-collapse::before{content:'';border-radius:1rem;left:.5rem;top:0;right:0;bo" +
            "ttom:.5rem;position:absolute}.capture-btn-collapse::before{opacity:.5;content:'';b" +
            "ackground:red;border-radius:1rem;right:.5rem;bottom:0;left:0;top:.5rem;position:ab" +
            "solute;transition:all .35s ease}.capture-header{padding-right:0!important;min-heig" +
            "ht:4rem;display:flex;align-items:center;overflow:hidden;white-space:nowrap;margin-" +
            "right:4rem}.w-100{width:100%}.capture-file-list{border-top:.125rem solid rgba(0,0," +
            "0,.35);overflow-x:hidden;overflow-y:auto;flex:1}.capture-file:not(:last-child){bor" +
            "der-bottom:.125rem solid rgba(0,0,0,.35)}.capture-file{padding:.5rem;display:flex;" +
            "align-items:center;justify-content:space-between}.capture-file-list .btn-group{dis" +
            "play:flex;margin-left:.5rem}.capture-filename{display:flex;min-width:0}.capture-fi" +
            "lename>div:first-child{min-width:0;overflow:hidden;text-overflow:ellipsis}.capture" +
            "-footer{border-top:.125rem solid rgba(0,0,0,.35);max-height:22rem;overflow:auto;pa" +
            "dding:0!important}.capture-footer-div{position:sticky;top:0;width:100%;padding:.5r" +
            "em;border:0;border-radius:0;}.capture-changelog{padding:.5rem}.capture-changelog i" +
            "mg{max-width:8rem;max-height:8rem}";
        // https://github.com/felixge/node-dateformat
        let dateformatMinJs =
            "var token=/d{1,4}|D{3,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\\1?|W{1,2}|[LlopSZN]|\"[^\"]*" +
            "\"|'[^']*'/g;var timezone=/\\b(?:[A-Z]{1,3}[A-Z][TC])(?:[-+]\\d{4})?|((?:Australia" +
            "n )?(?:Pacific|Mountain|Central|Eastern|Atlantic) (?:Standard|Daylight|Prevailing)" +
            " Time)\\b/g;var timezoneClip=/[^-+\\dA-Z]/g;function dateFormat(date,mask,utc,gmt)" +
            "{if(arguments.length===1&&typeof date===\"string\"&&!/\\d/.test(date)){mask=date;d" +
            "ate=undefined}date=date||date===0?date:new Date;if(!(date instanceof Date)){date=n" +
            "ew Date(date)}if(isNaN(date)){throw TypeError(\"Invalid date\")}mask=String(masks[" +
            "mask]||mask||masks[\"default\"]);var maskSlice=mask.slice(0,4);if(maskSlice===\"UT" +
            "C:\"||maskSlice===\"GMT:\"){mask=mask.slice(4);utc=true;if(maskSlice===\"GMT:\"){g" +
            "mt=true}}var _=function _(){return utc?\"getUTC\":\"get\"};var _d=function d(){ret" +
            "urn date[_()+\"Date\"]()};var D=function D(){return date[_()+\"Day\"]()};var _m=fu" +
            "nction m(){return date[_()+\"Month\"]()};var y=function y(){return date[_()+\"Full" +
            "Year\"]()};var _H=function H(){return date[_()+\"Hours\"]()};var _M=function M(){r" +
            "eturn date[_()+\"Minutes\"]()};var _s=function s(){return date[_()+\"Seconds\"]()}" +
            ";var _L=function L(){return date[_()+\"Milliseconds\"]()};var _o=function o(){retu" +
            "rn utc?0:date.getTimezoneOffset()};var _W=function W(){return getWeek(date)};var _" +
            "N=function N(){return getDayOfWeek(date)};var flags={d:function d(){return _d()},d" +
            "d:function dd(){return pad(_d())},ddd:function ddd(){return i18n.dayNames[D()]},DD" +
            "D:function DDD(){return getDayName({y:y(),m:_m(),d:_d(),_:_(),dayName:i18n.dayName" +
            "s[D()],short:true})},dddd:function dddd(){return i18n.dayNames[D()+7]},DDDD:functi" +
            "on DDDD(){return getDayName({y:y(),m:_m(),d:_d(),_:_(),dayName:i18n.dayNames[D()+7" +
            "]})},m:function m(){return _m()+1},mm:function mm(){return pad(_m()+1)},mmm:functi" +
            "on mmm(){return i18n.monthNames[_m()]},mmmm:function mmmm(){return i18n.monthNames" +
            "[_m()+12]},yy:function yy(){return String(y()).slice(2)},yyyy:function yyyy(){retu" +
            "rn pad(y(),4)},h:function h(){return _H()%12||12},hh:function hh(){return pad(_H()" +
            "%12||12)},H:function H(){return _H()},HH:function HH(){return pad(_H())},M:functio" +
            "n M(){return _M()},MM:function MM(){return pad(_M())},s:function s(){return _s()}," +
            "ss:function ss(){return pad(_s())},l:function l(){return pad(_L(),3)},L:function L" +
            "(){return pad(Math.floor(_L()/10))},t:function t(){return _H()<12?i18n.timeNames[0" +
            "]:i18n.timeNames[1]},tt:function tt(){return _H()<12?i18n.timeNames[2]:i18n.timeNa" +
            "mes[3]},T:function T(){return _H()<12?i18n.timeNames[4]:i18n.timeNames[5]},TT:func" +
            "tion TT(){return _H()<12?i18n.timeNames[6]:i18n.timeNames[7]},Z:function Z(){retur" +
            "n gmt?\"GMT\":utc?\"UTC\":formatTimezone(date)},o:function o(){return(_o()>0?\"-\"" +
            ":\"+\")+pad(Math.floor(Math.abs(_o())/60)*100+Math.abs(_o())%60,4)},p:function p()" +
            "{return(_o()>0?\"-\":\"+\")+pad(Math.floor(Math.abs(_o())/60),2)+\":\"+pad(Math.fl" +
            "oor(Math.abs(_o())%60),2)},S:function S(){return[\"th\",\"st\",\"nd\",\"rd\"][_d()" +
            "%10>3?0:(_d()%100-_d()%10!=10)*_d()%10]},W:function W(){return _W()},WW:function W" +
            "W(){return pad(_W())},N:function N(){return _N()}};return mask.replace(token,funct" +
            "ion(match){if(match in flags){return flags[match]()}return match.slice(1,match.len" +
            "gth-1)})}var masks={default:\"ddd mmm dd yyyy HH:MM:ss\",shortDate:\"m/d/yy\",padd" +
            "edShortDate:\"mm/dd/yyyy\",mediumDate:\"mmm d, yyyy\",longDate:\"mmmm d, yyyy\",fu" +
            "llDate:\"dddd, mmmm d, yyyy\",shortTime:\"h:MM TT\",mediumTime:\"h:MM:ss TT\",long" +
            "Time:\"h:MM:ss TT Z\",isoDate:\"yyyy-mm-dd\",isoTime:\"HH:MM:ss\",isoDateTime:\"yy" +
            "yy-mm-dd'T'HH:MM:sso\",isoUtcDateTime:\"UTC:yyyy-mm-dd'T'HH:MM:ss'Z'\",expiresHead" +
            "erFormat:\"ddd, dd mmm yyyy HH:MM:ss Z\"};var i18n={dayNames:[\"Sun\",\"Mon\",\"Tu" +
            "e\",\"Wed\",\"Thu\",\"Fri\",\"Sat\",\"Sunday\",\"Monday\",\"Tuesday\",\"Wednesday" +
            "\",\"Thursday\",\"Friday\",\"Saturday\"],monthNames:[\"Jan\",\"Feb\",\"Mar\",\"Apr" +
            "\",\"May\",\"Jun\",\"Jul\",\"Aug\",\"Sep\",\"Oct\",\"Nov\",\"Dec\",\"January\",\"F" +
            "ebruary\",\"March\",\"April\",\"May\",\"June\",\"July\",\"August\",\"September\"," +
            "\"October\",\"November\",\"December\"],timeNames:[\"a\",\"p\",\"am\",\"pm\",\"A\"," +
            "\"P\",\"AM\",\"PM\"]};var pad=function pad(val){var len=arguments.length>1&&argume" +
            "nts[1]!==undefined?arguments[1]:2;return String(val).padStart(len,\"0\")};var getD" +
            "ayName=function getDayName(_ref){var y=_ref.y,m=_ref.m,d=_ref.d,_=_ref._,dayName=_" +
            "ref.dayName,_ref$short=_ref[\"short\"],_short=_ref$short===void 0?false:_ref$short" +
            ";var today=new Date;var yesterday=new Date;yesterday.setDate(yesterday[_+\"Date\"]" +
            "()-1);var tomorrow=new Date;tomorrow.setDate(tomorrow[_+\"Date\"]()+1);var today_d" +
            "=function today_d(){return today[_+\"Date\"]()};var today_m=function today_m(){ret" +
            "urn today[_+\"Month\"]()};var today_y=function today_y(){return today[_+\"FullYear" +
            "\"]()};var yesterday_d=function yesterday_d(){return yesterday[_+\"Date\"]()};var " +
            "yesterday_m=function yesterday_m(){return yesterday[_+\"Month\"]()};var yesterday_" +
            "y=function yesterday_y(){return yesterday[_+\"FullYear\"]()};var tomorrow_d=functi" +
            "on tomorrow_d(){return tomorrow[_+\"Date\"]()};var tomorrow_m=function tomorrow_m(" +
            "){return tomorrow[_+\"Month\"]()};var tomorrow_y=function tomorrow_y(){return tomo" +
            "rrow[_+\"FullYear\"]()};if(today_y()===y&&today_m()===m&&today_d()===d){return _sh" +
            "ort?\"Tdy\":\"Today\"}else if(yesterday_y()===y&&yesterday_m()===m&&yesterday_d()=" +
            "==d){return _short?\"Ysd\":\"Yesterday\"}else if(tomorrow_y()===y&&tomorrow_m()===" +
            "m&&tomorrow_d()===d){return _short?\"Tmw\":\"Tomorrow\"}return dayName};var getWee" +
            "k=function getWeek(date){var targetThursday=new Date(date.getFullYear(),date.getMo" +
            "nth(),date.getDate());targetThursday.setDate(targetThursday.getDate()-(targetThurs" +
            "day.getDay()+6)%7+3);var firstThursday=new Date(targetThursday.getFullYear(),0,4);" +
            "firstThursday.setDate(firstThursday.getDate()-(firstThursday.getDay()+6)%7+3);var " +
            "ds=targetThursday.getTimezoneOffset()-firstThursday.getTimezoneOffset();targetThur" +
            "sday.setHours(targetThursday.getHours()-ds);var weekDiff=(targetThursday-firstThur" +
            "sday)/(864e5*7);return 1+Math.floor(weekDiff)};var getDayOfWeek=function getDayOfW" +
            "eek(date){var dow=date.getDay();if(dow===0){dow=7}return dow};var formatTimezone=f" +
            "unction formatTimezone(date){return(String(date).match(timezone)||[\"\"]).pop().re" +
            "place(timezoneClip,\"\").replace(/GMT\\+0000/g,\"UTC\")};";
        window.eval(dateformatMinJs);
        window.replayCapture = replayCapture;

        let chName = '';
        let chPath = '';
        let autoSaveInrervalId;
        let captureFilename;
        let captureWindow = mkElem('div', {
            className: 'capture-window modal-content' + (replayCapturing ? ' capturing ' : '')
        });
        let captureHeader = mkElem('div', {
            className: 'capture-header',
            innerText: 'Replay Capture ' + versionStr
        });
        let captureBtnContainer = mkElem('div');
        let captureBtn = mkElem('button', {
            className: 'w-100 btn btn-' + (replayCapturing ? 'danger' : 'primary'),
            innerText: replayCapturing ? 'Stop' : 'Start',
            title: (replayCapturing ? 'Stop' : 'Start') + ' capture',
            onclick: toggleCapture
        });
        let captureFileList = mkElem('div', {
            className: 'capture-file-list',
            innerText: 'Capture files:'
        });
        let captureCollapseBtn = mkElem('button', {
            className: 'capture-btn-collapse',
            onclick: () => captureWindow.classList.toggle('open')
        });
        let captureFooter = mkElem('div', {
            className: 'capture-footer text-success' + (fromLocalStorage ? '' : ' hidden')
        });
        let captureFooterDiv = mkElem('div', {
            className: 'capture-footer-div popover-title' //for background color in different themes
        });
        let captureChangeLog = mkElem('div', {
            className: 'capture-changelog hidden',
        });
        let style = mkElem('style', { innerHTML: styleMinCss });
        let db;
        if (fromLocalStorage) {
            let captureFooterLink = mkElem('a', {
                innerText: 'here',
                target: "_blank",
                href: updateUrl
            });
            let version = mkElem('b', {
                innerText: versionStr
            })
            captureFooterDiv.append('Loaded ')
            captureFooterDiv.append(version);
            captureFooterDiv.append(' from local storage. Click ');
            captureFooterDiv.append(captureFooterLink);
            captureFooterDiv.append(' to update permanently.');
        }
        captureFooter.append(captureFooterDiv);
        captureFooter.append(captureChangeLog);
        captureBtnContainer.append(captureBtn);
        captureWindow.append(captureCollapseBtn);
        captureWindow.append(captureHeader);
        captureWindow.append(captureBtnContainer);
        captureWindow.append(captureFileList);
        captureWindow.append(captureFooter);
        captureWindow.append(style);

        window.addEventListener('load', async function myLoad() {
            // Create auto-update script
            let scr = document.createElement('script');
            let updUrlObj = new URL(updateUrl);
            updUrlObj.searchParams.set('_', Date.now());
            scr.src = updUrlObj.toString();

            chPath = replayCapture.channelPath = window.CHANNELPATH;
            chName = replayCapture.channelName = window.CHANNELNAME;

            let rex = new RegExp(
                "^" + escapeStringRegexp(chName) + "_[\\d]{14}.json$"
            );
            db = await openIDB();
            window.db = db;
            for (const key of (await db.keys())) {
                if (key.match(rex)) {
                    let lastDiv = mkElem('div', { className: 'capture-file' });
                    await appendDownloadLinks(lastDiv, (await db.get(key)), key);
                    captureFileList.append(lastDiv);
                }
            }
            if (replayCapturing) {
                startCapture();
            }

            document.body.append(captureWindow);
            // Begin auto-update
            document.body.append(scr);
            window.removeEventListener('load', myLoad);
        });

        window.addEventListener('beforeunload', async function () {
            if (replayCapturing) await finishCapture();
        });

        // OnAutoUpdate callback
        window[name + 'OnAutoUpdate'] = OnAutoUpdate;

        let onAny = (key, data) => {
            if (replayCapturing) {
                replayCapture.eventsLog.push({
                    time: Date.now(),
                    type: key,
                    data: JSON.parse(JSON.stringify(data != null ? [data] : []))
                });
            }
        };
        let onConnect = () => onAny('connect');

        let currentSocket;
        let currentOneventOriginal;
        let prepareSocket = (socket) => {
            if (currentSocket != null) {
                if (typeof currentSocket.offAny === 'function') {
                    currentSocket.off('connect', onConnect);
                    currentSocket.offAny(onAny);
                }
                else if (typeof currentSocket.onevent === 'function') {
                    currentSocket.onevent = currentOneventOriginal;
                    currentSocket.off('connect', onConnect);
                    currentSocket.off('*', onAny);
                }
            }

            if (socket != null) {
                if (typeof socket.onAny === 'function') {
                    socket.on('connect', onConnect);
                    socket.onAny(onAny);
                }
                else if (typeof socket.onevent === 'function') {
                    // Old socket.io workaround
                    currentOneventOriginal = socket.onevent;
                    socket.onevent = function (packet) {
                        let args = packet.data || [];
                        currentOneventOriginal.call(this, packet);    // original call
                        packet.data = ['*'].concat(args);
                        currentOneventOriginal.call(this, packet);    // additional call to catch-all
                    };
                    socket.on('connect', onConnect);
                    socket.on('*', onAny);
                }
            }
            currentSocket = socket;
        }
        try {
            Object.defineProperty(window, 'socket', {
                configurable: true,
                get: () => currentSocket,
                set: (socket) => prepareSocket(socket)
            });
        } catch (exc) {
            // Sometimes userscript loads after socketio already been loaded and we get this exception
            if (
                typeof window.io === 'function' &&
                window.socket != null &&
                Object.keys(window.socket == null ? {} : window.socket).length === 1 &&
                typeof (window.socket == null ? {} : window.socket).emit === 'function'
            ) {
                console.log("Using alt hook method");
                let originalIo = window.io;
                window.io = (uri, opts) => {
                    let socket = originalIo(uri, opts);
                    prepareSocket(socket);
                    return socket;
                }
            }
            else {
                // Just in case unexpected things happen
                let err = mkElem('b', {
                    className: 'text-danger'
                });
                err.append('Socket.IO hook failed. Replay is NOT being captured.');
                err.append(mkElem('br'));
                err.append('Please reload page.');
                captureFooter.append(err);
                captureFooter.classList.remove('hidden');
                console.error(exc);
                if (localStorage['firlin123Debug'] === 'true') {
                    debugger;
                }
            }
        }

        function mkElem(tag, attribures = {}) {
            let elm = document.createElement(tag);
            for (let attribute in attribures) {
                elm[attribute] = attribures[attribute];
            }
            return elm;
        }

        async function toggleCapture() {
            if (replayCapturing) {
                await finishCapture();
                replayCapturing = false;
                localStorage.removeItem(capName);
                captureBtn.innerText = 'Start';
                captureBtn.title = 'Start capture';
                captureBtn.classList.add('btn-primary');
                captureBtn.classList.remove('btn-danger');
                captureWindow.classList.remove('capturing');
            } else {
                captureBtn.innerText = 'Reloading page...';
                captureBtn.disabled = true;
                localStorage[capName] = 'true';
                window.location.reload();
            }
        }

        function startCapture() {
            captureFilename = chName + '_' + dateFormat(new Date(), 'yyyymmddHHMMss') + '.json';
            autoSaveInrervalId = window.setInterval(
                async () => await db.set(captureFilename, JSON.stringify(replayCapture)), 120000
            );
            let name = captureFilename;
            let file = mkElem('div', { className: 'capture-file' });
            let fileName = mkElem('div', {
                className: 'capture-filename',
                title: name
            });
            fileName.append(mkElem('div', { innerText: name.substr(0, name.length - 20) }));
            fileName.append(mkElem('div', { innerText: name.substr(name.length - 20) }));
            file.append(fileName);
            file.append(mkElem('div', {
                innerHTML: '<div class="btn btn-default btn-sm disabled">Capturing...</div>',
                classList: 'btn-group'
            }));
            captureFileList.append(file);
        }

        async function finishCapture() {
            if (autoSaveInrervalId != null) {
                window.clearInterval(autoSaveInrervalId);
                autoSaveInrervalId = null;
            }
            let text = JSON.stringify(replayCapture);
            await appendDownloadLinks(captureFileList.lastElementChild, text, captureFilename);
        }

        async function appendDownloadLinks(div, text, name) {
            await db.set(name, text);
            div.innerHTML = '';
            let btnGroup = mkElem('div', { className: 'btn-group' });
            btnGroup.append(mkElem('a', {
                innerHTML: '<span class="glyphicon glyphicon-download-alt"></span>',
                title: 'Download ' + name,
                href: window.URL.createObjectURL(new Blob([text], { type: 'application/json' })),
                download: name,
                className: 'btn btn-default btn-sm'
            }));
            btnGroup.append(mkElem('a', {
                innerHTML: '<span class="glyphicon glyphicon-trash"></span>',
                title: 'Remove ' + name,
                href: '#',
                onclick: async () => {
                    if ((await db.keys()).includes(name)) {
                        await db.delete(name);
                    }
                    div.remove();
                },
                className: 'btn btn-danger btn-sm'
            }));
            let fileName = mkElem('div', {
                className: 'capture-filename',
                title: name
            });
            fileName.append(mkElem('div', { innerText: name.substr(0, name.length - 20) }));
            fileName.append(mkElem('div', { innerText: name.substr(name.length - 20) }));
            div.append(fileName);
            div.append(btnGroup);
        }

        // https://github.com/sindresorhus/escape-string-regexp
        function escapeStringRegexp(string) {
            if (typeof string !== 'string') {
                throw new TypeError('Expected a string');
            }

            // Escape characters with special meaning either inside or outside character sets.
            // Use a simple backslash escape when it’s always valid, and a `\xnn` escape when
            // the simpler form would be disallowed by Unicode patterns’ stricter grammar.
            return string
                .replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
                .replace(/-/g, '\\x2d');
        }

        function openIDB() {
            return new Promise((resolve, reject) => {
                let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB || window.shimIndexedDB;
                let open = indexedDB.open("ReplayCapture", 1);
                open.onupgradeneeded = function () {
                    try { open.result.createObjectStore("ReplayObjectStore", { keyPath: "name" }); } catch (err) { reject(err); }
                };
                open.onsuccess = async () => {
                    let db = open.result;
                    function request(fname, args = [], result = null) {
                        return new Promise((rResolve, rReject) => {
                            let tx = db.transaction("ReplayObjectStore", ((fname === 'put' || fname === 'delete') ? 'readwrite' : 'readonly'));
                            let store = tx.objectStore("ReplayObjectStore");
                            let rq = store[fname](...args);
                            rq.onsuccess = () => rResolve((result == null) ? rq.result : rq.result[result]);
                            rq.oneror = () => rReject(rq.error);
                        });
                    }
                    let getKeys = async () => await request('getAllKeys');
                    let deleteKey = async (key, value) => await request('delete', [key]);
                    let setValue = async (key, value) => await request('put', [{ name: key, text: value }]);
                    let getValue = async (key) => await request('get', [key], 'text');
                    const outObj = { set: setValue, get: getValue, keys: getKeys, close: db.close, delete: deleteKey };
                    resolve(outObj);
                }
                open.oneror = () => reject(open.error);
            });
        }

        function OnAutoUpdate(updateVersion, changeLog) {
            let captureFooterLink = mkElem('a', {
                innerText: 'here',
                target: "_blank",
                href: updateUrl
            });
            let version = mkElem('b', {
                innerText: versionToString(updateVersion)
            });
            captureFooterDiv.innerText = '';
            captureFooterDiv.append('Update ');
            captureFooterDiv.append(version);
            captureFooterDiv.append(' installed to local storage refresh page to load updated version or click ');
            captureFooterDiv.append(captureFooterLink);
            captureFooterDiv.append(' to install update permanently.');

            if (changeLog != null) {
                if (changeLog.length > 0) {
                    captureFooterDiv.append(mkElem('br'));
                    captureFooterDiv.append('Changelog:');
                    for (let i = 0; i < changeLog.length; i++) {
                        let logEntry = changeLog[i];
                        let ver = mkElem('b', {
                            innerText: versionToString(logEntry.version) + ':'
                        });
                        if (i !== 0) captureChangeLog.append(mkElem('br'));
                        captureChangeLog.append(ver);
                        for (let change of logEntry.changes) {
                            captureChangeLog.append(mkElem('br'));
                            let changeSpan = mkElem('span', {
                                innerHTML: change
                            });
                            changeSpan.prepend('• ');
                            captureChangeLog.append(changeSpan);
                        }
                    }
                    captureChangeLog.classList.remove('hidden');
                }
            }
            captureFooter.classList.remove('hidden');
        }

        function versionToString(version) {
            return `v${version.major}.${version.minor}.${version.patch}`;
        }
    }

    let scriptChangeLog = [
        {
            version: { major: 1, minor: 1, patch: 0 }, changes: [
                'Auto update',
                'Alternative hook method',
                'Per-channel capture flags'
            ]
        },
    ];

    // ======== Auto update code  ======== //

    // Already running from userscript/localStorage
    if (window[scriptName + 'Version'] != null) {
        if (isVersion(window[scriptName + 'Version'])) {
            let runningVersion = window[scriptName + 'Version'];
            let loadedVersion = scriptVersion;
            let versionDiff = versionsCompare(loadedVersion, runningVersion);
            // loadedVersion > runningVersion
            if (versionDiff === 1) {
                saveToLocalStorage(main, loadedVersion);
                if (typeof window[scriptName + 'OnAutoUpdate'] === 'function') {
                    let changeLog = filterChangeLog(runningVersion, loadedVersion);
                    window[scriptName + 'OnAutoUpdate'](loadedVersion, changeLog);
                }
            }
        }
    }
    else {
        let { localStorageVersion, localStorageMain } = getFromLocalStorage();
        let userScriptVersion = scriptVersion;
        if (localStorageVersion != null && localStorageMain != null) {
            let versionDiff = versionsCompare(localStorageVersion, userScriptVersion);
            //localStorageVersion > userScriptVersion
            if (versionDiff === 1) {
                window[scriptName + 'Version'] = localStorageVersion;
                localStorageMain(scriptName, true, scriptUpdateUrl);
            }
            else {
                deleteFromLocalStorage();
                window[scriptName + 'Version'] = userScriptVersion;
                main(scriptName, false, scriptUpdateUrl);
            }
        }
        else {
            window[scriptName + 'Version'] = userScriptVersion;
            main(scriptName, false, scriptUpdateUrl);
        }

    }

    function isVersion(version) {
        if (version != null) {
            return (
                Object.keys(version).length === 3 &&
                typeof version.major === 'number' &&
                typeof version.minor === 'number' &&
                typeof version.patch === 'number'
            );
        }
        else return false;
    }

    //version1 > version2 === 1
    //version1 = version2 === 0
    //version1 < version2 === -1
    function versionsCompare(version1, version2) {
        if (version1.major === version2.major) {
            if (version1.minor === version2.minor) {
                if (version1.patch === version2.patch) return 0;
                else return version1.patch > version2.patch ? 1 : -1;
            }
            else return version1.minor > version2.minor ? 1 : -1;
        }
        else return version1.major > version2.major ? 1 : -1;
    }

    function saveToLocalStorage(mainFunc, version) {
        try {
            let prevMain = localStorage.getItem(scriptName + 'Main');
            localStorage.setItem(scriptName + 'Main', mainFunc.toString());
            try {
                localStorage.setItem(scriptName + 'Version', JSON.stringify(version));
            }
            catch (e) {
                console.error('saveToLocalStorage failed:', e);
                if (prevMain != null) {
                    try {
                        localStorage.setItem(scriptName + 'Main', prevMain);
                    }
                    catch (e2) { }
                }
            }
        }
        catch (e) {
            console.error('saveToLocalStorage failed:', e);
        }
    }

    function filterChangeLog(runningVersion, loadedVersion) {
        return scriptChangeLog.filter((logEntry) => {
            return (
                //logEntry.version > runningVersion
                versionsCompare(logEntry.version, runningVersion) === 1 &&
                //logEntry.version <= loadedVersion
                versionsCompare(logEntry.version, loadedVersion) !== 1
            );
        });
    }

    function getFromLocalStorage() {
        let localStorageVersion = parseVersionOrNull(localStorage.getItem(scriptName + 'Version'));
        let localStorageMain = parseFunctionOrNull(localStorage.getItem(scriptName + 'Main'));
        if (localStorageVersion != null && localStorageMain != null)
            return { localStorageVersion, localStorageMain };
        else
            return { localStorageVersion: null, localStorageMain: null };
    }

    function parseVersionOrNull(str) {
        try {
            let version = JSON.parse(str);
            return isVersion(version) ? version : null;
        }
        catch (e) {
            return null;
        }
    }

    function parseFunctionOrNull(str) {
        try {
            let func = window.eval('(' + str + ')');
            return typeof func === 'function' ? func : null;
        }
        catch (e) {
            return null;
        }
    }

    function deleteFromLocalStorage() {
        localStorage.removeItem(scriptName + 'Main');
        localStorage.removeItem(scriptName + 'Version');
    }
})();