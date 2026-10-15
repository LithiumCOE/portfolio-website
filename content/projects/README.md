# 项目文字与图片维护

项目目录：`content/projects/`。内容都是普通文件，可以用 Obsidian、VS Code 等编辑器维护，提交并推送后随 GitHub Pages 更新。

## 修改亡犬简介

直接编辑 `wangquan/intro.md`，不需要改 HTML。支持标题、段落、**加粗**、列表、引用、链接、图片、表格和代码块。

```md
## 我的职责

我负责 **创意设定与游戏美术**。

> 这里可以放关键判断或引用。

[项目链接](https://example.com/)
```

亡犬的 Steam 链接已配置。其他项目需要外部跳转时，在 `projects.json` 中配置该项目的 `external.label` 和 `external.url`。

## 放置图片与配置 Slides

把准备好的 16:9 图片放入各项目的 `images/` 文件夹，例如：

```text
content/projects/wangquan/images/01.jpg
content/projects/wangquan/images/02.jpg
content/projects/ga/images/01.jpg
```

在 `projects.json` 中找到相应项目，将 `gallery` 改成：

```json
"gallery": [
  {"src": "wangquan/images/01.jpg"},
  {"src": "wangquan/images/02.jpg"}
]
```

`alt` 为可选的替代文字，不是图片说明，不需要时可以省略。`src` 开头不要加 `/`，路径相对于 `content/projects/`；请使用英文半角引号、逗号和大括号，最后一项后不加逗号。

数量不限，按配置顺序显示。缩略图数量严格跟随有效图片数量，不补足五张；空数组只保留大图占位，不生成缩略图或计数。少于两张图片时隐藏翻页箭头。图片使用 contain 完整显示，不裁切。可使用 JPG、PNG、WebP；建议 1920×1080 左右。为方便跨平台，请用英文、数字与短横线命名。

`src` 也可以填可公开访问的 HTTPS 图片直链，无需改前端代码。远程图片应允许外站访问；不要填网盘分享页或需要登录的网址。

## 有正文与只有简介的两种状态

每个项目的 `intro` 指向简介 Markdown。没有 `body` 字段时只显示简介弹窗。

需要正文时，新建 `<项目ID>/body.md`，并在该项目配置中添加：

```json
"body": "ga/body.md"
```

简介底部就会显示 MORE，滚轮可以继续向下看正文，点击 MORE 也能滚到正文。

当前模板对应：
- 单页简介（without MORE）：`wangquan`、`pda`、`web`、`physics`。
- 简介 + 正文（with MORE）：`ga`、`toyota`、`mel`、`ss`、`r6s`、`saic`、`mci`，均已连接各自的 `intro.md` 与 `body.md`。
- `mci` 为原 `thesis` 文件夹的新名称。

直接编辑相应目录里的 MD，保存后刷新网页即可更新，不需要反复修改 JSON。页面刷新时会重新校验文件，页面内重复打开则复用预加载缓存。JSON 仅在改路径、图片列表、分类或跳转链接时需要修改。

PPT/PDF 建议先导出成逐页 16:9 图片，再在 `body.md` 引用；系统不会自动转换 PPT/PDF。正文里的相对路径按当前 Markdown 文件所在目录解析：

```md
# 方案展示

![第 1 页](images/01.jpg)

## 过程与判断

> 文字引用。

![第 2 页](images/02.jpg)
```

## 卡片和分类

卡片标题、简介小字、颜色分类、弹窗副标题都在 `projects.json`。项目按数组顺序排列：桌面六列两排；窄屏自动重排。`categories` 定义六个分类和颜色；项目的 `category` 对应其 ID。

新增项目时复制一项配置，使用唯一英文 ID，并新建对应 Markdown 和图片目录。`home: true` 用于“作品集网站”卡片返回首页。

## 本地预览

通过本地服务预览，例如 `http://127.0.0.1:8765/#work`；不要直接双击 HTML，因为浏览器会限制读取 Markdown 和 JSON。
