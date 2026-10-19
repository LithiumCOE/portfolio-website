# 素材来源登记 (SOURCES.md)

本文件登记 `playground_v2/assets/` 下每个图片素材的**实测**尺寸、字节数、来源页面、实际下载直链与 NASA 要求的署名文字。

工程约束：`playground_v2` 是离线单文件 HTML，`build.py` 会把被引用的图片 base64 内联进 `playground_v2.html`，
所以每条记录的字节数直接决定最终产物体积。

## 项目 UI 图标

`ui/story-info.svg` 与 `ui/add.svg` 直接导出自项目 [Figma 设计节点 `1:8`](https://www.figma.com/design/63Qv95UMoQ06nYqWNOyT8H/太阳系模拟器?node-id=1-8)，对应 `clarity:help-info-solid` 和 `carbon:add-alt` 图层。`build.py` 会把两个 SVG base64 内联进离线 HTML，生成物中不保留临时 Figma 资源地址。

**尺寸验证方式（不依赖网页文字描述）**：每个文件都用 Node 读文件头解析——
JPEG 走 `SOI(FFD8)` → 逐段扫描到 `SOF0-SOF15`，读 precision/height/width/components；
PNG 走 `IHDR` 前 24 字节读 width/height。本文件列出的所有宽高均为该解析器输出的实测值，
并与 2:1（`width === height * 2`）断言比对。

**直链验证方式**：`HEAD` 请求比对 `Content-Length` 与本地字节数。
Lead 使用 `node` 的 `fetch(url, {method:'HEAD'})`；素材员使用 PowerShell `Invoke-WebRequest -Method Head`。

---

## 1. 月球 (Moon)

### 1.1 `moon-color-2025-official.jpg` — **当前 `build.py` 实际内联的那一张**

| 项 | 值 |
| --- | --- |
| 像素尺寸 | **2048 x 1024**（实测 SOF0，aspect = 2.0000，满足 2:1 等经纬度） |
| 字节数 | **457,942** |
| 色彩/编码 | JPEG baseline (SOF0)，8-bit，3 components |
| sha256 | `F7130A1822681FA7512D7DCFD40DB8C10B9BA4F06777910348698260ED7A2170` |
| 来源页面 | https://svs.gsfc.nasa.gov/4720 （NASA SVS "CGI Moon Kit"，ID 4720） |
| 实际下载直链 | https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_2k.jpg |
| 直链验证 | `HEAD` → 200, `Content-Length: 457942`, `Content-Type: image/jpeg`；与本文件字节数一致 |
| 是否再编码 | **否**。NASA 官方发布的就是 JPEG，本文件与直链字节一致（仅重命名） |
| 接入方式 | `build.py` 中 `('/*PHOTO_MOON*/', 'moon-color-2025-official.jpg')` |

**来源说明**：SVS 4720 页面 "Color" 区块第 1 个条目（2025 年 12 月版彩色图）。由 LROC 广角相机（WAC）
的 Hapke 归一化全球镶嵌图制作，取 643nm/566nm/415nm 三个波段合成 RGB，并做曝光/白平衡校正；
70°N–70°S 以外由 LOLA 激光高度计的低分辨率单色反照率图（LDAM）填补。
地图以 0° 经线为中心，标准等经纬度（equirectangular），可直接做球面 u/v 采样。

**必需署名文字**：

> NASA's Scientific Visualization Studio

完整 credits：Visualization **Ernie Wright** (USRA)；Scientist **Noah Petro** (NASA/GSFC)；
数据 LROC WAC Color Mosaic — Natural Color Hapke Normalized WAC Mosaic（LRO Camera，Arizona State University）；
数据 DEM — LRO / LOLA。NASA Scientific Visualization Studio，页面 ID 4720。

### 1.2 `moon-color-4k.jpg` — 高分辨率版（4096 x 2048，**未接入，待 Lead 评估**）

| 项 | 值 |
| --- | --- |
| 像素尺寸 | **4096 x 2048**（实测 SOF0，aspect = 2.0000，满足 2:1） |
| 字节数 | **1,890,062**（1.80 MB，满足 Lead 的 ≤2MB 限制） |
| 色彩/编码 | JPEG baseline (SOF0)，8-bit，4:4:4（subsampling=0） |
| sha256 | `48AC9C71602316112DA9FDE5B71068B8F100798730AB5DD0FDD6AEE9DC6C4F5E` |
| 来源页面 | https://svs.gsfc.nasa.gov/4720 （同 1.1，2025 版 color map） |
| 实际下载直链（源文件） | https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_16bit_srgb_4k.tif |
| 源文件验证 | `HEAD` → 200, `Content-Length: **61891324**`, `Content-Type: image/tiff`；本地下载字节数一致 |
| 源文件 sha256 | `9731FA8AF425B6C2F88F277ECCA82BF8C603F3743894F64ED7B25C5BFEFA22FF` |
| 是否再编码 | **是，已转换**（NASA 在该分辨率只发布 16-bit TIFF，没有官方 JPEG） |

**转换过程的完整披露**（派生文件，不是 NASA 原件）：

```
源: lroc_color_16bit_srgb_4k.tif (4096x2048, 16-bit sRGB TIFF, 61,891,324 bytes, NASA SVS 官方原件)
工具: Pillow 12.3.0（Image.MAX_IMAGE_PIXELS=None）
操作: 无缩放、无裁剪、无调色；16-bit sRGB 解码为 8-bit RGB → JPEG quality=88, subsampling=0 (4:4:4), optimize=True
结果: 4096x2048 保持不变，1,890,062 bytes
```

**为什么需要它**：Lead 把月球放大到 400 px 半径时，2048 宽贴图（u 方向 0.8 texel/px）明显发软；
4096 宽可到约 1.6 texel/px。**体积代价**：替换后单文件 +1.43 MB。

**同分辨率的其他质量档（实测，供选型）**：

| 编码参数 | 字节数 | 是否 ≤2MB |
| --- | --- | --- |
| q85, 4:2:0 | 1,456,379 | ✅（且 ≤1.5MB） |
| **q88, 4:4:4（本文件采用）** | **1,890,062** | ✅ |
| q90, 4:4:4 | 2,136,859 | ❌ 超过 2MB |

### 1.3 `moon-color.jpg` — 备选（未接入，2019 版高对比度）

| 项 | 值 |
| --- | --- |
| 像素尺寸 | **2048 x 1024**（实测 SOF0，aspect = 2.0000，满足 2:1） |
| 字节数 | **640,238** |
| sha256 | `389536F605EEA3F229C7CC98CB508A069540842DB0AD594B3AABEE8523CF2129` |
| 来源页面 | https://svs.gsfc.nasa.gov/4720 （同一页面下方的 2019 版 color map） |
| 实际下载直链（转换的源文件） | https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/lroc_color_poles_2k.tif |
| 源文件验证 | `HEAD` → 200, `Content-Length: 3339438`, `Content-Type: image/tiff` |
| 是否再编码 | **是**：Pillow 12.3.0，TIFF → JPEG quality=92, subsampling=0 (4:4:4)，无缩放 |
| 接入方式 | **当前未被 `build.py` 引用**（不内联，不占最终 HTML 体积） |

**与 1.1 的差别**（README 取舍依据）：2019 版明暗对比**强**——月海呈深灰、高地亮，月海轮廓一眼可辨；
2025 版偏**暖**、整体较亮，月海/高地色彩分离更清楚，极区细节更多。
官方说明：2025 版于 2025 年 12 月用商业图像软件重制，保留了更多色彩与动态范围。
**Lead 已选定 1.1（2025 官方版）接入**，理由是偏暖、色彩分离更清楚，更接近 NASA Eyes 里的月球。

### 1.4 `moon.jpg` — **作废，不要使用**

| 项 | 值 |
| --- | --- |
| 像素尺寸 | **3000 x 3000**（实测，aspect = **1.0000**，**不是** 2:1） |
| 字节数 | 4,573,032 |
| sha256 | `5CCE0D450D96505FD447EAD43D8392E5A9F4B536B84DB2278646DC3FF6EF0F28` |
| 状态 | **不能用于球面等经纬度采样**（方形图铺到 UV 会拉伸；裁成 2:1 会丢掉半个球面，不可接受）。当前不被 `build.py` 引用。按 Lead 指示暂不删除，留待最终统一清理。 |

---

## 2. 星图 (Starfield)

### 2.1 `starfield.jpg` — 当前被 `build.py` 内联（1024 x 512，铺 1476px 会糊）

| 项 | 值 |
| --- | --- |
| 像素尺寸 | **1024 x 512**（实测 SOF2 渐进式 JPEG，aspect = 2.0000，满足 2:1 等经纬度全天图） |
| 字节数 | **42,786** |
| sha256 | `8D2E7E8D515E238DEAF90E2B7FB11B2838B6E8DB64F933A57540D894468148AA` |
| 来源页面 | https://svs.gsfc.nasa.gov/4851 （NASA SVS "Deep Star Maps 2020"） |
| 实际下载直链 | https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/starmap_2020_4k_print.jpg |
| 直链验证 | `HEAD` → 200, `Content-Length: **42786**`, `Content-Type: image/jpeg`——与本地字节数**逐字节一致** |
| 接入方式 | `build.py` 中 `('/*PHOTO_SKY*/', 'starfield.jpg')` |

**重要澄清**：文件名里的 "4k" 指该系列基于 4K 分辨率原始星表渲染，**不代表这张 JPEG 是 4096 宽**。
SVS 4851 页面**只提供这一档 JPEG**；更高分辨率只提供 EXR 半浮点格式。
（已实测：`starmap_2020_8k_print.jpg` 与 `starmap_2020_2k_print.jpg` 均 **404**。）

**必需署名文字**：

> NASA/Goddard Space Flight Center Scientific Visualization Studio
>
> Gaia DR2: ESA/Gaia/DPAC

### 2.2 由 4K EXR 派生的高分辨率星图（全部为派生文件，未接入，待 Lead 选择）

**共同来源**：

| 项 | 值 |
| --- | --- |
| 来源页面 | https://svs.gsfc.nasa.gov/4851 （NASA SVS "Deep Star Maps 2020"） |
| 实际下载直链 | https://svs.gsfc.nasa.gov/vis/a000000/a004800/a004851/starmap_2020_4k.exr |
| 源文件验证 | `HEAD` → 200, `Content-Length: **35997085**` (34.3 MB), `Content-Type: image/aces`；本地下载字节数一致 |
| 源文件 sha256 | `69B841CD048C2EF35543EB1C5819B322530E78AA4B0CAB97EC1DE3EF56A4DDCD` |

**EXR 解码记录（本机无任何 EXR 库，以下是自写最小读取器的实测结果）**：

- EXR 版本 2，magic 字节 `76 2f 31 01`（整数 20000630），通道 `['B','G','R']`，pixelType HALF。
- **压缩方式实测为 `3` = ZIP**（不是 NO_COMPRESSION；每个 chunk 16 条扫描线，共 128 个 chunk）。
  解码 = zlib inflate → 逆预测器（`rec[i] = rec[i-1] + d[i] - 128 (mod 256)`）→ 反交错（前半/后半重新交织）。
  没有任何 chunk 以未压缩形式存储（128/128 都走了 zlib）。
- **完整性断言全部通过**：2048/2048 条扫描线全部读出；`max(chunk 数据末尾) == 文件大小 == 35,997,085` 字节；
  宽高断言 `4096 x 2048` 通过。
- 数据范围：线性 `min=0 max=1 mean=0.0158`（**已经是 0–1 归一化，不是超过 1 的 HDR**）。

**为什么需要「匹配版」——用数据说话**（把 EXR 降采样到 1024x512 后与原 1024x512 打印版比对亮度分位数）：

| 分位数 | 原打印版 | 纯线性 | 对数 k=1000 γ0.85 | **匹配版 γ0.54** |
| --- | --- | --- | --- | --- |
| p1 | 0.0235 | 0.0018 | — | 0.0326 |
| p10 | 0.0353 | 0.0031 | — | 0.0439 |
| p25 | 0.0510 | 0.0047 | — | 0.0552 |
| p50 | 0.0824 | 0.0087 | ~0.377 | 0.0773 |
| p75 | 0.1294 | 0.0188 | — | 0.1168 |
| p90 | 0.2000 | 0.0406 | — | 0.1773 |
| p99 | 0.3569 | 0.1429 | — | 0.3497 |
| p99.9 | 0.5020 | 0.3312 | — | 0.5506 |
| **9 点平均误差** | — | **0.09528** | **0.29715** | **0.01400** ✅ |

**结论**：原打印版在各分位数上比**纯线性亮约 10 倍**，所以纯线性版（见 2.2.1）明显偏暗、银河细节丢失；
而 Lead 建议的对数映射 k=1000 γ0.85 把中位数抬到 ≈0.377（≈96/255），背景会变成灰色，**过亮**。
实测最佳拟合是 **`out = L^0.54`（L 取 RGB 三通道最大值，再按比例缩放以保留星色）**，误差比线性小 6.8 倍。
γ=0.54 的映射即 2.2.3 / 2.2.4 两个文件，**建议优先评估这两个**。

| 文件 | 尺寸 | 字节数 | 映射 | sha256 |
| --- | --- | --- | --- | --- |
| `starfield-2k-linear.jpg` | 2048x1024 | 152,386 | 纯线性 `clip(L,0,1)`（偏暗，作对照） | `A0944D83287155ED…` |
| `starfield-2k-log.jpg` | 2048x1024 | 561,004 | 对数 k=1000, γ=0.85（偏亮，作对照） | `CF7A6CA205DE23E0…` |
| **`starfield-2k-matched.jpg`** | **2048x1024** | **298,561** | **γ=0.54（最佳拟合原观感）** | `0505406CFCA8FFD6…` |
| **`starfield-4k.jpg`** | **4096x2048** | **1,541,672** | **γ=0.54（最佳拟合原观感，满足 ≤1.5MB）** | `8BAB06963E496228…` |

（上表 sha256 省略号为截断显示，完整值见生成记录；文件尺寸均已用 Node 解析 SOF 实测，全部为 2:1。）

**推荐**：`starfield-4k.jpg`（1.47 MB）——同时解决「1024→1476px 放大约 4.4 倍的糊」与「观感与原版一致」两个问题；
若体积敏感，用 `starfield-2k-matched.jpg`（0.28 MB，比现行 42 KB 版清晰 2 倍，仍远小于预算）。

**必需署名文字**（同 2.1）：

> NASA/Goddard Space Flight Center Scientific Visualization Studio
>
> Gaia DR2: ESA/Gaia/DPAC

---

## 3. 其他既有素材（Lead 已核实直链，均来自 NASA 3D Resources 图库）

**验证方法**：`node` 的 `fetch(url, {method:'HEAD'})`，比对 `Content-Length` 与本地字节数。

**5 张与 NASA 官方原件逐字节一致**（直链前缀均为
`https://assets.science.nasa.gov/content/dam/science/cds/3d/resources/image/`）：

| 文件 | 实测尺寸 | 2:1 | 字节数 | 直链 path | Content-Length 校验 |
| --- | --- | --- | --- | --- | --- |
| `venus.jpg` | 1440 x 720 | ✅ | 1,166,974 | `venus/Venus.jpg` | 1,166,974 ✅ 一致 |
| `mars.jpg` | 1440 x 720 | ✅ | 972,896 | `mars/Mars.jpg` | 972,896 ✅ 一致 |
| `jupiter.jpg` | 720 x 360 | ✅ | 225,878 | `jupiter/Jupiter.jpg` | 225,878 ✅ 一致 |
| `saturn.jpg` | 720 x 360 | ✅ | 275,735 | `saturn/Saturn.jpg` | 275,735 ✅ 一致 |
| `neptune.jpg` | 720 x 360 | ✅ | 210,528 | `neptune/Neptune.jpg` | 210,528 ✅ 一致 |

这 5 张的署名：NASA（NASA 3D Resources / NASA Science 素材库）。
**注意**：各页面的具体署名文字未由本任务核实，README 中建议统一写 "NASA"。

同一目录下还存在 `earth-(a)/Earth%20(A).jpg`（200, 1,398,329 B）与 `moon/Moon.jpg`（200, 2,957,499 B），
**但都不是本地在用的文件**，不要误用。

### 3.1 `earth.jpg` — **原始直链未核实**

| 项 | 值 |
| --- | --- |
| 像素尺寸 | 5400 x 2700（实测 SOF0，aspect = 2.0000，满足 2:1） |
| 字节数 | 1,884,678 |
| sha256 | `99F5FAAD74EFE985FBF1714C8BE7296CA9999759A1215B65F99B7F1DF278DDE5`（前缀） |
| 视觉特征 | 全球等经纬度真彩图，一月（北半球有雪盖），海洋为深色测深底图 |

**原始直链未核实。** 档案记录指向 Blue Marble Next Generation 的 base map 系列，但该 URL 已 404，
**无法确认本地文件是否为其原件的字节副本或经过再编码**。
已尝试且失败的直链：

- `assets.science.nasa.gov/.../esd/eo/images/bmng/bmng-base-map/bmng_base_map_january.jpg` → 404
- `eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200401.3x5400x2700.jpg` → 404
- `eoimages.gsfc.nasa.gov/images/imagerecords/73000/73934/world.topo.bathy.200412.3x5400x2700.jpg` → 404
- `eoimages.gsfc.nasa.gov/images/imagerecords/73000/74000/world.topo.bathy.200401.3x5400x2700.jpg` → 404

**待办**：若要严格可追溯，可换成已核实的低分辨率版
`https://eoimages.gsfc.nasa.gov/images/imagerecords/57730/land_ocean_ice_2048.jpg`
（266,599 B，Lead 已验证 200），代价是清晰度下降（2048 宽 → 在 1476px 宽的画面上会再次变软）。

---

## 4. 已尝试但失败的直链（留档，避免重复踩坑）

| URL | 结果 |
| --- | --- |
| `.../a004720/lroc_color_poles_2k.jpg` | **404** —— 2019 版 2k 官方只提供 TIFF |
| `.../a004720/lroc_color_poles_2k.png` | **404** |
| `.../a004720/lroc_color_poles_1k.tif` | **404**（1k 只有 .jpg） |
| `.../a004720/lroc_color_4k.jpg` | **404** —— 2025 版 4k 官方只提供 16-bit TIFF (59.0 MB) |
| `.../a004720/lroc_color_8k.jpg` | **404** |
| `.../a004720/lroc_color_1k.jpg` | **404** |
| `.../a004720/lroc_color_2k_16bit.jpg` | **404** |
| `.../a004851/starmap_2020_8k_print.jpg` | **404** |
| `.../a004851/starmap_2020_2k_print.jpg` | **404** |
| `https://svs.gsfc.nasa.gov/vis/a000000/a004700/a004720/`（目录列表） | **404** —— SVS 不提供目录索引，只能按文件名猜 |

**教训与可用手段**：
1. SVS 页面上 "Download" 区块列出的文件名才是权威清单。
2. `https://svs.gsfc.nasa.gov/api/<页面ID>` 返回 JSON（含 `width`/`height`/直链/credits），可用于交叉验证——
   本文件 1.1 的 2048x1024 与官方 API 的 `"width": 2048, "height": 1024` 一致。
3. **SVS 服务器单连接很慢（实测约 17 KB/s）**，但**支持 HTTP Range**（`Accept-Ranges: bytes`，实测 206）。
   用 `curl.exe -r start-end` 分 8–16 个分片并发下载后拼接，实测可达 **514 KB/s（约 30 倍）**，
   这是拿到 34 MB / 59 MB 级源文件的可行路径（分片下载后已逐片校验字节数并拼接校验总大小）。
