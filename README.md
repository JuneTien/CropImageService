# Crop Image Service

### 開發流程

```bash
yarn
yarn dev
open 'http://localhost:3002'
```

### 使用方法

```bash
http://<CROP_HOST>/<size>/<example.png>
```


1. 將原圖檔放置於：origin/example.png
2. 根據 client request 的 < size > 參數，產生對應比例大小的圖片，並回傳給 client
3. Server 會產生 < size > 的資料夾及裁切後的圖片檔案
