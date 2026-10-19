# Toyota 正文

正文入口：`body.md`。保留 Figma 中的原生文字、标注和独立图片/SVG，不使用整页截图。

阅读顺序：项目概述 → 岭南文化挖掘 → 文化意象提取与衍化 → 市场与目标用户 → 用户痛点洞察 → 家庭 SUV 设计策略 → 具体设计方案 → 座舱功能设计。

每页为独立视口，使用滚轮、上下键或 Next 切页，末页 End 返回 Preview。所有页面的动效均在进入该页后播放，离开取消，再次进入重播；减少动态偏好下显示静态内容。

素材：`images/`，来源记录见 `images/ASSET_SOURCES.md`。文字可在 `body.md` 编辑，刷新后生效；保留 data-node-id 以维持动效绑定。草图和图表可分别替换，无需重做整页。

动效代码：根目录 `toyota-motion.js`。本地设计源与转换记录：`work/toyota-body-*.txt`、`work/toyota-frames.json`、`work/build-toyota-body.py`。转换脚本会重新生成 body.md，手动编辑后不要直接重跑覆盖。
