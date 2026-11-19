/* Starta guided enquiry · user-controlled handoff · review only */
(function () {
  'use strict';
  function mount() {
    const root = document.querySelector('[data-starta-enquiry]');
    if (!root) return;
    const pick = key => root.querySelector('[data-enquiry-' + key + ']');
    const service=pick('service'),market=pick('market'),requirement=pick('requirement');
    const detail=pick('detail'),name=pick('name'),company=pick('company'),preview=pick('preview');
    const whatsapp=pick('whatsapp'),email=pick('email'),copy=pick('copy'),notice=pick('notice');
    const details={
      messaging:'Use case or estimated traffic (optional)',
      voice:'Traffic or interconnection requirements (optional)',
      cpaas:'Desired integration or application (optional)'
    };
    let lastGenerated='';
    function prepare() {
      const selected=service.value;
      const extra=details[selected];
      detail.setAttribute('aria-label',extra||'Optional service-specific detail');
      const label=root.querySelector('[data-enquiry-detail-label]');
      if(label)label.textContent=extra||'Additional detail (optional)';
      const lines=[
        'Hello Starta Communication,',
        'I would like to discuss a business communication requirement.',
        'Service: '+(selected?service.options[service.selectedIndex].text:'Not selected'),
        'Market/destination: '+(market.value.trim()||'Not provided'),
        'Requirement: '+(requirement.value.trim()||'Not provided')
      ];
      if(detail.value.trim())lines.push('Additional detail: '+detail.value.trim());
      if(name.value.trim())lines.push('Name: '+name.value.trim());
      if(company.value.trim())lines.push('Company: '+company.value.trim());
      const nextGenerated=lines.join('\n');
      const pristine=preview.value===lastGenerated;
      // Once the visitor edits the draft, preserve it across later field changes.
      // The visible message, not the form, is the handoff source of truth.
      if(pristine){
        preview.value=nextGenerated;
        notice.textContent='Preview ready. You can edit it before choosing WhatsApp, email, or copy.';
      }else{
        notice.textContent='Your edited message was kept. Changes to the fields are not automatically added; review your message before sharing.';
      }
      lastGenerated=nextGenerated;
    }
    function valid() {
      if(!service.value){service.focus();notice.textContent='Choose a service before continuing.';return false;}
      if(!market.value.trim()){market.focus();notice.textContent='Enter a market or destination before continuing.';return false;}
      if(!requirement.value.trim()){requirement.focus();notice.textContent='Describe your requirement before continuing.';return false;}
      if(!preview.value.trim()){preview.focus();notice.textContent='Message preview cannot be empty.';return false;}
      return true;
    }
    function handle(action) {
      if(!valid())return;
      const msg=preview.value;
      if(action==='whatsapp'){
        const href='https://wa.me/8801789217632?text='+encodeURIComponent(msg);
        window.open(href,'_blank','noopener,noreferrer');
        notice.textContent='WhatsApp opening requested. If nothing appears, try email or copy. This website has not sent your message.';
      }
      if(action==='email'){
        window.open('mailto:info@startacommunication.com?subject='+encodeURIComponent('Starta business communication enquiry')+'&body='+encodeURIComponent(msg),'_blank','noopener,noreferrer');
        notice.textContent='Email application requested. Confirm any message transmission in your email app.';
      }
      if(action==='copy'){
        if(navigator.clipboard&&navigator.clipboard.writeText) {
          navigator.clipboard.writeText(msg).then(
            ()=>{notice.textContent='Message copied to clipboard.';},
            ()=>{notice.textContent='Clipboard unavailable. Select and copy the message preview manually.';preview.focus();preview.select();}
          );
        } else {preview.focus();preview.select();notice.textContent='Select and copy the message preview manually.';}
      }
    }
    [service,market,requirement,detail,name,company].forEach(el=>el.addEventListener('input',prepare));
    [service,market,requirement,detail,name,company].forEach(el=>el.addEventListener('change',prepare));
    whatsapp.addEventListener('click',()=>handle('whatsapp'));
    email.addEventListener('click',()=>handle('email'));
    copy.addEventListener('click',()=>handle('copy'));
    root.setAttribute('aria-live','off');
    notice.setAttribute('aria-live','polite');
    prepare();
    // Reveal only after controls, handlers, and preview are initialized.
    root.hidden = false;
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',mount,{once:true});
  else mount();
})();
