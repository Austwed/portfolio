/* 替换素材或调整文案时，只需要编辑此文件。路径相对于 index.html。 */
window.PORTFOLIO = {
  site: { showPending: false, updated: "作品集" },
  profile: { name: "Wade", role: "系统策划 · 玩法策划" },
  hero: {
    title: "基地征服",
    summary: "一款结合营地经营与小队即时战斗的俯视 RPG。同一批士兵既要承担生产，也要随队出征。",
    role: "负责玩法方向、系统规则、数值目标、任务流程与界面需求。",
    cover: "assets/images/camp.webp",
    caption: "灰岩营地 · 11 月 18 日开发截图",
    actions: [
      { type: "link", label: "查看设计案例", src: "#project", primary: true },
      { type: "web", label: "进入网页试玩版", src: "assets/play/birch-camp/index.html",
        note: "用浏览器体验古窟调查、募兵备粮、守营与攻寨。此为独立网页试玩版。" },
      { type: "video", label: "观看实机演示", src: null }
    ]
  },
  sections: {
    project: { title: "代表项目", sub: "" },
    playables: { title: "在线试玩", sub: "体验经营与出征循环，或查看界面的操作路径。" },
    docs: { title: "策划资料", sub: "" },
    others: { title: "其他作品", sub: "" },
    resume: { title: "简历", sub: "" }
  },
  featured: {
    title: "基地征服 RPG",
    subtitle: "营地经营 · 实地部署 · 可暂停的即时战斗",
    cover: "assets/images/deployment.webp",
    summary: "玩家在灰岩营地安排生产、组织出征。战后的伤病、减员和资源变化会带回营地，影响下一轮的人手分配。\n\n我负责玩法、规则、数值与任务设计，也用交互原型描述界面流程。程序与部分素材制作使用 AI 协助。",
    facts: [
      { label: "项目形式", value: "Unity 单人 RPG Demo" },
      { label: "项目状态", value: "持续开发" }
    ],
    actions: [{ type: "link", label: "查看 Demo 仓库", src: "https://github.com/Austwed/RPGDemo" }],
    casesTitle: "设计案例",
    cases: [
      {
        id: "soldier-work", tag: "经营与兵力", title: "士兵工作、出征与战损恢复",
        summary: "出征要占用营地劳力，战后伤亡又会改变下一轮能派哪些人工作。",
        sections: [
          { heading: "玩家的选择", text: "进攻黑鸦寨前，玩家从同一批人里选出战士兵和留营工人。带走正在粮田或工坊工作的士兵，会改变留营产出；行军当天仍推进日结。" },
          { heading: "规则和反馈", text: "留营村民会按规则补空岗，每人提供半份基础工作量。玩家可在备战时查看人员分配和产出变化，决定带多少人出征。" },
          { heading: "战后取舍", text: "伤员需要休养，阵亡留下长期缺口。回营后，玩家要根据剩余兵力和资源，在恢复生产、招募和备战之间排优先级。" }
        ],
        media: [{ type: "image", src: "assets/images/farm.webp", caption: "粮田岗位与预计产量 · 开发截图" }]
      },
      {
        id: "captain-squad", tag: "小队战斗", title: "队长带兵与暂停指挥",
        summary: "把部署和命令交给少数队长，让玩家在多人战斗中仍能关注地形与目标。",
        sections: [
          { heading: "指挥粒度", text: "剑士、弓兵与骑兵跟随所属队长行动。玩家可暂停战斗，逐队下移动、驻守或集火命令，也能让小队依当前策略自主行动。" },
          { heading: "地形怎样影响布阵", text: "骑兵占地较大，窄口会限制摆位；高地和遮挡影响视野与射击。部队搭配和落位一起决定兵力能发挥多少。" }
        ],
        media: [{ type: "image", src: "assets/images/deployment.webp", caption: "开战前在战斗地图上部署 · 开发截图" }]
      },
      {
        id: "ruins-rescue", tag: "关卡与任务", title: "沉眠古窟救援",
        summary: "侵蚀改变同行选择，解救镇民取决于玩家处理控制者的时机。",
        sections: [
          { heading: "进场前的选择", text: "普通人会受到侵蚀，免疫的同行者能在古窟坚持更久。进入前的提示让玩家决定直接挑战，还是先调整队伍。" },
          { heading: "目标与流程分支", text: "制伏控制者后可以解救镇民。先接委托后救人、先救人后见领主都能推进主线，交差对白对应玩家实际完成的行动。" }
        ],
        media: [{ type: "image", src: "assets/images/ruins.webp", caption: "古窟入口说明侵蚀规则，并提供调整随行的选择 · 开发截图" }]
      }
    ]
  },
  playables: [
    { id: "web-playtest", title: "基地征服｜网页试玩版",
      summary: "从灰岩营地醒来，调查古窟、募兵备粮、抵御首袭，再率队攻下黑鸦寨，查看通关天数和经营战果。",
      actions: [{ type: "web", label: "开始试玩", src: "assets/play/birch-camp/index.html", primary: true,
        note: "免下载，打开浏览器即可开始。" }] },
    { id: "proto-gameplay", title: "独立玩法原型",
      summary: "从营地派工开始，体验备战、部署、战果与日结。此版本包含独立的玩法试验。",
      actions: [{ type: "web", label: "在线试玩", src: "assets/prototypes/gameplay/index.html", primary: true,
        note: "跟随首次引导完成派工与出征。原型可在新标签页全屏打开。" }] },
    { id: "proto-interaction", title: "界面交互原型",
      summary: "查看营地、士兵编队、备战和背包等界面的操作路径，建议使用电脑体验。",
      actions: [{ type: "web", label: "体验交互", src: "assets/prototypes/interaction/index.html", primary: true,
        note: "进入主界面后，可从营地设施或快捷入口查看编队与背包。" }] },
    { id: "demo-windows", title: "Windows Demo",
      summary: "试玩包随选定的展示版本补充。",
      actions: [{ type: "download", label: "下载试玩包", src: null }] }
  ],
  docCategories: ["策划案", "数值配表", "游戏拆解"],
  docs: [
    { id: "doc-excerpt", category: "策划案", type: "PDF", title: "基地征服 · 重点策划案",
      summary: "主线体验、玩法循环与代表设计。",
      actions: [{ type: "pdf", label: "阅读", src: null }] },
    { id: "doc-design", category: "策划案", type: "PDF", title: "基地征服 · 正式策划案",
      summary: "系统规则、关卡流程、数值规格与验收用例。",
      actions: [{ type: "pdf", label: "阅读", src: null }] },
    { id: "doc-balance", category: "数值配表", type: "XLSX", title: "基地征服 · 数值配表样本",
      summary: "对应经营与兵力案例中的生产、口粮和恢复字段。",
      actions: [{ type: "download", label: "下载配表", src: null }] },
    { id: "doc-rimworld", category: "游戏拆解", type: "PDF", title: "《边缘世界》系统设计拆解案",
      summary: "从殖民者、经营与战斗三个部分分析人员状态、生产安排和袭击压力如何互相作用。",
      actions: [{ type: "pdf", label: "阅读全文", src: "assets/documents/rimworld-system-design.pdf" }] },
    { id: "doc-honkai-star-rail", category: "游戏拆解", type: "PDF", title: "《崩坏：星穹铁道》系统设计拆解案",
      summary: "从角色养成、资源规划与版本活动出发，分析长期游玩节奏。",
      actions: [{ type: "pdf", label: "阅读全文", src: "assets/documents/honkai-star-rail-system-design.pdf" }] }
  ],
  others: [
    { id: "arcg", title: "ARCG 实体卡牌对战",
      role: "对战规则、卡牌配置与图鉴交互",
      summary: "通过摄像头识别实体卡牌，在回合中选择攻击、使用道具和改变场上环境。",
      case: {
        title: "ARCG · 图鉴与战斗效果",
        summary: "我负责规则与卡牌配置，在 Unity 中搭建界面并绑定功能。",
        sections: [
          { heading: "卡牌图鉴", text: "按卡牌类别排列图鉴。选中卡牌后展示模型、属性与效果，解锁、升降级与出售会改变可用操作及卡牌状态。" },
          { heading: "环境效果", text: "以腐蚀环境为例，识别实体卡时施加场上属性变化，失去识别时移除。结算还需处理已有环境效果与随后入场的角色。" }
        ]
      },
      actions: [
        { type: "pdf", label: "阅读案例 PDF", src: "assets/documents/arcg-portfolio-case.pdf" },
        { type: "link", label: "观看实机演示", src: "https://www.bilibili.com/video/BV1gdEE6pEBU/" }
      ]
    }
  ],
  resume: {
    pdf: null, downloadName: "简历.pdf",
    highlights: ["应聘方向 · 系统策划与玩法策划", "项目经历 · 基地征服 RPG、ARCG 实体卡牌对战"]
  },
  contacts: []
};

