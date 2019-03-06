# Crop Image Service

### 目的

減少 request 圖片檔案的流量與大小，以提升效能

### 功能

對圖片做動態裁圖，並取得 resize 後中間位置的區域

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
