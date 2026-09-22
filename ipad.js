(() => {
  const names=['Inicio','Peso','Comidas','Medidas','Actividad','Ajustes'];
  const paths=['M3 10 12 3l9 7v11h-6v-7H9v7H3z','M5 4h14v16H5z M8 8a5 5 0 0 1 8 0 M12 8l2-2','M5 3v7m3-7v7M3 3v5a3 3 0 0 0 6 0M6 11v10M17 3v18M17 3c-4 3-4 9 0 9','M3 7h18v10H3z M7 7v5m5-5v3m5-3v5','M2 12h5l3-8 4 16 3-8h5','M4 6h16M4 12h16M4 18h16M8 3v6m8 0v6m-6 0v6'];
  const nav=document.getElementById('nav');nav.setAttribute('aria-label','Secciones');
  nav.querySelectorAll('button').forEach((b,i)=>{
    b.innerHTML=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${paths[i]}"/></svg><span>${names[i]}</span>`;
    b.setAttribute('aria-controls',navs[i]);
  });
  const originalGo=window.go;
  window.go=function(id,b){originalGo(id,b);nav.querySelectorAll('button').forEach(x=>{if(x===b)x.setAttribute('aria-current','page');else x.removeAttribute('aria-current')});window.scrollTo(0,0)};
  nav.querySelector('button').setAttribute('aria-current','page');
  const standalone=()=>document.documentElement.classList.toggle('standalone',navigator.standalone===true||matchMedia('(display-mode: standalone)').matches);
  standalone();matchMedia('(display-mode: standalone)').addEventListener('change',standalone);
  document.querySelectorAll('label').forEach(l=>{const input=l.nextElementSibling;if(input?.id&&input.matches('input,select,textarea'))l.htmlFor=input.id});
  document.querySelectorAll('input[type=number]').forEach(i=>i.inputMode='decimal');
  const note=document.createElement('p');note.className='status-note c12';note.textContent='Los registros se guardan en este dispositivo. Usa la copia JSON para llevarlos a otro dispositivo o a la app instalada.';document.querySelector('#config .grid').append(note);
  if('serviceWorker' in navigator && /^https?:$/.test(location.protocol)){
    window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
  }
})();
