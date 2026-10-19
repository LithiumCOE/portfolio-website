# Eric Liang Portfolio Website

更新：2026-10-19。网站已完成主要页面、作品正文和核心交互，进入收尾微调与发布前验收阶段。当前为面向桌面的静态作品集，依据 Figma 设计实现，无后端。

## 本地查看

在项目根目录运行：

```powershell
python -m http.server 8765 --bind 127.0.0.1
```

打开 `http://127.0.0.1:8765/`。请使用静态服务，直接双击 HTML 无法可靠读取 Markdown 和 JSON。

## 当前网站

- **Home（#home）**：ERIC LIANG 大标题、单词轮播、可旋转的三维城市沙盒。约 2 秒顺序入场：标题逐字、小字、沙盒；首次操作后 3D 指引箭头渐隐。
- **About Me（#about）**：个人信息、履历、项目及身份高亮。引言为“AI-empowered designer”，保留下方横线。
- **Selected Works（#work）**：六类作品筛选、Preview 卡片、图片/视频及 MORE 正文。三页均保留滚轮、键盘和箭头导航。
- 三个大标题保留 Michroma，支持字母弹簧响应和局部金属材质遮罩；普通文字为本地 Noto Sans SC。自动动效遵循减少动态效果偏好。

## 修改入口

| 内容 | 编辑位置 |
| --- | --- |
| 首页/个人资料结构 | index.html |
| About 项目列表 | content/about/projects.md |
| 作品标题、分类、图片、链接 | content/projects/projects.json |
| 各作品简介和正文 | content/projects/<项目ID>/intro.md、body.md |
| 网站字体 | typography.css、assets/fonts/ |
| 首页排版/文字动效 | home-revision.css、home-title.js、home-words.js |
| 三维沙盒 | webgl-hero.js |
| 作品浏览和正文分页 | selected-works.js、project-slides.js、ga-chapters.js |

完整实现状态和验收清单见 [当前状态](docs/CURRENT_STATE.md)。作品编辑说明见 [内容维护](content/projects/README.md)。早期探索方案移至 [历史存档](docs/IMPLEMENTATION_HISTORY.md)，不作为当前实现依据。

## Git 与发布

仓库： https://github.com/LithiumCOE/portfolio-website ，当前分支 `main`。

已确认推送到 GitHub 的版本为 `f3fa1a0`（含前期作品更新和两秒入场）。此后 About 引言删除、另外两个标题特效及收尾文档更新已纳入本次提交，用户于 2026-10-19 授权推送。Git 推送不等于已确认线上部署；尚未确认当前 Pages 设置或线上地址。

每次上传前检查改动范围及发布设置；不擅自修改部署。若终端直连 GitHub 失败而浏览器正常，检查系统代理；本次成功推送使用单次 Git 代理 `http://127.0.0.1:12000`，不应假定该端口永久有效。

本地检查截图等放在已忽略的 outputs/；旧 Canvas 实现与备份不属于当前首页运行入口。运行依赖已保存在 vendor/，部署无需 node_modules/。
