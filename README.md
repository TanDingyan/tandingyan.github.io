# 个人主页

一个零依赖的个人主页站点，部署在 GitHub Pages 上：**https://tandingyan.github.io/**

纯 HTML / CSS / JavaScript 实现，没有构建步骤、没有框架、没有 npm，改完内容推送到 GitHub 就会自动上线。

## 功能

- 响应式布局，手机 / 平板 / 桌面都适配
- 浅色 & 深色双主题切换，选择结果记在 `localStorage`，首次访问跟随系统设置
- **中英双语**：导航栏 `EN / 中` 按钮一键切换，全站文案中英对照，选择记在 `localStorage`
- 手机端汉堡菜单、滚动毛玻璃导航栏、当前区块高亮
- 元素进场动画、返回顶部、一键复制邮箱
- 内容集中在 `js/config.js`，改配置即可更新技能 / 项目 / 经历 / 社交链接

## 目录结构

```
.
├── .nojekyll            # 关闭 Jekyll 处理，保证 Pages 原样发布静态文件
├── index.html           # 首页（静态文案直接改这里）
├── 404.html             # 404 页面
├── css/
│   └── style.css        # 全部样式（浅/深色主题都写在这里）
├── js/
│   ├── config.js        # ★ 站点内容配置：姓名、邮箱、技能、项目、经历、社交链接
│   └── main.js          # 交互逻辑：主题切换、菜单、滚动动画、内容渲染
├── images/
│   ├── avatar.svg       # 占位头像（换成自己的照片见下方说明）
│   └── favicon.svg      # 站点图标
└── README.md
```

## 怎么修改内容

| 想改什么 | 改哪里 |
| --- | --- |
| 姓名、标题、头像、邮箱 | `js/config.js` 顶部的 `title` / `name` / `avatar` / `email` |
| 社交链接（GitHub、邮箱、博客等） | `js/config.js` 的 `social` 数组 |
| 技术栈进度条 | `js/config.js` 的 `skills` 数组（`level` 为 0-100，不写则只显示标签） |
| 项目作品 | `js/config.js` 的 `projects` 数组 |
| 成长记录 | `js/config.js` 的 `timeline` 数组 |
| “关于我”正文等静态文案 | `index.html` |
| 配色、圆角、字号等样式 | `css/style.css` 顶部的 CSS 变量 |

把数组清空（`[]`）时，对应区块会保留 `index.html` 里的默认内容。

### 中英双语怎么写

所有可翻译字段都用 `{ zh: '中文', en: 'English' }` 的形式，
`js/main.js` 会按当前语言自动取值；像 `Python`、`2026` 这种两种语言通用的内容直接写字符串即可。

`index.html` 里的静态文案采用**对照式双语**：中文写在元素里，英文写在 `data-en` 属性里。

```html
<h2 class="section-title" data-en="About">关于我</h2>
```

新增静态文案时记得补上 `data-en`，否则切到英文时会保留中文。
姓名在英文语言下会自动显示 `nameEn`（TanDingYan）。
`localStorage` 键名：`site-lang`（语言）、`site-theme`（主题）。

### 换成自己的头像

1. 把照片放到 `images/` 目录，例如 `images/avatar.jpg`（建议正方形，400×400 左右）
2. 修改 `js/config.js`：`avatar: './images/avatar.jpg'`

### 换成自己的域名（可选）

在仓库根目录新建 `CNAME` 文件，内容写你的域名，例如 `example.com`，
然后在仓库 **Settings → Pages** 里把域名填成 `example.com` 即可。

## 本地预览

直接双击 `index.html` 就能看效果。若想用本地服务器（推荐，行为与线上更接近）：

```bash
# 在仓库根目录执行，任意一种即可
python -m http.server 8080
npx serve .
```

然后浏览器访问 `http://localhost:8080/`。

## 部署到 GitHub Pages

1. 把整个目录推送到 GitHub 仓库 `tandingyan.github.io`（用户站点仓库）。
2. 仓库 **Settings → Pages** → **Source** 选择 `Deploy from a branch`，
   分支选 `main`（或 `master`），目录选 `/ (root)`，保存。
3. 等 1～2 分钟，访问 https://tandingyan.github.io/ 即可看到页面。

仓库根目录的 `.nojekyll` 必须保留，否则 GitHub Pages 会尝试用 Jekyll 解析站点，导致文件路径异常。

## 注意事项

- 所有 CSS / JS / 图片引用、页面跳转一律使用**相对路径**（`./`、`../`），
  不要写成 `/css/style.css` 这种以 `/` 开头的绝对路径，否则在不同部署路径下会 404。