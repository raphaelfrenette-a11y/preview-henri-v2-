/* Henri V2: isolated, explicit sequence publishing.
   No annual-plan mutation, no implicit placement, no silent success. */
(function(){
'use strict';
const STORE='previewHenriSlate:henriSequences';
const escapeHTML=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','"':'&quot;',"'":'&#39;'}[c]));
const norm=s=>String(s||'').trim().toLocaleLowerCase('fr-CA').normalize('NFD').replace(/[\u0300-\u036f]/g,'');
function matchingBlocks(group,seq){
 const blocks=(annualPlans[group.id]||[]);
 return blocks.filter(b=>norm(b.sport)===norm(seq.sport)&&Number(b.courses)===seq.sessions.length);
}
function modal(){
 let el=document.getElementById('henriV2SaveModal');
 if(!el){el=document.createElement('div');el.id='henriV2SaveModal';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');document.body.appendChild(el);}
 el.style.cssText='position:fixed!important;inset:5% 4% auto!important;z-index:2147483647!important;max-height:85vh!important;overflow:auto!important;background:#fff!important;color:#203040!important;border-radius:18px!important;padding:22px!important;max-width:580px!important;margin:auto!important;box-shadow:0 0 0 100vmax rgba(0,0,0,.55),0 16px 50px rgba(0,0,0,.25)!important';
 return el;
}
function report(message,isError){
 const el=document.getElementById('henriActionStatus');
 if(el){el.hidden=false;el.textContent=message;el.classList.toggle('actionError',!!isError);}
 if(isError)alert(message);
}
window.henriV2OpenSave=function(){
 try{
  if(!activeSequence||!Array.isArray(activeSequence.sessions)||!activeSequence.sessions.length)throw Error('Aucune séquence à enregistrer.');
  if(!Array.isArray(groupsData)||!groupsData.length)throw Error('Aucun groupe importé.');
  const el=modal(),seq=activeSequence;
  const rows=groupsData.map(group=>{
   const blocks=matchingBlocks(group,seq);
   const chosen=group.id===seq.groupId;
   return '<label style="display:flex;gap:12px;align-items:center;padding:12px 4px;border-bottom:1px solid #e9eef2"><input type="checkbox" data-v2-group="'+escapeHTML(group.id)+'" '+(chosen&&blocks.length?'checked':'')+' '+(!blocks.length?'disabled':'')+'><span>'+escapeHTML(group.name)+'<small style="display:block;color:#687885">'+(blocks.length?blocks.length+' bloc(s) '+escapeHTML(seq.sport)+' de '+seq.sessions.length+' cours':'Aucun bloc annuel de '+seq.sessions.length+' cours correspondant')+'</small></span></label>';
  }).join('');
  el.innerHTML='<h2 style="margin:0 0 10px">Enregistrer la séquence</h2><p style="margin:0 0 12px">'+escapeHTML(seq.sport)+' · '+seq.sessions.length+' séances. Choisis les groupes auxquels appliquer cette séquence.</p><div style="max-height:45vh;overflow:auto">'+rows+'</div><p id="henriV2ModalError" style="color:#b42318" aria-live="polite"></p><div style="display:flex;gap:10px;flex-wrap:wrap"><button type="button" id="henriV2Confirm" class="planPrimary">Enregistrer dans le calendrier</button><button type="button" id="henriV2Cancel" class="itemBtn">Annuler</button></div>';
  el.querySelector('#henriV2Confirm').addEventListener('click',window.henriV2Commit);
  el.querySelector('#henriV2Cancel').addEventListener('click',()=>el.remove());
 }catch(err){report('Enregistrement impossible : '+err.message,true);}
};
window.henriV2Commit=function(){
 const el=document.getElementById('henriV2SaveModal'),err=el?.querySelector('#henriV2ModalError');
 try{
  if(!el)throw Error('Fenêtre de sélection introuvable.');
  const ids=[...el.querySelectorAll('[data-v2-group]:checked')].map(x=>x.dataset.v2Group);
  if(!ids.length)throw Error('Sélectionne au moins un groupe.');
  const seq=activeSequence,placements=[];
  for(const id of ids){
   const group=groupsData.find(g=>String(g.id)===String(id));
   if(!group)throw Error('Groupe introuvable.');
   const blocks=matchingBlocks(group,seq);
   const block=blocks.find(b=>b.id===seq.annualBlockId)||blocks.find(b=>!getSavedSequence(id,b.id))||blocks[0];
   if(!block)throw Error('Bloc annuel introuvable pour '+group.name);
   placements.push({group,block});
  }
  const existing=placements.filter(({group,block})=>getSavedSequence(group.id,block.id));
  if(existing.length&&!confirm('Remplacer la séquence existante dans '+existing.length+' groupe(s) ?'))return;
  const next=JSON.parse(JSON.stringify(savedSequences));
  for(const {group,block} of placements){
   const copy=JSON.parse(JSON.stringify(seq));
   copy.id=(group.id===seq.groupId&&block.id===seq.annualBlockId?seq.id:'v2-'+group.id+'-'+block.id);
   copy.groupId=group.id;copy.groupName=group.name;copy.annualBlockId=block.id;
   delete copy.startCourseKey;
   next[sequenceStorageKey(group.id,block.id)]=copy;
  }
  const serialized=JSON.stringify(next);
  localStorage.setItem(STORE,serialized);
  if(localStorage.getItem(STORE)!==serialized)throw Error('Le stockage local n’a pas confirmé la sauvegarde.');
  savedSequences=next;
  const primary=placements.find(x=>x.group.id===seq.groupId)||placements[0];
  activeSequence=JSON.parse(JSON.stringify(next[sequenceStorageKey(primary.group.id,primary.block.id)]));
  localStorage.setItem('previewHenriSlate:henriActiveSequence',JSON.stringify(activeSequence));
  rebuildPlanningAssignments();
  for(const {group,block} of placements){
   if(!getSavedSequence(group.id,block.id))throw Error('Vérification échouée pour '+group.name);
  }
  el.remove();
  report('Enregistré : '+placements.length+' groupe(s), '+seq.sessions.length+' séances par groupe, liées aux blocs annuels.');
  alert('Séquence enregistrée pour '+placements.length+' groupe(s). Ouvre maintenant une séance depuis le calendrier.');
 }catch(error){if(err)err.textContent=error.message;report('Enregistrement impossible : '+error.message,true);}
};
window.saveSequence=window.henriV2OpenSave;
function wire(){
 const button=document.getElementById('henriV2SaveButton');
 if(button&&!button.dataset.v2Wired){
  button.dataset.v2Wired='1';
  button.addEventListener('click',function(event){event.preventDefault();event.stopImmediatePropagation();window.henriV2OpenSave();},true);
 }
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',wire);else wire();
})();