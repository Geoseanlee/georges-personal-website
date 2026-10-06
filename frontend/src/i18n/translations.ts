import type { Project } from '../types/project'

export type Locale = 'en' | 'zh-Hans' | 'zh-Hant'

const en = {
  common: {
    pageTitle: 'George Li — Technology, care & curiosity',
    pageDescription:
      'Meet George: a nursing student with a computer science background, based on the Gold Coast, Australia.',
    skipLink: 'Skip to content',
    home: 'George Li, home',
    mainNavigation: 'Main navigation',
    openNavigation: 'Open navigation',
    closeNavigation: 'Close navigation',
    language: 'Language',
    switchToLight: 'Switch to light mode',
    switchToDark: 'Switch to dark mode',
    about: 'About',
    work: 'Work',
    journey: 'Journey',
    contact: 'Contact',
    sayHello: 'Say hello',
    location: 'Location: Gold Coast, Australia',
    socialProfiles: 'Social profiles',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    github: 'GitHub',
    backToTop: 'Back to top',
    technologies: 'Technologies',
    viewProject: 'View {title} on GitHub',
  },
  hero: {
    location: 'Gold Coast, Australia · Taiwan to Australia',
    headlineStart: 'A life between',
    headlineAccent: 'code & care.',
    introduction:
      "I'm George — a nursing student with a computer science background. I'm drawn to work that makes everyday life a little more thoughtful, useful, and human.",
    exploreWork: 'Explore my work',
    getInTouch: 'Get in touch',
    portraitAlt: 'George Li sitting by a cafe window',
    portraitUnavailable: 'George Li portrait unavailable',
    caption: 'George Li · Gold Coast, Australia',
  },
  about: {
    tag: 'The person',
    heading: 'Different paths. One human focus.',
    paragraphs: [
      'I grew up in Wenzhou, Zhejiang, China, and completed Year 12 in June 2019. I then spent four years studying economics at Soochow University in Taipei, graduating in July 2023.',
      'I moved to Sydney in February 2024 to study computer science at the University of Sydney, completing a Master of Computer Science in December 2025. In August 2026, I began a Master of Nursing at Southern Cross University on the Gold Coast.',
      'Today, I bring a builder’s curiosity and a calm, attentive approach to study, support work, and dog grooming.',
    ],
    faithTitle: 'Faith in community',
    faithText:
      'I am a Christian. During my two years in Sydney, I took part in the Evangelical Union and a Mandarin Bible Study.',
    cyclingTitle: 'Outside the classroom',
    cyclingText: 'I enjoy cycling. A ride is one of my favourite ways to slow down and explore.',
    cyclingPlaceholder: 'Cycling photo placeholder',
    cyclingAlt: 'Illustrated bicycle placeholder for a future cycling photograph',
    taipeiTitle: 'A chapter in Taipei',
    taipeiText: 'Four years studying in Taipei became an important chapter in my journey.',
    taipeiPlaceholder: 'Taipei photo placeholder',
    taipeiAlt: 'Illustrated Taipei skyline placeholder for a future photograph',
    replaceImage: 'Replace this illustration with a personal photo when ready.',
    languages: 'Languages',
    proficiency: {
      native: 'Native',
      fluent: 'Fluent',
      learning: 'Learning',
    },
    languageList: [
      { name: 'Mandarin', level: 'native' },
      { name: 'English', level: 'fluent' },
      { name: 'Japanese', level: 'learning' },
      { name: 'German', level: 'learning' },
    ],
  },
  work: {
    heading: "Things I've helped bring to life.",
    introduction:
      "Somewhere between a useful tool and a meaningful experience, there's a good project.",
    unavailable: 'Could not load projects right now.',
    checkBack: 'Check back soon, or',
    browseGithub: 'browse GitHub directly',
    more: 'More on GitHub',
    projectTypes: {
      'blotz-task-app': 'FULL-STACK · 2025',
      renopilot: 'FULL-STACK · 2025',
      'global-youth-sdgs-summit': 'WEB · 2025',
      'ai-health-management': 'AI · 2024',
    },
    visualLabels: {
      'blotz-task-app': 'Product & Mobile',
      renopilot: 'Web Platform',
      'global-youth-sdgs-summit': 'Community & Content',
      'ai-health-management': 'Digital Health',
    },
    projects: {
      'blotz-task-app': {
        title: 'Blotz Task App',
        description:
          'A task management app pairing a .NET API and SQL Server backend with a React Native mobile experience, featuring AI-powered task suggestions.',
      },
      renopilot: {
        title: 'RenoPilot',
        description:
          'A renovation project management platform helping homeowners track tasks, budgets, and contractors in one place.',
      },
      'global-youth-sdgs-summit': {
        title: 'Global Youth SDGs Summit',
        description:
          'The official website for an international summit connecting young people committed to the UN Sustainable Development Goals.',
      },
      'ai-health-management': {
        title: 'AI Health Management',
        description:
          'An AI-assisted health management system that analyses patient data and offers personalised wellness recommendations.',
      },
    },
  },
  journey: {
    tag: 'The journey so far',
    heading: 'Still becoming.',
    current: 'Current',
    events: [
      {
        date: 'June 2019',
        title: 'Completed Year 12',
        place: 'Wenzhou, Zhejiang',
        detail: 'I grew up in Wenzhou and completed secondary school there.',
      },
      {
        date: '2019 — July 2023',
        title: 'Bachelor of Arts, Economics',
        place: 'Soochow University · Taipei, Taiwan',
        detail: 'Four years studying economics; graduated with High Distinction in July 2023.',
      },
      {
        date: 'February 2024',
        title: 'A new chapter in Sydney',
        place: 'Sydney, Australia',
        detail: 'I moved to Sydney to continue my studies.',
      },
      {
        date: '2024 — 2025',
        title: 'Master of Computer Science',
        place: 'The University of Sydney',
        detail: 'Completed my degree with Distinction in December 2025.',
      },
      {
        date: 'August 2026',
        title: 'Master of Nursing',
        place: 'Southern Cross University · Gold Coast',
        detail: 'I began nursing studies and a new chapter in care.',
      },
    ],
    workTitle: 'People and animals',
    workDetail: 'Support worker and dog groomer · Gold Coast',
  },
  contact: {
    tag: 'Your turn',
    heading: 'Something on your mind?',
    introduction:
      'Always open to a good conversation — about tech, care, or anything in between.',
    writeNote: 'Write me a note',
  },
  footer: {
    madeWithCare: 'Made with care, on the lands of the Yugambeh people.',
    copyright: '© {year} George Li',
  },
} as const

