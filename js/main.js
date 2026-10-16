/* ==========================================================================
   主页交互脚本
   --------------------------------------------------------------------------
   功能：
   1. 中英双语：读取 SITE_CONFIG 填充页面，按语言渲染 / 切换（localStorage 记忆）
   2. 深色 / 浅色主题切换（localStorage 记忆，键名 site-theme）
   3. 手机端汉堡菜单
   4. 导航栏滚动毛玻璃 + 当前区块高亮
   5. 元素进场动画（IntersectionObserver）
   6. 返回顶部、复制邮箱、页脚年份

   双语实现方式：
   - index.html 里中文写在元素内容中、英文写在 data-en 属性中；
     首次运行时把中文原文缓存到 data-zh，之后来回切换只替换 textContent。
   - js/config.js 里的 { zh, en } 对象按当前语言取值。
   ========================================================================== */

(function () {
  'use strict';

  /* ---------------- 全局状态 ---------------- */

  /** 读取站点配置，config.js 未加载时退化为空对象，保证脚本不报错 */
  var config = window.SITE_CONFIG || {};

  /** 当前语言：'zh' | 'en' */
  var state = { lang: 'zh' };

  /* ---------------- 工具函数 ---------------- */

  /** 按当前语言取值：对象取对应语言（缺省回退），字符串原样返回 */
  function t(value) {
    if (value == null) return '';
    if (typeof value === 'string') return value;
    return value[state.lang] || value.zh || value.en || '';
  }

  /** 把配置项写进所有带 data-config="xxx" 的元素 */
  function bindConfig(key, value) {
    if (value == null) return;
    var text = t(value);
    var nodes = document.querySelectorAll('[data-config="' + key + '"]');
    for (var i = 0; i < nodes.length; i++) {
      nodes[i].textContent = text;
    }
  }

  /** 用给定数组替换容器的全部子元素 */
  function render(container, items, factory) {
    if (!container || !items || !items.length) return;
    container.innerHTML = '';
    for (var i = 0; i < items.length; i++) {
      container.appendChild(factory(items[i], i));
    }
  }

  /** 弹出一条轻提示（文案随语言变化） */
  var toastTimer = null;
  function showToast(message) {
    var toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      toast.classList.remove('is-visible');
    }, 2000);
  }

  /* ---------------- 1. 语言切换 ---------------- */

  /** 切换所有带 data-en 的静态文案 */
  function applyStaticLang() {
    var nodes = document.querySelectorAll('[data-en]');
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      // 首次运行时把页面里的中文原文缓存下来，切回中文时用它还原
      if (!node.dataset.zh) node.dataset.zh = node.textContent;
      node.textContent = state.lang === 'en' ? node.dataset.en : node.dataset.zh;
    }
  }

  /** 更新语言按钮上的文字：显示“将切换到的语言” */
  function syncLangButton() {
    var label = document.getElementById('langLabel');
    if (label) label.textContent = state.lang === 'en' ? '中' : 'EN';
  }

  /** 应用指定语言：更新 <html> 属性、静态文案、动态内容 */
  function setLang(lang) {
    state.lang = (lang === 'en') ? 'en' : 'zh';

    var root = document.documentElement;
    root.dataset.lang = state.lang;
    root.lang = state.lang === 'en' ? 'en' : 'zh-CN';

    try {
      localStorage.setItem('site-lang', state.lang);   // 记住用户选择
    } catch (e) {
      /* 隐私模式下写入失败可忽略 */
    }

    applyStaticLang();     // 先替换静态文案
    fillContent();         // 再按新语言重新渲染动态内容
    observeReveal();       // 新生成的卡片继续走进场动画
    if (repickQuote) repickQuote();   // 语录同步切换语言
    syncLangButton();
  }

  function initLang() {
    var saved = null;
    try {
      saved = localStorage.getItem('site-lang');
    } catch (e) { /* 忽略 */ }

    // 优先级：用户上次选择 > config 默认语言
    var initial = saved || config.lang || 'zh';
    setLang(initial);

    var toggle = document.getElementById('langToggle');
    if (toggle) {
      toggle.addEventListener('click', function () {
        setLang(state.lang === 'en' ? 'zh' : 'en');
      });
    }
  }

  /* ---------------- 2. 填充页面内容 ---------------- */

  /** 生成一个 <li class="social-item"> 元素 */
  function createSocialItem(item) {
    var li = document.createElement('li');
    li.className = 'social-item';

    var a = document.createElement('a');
    a.href = item.url;
    a.textContent = t(item.name);
    // 外链加安全属性，邮箱链接保持默认行为
    if (!/^mailto:/.test(item.url)) {
      a.target = '_blank';
      a.rel = 'noopener noreferrer';
    }

    if (item.icon) {
      var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
      svg.setAttribute('class', 'icon');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = item.icon;      // 内容来自本地 config.js，非外部输入
      a.appendChild(svg);
    }

    li.appendChild(a);
    return li;
  }

  /** 创建一个小标签（tags 元素可以是字符串，也可以是 { zh, en }） */
  function createTag(tag) {
    var span = document.createElement('span');
    span.className = 'tag';
    span.textContent = t(tag);
    return span;
  }

  function fillContent() {
    // 页面标题
    var title = t(config.title);
    if (title) document.title = title;

    // 姓名：英文语言下显示拉丁写法
    var name = state.lang === 'en' ? (config.nameEn || config.name) : config.name;
    bindConfig('name', name);
    bindConfig('greeting', config.greeting);
    bindConfig('tagline', config.tagline);

    // 头像
    var avatar = document.getElementById('avatarImg');
    if (avatar && config.avatar) {
      avatar.src = config.avatar;
      avatar.alt = (name || '头像') + ' 的头像';
    }

    // 社交链接（首屏 + 联系区块两处）
    if (config.social && config.social.length) {
      var heroList = document.getElementById('socialList');
      var footerList = document.getElementById('socialListFooter');
      if (heroList) render(heroList, config.social, createSocialItem);
      if (footerList) render(footerList, config.social, createSocialItem);
    }

    // 邮箱
    var emailText = document.getElementById('emailText');
    if (emailText && config.email) emailText.textContent = config.email;

    // “关于我”小标签
    var tagsBox = document.getElementById('aboutTags');
    if (tagsBox && config.aboutTags && config.aboutTags.length) {
      tagsBox.innerHTML = '';
      for (var i = 0; i < config.aboutTags.length; i++) {
        tagsBox.appendChild(createTag(config.aboutTags[i]));
      }
    }

    // “关于我”速览卡片
    var factCard = document.getElementById('factCard');
    if (factCard && config.aboutFacts && config.aboutFacts.length) {
      factCard.innerHTML = '';
      config.aboutFacts.forEach(function (fact) {
        var row = document.createElement('div');
        row.className = 'fact-row';

        var label = document.createElement('span');
        label.className = 'fact-label';
        label.textContent = t(fact.label);

        var value = document.createElement('span');
        value.className = 'fact-value';
        // value 允许一小段 HTML（例如“在线状态”绿点）
        if (/<[a-z]/i.test(String(fact.value))) {
          value.innerHTML = t(fact.value);
        } else {
          value.textContent = t(fact.value);
        }

        row.appendChild(label);
        row.appendChild(value);
        factCard.appendChild(row);
      });
    }

    // 技术栈卡片
    render(document.getElementById('skillsList'), config.skills, function (skill) {
      var card = document.createElement('div');
      card.className = 'skill-card reveal';

      var head = document.createElement('div');
      head.className = 'skill-head';
      var skillName = document.createElement('h3');
      skillName.className = 'skill-name';
      skillName.textContent = t(skill.name);
      head.appendChild(skillName);

      if (typeof skill.level === 'number') {
        var value = document.createElement('span');
        value.className = 'skill-value';
        value.textContent = skill.level + '%';
        head.appendChild(value);
      }
      card.appendChild(head);

      if (typeof skill.level === 'number') {
        var bar = document.createElement('div');
        bar.className = 'skill-bar';
        var fill = document.createElement('i');
        // 用 CSS 变量传值，避免拼接内联 style 字符串
        fill.style.setProperty('--value', skill.level + '%');
        bar.appendChild(fill);
        card.appendChild(bar);
      }

      if (skill.note) {
        var note = document.createElement('p');
        note.className = 'skill-note';
        note.textContent = t(skill.note);
        card.appendChild(note);
      }

      if (skill.tags && skill.tags.length) {
        var tagBox = document.createElement('div');
        tagBox.className = 'project-tags';
        skill.tags.forEach(function (tag) { tagBox.appendChild(createTag(tag)); });
        card.appendChild(tagBox);
      }

      return card;
    });

    // 项目卡片
    render(document.getElementById('projectsList'), config.projects, function (project) {
      var card = document.createElement('article');
      card.className = 'project-card reveal';

      if (project.icon) {
        var icon = document.createElement('div');
        icon.className = 'project-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.textContent = project.icon;
        card.appendChild(icon);
      }

      var projectTitle = document.createElement('h3');
      projectTitle.className = 'project-title';
      projectTitle.textContent = t(project.title);
      card.appendChild(projectTitle);

      var desc = document.createElement('p');
      desc.className = 'project-desc';
      desc.textContent = t(project.desc);
      card.appendChild(desc);

      if (project.tags && project.tags.length) {
        var tags = document.createElement('div');
        tags.className = 'project-tags';
        project.tags.forEach(function (tag) { tags.appendChild(createTag(tag)); });
        card.appendChild(tags);
      }

      if (project.links && project.links.length) {
        var links = document.createElement('div');
        links.className = 'project-links';
        project.links.forEach(function (link) {
          var a = document.createElement('a');
          a.href = link.url;
          a.textContent = t(link.label);
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          links.appendChild(a);
        });
        card.appendChild(links);
      }

      // 记录标签，供项目筛选使用（空格分隔写进 data-tags）
      if (project.tags && project.tags.length) {
        card.dataset.tags = project.tags.join(' ');
      }

      // 整张卡片可点击：盖一层透明链接在卡片上（卡片内的补充链接 z-index 更高，仍可单独点击）
      if (project.url) {
        card.classList.add('is-clickable');
        var overlay = document.createElement('a');
        overlay.className = 'project-card-link';
        overlay.href = project.url;
        overlay.target = '_blank';
        overlay.rel = 'noopener noreferrer';
        overlay.setAttribute('aria-label',
          t({ zh: '打开项目：', en: 'Open project: ' }) + t(project.title));
        card.appendChild(overlay);
      }

      return card;
    });

    // 成长记录
    render(document.getElementById('timelineList'), config.timeline, function (item) {
      var li = document.createElement('li');
      li.className = 'timeline-item reveal';

      var marker = document.createElement('div');
      marker.className = 'timeline-marker';
      marker.setAttribute('aria-hidden', 'true');
      li.appendChild(marker);

      var body = document.createElement('div');
      body.className = 'timeline-body';

      if (item.period) {
        var period = document.createElement('span');
        period.className = 'timeline-period';
        period.textContent = t(item.period);
        body.appendChild(period);
      }

      var timelineTitle = document.createElement('h3');
      timelineTitle.className = 'timeline-title';
      timelineTitle.textContent = t(item.title);
      body.appendChild(timelineTitle);

      if (item.org) {
        var org = document.createElement('p');
        org.className = 'timeline-desc';
        org.textContent = t(item.org);
        body.appendChild(org);
      }

      var timelineDesc = document.createElement('p');
      timelineDesc.className = 'timeline-desc';
      timelineDesc.textContent = t(item.desc);
      body.appendChild(timelineDesc);

      li.appendChild(body);
      return li;
    });

    // 语言切换后会重建卡片，重新生成筛选栏与打字机（避免旧定时器/旧标签残留）
    buildProjectFilter();
    startTypewriter();
  }

  /* ---------------- 2.5 趣味互动功能 ---------------- */

  /** 首屏打字机：循环展示 taglines，逐字出现并带回退效果 */
  var typeTimer = null;
  function startTypewriter() {
    var el = document.getElementById('heroSubtitle');
    if (!el) return;

    var list = (config.taglines || []).map(t).filter(Boolean);
    if (!list.length) return;

    // 尊重“减少动态效果”：直接显示首条，不做动画
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      clearTimeout(typeTimer);
      el.textContent = list[0];
      el.classList.remove('typing');
      return;
    }

    clearTimeout(typeTimer);
    el.classList.add('typing');

    var idx = 0, pos = 0, deleting = false;

    function tick() {
      var full = list[idx];
      if (!deleting) {
        pos++;
        el.textContent = full.slice(0, pos);
        if (pos >= full.length) {
          deleting = true;
          typeTimer = setTimeout(tick, 1700);          // 完整展示后停顿一下
        } else {
          typeTimer = setTimeout(tick, 55 + Math.random() * 45);
        }
      } else {
        pos--;
        el.textContent = full.slice(0, pos);
        if (pos <= 0) {
          deleting = false;
          idx = (idx + 1) % list.length;               // 换下一句
          typeTimer = setTimeout(tick, 350);
        } else {
          typeTimer = setTimeout(tick, 30);
        }
      }
    }
    tick();
  }

  /** 实时时钟：显示北京（Asia/Shanghai）当前时间 + 白天/夜晚图标 */
  function initClock() {
    var el = document.getElementById('heroClock');
    if (!el) return;

    var zoneLabel = { zh: '北京', en: 'Beijing' };

    function update() {
      var parts = new Intl.DateTimeFormat('zh-CN', {
        hour: '2-digit', minute: '2-digit', second: '2-digit',
        hour12: false, timeZone: 'Asia/Shanghai'
      }).format(new Date());

      // 取“时”判断白天/夜晚（北京时间）
      var hour = parseInt(parts.slice(0, 2), 10) || 0;
      var isDay = hour >= 6 && hour < 18;
      var icon = isDay ? '☀️' : '🌙';

      el.innerHTML =
        icon + ' <span class="clock-zone">' + t(zoneLabel) + '</span>' +
        ' <span class="clock-time">' + parts + '</span>';
    }

    update();
    setInterval(update, 1000);
  }

  /** 今日一句：随机展示一条语录，点击按钮换一条 */
  function initQuote() {
    var text = document.getElementById('quoteText');
    var btn = document.getElementById('quoteShuffle');
    var list = (config.quotes || []).map(t).filter(Boolean);
    if (!text || !list.length) return;

    var lastIndex = -1;
    function pick() {
      var i;
      do { i = Math.floor(Math.random() * list.length); }
      while (i === lastIndex && list.length > 1);   // 避免连续重复
      lastIndex = i;
      text.textContent = list[i];
      // 轻微淡入
      text.style.opacity = '0';
      requestAnimationFrame(function () {
        text.style.transition = 'opacity 0.35s ease';
        text.style.opacity = '1';
      });
    }

    pick();
    if (btn) btn.addEventListener('click', pick);

    // 语言切换后，语录也要换成对应语言
    return pick;
  }

  /** 项目标签筛选：根据项目标签生成筛选条，点击后过滤卡片 */
  function buildProjectFilter() {
    var bar = document.getElementById('filterBar');
    var grid = document.getElementById('projectsList');
    if (!bar || !grid) return;

    // 收集所有标签（去重，保持出现顺序）
    var tags = [];
    var seen = {};
    (config.projects || []).forEach(function (p) {
      (p.tags || []).forEach(function (tag) {
        var key = t(tag);            // 标签也可能双语
        if (!seen[key]) { seen[key] = true; tags.push(key); }
      });
    });

    bar.innerHTML = '';
    var allChip = makeChip({ zh: '全部', en: 'All' }, true);
    bar.appendChild(allChip);

    var cards = grid.querySelectorAll('.project-card');

    function applyFilter(activeTag) {
      // 更新按钮高亮
      var chips = bar.querySelectorAll('.filter-chip');
      for (var c = 0; c < chips.length; c++) {
        chips[c].classList.toggle('is-active', chips[c].dataset.tag === activeTag);
      }
      // 过滤卡片
      for (var i = 0; i < cards.length; i++) {
        var cardTags = (cards[i].dataset.tags || '').split(' ');
        var show = !activeTag || cardTags.indexOf(activeTag) !== -1;
        cards[i].classList.toggle('is-hidden', !show);
      }
    }

    allChip.addEventListener('click', function () { applyFilter(''); });

    tags.forEach(function (tag) {
      var chip = makeChip(tag, false);
      chip.dataset.tag = tag;
      chip.addEventListener('click', function () { applyFilter(tag); });
      bar.appendChild(chip);
    });

    applyFilter('');

    function makeChip(label, active) {
      var chip = document.createElement('button');
      chip.type = 'button';
      chip.className = 'filter-chip' + (active ? ' is-active' : '');
      chip.textContent = t(label);
      return chip;
    }
  }

  /** 点击头像打招呼：挥手动画 + 冒出表情 */
  function initAvatarWave() {
    var frame = document.getElementById('avatarFrame');
    if (!frame) return;

    function wave() {
      frame.classList.remove('is-waving');
      // 强制重排以便重新触发动画
      void frame.offsetWidth;
      frame.classList.add('is-waving');

      var pop = document.createElement('span');
      pop.className = 'wave-pop';
      pop.textContent = '👋';
      frame.appendChild(pop);
      setTimeout(function () {
        if (pop.parentNode) pop.parentNode.removeChild(pop);
      }, 1200);
    }

    frame.addEventListener('click', wave);
    frame.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); wave(); }
    });
  }

  /* ---------------- 3. 主题切换 ---------------- */
  function initTheme() {
    var toggle = document.getElementById('themeToggle');
    if (!toggle) return;

    // 同步按钮的 aria-label 与当前状态
    function syncLabel() {
      var isDark = document.documentElement.dataset.theme === 'dark';
      toggle.setAttribute('aria-label', isDark ? '切换浅色模式' : '切换深色模式');
    }
    syncLabel();

    toggle.addEventListener('click', function () {
      var next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      document.documentElement.dataset.theme = next;
      try {
        localStorage.setItem('site-theme', next);     // 记住用户选择
      } catch (e) {
        /* 隐私模式下写入失败可忽略 */
      }
      syncLabel();
    });

    // 用户未手动选择过时，跟随系统主题变化
    var media = window.matchMedia('(prefers-color-scheme: dark)');
    var onChange = function (e) {
      var saved = null;
      try {
        saved = localStorage.getItem('site-theme');
      } catch (err) { /* 忽略 */ }
      if (!saved) {
        document.documentElement.dataset.theme = e.matches ? 'dark' : 'light';
        syncLabel();
      }
    };
    if (media.addEventListener) {
      media.addEventListener('change', onChange);
    } else if (media.addListener) {
      media.addListener(onChange);                   // 兼容旧版浏览器
    }
  }

  /* ---------------- 4. 手机端菜单 ---------------- */
  function initMobileNav() {
    var toggle = document.getElementById('navToggle');
    var menu = document.getElementById('navMenu');
    if (!toggle || !menu) return;

    function close() {
      menu.classList.remove('is-open');
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', '打开菜单');
    }

    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? '关闭菜单' : '打开菜单');
    });

    // 点击菜单项后自动收起
    menu.addEventListener('click', function (e) {
      if (e.target.closest('a')) close();
    });

    // 点击页面其他地方 / Esc 关闭
    document.addEventListener('click', function (e) {
      if (!menu.contains(e.target) && !toggle.contains(e.target)) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    // 窗口放大到桌面尺寸时复位
    window.addEventListener('resize', function () {
      if (window.innerWidth > 720) close();
    });
  }

  /* ---------------- 5. 导航栏滚动效果 + 区块高亮 ---------------- */
  function initScrollSpy() {
    var header = document.getElementById('siteHeader');
    var toTop = document.getElementById('toTop');
    var navLinks = Array.prototype.slice.call(document.querySelectorAll('.nav-link'));
    var sections = navLinks
      .map(function (link) {
        var id = link.getAttribute('href');
        return id && id.charAt(0) === '#' ? document.querySelector(id) : null;
      })
      .filter(Boolean);

    // 滚动：更新导航栏背景、返回顶部按钮与顶部阅读进度条
    var progress = document.getElementById('scrollProgress');
    function onScroll() {
      var y = window.pageYOffset || document.documentElement.scrollTop;
      var doc = document.documentElement;
      var max = (doc.scrollHeight - doc.clientHeight) || 1;
      if (header) header.classList.toggle('is-scrolled', y > 12);
      if (toTop) toTop.classList.toggle('is-visible', y > 500);
      if (progress) progress.style.width = Math.min(100, (y / max) * 100) + '%';
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // 当前区块高亮：观察每个区块进入视口的位置
    if ('IntersectionObserver' in window && sections.length) {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var id = '#' + entry.target.id;
          navLinks.forEach(function (link) {
            link.classList.toggle('is-active', link.getAttribute('href') === id);
          });
        });
      }, {
        rootMargin: '-45% 0px -50% 0px',   // 以视口中部为判定线，避免边界抖动
        threshold: 0
      });
      sections.forEach(function (section) { observer.observe(section); });
    }

    // 返回顶部
    if (toTop) {
      toTop.addEventListener('click', function () {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }
  }

  /* ---------------- 6. 进场动画 ---------------- */

  // 复用一个观察器：元素进入视口后加上 .is-visible，并取消观察
  var revealObserver = 'IntersectionObserver' in window
    ? new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          // 同级元素依次延迟出现
          var delay = parseInt(entry.target.dataset.revealDelay || '0', 10);
          setTimeout(function () {
            entry.target.classList.add('is-visible');
          }, delay);
          revealObserver.unobserve(entry.target);
        });
      }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })
    : null;

  /**
   * 收集所有“还没出现”的 .reveal 元素并开始观察
   * 语言切换会重建列表卡片，所以切换后要再调用一次
   */
  function observeReveal() {
    var targets = document.querySelectorAll('.reveal:not(.is-visible)');

    // 浏览器不支持 IntersectionObserver 时直接全部显示，保证内容可读
    if (!revealObserver) {
      for (var i = 0; i < targets.length; i++) targets[i].classList.add('is-visible');
      return;
    }

    for (var j = 0; j < targets.length; j++) {
      var el = targets[j];
      // 同级元素按顺序递增延迟，形成错落感
      if (!el.dataset.revealDelay) {
        el.dataset.revealDelay = String(Math.min(j % 4, 3) * 70);
      }
      revealObserver.observe(el);
    }
  }

  /* ---------------- 7. 复制邮箱 + 年份 ---------------- */
  function initMisc() {
    var copyBtn = document.getElementById('copyEmail');
    if (copyBtn && config.email) {
      copyBtn.addEventListener('click', function () {
        var email = config.email;
        var copied = { zh: '邮箱已复制：', en: 'Email copied: ' };

        // 优先用剪贴板 API；不可用时退回 execCommand
        if (navigator.clipboard && window.isSecureContext) {
          navigator.clipboard.writeText(email).then(function () {
            showToast(t(copied) + email);
          }).catch(function () {
            fallbackCopy(email, t(copied));
          });
        } else {
          fallbackCopy(email, t(copied));
        }
      });

      function fallbackCopy(text, prefix) {
        var input = document.createElement('input');
        input.value = text;
        input.style.position = 'fixed';
        input.style.opacity = '0';
        document.body.appendChild(input);
        input.select();
        try {
          document.execCommand('copy');
          showToast(prefix + text);
        } catch (e) {
          showToast(text);
        }
        document.body.removeChild(input);
      }
    }

    // 页脚年份自动更新
    var year = document.getElementById('currentYear');
    if (year) year.textContent = new Date().getFullYear();
  }

  /* ---------------- 启动 ---------------- */
  var repickQuote = null;   // 语言切换时用来刷新“今日一句”的回调

  function init() {
    initLang();        // 内部会调用 fillContent() 渲染当前语言
    initTheme();
    initMobileNav();
    initScrollSpy();
    initClock();          // 实时时钟
    initAvatarWave();     // 头像打招呼
    repickQuote = initQuote();   // 今日一句（返回换句回调，供语言切换使用）
    observeReveal();     // 收集进场动画节点（切换语言时由 setLang 再次调用）
    initMisc();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();