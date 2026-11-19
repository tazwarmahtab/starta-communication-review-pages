/* Starta Communication · progressive, below-hero service Bento · review only */
(function () {
  'use strict';
  function mount() {
    const section=document.getElementById('solutions');
    if(!section || section.querySelector('[data-starta-bento-controls]'))return;
    const grid=section.querySelector('.service-grid');
    if(!grid)return;
    const data=[
      {key:'messaging',name:'Messaging',eyebrow:'01 / BUSINESS MESSAGING',lead:'Start with the message and its purpose.',body:'Authentication, transactional updates and consent-based use cases begin with destinations, traffic expectations and applicable requirements.',details:['Use case and consent','Destination and volume','Technical fit'],href:'messaging.html'},
      {key:'voice',name:'Voice',eyebrow:'02 / WHOLESALE VOICE',lead:'Define the conversation before the route.',body:'Destination markets, traffic characteristics and interconnection needs determine the next technical and commercial discussion.',details:['Destination markets','Traffic characteristics','Interconnection requirements'],href:'voice.html'},
      {key:'cpaas',name:'CPaaS',eyebrow:'03 / INTEGRATIONS',lead:'Connect the use case to an integration approach.',body:'Application requirements, interface expectations and the customer journey guide discussions about communications integration.',details:['Application use case','Interface requirements','Implementation fit'],href:'cpaas.html'}
    ];
    const widget=document.createElement('div');
    widget.className='starta-bento';
    widget.setAttribute('data-starta-bento-controls','');
    const group=document.createElement('div');
    group.className='starta-bento-tabs';
    group.setAttribute('role','group');
    group.setAttribute('aria-label','Explore Starta services');
    const label=document.createElement('span');
    label.className='starta-bento-kicker';
    label.textContent='EXPLORE A SERVICE';
    group.appendChild(label);
    const buttons=data.map(item=>{
      const b=document.createElement('button');
      b.type='button';
      b.textContent=item.name;
      b.dataset.service=item.key;
      b.setAttribute('aria-pressed','false');
      group.appendChild(b);
      return b;
    });
    const panel=document.createElement('div');
    panel.className='starta-bento-detail';
    panel.setAttribute('role','region');
    panel.setAttribute('aria-label','Selected service details');
    const visual=document.createElement('div');
    visual.className='starta-bento-visual';
    visual.setAttribute('aria-hidden','true');
    const visualTitle=document.createElement('span');
    visualTitle.className='starta-bento-visual-label';
    visualTitle.textContent='ILLUSTRATIVE REQUIREMENTS';
    const diagram=document.createElement('div');
    diagram.className='starta-bento-steps';
    visual.append(visualTitle,diagram);
    const info=document.createElement('div');
    info.className='starta-bento-info';
    const eyebrow=document.createElement('span');
    eyebrow.className='starta-bento-kicker';
    const heading=document.createElement('h3');
    const paragraph=document.createElement('p');
    const link=document.createElement('a');
    link.className='starta-bento-link';
    const caveat=document.createElement('small');
    caveat.textContent='Illustrative requirements only · No availability or coverage claim';
    info.append(eyebrow,heading,paragraph,link,caveat);
    panel.append(visual,info);
    const status=document.createElement('p');
    status.className='starta-bento-status';
    status.setAttribute('aria-live','polite');
    status.setAttribute('aria-atomic','true');
    status.classList.add('sr-only');
    widget.append(group,panel,status);
    grid.insertAdjacentElement('beforebegin',widget);
    function select(index) {
      const item=data[index];
      buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));
      grid.dataset.selectedService=item.key;
      eyebrow.textContent=item.eyebrow;
      heading.textContent=item.lead;
      paragraph.textContent=item.body;
      link.href=item.href;
      link.textContent='Explore '+item.name+' ↗';
      diagram.replaceChildren();
      item.details.forEach((text,i)=>{
        const step=document.createElement('div');
        step.className='starta-bento-step';
        const number=document.createElement('span');
        number.textContent=String(i+1).padStart(2,'0');
        const name=document.createElement('strong');
        name.textContent=text;
        step.append(number,name);
        diagram.append(step);
      });
      status.textContent='Showing '+item.name+' service details';
    }
    buttons.forEach((button,i)=>button.addEventListener('click',()=>select(i)));
    select(0);
    // Fail closed: only hide native service links after the enhanced view renders.
    // If construction throws, fallback links remain visible and navigable.
    grid.classList.add('starta-bento-fallback-hidden');
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