type Widen<T> = T extends string
  ? string
  : T extends readonly (infer U)[]
    ? readonly Widen<U>[]
    : T extends object
      ? { readonly [K in keyof T]: Widen<T[K]> }
      : T

export type Messages = Widen<typeof en>

const zhHans = {
  common: {
    pageTitle: 'George Li — 科技、关怀与好奇心',
    pageDescription: '认识 George：一位拥有计算机科学背景、现居澳大利亚黄金海岸的护理硕士生。',
    skipLink: '跳转到正文',
    home: 'George Li，首页',
    mainNavigation: '主导航',
    openNavigation: '打开导航',
    closeNavigation: '关闭导航',
    language: '语言',
    switchToLight: '切换到白天模式',
    switchToDark: '切换到夜间模式',
    about: '关于我',
    work: '作品',
    journey: '经历',
    contact: '联系',
    sayHello: '打个招呼',
    location: '所在地：澳大利亚黄金海岸',
    socialProfiles: '社交主页',
    linkedin: '领英',
    instagram: 'Instagram',
    github: 'GitHub',
    backToTop: '返回顶部',
    technologies: '技术栈',
    viewProject: '在 GitHub 查看 {title}',
  },
  hero: {
    location: '澳大利亚黄金海岸 · 从台湾到澳大利亚',
    headlineStart: '在代码与关怀之间，',
    headlineAccent: '继续探索。',
    introduction:
      '我是 George，一名拥有计算机科学背景的护理硕士生。我希望所做的事能让日常生活更周到、更实用，也更有人情味。',
    exploreWork: '看看我的作品',
    getInTouch: '联系我',
    portraitAlt: 'George Li 坐在咖啡馆窗边',
    portraitUnavailable: 'George Li 的肖像暂不可用',
    caption: 'George Li · 澳大利亚黄金海岸',
  },
  about: {
    tag: '认识我',
    heading: '走过不同道路，始终关心人。',
    paragraphs: [
      '我在中国浙江温州长大，并于 2019 年 6 月完成高中十二年级。之后，我在台湾台北的东吴大学读了四年经济学，并于 2023 年 7 月毕业。',
      '我于 2024 年 2 月搬到悉尼，在悉尼大学学习计算机科学，并于 2025 年 12 月完成计算机科学硕士学位。2026 年 8 月，我开始在黄金海岸的南十字星大学攻读护理硕士。',
      '如今，我带着对创造的好奇，以及平静、细心的态度投入学习、支持工作和宠物美容。',
    ],
    faithTitle: '在群体中实践信仰',
    faithText:
      '我是一名基督徒。在悉尼的两年里，我参加了 Evangelical Union 和 Mandarin Bible Study。',
    cyclingTitle: '课堂之外',
    cyclingText: '我喜欢骑自行车。骑行让我放慢脚步，也能用自己喜欢的方式探索周围。',
    cyclingPlaceholder: '自行车照片占位图',
    cyclingAlt: '自行车插画占位图，未来可替换为骑行照片',
    taipeiTitle: '台北的篇章',
    taipeiText: '在台北求学的四年，成为我人生旅程中重要的一章。',
    taipeiPlaceholder: '台北照片占位图',
    taipeiAlt: '台北城市天际线插画占位图，未来可替换为实景照片',
    replaceImage: '准备好后，可将这幅插画替换为个人照片。',
    languages: '语言',
    proficiency: {
      native: '母语',
      fluent: '流利',
      learning: '学习中',
    },
    languageList: [
      { name: '中文（普通话）', level: 'native' },
      { name: '英语', level: 'fluent' },
      { name: '日语', level: 'learning' },
      { name: '德语', level: 'learning' },
    ],
  },
  work: {
    heading: '参与创造，让想法落地。',
    introduction: '好的项目，往往介于实用工具与有意义的体验之间。',
    unavailable: '暂时无法加载作品。',
    checkBack: '请稍后再来，或',
    browseGithub: '直接浏览 GitHub',
    more: '在 GitHub 查看更多',
    projectTypes: {
      'blotz-task-app': '全栈 · 2025',
      renopilot: '全栈 · 2025',
      'global-youth-sdgs-summit': '网站 · 2025',
      'ai-health-management': '人工智能 · 2024',
    },
    visualLabels: {
      'blotz-task-app': '产品与移动端',
      renopilot: '网页平台',
      'global-youth-sdgs-summit': '社群与内容',
      'ai-health-management': '数字健康',
    },
    projects: {
      'blotz-task-app': {
        title: 'Blotz 任务应用',
        description:
          '任务管理应用结合 .NET API、SQL Server 后端与 React Native 移动体验，并提供 AI 任务建议。',
      },
      renopilot: {
        title: 'RenoPilot',
        description: '装修项目管理平台，帮助屋主在同一处追踪任务、预算和承包商。',
      },
      'global-youth-sdgs-summit': {
        title: '全球青年可持续发展目标峰会',
        description: '国际峰会官方网站，连接致力于联合国可持续发展目标的青年。',
      },
      'ai-health-management': {
        title: 'AI 健康管理',
        description: 'AI 辅助健康管理系统，用于分析患者数据并提供个性化健康建议。',
      },
    },
  },
  journey: {
    tag: '一路走来',
    heading: '仍在成为更好的自己。',
    current: '目前',
    events: [
      {
        date: '2019 年 6 月',
        title: '完成高中十二年级',
        place: '中国浙江温州',
        detail: '我在温州长大，并在那里完成中学学业。',
      },
      {
        date: '2019 — 2023 年 7 月',
        title: '经济学文学学士',
        place: '东吴大学 · 台湾台北',
        detail: '学习经济学四年，并于 2023 年 7 月以优异成绩毕业。',
      },
      {
        date: '2024 年 2 月',
        title: '悉尼的新篇章',
        place: '澳大利亚悉尼',
        detail: '我搬到悉尼继续求学。',
      },
      {
        date: '2024 — 2025 年',
        title: '计算机科学硕士',
        place: '悉尼大学',
        detail: '于 2025 年 12 月以优异成绩完成学位。',
      },
      {
        date: '2026 年 8 月',
        title: '护理硕士',
        place: '南十字星大学 · 黄金海岸',
        detail: '我开始学习护理，开启关怀他人的新篇章。',
      },
    ],
    workTitle: '与人和动物同行',
    workDetail: '支持工作者与宠物美容师 · 黄金海岸',
  },
  contact: {
    tag: '也欢迎你',
    heading: '最近有什么想聊的？',
    introduction: '欢迎聊聊科技、关怀，或任何你感兴趣的话题。',
    writeNote: '给我写信',
  },
  footer: {
    madeWithCare: '怀着关怀之心，生活与创作于 Yugambeh 人民的土地上。',
    copyright: '© {year} George Li',
  },
} satisfies Messages

