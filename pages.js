(() => {
const cases = {
 ss:{name:'SS · 商业 FPS 交互',type:'概述 + 演示',description:'局外交互流程、组件库与设计规范。',note:'仅展示低保真与脱敏内容。',demo:true},
 ga:{name:'GA · 从零构建 UI 系统',type:'概述 + 演示',description:'组件库、信息架构与模块化界面的设计探索。',note:'可公开素材待整理；商业结果仅中性表述。',demo:true},
 mel:{name:'MEL · 双主角解谜游戏',type:'介绍 + 动效叙事',description:'从核心循环到美术与界面，一个小团队的创作。',note:'角色、过程与作品素材待整理。',deck:true},
 pda:{name:'PDA · 全息交互样机',type:'概述 + 演示',description:'从已公开 PV 镜头，探索界面在空间中的表达。',note:'公开素材范围内的 UI 原稿与样机待接入。',demo:true},
 physics:{name:'天体物理模拟器',type:'概述 + 演示',description:'以 AI 协作探索和构建可玩的物理模拟原型。',note:'个人前瞻研究；原有 HTML 工程待接入。',demo:true},
 web:{name:'官网重构',type:'介绍 + 动效叙事',description:'以信息架构、视觉与动态体验重新组织品牌内容。',note:'本人设计与他人前端实现将分别说明。',deck:true},
 saic:{name:'乐趣衍化 · 上汽设计策略',type:'介绍 + 动效叙事',description:'通过品牌研究、访谈与画像探索产品策略。',note:'研究口径和奖项称谓在正式内容中核实。',deck:true},
 thesis:{name:'毕设 · 老年人软硬件体验',type:'介绍 + 动效叙事',description:'面向轻度认知障碍老人的硬件交互行为与体感游戏。',note:'产品视觉、行为模式图与验证材料待整理。',deck:true},
 toyota:{name:'相聚，相乐 · 家庭 SUV',type:'介绍 + 动效叙事',description:'从家庭用户旅程到座舱体验概念。',note:'设计提案；素材重排与重复页整理待完成。',deck:true},
 netease:{name:'召唤兽 · UX 优化',type:'单页介绍',description:'在运营项目中的问题定义与 UXD 工作。',note:'仅轻量概述，不补写无法回忆的项目细节。'},
 ai:{name:'与 AI 一起，把想法做出来',type:'介绍 + 动效叙事',description:'从知识库素材、设计意图，到原型实现和人工验收。',note:'首版以本站制作与个人原型作为可公开证据。',deck:true}
};
const orders={game:['ss','ga','mel','pda','physics','netease'],digital:['web','saic','thesis','ss'],hardware:['thesis','saic','toyota']};
const labels={game:['Game','游戏交互 / 系统设计 / 可玩原型'],digital:['Digital','数字产品 / 信息架构 / 设计策略'],hardware:['Hardware','智能硬件 / 行为模式 / 软硬件体验']};
const query=new URLSearchParams(location.search);const industry=orders[query.get('industry')]?query.get('industry'):'game';const list=document.querySelector('#case-list');
if(list){document.title=labels[industry][0]+' — Eric';document.querySelector('#list-title').textContent=labels[industry][0];document.querySelector('#list-description').textContent=labels[industry][1];list.innerHTML=orders[industry].map((id,i)=>{const c=cases[id];return `<a class="case-card" href="case.html?id=${id}&industry=${industry}"><div class="case-cover">${String(i+1).padStart(2,'0')} / 封面待补充</div><h3>${c.name} <span>↗</span></h3><p>${c.type} · ${c.description}</p></a>`}).join('');if(industry==='game'){list.insertAdjacentHTML('beforeend','<a class="case-card" href="https://www.gcores.com/games/126712" target="_blank" rel="noopener noreferrer"><div class="case-cover">外部作品 / 机核</div><h3>亡犬 <span>↗</span></h3><p>参与署名 · 朋友项目 · 打开外部链接</p></a>')}}
const content=document.querySelector('#case-content');if(content){const id=query.get('id');const c=cases[id];if(!c){content.innerHTML='<section class="page-top"><h1>这个案例还未整理。</h1><a href="index.html#work">← 返回作品</a></section>';return}const demo=query.get('view')==='demo'&&c.demo;const back=id==='ai'?'index.html#about':`work.html?industry=${industry}`;document.title=c.name+' — Eric';content.innerHTML=`<section class="page-top"><a class="back" href="${back}">← 返回${id==='ai'?'关于':'案例列表'}</a><p class="prototype-label">${demo?'交互演示':'案例结构探索版'} · ${c.type}</p><h1>${c.name}</h1><p>${c.description}</p></section><section class="detail-content">${demo?`<div class="demo-box"><div><h2>演示内容待接入</h2><p>${c.note}</p><p>这里预留真实原型的嵌入位置。当前仅用于检查页面动线。</p></div></div><div class="detail-actions"><a href="case.html?id=${id}&industry=${industry}">← 返回概述</a><a href="${back}">退出案例 ↗</a></div>`:`<h2>背景与设计目标</h2><p>${c.description} 正式案例将说明项目背景、本人职责、目标与限制。</p><div class="placeholder">关键视觉 / 项目素材待补充</div><h2>过程与关键判断</h2><p>研究依据、方案推导与迭代过程待整理。${c.note}</p>${c.deck?'<div class="placeholder">叙事画面 / 图表与过程素材待补充</div><h2>方案与复盘</h2><p>成果、验证依据和取舍将在正式稿中展开。</p>':''}${id==='mel'?'<a class="text-link" href="https://www.gcores.com/games/81216" target="_blank" rel="noopener noreferrer">在机核查看作品 ↗</a>':''}<div class="detail-actions"><a href="${back}">← 返回${id==='ai'?'关于':'案例列表'}</a>${c.demo?`<a href="case.html?id=${id}&industry=${industry}&view=demo">下一页：交互演示 →</a>`:''}</div>`}</section>`}
})();
