# Crop Image Service

### 目的

透過此 service，可減少 client request 圖片檔案的大小與流量，以提升畫面顯示效能。

根據頁面上所需圖片大小，做直接的使用，即不需要抓取原圖後再根據 style 做 resize 的動作。

舉例：
當頁面上需要某張圖片 size 100x100，但原圖尺寸為 500x500：
- 在未使用此 service 時，client 會抓取 500x500 的圖片，再透過 img 的 style 做 resize，此時即是使用原圖的檔案大小與下載流量
- 若使用此 service，client 直接抓取需要的尺寸 100x100，即可減少下載圖片的大小與流量。

### 功能

- 對圖片做動態裁圖，並取得 resize 後中間位置的區域：gm.gravity('Center')
- 保留原圖解析度
- 去背景：gm.background('none')

### 開發流程

```bash
yarn
yarn dev
open 'http://localhost:3002'
```

### 使用方法

```bash
http://<CROP_HOST>/<origin_file_path>/<size>/<example.png>

eg: http://localhost:3002/origin/100x100/example.png
```


1. 將原圖檔放置於相對路徑：./origin/example.png
2. 根據 client request 的 < size > 參數，產生對應比例大小的圖片，並回傳給 client
3. Server 會產生 < size > 的資料夾及裁切後的圖片檔案


### Reference
https://github.com/aheckmann/gm