const zhHant = {
  common: {
    pageTitle: 'George Li — 科技、關懷與好奇心',
    pageDescription: '認識 George：一位具有電腦科學背景、現居澳洲黃金海岸的護理碩士生。',
    skipLink: '跳至正文',
    home: 'George Li，首頁',
    mainNavigation: '主導覽',
    openNavigation: '開啟導覽',
    closeNavigation: '關閉導覽',
    language: '語言',
    switchToLight: '切換至白天模式',
    switchToDark: '切換至夜間模式',
    about: '關於我',
    work: '作品',
    journey: '經歷',
    contact: '聯絡',
    sayHello: '打聲招呼',
    location: '所在地：澳洲黃金海岸',
    socialProfiles: '社群頁面',
    linkedin: 'LinkedIn',
    instagram: 'Instagram',
    github: 'GitHub',
    backToTop: '回到頂端',
    technologies: '技術',
    viewProject: '在 GitHub 查看 {title}',
  },
  hero: {
    location: '澳洲黃金海岸 · 從台灣到澳洲',
    headlineStart: '在程式與關懷之間，',
    headlineAccent: '持續探索。',
    introduction:
      '我是 George，一位具有電腦科學背景的護理碩士生。我希望所做的事能讓日常生活更周到、更實用，也更有人情味。',
    exploreWork: '看看我的作品',
    getInTouch: '聯絡我',
    portraitAlt: 'George Li 坐在咖啡館窗邊',
    portraitUnavailable: 'George Li 的肖像暫時無法顯示',
    caption: 'George Li · 澳洲黃金海岸',
  },
  about: {
    tag: '認識我',
    heading: '走過不同道路，始終關心人。',
    paragraphs: [
      '我在中國浙江溫州長大，並於 2019 年 6 月完成高中十二年級。之後，我在台灣台北的東吳大學讀了四年經濟學，並於 2023 年 7 月畢業。',
      '我於 2024 年 2 月搬到雪梨，在雪梨大學研讀電腦科學，並於 2025 年 12 月完成電腦科學碩士學位。2026 年 8 月，我開始在黃金海岸的南十字星大學攻讀護理碩士。',
      '如今，我帶著對創造的好奇，以及平靜、細心的態度投入學習、支持工作和寵物美容。',
    ],
    faithTitle: '在群體中實踐信仰',
    faithText:
      '我是一位基督徒。在雪梨的兩年裡，我參加了 Evangelical Union 和 Mandarin Bible Study。',
    cyclingTitle: '課堂之外',
    cyclingText: '我喜歡騎自行車。騎行讓我放慢腳步，也能用自己喜歡的方式探索周遭。',
    cyclingPlaceholder: '自行車照片佔位圖',
    cyclingAlt: '自行車插畫佔位圖，未來可替換為騎行照片',
    taipeiTitle: '台北的篇章',
    taipeiText: '在台北求學的四年，成為我人生旅程中重要的一章。',
    taipeiPlaceholder: '台北照片佔位圖',
    taipeiAlt: '台北城市天際線插畫佔位圖，未來可替換為實景照片',
    replaceImage: '準備好後，可將這幅插畫替換為個人照片。',
    languages: '語言',
    proficiency: {
      native: '母語',
      fluent: '流利',
      learning: '學習中',
    },
    languageList: [
      { name: '中文（普通話）', level: 'native' },
      { name: '英文', level: 'fluent' },
      { name: '日文', level: 'learning' },
      { name: '德文', level: 'learning' },
    ],
  },
  work: {
    heading: '參與創造，讓想法實現。',
    introduction: '好的專案，往往介於實用工具與有意義的體驗之間。',
    unavailable: '目前無法載入作品。',
    checkBack: '請稍後再來，或',
    browseGithub: '直接瀏覽 GitHub',
    more: '在 GitHub 查看更多',
    projectTypes: {
      'blotz-task-app': '全端 · 2025',
      renopilot: '全端 · 2025',
      'global-youth-sdgs-summit': '網站 · 2025',
      'ai-health-management': '人工智慧 · 2024',
    },
    visualLabels: {
      'blotz-task-app': '產品與行動裝置',
      renopilot: '網頁平台',
      'global-youth-sdgs-summit': '社群與內容',
      'ai-health-management': '數位健康',
    },
    projects: {
      'blotz-task-app': {
        title: 'Blotz 任務應用程式',
        description:
          '任務管理應用程式結合 .NET API、SQL Server 後端與 React Native 行動體驗，並提供 AI 任務建議。',
      },
      renopilot: {
        title: 'RenoPilot',
        description: '裝修專案管理平台，協助屋主在同一處追蹤任務、預算與承包商。',
      },
      'global-youth-sdgs-summit': {
        title: '全球青年永續發展目標峰會',
        description: '國際峰會官方網站，連結致力於聯合國永續發展目標的青年。',
      },
      'ai-health-management': {
        title: 'AI 健康管理',
        description: 'AI 輔助健康管理系統，用於分析患者資料並提供個人化健康建議。',
      },
    },
  },
  journey: {
    tag: '一路走來',
    heading: '仍在成為更好的自己。',
    current: '目前',
    events: [
      {
        date: '2019 年 6 月',
        title: '完成高中十二年級',
        place: '中國浙江溫州',
        detail: '我在溫州長大，並在當地完成中學學業。',
      },
      {
        date: '2019 — 2023 年 7 月',
        title: '經濟學文學士',
        place: '東吳大學 · 台灣台北',
        detail: '研讀經濟學四年，並於 2023 年 7 月以優異成績畢業。',
      },
      {
        date: '2024 年 2 月',
        title: '雪梨的新篇章',
        place: '澳洲雪梨',
        detail: '我搬到雪梨繼續求學。',
      },
      {
        date: '2024 — 2025 年',
        title: '電腦科學碩士',
        place: '雪梨大學',
        detail: '於 2025 年 12 月以優異成績完成學位。',
      },
      {
        date: '2026 年 8 月',
        title: '護理碩士',
        place: '南十字星大學 · 黃金海岸',
        detail: '我開始學習護理，開啟關懷他人的新篇章。',
      },
    ],
    workTitle: '與人和動物同行',
    workDetail: '支持工作者與寵物美容師 · 黃金海岸',
  },
  contact: {
    tag: '也歡迎你',
    heading: '最近有什麼想聊的？',
    introduction: '歡迎聊聊科技、關懷，或任何你感興趣的話題。',
    writeNote: '寫信給我',
  },
  footer: {
    madeWithCare: '懷著關懷之心，生活與創作於 Yugambeh 人民的土地上。',
    copyright: '© {year} George Li',
  },
} satisfies Messages

export const translations: Record<Locale, Messages> = {
  en,
  'zh-Hans': zhHans,
  'zh-Hant': zhHant,
}

export const localeTags: Record<Locale, string> = {
  en: 'en',
  'zh-Hans': 'zh-Hans',
  'zh-Hant': 'zh-Hant',
}

const knownProjectCopy = {
  en: en.work.projects,
  'zh-Hans': zhHans.work.projects,
  'zh-Hant': zhHant.work.projects,
}

export function localizeProject(project: Project, locale: Locale) {
  const copy = Object.hasOwn(knownProjectCopy.en, project.slug)
    ? knownProjectCopy[locale][project.slug as keyof typeof knownProjectCopy.en]
    : undefined

  const projectType = translations[locale].work.projectTypes[
    project.slug as keyof typeof translations.en.work.projectTypes
  ] ?? project.projectType

  return {
    ...project,
    title: copy?.title ?? project.title,
    description: copy?.description ?? project.description,
    projectType,
  }
}
