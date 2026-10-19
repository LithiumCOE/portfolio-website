# 网站当前状态与收尾交接

记录：2026-10-19。用户认为网站已基本完成；后续以局部润色、内容核对及发布验收为主，避免无授权重做结构。

## 视觉与交互基线

浅色纸感背景、黑色正文、按类别配色；普通文字统一本地完整 MiSans（Noto Sans SC 保留为后备，GA低保真继续使用Noto原字体），大标题与 Home 轮播使用 Michroma。Toyota、SAIC 正文强调蓝色 #0093EE，关键词标签深蓝 #006FB5 配白字。SS 说明强调色 #B48400、标注点 #FFBB00。

Home、About、Selected Works 是独立画面；长内容先内部滚动，再触发切页。弹窗内部操作不应误触背后页面切换。网站主要面向桌面，不要求继续手机适配。

Home 约 2 秒完成入场：标题逐字约 0.78 秒完成，小字 0.75–1.36 秒错峰，沙盒 1.35–2 秒进入。左右轮播每项停留 1.2 秒、错开 500ms，每侧只显示一个词。标题上下间距已收紧，沙盒与文字取消交叠。

三个大标题共用鼠标驱动的逐字阻尼弹簧、局部镜面材质和入场扫光；首页中文签名为粗体并有同类效果，副标题只有物理响应。About 引言改为“AI-empowered designer”，已恢复引言区域及下方横线。

沙盒使用 Three.js 0.186.1、本地 vendor 依赖。实体速度滑块、播放/暂停、重置、超速脱轨、拾取拖回赛道、水平旋转及 PNG 导出均保留。车辆使用真实三维遮挡；无强制置顶或动态停靠台。五个立体指引箭头首次有效交互后 750ms 渐隐，本次页面生命周期不恢复。

## 作品内容

| 项目 | 当前展示方式 |
| --- | --- |
| GA | Preview + 五个正文视口；低保真内部长页，高保真三 Tab 与叠图切换 |
| SS | Preview + 前四个正文视口；四份低保真合成内部长页，保留标注、仅一个组标题 |
| MEL | Preview + 前四个正文视口；主要画面展示合成长页，三个透明图已适配浅底 |
| SAIC | 视频/图片混合 Preview，另有证书；八个原生正文视口与内容动效 |
| Toyota | 图片 Preview；八个原生正文视口与内容动效 |
| 亡犬、PDA、官网、physics、MCI | without MORE；按配置展示简介、图片、视频或外链 |
| 作品集网站 | 返回首页入口 |

R6S 已移除。GA、SS、MEL、SAIC、Toyota 正文从 Figma 实际内容转化为 HTML/CSS 和局部素材，不是整页 PPT/PDF 截图。正文以 body.md 为当前编辑源，不可运行旧生成器覆盖后续人工修改。SS 低保真尤其不能省略标注或擅改组内坐标。

with MORE 的 Preview 与正文为独立阅读状态，正文底部统一 Next，最后 End 返回 Preview。托管视频只在需要时加载，切换媒体或关闭弹窗时卸载。模拟器只有点击外链后加载，独立入口 playgrounds/planet-engine/。

## 文件职责

- navigation.js：三页导航；about-filter.js / about-projects.js：身份交互与项目文字。
- selected-works.js / selected-works.css：筛选、卡片展开、Preview 图集、正文状态。
- ga-chapters.js：GA 专属正文；project-slides.js：SS/MEL/SAIC/Toyota 分页及长页。
- saic-history-motion.js / toyota-motion.js：对应正文内容动效。
- content/projects/：JSON 配置、Markdown 和各自 images/；各项目 README 保留专属说明。
- index.html、style.css、figma-layout.css、typography.css、home-revision.css：页面结构与分层样式；注意覆盖顺序。

## 完成情况与验证边界

核心沙盒和三页切换曾经用户验收；后续局部修改做了脚本语法和浏览器基本检查，不代表所有作品及所有窗口尺寸都已完整复验。最近一次浏览器检查无运行错误；三个标题均已接入字母拆分和材质效果。

用户视觉验收建议：

1. 刷新 Home，确认两秒顺序入场、轮播节奏和标题 hover 手感。
2. 操作沙盒任意控件/旋转，确认指引一次消失，重置和切页后不再恢复。
3. 查看 About 与 Selected Works 标题效果及文字间距，确认删去引言后的个人资料布局。
4. 逐项核对 Preview 文案、图片/视频、外链；检查 MORE、长页、Next/End、关闭与 Esc。
5. 发布后再核对线上字体、素材路径和视频加载，尤其 GitHub Pages 子路径。

## 版本与后续

GitHub main 已确认到 f3fa1a0；之后的 About/标题修改和收尾文档已纳入本次提交。尚未确认 GitHub Pages 设置及线上发布结果。用户于 2026-10-19 追加授权推送；部署设置保持不变。

优先后续事项是用户视觉微调、外链/内容最终核对及发布设置确认。不要把原型阶段的“目录为空、没有 WebGL、案例占位”等历史描述当作当前状态。遇到历史约定冲突，以用户最新决定和 AGENTS.md 后续记录为准。
