(() => {
  const about = document.querySelector('#about');
  if (!about) return;
  const labels = about.querySelectorAll('.identity-list > span');
  const roles = ['gold', 'green', 'blue', 'red'];
  const options = document.createElement('span');
  options.className = 'identity-options';
  const buttons = [...labels].map((label, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `identity-button ${roles[index]}`;
    button.dataset.role = roles[index];
    button.setAttribute('aria-pressed', 'false');
    button.textContent = label.textContent;
    if (index) {
      const separator = document.createElement('span');
      separator.textContent = '·';
      separator.setAttribute('aria-hidden', 'true');
      options.append(separator);
    }
    options.append(button);
    return button;
  });
  const group = about.querySelector('.identity-list');
  group.replaceChildren(options);
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', '按身份高亮项目，再次点击恢复全部');
  let projects = [...about.querySelectorAll('.projects-list li')];
  for (const project of projects) {
    project.dataset.role = roles.find(role => project.classList.contains(role) || project.parentElement.classList.contains(role));
  }
  const announcement = document.createElement('span');
  announcement.className = 'filter-announcement';
  announcement.setAttribute('role', 'status');
  group.after(announcement);
  let selected = null, previewRole = null, demoTimer = null, demoRunning = false;
  function paintProjects() {
    projects.forEach(project => {
      const preview=project.dataset.role===previewRole;
      project.classList.toggle('project-hover',preview);
      project.classList.toggle('project-muted',!!selected && project.dataset.role!==selected && !preview);
      project.classList.toggle('project-highlight',project.dataset.role===selected);
    });
  }
  function select(role, announce=false) {
    selected=role;
    buttons.forEach(item => item.setAttribute('aria-pressed', String(item.dataset.role === selected)));
    paintProjects();
    const count = projects.filter(project => project.dataset.role === selected).length;
    if(announce) announcement.textContent = selected ? `${buttons.find(button=>button.dataset.role===selected).textContent}：已高亮 ${count} 个项目` : '已恢复全部项目';
  }
  function stopDemo() { clearTimeout(demoTimer);demoTimer=null;demoRunning=false; }
  function preview(role) {
    if(demoRunning){stopDemo();select(null);}
    previewRole=role;paintProjects();
  }
  buttons.forEach(button=>{
    button.addEventListener('pointerenter',()=>preview(button.dataset.role));
    button.addEventListener('pointerleave',()=>preview(button.matches(':focus-visible')?button.dataset.role:null));
    button.addEventListener('focus',()=>{if(button.matches(':focus-visible'))preview(button.dataset.role);});
    button.addEventListener('blur',()=>preview(null));
  });
  about.addEventListener('about-projects-updated',()=>{
    projects=[...about.querySelectorAll('.projects-list li')];
    select(selected);
  });
  buttons.forEach(button => button.addEventListener('click', () => {
    const next=!demoRunning && selected===button.dataset.role ? null : button.dataset.role;
    stopDemo();select(next,true);
  }));
  function startDemo() {
    previewRole=null;stopDemo();select(null);
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    demoRunning=true;
    let index=0;
    function step() {
      if(index===roles.length){select(null);stopDemo();return;}
      select(roles[index++]);demoTimer=setTimeout(step,300);
    }
    // Let the entrance animation reveal the identity and project text first.
    demoTimer=setTimeout(step,850);
  }
  let active=false;
  function syncEntrance() {
    const next=about.getAttribute('aria-hidden')==='false';
    if(next===active)return;
    active=next;
    if(active)startDemo();else{previewRole=null;stopDemo();select(null);}
  }
  new MutationObserver(syncEntrance).observe(about,{attributes:true,attributeFilter:['aria-hidden']});
  syncEntrance();
  about.querySelectorAll('.projects-list').forEach(list => {
    list.tabIndex = 0;
    list.setAttribute('aria-label', '项目列表，长文字可横向滚动查看');
  });
})();
