import {marked} from './vendor/marked.esm.js';
import DOMPurify from './vendor/purify.es.js';

const about=document.querySelector('#about');
const sourceUrl=new URL('./content/about/projects.md',import.meta.url);
const sections={'本科':'bachelor','硕士':'master','柳叶刀工作室':'studio','网易互娱':'netease'};
const roles={'独立游戏开发者':'gold','设计师':'green','用户研究员':'blue','设计策略':'red'};

try {
  const response=await fetch(sourceUrl);
  if(!response.ok)throw new Error(`About 项目文档读取失败：${response.status}`);
  const tokens=marked.lexer(await response.text());
  const lists=new Map();
  let section=null,role=null;
  for(const token of tokens){
    if(token.type==='heading'&&token.depth===2){
      section=sections[token.text]||null;role=null;
      if(section)lists.set(section,[]);
    }else if(token.type==='heading'&&token.depth===3){
      role=roles[token.text]||null;
    }else if(token.type==='list'&&section&&role){
      for(const item of token.items)lists.get(section).push({text:item.text,role});
    }
  }
  if(!lists.size)throw new Error('About 项目文档中没有识别到项目分组');
  for(const [key,items] of lists){
    const list=about.querySelector(`.history-row.${key} .projects-list`);
    const children=items.map(item=>{
      const li=document.createElement('li');li.className=item.role;li.dataset.role=item.role;
      li.innerHTML=DOMPurify.sanitize(marked.parseInline(item.text),{ALLOWED_TAGS:['strong','em','a','code','del','br'],ALLOWED_ATTR:['href','title']});
      li.querySelectorAll('a[href]').forEach(link=>{
        try {
          const url=new URL(link.getAttribute('href'),sourceUrl);
          if(!['http:','https:'].includes(url.protocol)){link.removeAttribute('href');return;}
          link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';
        }catch{link.removeAttribute('href');}
      });
      return li;
    });
    list.replaceChildren(...children);
  }
  about.dispatchEvent(new Event('about-projects-updated'));
} catch(error){
  // Preserve the existing readable HTML if the editable document cannot be loaded.
  console.warn(error.message);
}
