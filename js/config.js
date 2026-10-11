/* ==========================================================================
   站点内容配置（中英对照）
   --------------------------------------------------------------------------
   想修改主页内容，优先只改这个文件即可（js/main.js 会自动渲染）。
   想调整首页的静态文案（如“关于我”正文段落），直接编辑 index.html，
   并记得给对应元素补上 data-en="English text"。

   双语字段约定：
   - 形如 { zh: '中文', en: 'English' } 的对象会自动按当前语言取值；
   - 纯字符串（如语言名称 'Python'、年份 '2026'）两种语言通用，不用翻译；
   - 数组清空 [] 时，对应区块会保留 index.html 里的默认内容。

   注意：所有路径都写相对路径（./），不要改成以 / 开头的绝对路径。
   ========================================================================== */

window.SITE_CONFIG = {
  /* ---------- 基础信息 ---------- */
  // 默认语言：'zh' 或 'en'（用户手动切换后会被记住，默认值只在首次访问时生效）
  lang: 'zh',

  // 站点标题，会自动写入浏览器标签页
  title: { zh: '谭鼎言 · 个人主页', en: 'TanDingYan · Homepage' },

  // 中文名 / 英文名，英文语言下会显示 nameEn
  name: '谭鼎言',
  nameEn: 'TanDingYan',

  // 首屏招呼语与副标题
  greeting: { zh: '你好，我是', en: "Hi, I'm" },
  tagline: {
    zh: '一名热爱开发的程序员，喜欢把想法变成可以直接运行的产品。',
    en: 'A developer who loves turning ideas into things you can actually run.'
  },

  // 头像地址（相对路径）
  avatar: './images/avatar.svg',

  // 邮箱（页面上点击可一键复制）
  email: 'maomao15711478047@88.com',

  /* ---------- “关于我”右侧速览卡片 ---------- */
  aboutFacts: [
    { label: { zh: '坐标', en: 'Location' }, value: { zh: '中国 · 北京', en: 'Beijing, China' } },
    { label: { zh: '身份', en: 'Role' }, value: { zh: '开发者', en: 'Developer' } },
    { label: { zh: '语言', en: 'Languages' }, value: { zh: '中文 / English', en: 'Chinese / English' } },
    { label: { zh: '当前状态', en: 'Status' }, value: { zh: '开发中', en: 'Developing' } }
  ],

  /* ---------- “关于我”下方的小标签 ---------- */
  aboutTags: [
    { zh: '开源爱好者', en: 'Open Source' },
    { zh: '系统与底层', en: 'Systems & Low-level' },
    { zh: '插件开发', en: 'Plugin Dev' },
    { zh: '前端折腾', en: 'Front-end' }
  ],

  /* ---------- 社交链接 ---------- */
  // name: 显示文字；icon: 内联 SVG（描边风格，24x24）；url: 链接地址
  social: [
    {
      name: { zh: 'GitHub', en: 'GitHub' },
      url: 'https://github.com/tandingyan',
      icon: '<path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />'
    },
    {
      name: { zh: '邮箱', en: 'Email' },
      url: 'mailto:maomao15711478047@88.com',
      icon: '<rect x="3" y="5" width="18" height="14" rx="2.5" /><path d="M3.5 6.5l8.5 6 8.5-6" />'
    },
    {
      // 个人博客就是这个站点本身
      name: { zh: '个人博客', en: 'Blog' },
      url: 'https://tandingyan.github.io/',
      icon: '<path d="M4 5.5A2.5 2.5 0 016.5 3H19v18H6.5A2.5 2.5 0 004 18.5z" /><path d="M4 17.5h15M8 7.5h7" />'
    }
  ],

  /* ---------- 技术栈 ---------- */
  // level: 0-100 的熟练度，会渲染成进度条；不写 level 则不显示进度条
  skills: [
    {
      name: 'Python',
      level: 88,
      note: { zh: '脚本、自动化、数据处理。', en: 'Scripting, automation and data wrangling.' }
    },
    {
      name: 'C++',
      level: 82,
      note: { zh: '算法、图形与性能相关。', en: 'Algorithms, graphics and performance work.' }
    },
    {
      name: 'Vibe Coding',
      level: 80,
      note: { zh: '用自然语言和AI 协作写代码，边聊边做。', en: 'Driving collaboration with AI in natural language — talk it through and build it.' }
    },
    {
      name: 'Java / Kotlin',
      level: 70,
      note: { zh: '服务端开发、插件开发、桌面工具。', en: 'Server-side development, plugins and desktop tools.' }
    },
    {
      name: 'HTML / CSS / JavaScript',
      level: 65,
      note: { zh: '静态站点、小工具、前端页面。', en: 'Static sites, small tools and front-end pages.' }
    },
    {
      name: 'Git & Linux',
      level: 60,
      note: { zh: '日常开发流程与环境配置。', en: 'Daily workflow and environment setup.' }
    },
    {
      name: 'Database',
      level: 50,
      note: { zh: 'MySQL、SQLite 等。', en: 'MySQL, SQLite and friends.' }
    }
  ],

  /* ---------- 项目作品 ---------- */
  // icon: 一个 emoji 或文字（显示在卡片左上角的方块里）
  projects: [
    {
      title: 'BeaconGame',
      desc: {
        zh: '一个 Minecraft 服务端插件，提供小游戏与自定义玩法，把想法做成了能和朋友一起玩的项目。',
        en: 'A Minecraft server-side plugin with mini-games and custom gameplay — an idea that became something you can actually play with friends.'
      },
      icon: '🎮',
      tags: ['Java', 'Minecraft', 'Gradle'],
      // url: 点击整张卡片跳转的地址（Modrinth 插件页）；不写则卡片不可点击
      url: 'https://modrinth.com/plugin/beacongame/',
      // links: 卡片内的补充链接，显示在卡片底部
      links: [{ label: { zh: '源码', en: 'Source' }, url: 'https://github.com/tandingyan/BeaconGame' }]
    },
    {
      title: 'BeaconGame Wiki',
      desc: {
        zh: '配套的静态 Wiki 站点，纯 HTML/CSS/JS 编写，部署在 GitHub Pages 上。',
        en: 'The companion static wiki site — plain HTML/CSS/JS, deployed on GitHub Pages.'
      },
      icon: '📖',
      tags: ['JavaScript', 'GitHub Pages'],
      url: 'https://tandingyan.github.io/BeaconGameWiki/',
      links: [{ label: { zh: '源码', en: 'Source' }, url: 'https://github.com/tandingyan/BeaconGameWiki' }]
    },
    {
      title: { zh: '个人主页', en: 'Personal Homepage' },
      desc: {
        zh: '就是你现在看到的这个站点：零依赖、无构建步骤，改完内容直接推送到 GitHub 就上线。',
        en: 'The site you are looking at: zero dependencies, no build step — edit the content, push to GitHub, and it goes live.'
      },
      icon: '🧩',
      tags: ['HTML', 'CSS', 'JavaScript'],
      url: 'https://tandingyan.github.io/',
      links: [{ label: { zh: '源码', en: 'Source' }, url: 'https://github.com/tandingyan/tandingyan.github.io' }]
    }
  ],

  /* ---------- 成长记录 ---------- */
  // 按时间倒序排列（最新的在最上面）
  timeline: [
    {
      period: { zh: '2026 — 至今', en: '2026 — Present' },
      title: { zh: '把项目做出来', en: 'Building projects' },
      org: { zh: '个人开发', en: 'Solo projects' },
      desc: {
        zh: '一边学习一边做自己的项目，尝试把想法真正落地，并且能一直维护下去。',
        en: 'Learning by building — turning my own ideas into real projects, and keeping them alive.'
      }
    },
    {
      period: '2026',
      title: { zh: '开始接触服务端开发', en: 'Getting into server-side development' },
      org: { zh: '兴趣起步', en: 'Getting started' },
      desc: {
        zh: '从写第一个 Java 程序开始，接触到了插件开发和服务器运维。',
        en: 'Started with a first Java program, and drifted into plugin development and server operations.'
      }
    },
    {
      period: '2021',
      title: { zh: '第一行代码', en: 'The first line of code' },
      org: { zh: '起点', en: 'The beginning' },
      desc: {
        zh: '因为好奇点开了编程教程，从此开始了自己的折腾之路。',
        en: 'Clicked into a programming tutorial out of curiosity — and never really stopped.'
      }
    }
  ]
};