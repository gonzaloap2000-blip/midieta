(() => {
  const types={
    weights:{tab:'peso',list:'weightList',save:'saveWeight',label:'peso',fields:{date:'wDate',time:'wTime',kg:'wKg',bmi:'wBmi',fat:'wFat',muscle:'wMuscle',water:'wWater',visceral:'wVisceral',bone:'wBone',bmr:'wBmr',age:'wAge',notes:'wNotes'},numbers:['kg','bmi','fat','muscle','water','visceral','bone','bmr','age']},
    meals:{tab:'comidas',list:'mealList',save:'saveMeal',label:'comida',fields:{date:'mDate',type:'mType',notes:'mealNotes'},numbers:[]},
    measures:{tab:'medidas',list:'measureList',save:'saveMeasure',label:'medidas',fields:{week:'bWeek',date:'bDate',chest:'bChest',waist:'bWaist',hip:'bHip',thigh:'bThigh',biceps:'bBiceps'},numbers:['chest','waist','hip','thigh','biceps']},
    activity:{tab:'actividad',list:'activityList',save:'saveActivity',label:'actividad',fields:{date:'aDate',type:'aType',steps:'aSteps',active:'aActive',exercise:'aExercise',stand:'aStand'},numbers:['steps','active','exercise','stand']}
  };
  const editing={};
  const clone=value=>JSON.parse(JSON.stringify(value));
  const notice=document.createElement('p');notice.className='record-notice';notice.setAttribute('role','status');document.querySelector('main').prepend(notice);
  function say(message){notice.textContent=message}
  function write(type,rows){
    const next={...db,[type]:rows};
    try{localStorage.setItem(KEY,JSON.stringify(next))}catch(e){alert('No se han podido guardar los cambios. Exporta una copia y comprueba el espacio disponible.');return false}
    db=next;return true;
  }
  function capture(type){
    const cfg=types[type],values={};
    Object.entries(cfg.fields).forEach(([key,id])=>values[key]=$(id).value);
    if(type==='meals')values.items=clone(draft);
    if(type==='weights')values.photo=photo;
    return values;
  }
  function fill(type,values){
    Object.entries(types[type].fields).forEach(([key,id])=>$(id).value=values[key]??'');
    if(type==='meals'){draft=clone(values.items||[]);renderDraft()}
    if(type==='weights'){photo=values.photo||'';prev.src=photo;prev.style.display=photo?'block':'none';wImg.value=''}
  }
  function sync(type){
    const cfg=types[type],active=!!editing[type];
    cfg.button.textContent=active?'Guardar cambios':'Guardar '+cfg.label;
    cfg.cancel.hidden=!active;
    cfg.indicator.textContent=active?'Editando registro · '+fd(editing[type].record.date):'';
  }
  function finish(type){
    const state=editing[type];delete editing[type];
    if(state)fill(type,state.before);
    else {
      const cfg=types[type],empty={date:D(),time:T(),week:'Semana'};
      if(type==='meals')empty.type='Desayuno';
      if(type==='activity')empty.type='Descanso';
      fill(type,empty);
    }
    sync(type);
  }
  function edit(type,record){
    if(!db[type].includes(record))return;
    if(editing[type]?.record===record){go(types[type].tab,document.querySelectorAll('#nav button')[navs.indexOf(types[type].tab)]);return}
    if(editing[type]&&!confirm('¿Descartar los cambios pendientes y editar este registro?'))return;
    const before=editing[type]?.before||capture(type);
    editing[type]={record,before};fill(type,record);sync(type);
    go(types[type].tab,document.querySelectorAll('#nav button')[navs.indexOf(types[type].tab)]);
    types[type].indicator.scrollIntoView({block:'center'});
  }
  function remove(type,record){
    if(!db[type].includes(record)||!confirm('¿Borrar este registro de '+types[type].label+' del '+fd(record.date)+'? No se puede deshacer.'))return;
    if(!write(type,db[type].filter(x=>x!==record)))return;
    if(editing[type]?.record===record)finish(type);
    render();say('Registro borrado.');
  }
  function commit(type){
    const cfg=types[type],state=editing[type];
    const value={...(state?.record||{}),...capture(type),id:state?.record.id||uid()};
    cfg.numbers.forEach(key=>value[key]=N(value[key]));
    if(!value.date)return alert('Indica la fecha del registro.');
    if(cfg.numbers.some(key=>value[key]!==null&&(!Number.isFinite(value[key])||value[key]<0)))return alert('Revisa los valores numéricos.');
    if(type==='weights'&&!(value.kg>0))return alert('Indica un peso mayor que cero.');
    if(type==='meals'){
      if(!value.items.length)return alert('Añade alimentos.');
      Object.assign(value,totals(value.items));
    }
    const rows=[...db[type]];
    if(state){const index=rows.indexOf(state.record);if(index<0)return alert('Este registro ya no existe. Cancela la edición.');rows[index]=value}
    else rows.unshift(value);
    if(!write(type,rows))return;
    finish(type);render();say(state?'Cambios guardados.':'Registro guardado.');
  }
  function actions(container,type,records){
    const cards=Array.from($(container).children);
    records.forEach((record,index)=>{
      const card=cards[index];if(!card)return;
      const row=document.createElement('div');row.className='record-actions';
      [['Editar',()=>edit(type,record),'s'],['Borrar',()=>remove(type,record),'d']].forEach(([label,handler,style])=>{
        const b=document.createElement('button');b.type='button';b.className='btn '+style;b.textContent=label;b.setAttribute('aria-label',label+' registro de '+types[type].label+' del '+fd(record.date));b.onclick=handler;row.append(b);
      });card.append(row);
    });
  }
  Object.entries(types).forEach(([type,cfg])=>{
    cfg.button=document.querySelector(`[onclick="${cfg.save}()"]`);
    cfg.cancel=document.createElement('button');cfg.cancel.type='button';cfg.cancel.className='btn s';cfg.cancel.textContent='Cancelar edición';cfg.cancel.hidden=true;
    cfg.cancel.onclick=()=>{finish(type);render();say('Edición cancelada.');};cfg.button.after(cfg.cancel);
    cfg.indicator=document.createElement('p');cfg.indicator.className='edit-indicator';cfg.indicator.setAttribute('role','status');cfg.button.parentElement.querySelector('h2').after(cfg.indicator);
    window[cfg.save]=()=>commit(type);
  });
  const previousDraft=window.renderDraft;
  window.renderDraft=function(){
    previousDraft();
    draft.forEach((item,index)=>{
      const label=document.createElement('label');label.textContent='Cantidad (g)';
      const input=document.createElement('input');input.type='number';input.min='0.1';input.step='any';input.inputMode='decimal';input.value=item.g;
      input.onchange=()=>{
        const g=Number(input.value);
        if(!(g>0)||!Number.isFinite(g)||!(item.g>0)){input.value=item.g;return alert('Indica una cantidad mayor que cero.');}
        const ratio=g/item.g;['kcal','p','c','f'].forEach(k=>item[k]*=ratio);item.g=g;renderDraft();
      };label.append(input);draftList.children[index]?.append(label);
    });
  };
  const previousRender=window.render;
  window.render=function(){previousRender();Object.entries(types).forEach(([type,cfg])=>actions(cfg.list,type,db[type]));actions('recentMeals','meals',db.meals.slice(0,5));};
  render();
})();
