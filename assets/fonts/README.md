# Noto Sans SC 网站字体

正式页面的普通标题、正文、图注、按钮统一使用 `Noto Sans SC`，通过根目录 `typography.css` 设置。Home / About Me / Selected Works 大字标题保留 Michroma。

完整可变字体：`NotoSansSC-Full-VF.woff2`，字重100–900，覆盖30,890个字符。来自 Google Fonts 的 `ofl/notosanssc/NotoSansSC[wght].ttf`，本地转换为 WOFF2，避免此前小型子集缺字时发生字体回退。采用同目录 `NotoSansSC-OFL.txt` 的 SIL Open Font License。

上游：https://github.com/google/fonts/tree/main/ofl/notosanssc

旧子集字体保留供历史版本使用。网站内嵌的独立模拟器不受网站字体样式影响。

## MiSans 本地对照（2026-10-19）

用户要求仅在本地试用 MiSans，暂不推送。typography.css 的普通内容字体改为 MiSans，Noto Sans SC 保留作后备；大字标题与 Home 轮播 Michroma 不变，现有字号、行高、字重声明与容器尺寸不变。

来源：小米官方 https://hyperos.mi.com/font/zh/download/ ，包 https://hyperos.mi.com/font-download/MiSans.zip 。提取完整可变字体 MiSansVF.ttf，只作 WOFF2 格式转换为 MiSans-VF.woff2（11,926,880字节），保留29,571字符；原生wght轴范围150–700，CSS超出可用范围时按字体可用范围匹配。官方许可原文：MiSans-License.pdf。当前网站中文字符覆盖检查无缺字。

恢复上一版：撤销 typography.css 的 MiSans 字体声明及body字体选择；保留原Noto资源。home-revision.css 中首页中文使用 --content-font 以跟随当前内容字体。

本地复查修正：由于MiSans原生Regular为330、Semi为520，而非通用400/700，typography.css通过font-variation-settings映射现有层级（正文330、500→380、600→450、700→520、800→580、900→630），保留CSS字号和字重语义，避免把常规正文渲染成中粗体、把700渲染成Heavy。GA低保真单独恢复原Noto字体与正常variation，不参与试字体。
