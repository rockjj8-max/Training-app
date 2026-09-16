(() => {
  'use strict';

  const STORAGE_KEY = 'hybridTrainingApp.v1';
  const APP_VERSION = '0.2.2';

  const uid = (prefix='id') => `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,8)}`;
  const nowISO = () => new Date().toISOString();
  const num = v => (v === '' || v === null || v === undefined ? null : Number(v));
  const avg = arr => arr.length ? arr.reduce((a,b)=>a+b,0) / arr.length : null;
  const parseSleepDuration = value => {
    if (!value) return null;
    const match = String(value).match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return null;
    const hours = Number(match[1]);
    const minutes = Number(match[2]);
    if (!Number.isInteger(hours) || !Number.isInteger(minutes) || hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
    return hours + minutes / 60;
  };
  const formatSleepDuration = value => {
    const hours = num(value);
    if (hours === null || !Number.isFinite(hours)) return '';
    const totalMinutes = Math.max(0, Math.min(1439, Math.round(hours * 60)));
    const hh = String(Math.floor(totalMinutes / 60)).padStart(2,'0');
    const mm = String(totalMinutes % 60).padStart(2,'0');
    return `${hh}:${mm}`;
  };
  const escapeHtml = s => String(s ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]));
  const localDate = (iso = nowISO()) => new Date(iso).toLocaleDateString('es-ES', {day:'2-digit', month:'short', year:'numeric'});
  const shortDate = (iso = nowISO()) => new Date(iso).toLocaleDateString('es-ES', {day:'2-digit', month:'2-digit'});
  const dateLabel = key => {
    if (!key) return '—';
    const [y,m,d] = key.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString('es-ES', {day:'2-digit', month:'short'});
  };
  const todayKey = () => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  };

  const loadEx = (id,name,variant,sets,repMin,repMax,rirMin=1,rirMax=2,increment=2.5,rest=120) => ({id,name,variant,mode:'load',sets,repMin,repMax,rirMin,rirMax,increment,rest});
  const skillEx = (id,name,variant,sets,repMin,repMax,rest=150) => ({id,name,variant,mode:'skill',sets,repMin,repMax,rirMin:null,rirMax:null,increment:0,rest});

  function defaultRoutines() {
    return [
      {
        id:'routine_torso_front',
        name:'Torso Front',
        note:'Front + fuerza relativa + hipertrofia de torso',
        exercises:[
          skillEx('ex_front','Subidas a front + negativas','Habilidad',3,1,5,150),
          skillEx('ex_pullup_explosive','Dominadas explosivas','Peso corporal',3,3,6,150),
          loadEx('ex_pullup_weighted','Dominadas lastradas','Lastre',3,5,8,1,2,2.5,180),
          loadEx('ex_dips','Fondos lastrados','Lastre',3,5,10,1,2,2.5,180),
          loadEx('ex_tbar_row','Remo en T','Máquina/barra',3,6,12,1,2,5,120),
          loadEx('ex_incline_machine','Press inclinado máquina','Máquina',3,6,12,1,2,5,120),
          loadEx('ex_rear_fly','Pájaro posterior','Máquina/mancuernas',3,10,20,1,2,2.5,90),
          loadEx('ex_lateral_seated','Elevación lateral sentado','Mancuernas',3,10,15,1,2,1,75)
        ]
      },
      {
        id:'routine_torso_muscleup',
        name:'Torso Muscle-up',
        note:'Muscle-up + fuerza relativa + hipertrofia de torso',
        exercises:[
          skillEx('ex_muscleup','Muscle-up','Habilidad',3,1,5,150),
          skillEx('ex_pullup_explosive','Dominadas explosivas','Peso corporal',3,3,6,150),
          loadEx('ex_bench','Press banca','Barra',3,6,10,1,2,2.5,180),
          loadEx('ex_hs_supine','Jalón supino máquina HS','Peso por lado',3,8,12,1,2,2.5,120),
          loadEx('ex_dips','Fondos lastrados','Lastre',3,5,10,1,2,2.5,180),
          loadEx('ex_rear_fly','Pájaro posterior','Máquina/mancuernas',3,10,20,1,2,2.5,90),
          loadEx('ex_lateral_seated','Elevación lateral sentado','Mancuernas',3,10,15,1,2,1,75)
        ]
      },
      {
        id:'routine_arms',
        name:'Brazos',
        note:'Bíceps + tríceps + core',
        exercises:[
          loadEx('ex_preacher_curl','Curl predicador','Máquina/barra',3,8,15,1,2,2.5,90),
          loadEx('ex_triceps_v','Jalón agarre V tríceps','Polea',3,8,15,1,2,2.5,90),
          loadEx('ex_biceps_v','Curl agarre V bíceps','Polea',3,8,15,1,2,2.5,90),
          loadEx('ex_skull_pulley','Rompecráneos polea','Polea',3,8,15,1,2,2.5,90),
          loadEx('ex_standing_curl','Curl mancuerna de pie','Mancuernas',3,8,15,1,2,1,90),
          loadEx('ex_triceps_machine','Jalón tríceps máquina','Máquina',3,8,15,1,2,5,90),
          loadEx('ex_abs_weighted','Abdominales','Lastre',3,8,15,1,3,1,90),
          loadEx('ex_crunch','Crunches','Peso corporal/lastre',3,12,20,1,3,1,75)
        ]
      },
      {
        id:'routine_legs',
        name:'Pierna',
        note:'Fuerza y masa compatibles con resistencia',
        exercises:[
          loadEx('ex_squat','Sentadilla','Barra',3,6,10,1,3,2.5,180),
          loadEx('ex_deadlift','Peso muerto','Convencional',3,5,8,1,3,5,210),
          loadEx('ex_bulgarian','Búlgaras en rack','Rack/mancuernas',3,8,12,1,3,2.5,120),
          loadEx('ex_hipthrust','Hip thrust','Peso por lado',3,8,12,1,3,5,150),
          loadEx('ex_legcurl','Femoral tumbado','Máquina',3,8,15,1,3,5,90),
          loadEx('ex_calf','Gemelo máquina','Máquina',4,12,20,1,3,5,75)
        ]
      }
    ];
  }

  function defaultState() {
    return {
      version:2,
      createdAt:nowISO(),
      settings:{
        units:'kg',
        compactMode:false,
        profile:{
          mainGoal:'Base equilibrada para triatlón olímpico 2027',
          gymGoal:'Hipertrofia y estética, especialmente torso'
        }
      },
      routines:defaultRoutines(),
      sessions:[],
      dailyLogs:[],
      draftSession:null
    };
  }

  function isOldDefaultRoutine(routine, expectedIds) {
    if (!routine || !Array.isArray(routine.exercises)) return false;
    const ids = routine.exercises.map(e=>e.id);
    return ids.length === expectedIds.length && expectedIds.every((id,i)=>ids[i]===id);
  }

  function migrateState(raw) {
    const base = defaultState();
    if (!raw || typeof raw !== 'object') return base;
    const migrated = {
      ...base,
      ...raw,
      version:2,
      settings:{...base.settings, ...(raw.settings||{}), profile:{...base.settings.profile, ...(raw.settings?.profile||{})}},
      routines:Array.isArray(raw.routines) ? raw.routines : base.routines,
      sessions:Array.isArray(raw.sessions) ? raw.sessions : [],
      dailyLogs:Array.isArray(raw.dailyLogs) ? raw.dailyLogs : [],
      draftSession:raw.draftSession || null
    };

    const defaults = defaultRoutines();
    const oldFrontIds = ['ex_bench','ex_dips','ex_pullup_weighted','ex_hs_supine','ex_lateral_seated','ex_front'];
    const oldLegIds = ['ex_squat','ex_deadlift','ex_bulgarian','ex_hipthrust'];
    const frontIndex = migrated.routines.findIndex(r=>r.id==='routine_torso_front');
    if (frontIndex >= 0 && isOldDefaultRoutine(migrated.routines[frontIndex], oldFrontIds)) {
      migrated.routines[frontIndex] = JSON.parse(JSON.stringify(defaults.find(r=>r.id==='routine_torso_front')));
    }
    const legIndex = migrated.routines.findIndex(r=>r.id==='routine_legs');
    if (legIndex >= 0 && isOldDefaultRoutine(migrated.routines[legIndex], oldLegIds)) {
      migrated.routines[legIndex] = JSON.parse(JSON.stringify(defaults.find(r=>r.id==='routine_legs')));
    }
    defaults.forEach(template => {
      if (!migrated.routines.some(r=>r.id===template.id || r.name.toLowerCase()===template.name.toLowerCase())) {
        migrated.routines.push(JSON.parse(JSON.stringify(template)));
      }
    });
    return migrated;
  }

  function loadState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? migrateState(JSON.parse(raw)) : defaultState();
    } catch (e) {
      console.warn('No se pudieron cargar los datos', e);
      return defaultState();
    }
  }

  let state = loadState();
  let currentView = 'today';
  let progressExerciseId = null;

  const app = document.getElementById('app');
  const title = document.getElementById('pageTitle');
  const modal = document.getElementById('modal');
  const modalContent = document.getElementById('modalContent');
  const toastEl = document.getElementById('toast');

  function saveState() { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  function toast(msg) {
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    setTimeout(() => toastEl.classList.remove('show'), 1700);
  }
  function openModal(html) { modalContent.innerHTML = `<div class="modal-inner">${html}</div>`; modal.showModal(); }
  function closeModal() { if (modal.open) modal.close(); }
  function routineById(id) { return state.routines.find(r=>r.id===id); }
  function findExerciseDef(exId) {
    for (const routine of state.routines) {
      const ex = routine.exercises.find(e=>e.id===exId);
      if (ex) return ex;
    }
    return null;
  }
  function previousExerciseSession(exId, beforeIso=null) {
    return state.sessions
      .filter(s=>s.status==='completed' && (!beforeIso || new Date(s.completedAt)<new Date(beforeIso)))
      .sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt))
      .map(s=>({session:s, exercise:s.exercises.find(e=>e.exerciseId===exId)}))
      .find(x=>x.exercise)?.exercise || null;
  }
  function latestExerciseHistory(exId, limit=8) {
    return state.sessions
      .filter(s=>s.status==='completed')
      .sort((a,b)=>new Date(a.completedAt)-new Date(b.completedAt))
      .map(s=>({session:s, exercise:s.exercises.find(e=>e.exerciseId===exId)}))
      .filter(x=>x.exercise)
      .slice(-limit);
  }
  function effectiveSets(ex) { return ex.sets.filter(s=>s.done && num(s.reps)!==null); }
  function exerciseBestE1RM(ex) {
    if (ex.mode==='skill') return null;
    const vals = effectiveSets(ex).map(s=>{
      const w=num(s.weight), r=num(s.reps);
      if (w===null || r===null || w<=0) return null;
      return w*(1+r/30);
    }).filter(v=>v!==null);
    return vals.length ? Math.max(...vals) : null;
  }
  function formatSets(ex) {
    const valid=effectiveSets(ex);
    if (!valid.length) return 'Sin datos';
    if (ex.mode==='skill') return valid.map(s=>`${s.reps} reps`).join(' / ');
    return valid.map(s=>`${s.weight ?? 0}×${s.reps}${s.rir!=='' && s.rir!==null && s.rir!==undefined ? ` @${s.rir}`:''}`).join(' · ');
  }
  function summarizePrevious(exId) {
    const prev=previousExerciseSession(exId);
    return prev ? formatSets(prev) : 'Sin sesión anterior';
  }

  function dailyLogByDate(date) { return state.dailyLogs.find(x=>x.date===date) || null; }
  function sortedDailyLogs() { return [...state.dailyLogs].sort((a,b)=>a.date.localeCompare(b.date)); }
  function latestDailyLog() { return sortedDailyLogs().slice(-1)[0] || null; }
  function logsWithinDays(days) {
    const end = new Date(); end.setHours(23,59,59,999);
    const start = new Date(); start.setDate(start.getDate()-(days-1)); start.setHours(0,0,0,0);
    return state.dailyLogs.filter(l=>{
      const [y,m,d]=l.date.split('-').map(Number);
      const dt=new Date(y,m-1,d);
      return dt>=start && dt<=end;
    });
  }
  function dailyAverages(days=7) {
    const logs=logsWithinDays(days);
    const weights=logs.map(x=>num(x.bodyWeight)).filter(v=>v!==null);
    const sleeps=logs.map(x=>num(x.sleepHours)).filter(v=>v!==null);
    return {weight:avg(weights), sleep:avg(sleeps), count:logs.length};
  }
  function saveMorningLog() {
    const date=document.getElementById('morningDate')?.value || todayKey();
    const bodyWeight=num(document.getElementById('morningWeight')?.value);
    const sleepRaw=document.getElementById('morningSleep')?.value || '';
    const sleepHours=parseSleepDuration(sleepRaw);
    if (bodyWeight===null && !sleepRaw) return toast('Añade sueño o peso');
    if (sleepRaw && sleepHours===null) return toast('Revisa el sueño en formato HH:MM');
    if (bodyWeight!==null && (bodyWeight<30 || bodyWeight>250)) return toast('Revisa el peso');
    const existing=dailyLogByDate(date);
    if (existing) {
      existing.bodyWeight=bodyWeight;
      existing.sleepHours=sleepHours;
      existing.updatedAt=nowISO();
    } else {
      state.dailyLogs.push({id:uid('daily'), date, bodyWeight, sleepHours, createdAt:nowISO()});
    }
    saveState(); render(); toast('Registro matinal guardado');
  }

  function createDraft(routineId) {
    const routine=routineById(routineId); if (!routine) return;
    state.draftSession={
      id:uid('session'), routineId, routineName:routine.name, startedAt:nowISO(), completedAt:null, status:'draft', sessionRPE:'', notes:'',
      exercises:routine.exercises.map(ex=>{
        const prev=previousExerciseSession(ex.id); const prevSets=prev?.sets || [];
        return {
          exerciseId:ex.id, name:ex.name, variant:ex.variant, mode:ex.mode,
          target:{sets:ex.sets,repMin:ex.repMin,repMax:ex.repMax,rirMin:ex.rirMin,rirMax:ex.rirMax,rest:ex.rest,increment:ex.increment},
          sets:Array.from({length:ex.sets},(_,i)=>({id:uid('set'),weight:ex.mode==='skill'?0:(prevSets[i]?.weight ?? ''),reps:'',rir:'',rest:ex.rest,done:false,note:''})),
          notes:''
        };
      })
    };
    saveState(); currentView='today'; render();
  }
  function copyPreviousExercise(exIndex) {
    const ex=state.draftSession?.exercises[exIndex]; if (!ex) return;
    const prev=previousExerciseSession(ex.exerciseId); if (!prev) return toast('No hay sesión anterior');
    ex.sets=prev.sets.map(s=>({...s,id:uid('set'),done:false}));
    saveState(); render(); toast('Series anteriores copiadas');
  }
  function addSet(exIndex) {
    const ex=state.draftSession?.exercises[exIndex]; if (!ex) return;
    const last=ex.sets[ex.sets.length-1];
    ex.sets.push({id:uid('set'),weight:last?.weight ?? '',reps:'',rir:'',rest:last?.rest ?? ex.target.rest,done:false,note:''});
    saveState(); render();
  }
  function removeLastSet(exIndex) {
    const ex=state.draftSession?.exercises[exIndex]; if (!ex) return;
    if (ex.sets.length<=1) return toast('Debe quedar al menos una serie');
    ex.sets.pop(); saveState(); render(); toast('Última serie eliminada');
  }

  function progressionDecision(exerciseRecord) {
    const sets=effectiveSets(exerciseRecord);
    if (!sets.length) return {code:'GYM-NODATA',label:'Sin decisión',class:'',text:'Faltan series completadas.'};
    if (exerciseRecord.mode==='skill') {
      const hist=latestExerciseHistory(exerciseRecord.exerciseId,3);
      if (hist.length<2) return {code:'SKILL-BASE',label:'Crear baseline',class:'',text:'Mantén la progresión y registra calidad/observaciones.'};
      const currentReps=sets.reduce((a,s)=>a+(num(s.reps)||0),0);
      const prev=hist[hist.length-2]?.exercise;
      const prevReps=prev ? effectiveSets(prev).reduce((a,s)=>a+(num(s.reps)||0),0) : null;
      if (prevReps!==null && currentReps>prevReps) return {code:'SKILL-PROG-01',label:'Progreso',class:'good',text:'Más repeticiones totales en la misma habilidad. Mantén variante hasta consolidarla.'};
      return {code:'SKILL-MAINT-01',label:'Mantener',class:'',text:'No hay evidencia suficiente para cambiar la progresión.'};
    }
    const repMax=exerciseRecord.target.repMax;
    const rirMin=exerciseRecord.target.rirMin;
    const allTop=sets.length>=exerciseRecord.target.sets && sets.every(s=>num(s.reps)>=repMax);
    const rirKnown=sets.every(s=>num(s.rir)!==null);
    const rirOK=rirMin===null ? true : (rirKnown && sets.every(s=>num(s.rir)>=rirMin));
    const weights=sets.map(s=>num(s.weight)).filter(v=>v!==null);
    const sameWeight=weights.length && weights.every(w=>w===weights[0]);
    if (allTop && rirOK && sameWeight) {
      const inc=exerciseRecord.target.increment || 2.5;
      const next=(weights[0]+inc).toFixed(inc%1?1:0);
      return {code:'GYM-PROG-01',label:'Subir carga',class:'good',text:`Rango superior completado con RIR objetivo. Próxima referencia: ${next} kg.`};
    }
    const hist=latestExerciseHistory(exerciseRecord.exerciseId,4);
    const currentTotal=sets.reduce((a,s)=>a+(num(s.reps)||0),0);
    const previous=hist.length>=2 ? hist[hist.length-2].exercise : previousExerciseSession(exerciseRecord.exerciseId,state.draftSession?.startedAt);
    if (previous) {
      const prevSets=effectiveSets(previous);
      const prevTotal=prevSets.reduce((a,s)=>a+(num(s.reps)||0),0);
      const currentAvgWeight=avg(weights)||0;
      const prevWeights=prevSets.map(s=>num(s.weight)).filter(v=>v!==null);
      const prevAvgWeight=avg(prevWeights)||0;
      if (Math.abs(currentAvgWeight-prevAvgWeight)<.01 && currentTotal>prevTotal) return {code:'GYM-PROG-02',label:'Mantener carga',class:'good',text:'Has aumentado repeticiones con carga comparable. Ya existe progresión.'};
      if (Math.abs(currentAvgWeight-prevAvgWeight)<.01 && currentTotal===prevTotal) {
        const cRir=avg(sets.map(s=>num(s.rir)).filter(v=>v!==null));
        const pRir=avg(prevSets.map(s=>num(s.rir)).filter(v=>v!==null));
        if (cRir!==null && pRir!==null && cRir>pRir) return {code:'GYM-PROG-03',label:'Mantener carga',class:'good',text:'Mismas repeticiones con mayor RIR: mejora de rendimiento.'};
      }
    }
    if (hist.length>=3) {
      const last3=hist.slice(-3).map(x=>x.exercise);
      const totals=last3.map(e=>effectiveSets(e).reduce((a,s)=>a+(num(s.reps)||0),0));
      if (Math.max(...totals)-Math.min(...totals)<=1) return {code:'GYM-STALL-01',label:'Vigilar estancamiento',class:'warn',text:'Tres exposiciones con progreso mínimo. Antes de cambiar ejercicio: revisar microcarga, volumen y rango de reps.'};
    }
    return {code:'GYM-MAINT-01',label:'Mantener',class:'',text:'No se cumplen aún las condiciones para aumentar carga. Busca mejorar reps o RIR con técnica estable.'};
  }

  function sessionSummary(draft) {
    let completed=0,total=0;
    draft.exercises.forEach(ex=>ex.sets.forEach(s=>{total++; if(s.done) completed++;}));
    return {completed,total,pct:total?Math.round(completed/total*100):0};
  }
  function finalizeSession() {
    const draft=state.draftSession; if (!draft) return;
    const summary=sessionSummary(draft); if (!summary.completed) return toast('Completa al menos una serie');
    draft.status='completed'; draft.completedAt=nowISO();
    draft.exercises.forEach(ex=>{ex.decision=progressionDecision(ex);});
    state.sessions.push(JSON.parse(JSON.stringify(draft))); state.draftSession=null; saveState();
    currentView='history'; render(); toast('Entrenamiento guardado');
  }
  function cancelSession() {
    if (!state.draftSession) return;
    openModal(`
      <div class="modal-head"><div><div class="eyebrow">CONFIRMAR</div><h2>Descartar entrenamiento</h2></div><button class="modal-close" data-cancel-no>×</button></div>
      <p class="muted" style="margin-top:8px">Se perderán los datos introducidos en esta sesión que todavía no hayas finalizado.</p>
      <div class="row" style="margin-top:18px;gap:10px">
        <button class="ghost-btn" data-cancel-no style="flex:1">Seguir entrenando</button>
        <button class="danger-btn" data-cancel-yes style="flex:1">Descartar sesión</button>
      </div>`);
    modalContent.onclick = ev => {
      if (ev.target.closest('[data-cancel-no]')) return closeModal();
      if (ev.target.closest('[data-cancel-yes]')) {
        state.draftSession = null;
        saveState();
        closeModal();
        currentView = 'today';
        render();
        toast('Entrenamiento descartado');
      }
    };
  }

  function morningCard() {
    const key=todayKey(); const log=dailyLogByDate(key); const a7=dailyAverages(7);
    return `
      <section class="card morning-card">
        <div class="row between"><div><div class="eyebrow">REGISTRO MATINAL</div><h2>Sueño y peso</h2></div>${log?'<span class="tag good">Guardado</span>':'<span class="tag">Pendiente</span>'}</div>
        <div class="form-grid morning-grid" style="margin-top:12px">
          <label>Fecha<input id="morningDate" type="date" value="${key}"></label>
          <label>Horas de sueño (HH:MM)<input id="morningSleep" type="time" step="60" value="${formatSleepDuration(log?.sleepHours)}"></label>
          <label>Peso corporal (kg)<input id="morningWeight" inputmode="decimal" type="number" min="30" max="250" step="0.1" value="${escapeHtml(log?.bodyWeight ?? '')}" placeholder="Ej. 73.1"></label>
          <button class="primary-btn morning-save" id="saveMorningBtn">Guardar</button>
        </div>
        <div class="grid-2" style="margin-top:12px">
          <div class="metric"><strong>${a7.sleep!==null?formatSleepDuration(a7.sleep):'—'}</strong><small>sueño · media 7 días</small></div>
          <div class="metric"><strong>${a7.weight!==null?a7.weight.toFixed(1):'—'}</strong><small>kg · media 7 días</small></div>
        </div>
      </section>`;
  }

  function renderToday() {
    title.textContent='Hoy';
    if (state.draftSession) return renderActiveSession();
    const recent=state.sessions.filter(s=>s.status==='completed').sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt))[0];
    const lastDaily=latestDailyLog();
    app.innerHTML=`
      <section class="card hero">
        <div class="eyebrow">FASE 1 · FUERZA + RECUPERACIÓN BÁSICA</div>
        <div class="hero-row"><div><div class="big">Registrar</div><div class="muted">Entreno, sueño y peso con historial.</div></div><span class="tag good">v${APP_VERSION}</span></div>
      </section>
      ${morningCard()}
      <div class="section-head"><h2>Empezar rutina</h2><span class="muted">${state.routines.length} disponibles</span></div>
      <div class="stack">${state.routines.map(r=>`
        <section class="card routine-card"><div><h3>${escapeHtml(r.name)}</h3><div class="meta">${r.exercises.length} ejercicios · ${escapeHtml(r.note||'')}</div></div><button class="primary-btn" data-start-routine="${r.id}">Empezar</button></section>`).join('')}</div>
      <div class="section-head"><h2>Estado</h2></div>
      <section class="card"><div class="grid-3">
        <div class="metric"><strong>${state.sessions.length}</strong><small>sesiones</small></div>
        <div class="metric"><strong>${recent?shortDate(recent.completedAt):'—'}</strong><small>último gym</small></div>
        <div class="metric"><strong>${lastDaily?.bodyWeight ?? '—'}</strong><small>kg último registro</small></div>
      </div></section>`;
  }

  function renderActiveSession() {
    const d=state.draftSession; title.textContent=d.routineName; const sum=sessionSummary(d);
    app.innerHTML=`
      <section class="card"><div class="row between"><div><div class="eyebrow">EN CURSO</div><h2>${escapeHtml(d.routineName)}</h2></div><span class="tag ${sum.pct===100?'good':''}">${sum.pct}%</span></div><div class="muted" style="margin-top:6px">${sum.completed}/${sum.total} series · inicio ${new Date(d.startedAt).toLocaleTimeString('es-ES',{hour:'2-digit',minute:'2-digit'})}</div></section>
      ${d.exercises.map((ex,i)=>renderExerciseCard(ex,i)).join('')}
      <section class="card"><div class="form-grid"><label>RPE de la sesión<input type="number" min="1" max="10" step="1" data-session-field="sessionRPE" value="${escapeHtml(d.sessionRPE)}" placeholder="1–10"></label><label>Notas<textarea data-session-field="notes" placeholder="Sensaciones, dolor, contexto…">${escapeHtml(d.notes)}</textarea></label></div></section>
      <div class="session-bar"><button class="danger-btn" id="cancelSessionBtn">Descartar</button><button class="primary-btn" id="finishSessionBtn">Finalizar</button></div>`;
  }

  function renderExerciseCard(ex,exIndex) {
    const targetText=ex.mode==='skill' ? `${ex.target.sets} series · habilidad` : `${ex.target.sets}×${ex.target.repMin}-${ex.target.repMax} · RIR ${ex.target.rirMin ?? '—'}-${ex.target.rirMax ?? '—'}`;
    return `<section class="card exercise-card">
      <div class="exercise-header"><div><div class="exercise-name">${escapeHtml(ex.name)}</div><div class="exercise-sub">${escapeHtml(ex.variant)} · ${targetText}</div></div><button class="small-btn" data-copy-prev="${exIndex}">↺ anterior</button></div>
      <div class="prev-box"><strong>Anterior:</strong> ${escapeHtml(summarizePrevious(ex.exerciseId))}</div>
      <table class="set-table"><thead><tr><th>#</th><th>${ex.mode==='skill'?'Asist.':'kg'}</th><th>reps</th><th>RIR</th><th>desc.</th><th>✓</th></tr></thead><tbody>
        ${ex.sets.map((s,setIndex)=>`<tr>
          <td>${setIndex+1}</td>
          <td><input class="set-input" inputmode="decimal" type="number" step="0.5" data-set-field="weight" data-ex="${exIndex}" data-set="${setIndex}" value="${escapeHtml(s.weight)}" ${ex.mode==='skill'?'placeholder="0"':''}></td>
          <td><input class="set-input" inputmode="numeric" type="number" step="1" data-set-field="reps" data-ex="${exIndex}" data-set="${setIndex}" value="${escapeHtml(s.reps)}"></td>
          <td><input class="set-input" inputmode="numeric" type="number" min="0" max="10" step="1" data-set-field="rir" data-ex="${exIndex}" data-set="${setIndex}" value="${escapeHtml(s.rir)}"></td>
          <td><input class="set-input" inputmode="numeric" type="number" step="5" data-set-field="rest" data-ex="${exIndex}" data-set="${setIndex}" value="${escapeHtml(s.rest)}"></td>
          <td><button class="check-set ${s.done?'done':''}" data-check-set="${exIndex}:${setIndex}">${s.done?'✓':'○'}</button></td>
        </tr>`).join('')}
      </tbody></table>
      <div class="exercise-actions"><button class="ghost-btn" data-remove-set="${exIndex}">− serie</button><button class="ghost-btn" data-add-set="${exIndex}">+ serie</button></div>
    </section>`;
  }

  function renderRoutines() {
    title.textContent='Rutinas';
    app.innerHTML=`
      <div class="section-head"><h2>Mis rutinas</h2><button class="primary-btn" id="newRoutineBtn">+ Nueva</button></div>
      <div class="stack">${state.routines.map((r,idx)=>`<section class="card">
        <div class="row between"><div><h3>${escapeHtml(r.name)}</h3><div class="muted" style="font-size:13px;margin-top:4px">${r.exercises.length} ejercicios · ${escapeHtml(r.note||'')}</div></div><button class="small-btn" data-edit-routine="${idx}">Editar</button></div>
        <div style="margin-top:12px" class="stack">${r.exercises.map((e,i)=>`<div class="row between"><span><strong>${i+1}.</strong> ${escapeHtml(e.name)}</span><span class="tag">${e.mode==='skill'?'habilidad':`${e.sets}×${e.repMin}-${e.repMax}`}</span></div>`).join('')}</div>
      </section>`).join('')}</div>`;
  }

  function routineEditor(idx=null) {
    const r=idx===null ? {id:uid('routine'),name:'',note:'',exercises:[]} : JSON.parse(JSON.stringify(state.routines[idx]));
    openModal(`
      <div class="modal-head"><div><div class="eyebrow">RUTINA EDITABLE</div><h2>${idx===null?'Nueva rutina':'Editar rutina'}</h2></div><button class="modal-close" data-close-modal>×</button></div>
      <div class="form-grid"><label>Nombre<input id="routineName" value="${escapeHtml(r.name)}" placeholder="Ej. Torso B"></label><label>Nota<input id="routineNote" value="${escapeHtml(r.note)}" placeholder="Objetivo de la sesión"></label></div>
      <div class="section-head"><h3>Ejercicios y orden</h3><button class="small-btn" id="addExerciseInEditor">+ ejercicio</button></div>
      <div id="routineExerciseEditor" class="stack"></div>
      <div class="row" style="margin-top:16px">${idx!==null?'<button class="danger-btn" id="deleteRoutineBtn">Eliminar</button>':''}<button class="primary-btn" id="saveRoutineBtn" style="margin-left:auto">Guardar</button></div>`);
    const list=modalContent.querySelector('#routineExerciseEditor');
    const draftExercises=r.exercises;
    const paint=()=>{
      list.innerHTML=draftExercises.length ? draftExercises.map((e,i)=>`
        <div class="card editor-exercise" style="box-shadow:none;margin:0">
          <div class="row between"><div class="row"><span class="order-badge">${i+1}</span><strong>${escapeHtml(e.name||'Nuevo ejercicio')}</strong></div><div class="editor-order-actions"><button class="small-btn" data-move-ed="up" data-i="${i}" ${i===0?'disabled':''}>↑</button><button class="small-btn" data-move-ed="down" data-i="${i}" ${i===draftExercises.length-1?'disabled':''}>↓</button><button class="small-btn" data-rm-ed="${i}">Quitar</button></div></div>
          <div class="grid-2" style="margin-top:10px">
            <label>Ejercicio<input data-ed="name" data-i="${i}" value="${escapeHtml(e.name)}"></label>
            <label>Variante<input data-ed="variant" data-i="${i}" value="${escapeHtml(e.variant||'')}"></label>
            <label>Tipo<select data-ed="mode" data-i="${i}"><option value="load" ${e.mode==='load'?'selected':''}>Carga/reps</option><option value="skill" ${e.mode==='skill'?'selected':''}>Habilidad</option></select></label>
            <label>Series<input type="number" min="1" max="12" data-ed="sets" data-i="${i}" value="${e.sets||3}"></label>
            <label>Rep mín<input type="number" data-ed="repMin" data-i="${i}" value="${e.repMin ?? 6}"></label>
            <label>Rep máx<input type="number" data-ed="repMax" data-i="${i}" value="${e.repMax ?? 10}"></label>
            <label>RIR mín<input type="number" data-ed="rirMin" data-i="${i}" value="${e.rirMin ?? 1}"></label>
            <label>RIR máx<input type="number" data-ed="rirMax" data-i="${i}" value="${e.rirMax ?? 2}"></label>
            <label>Descanso de referencia (s)<input type="number" data-ed="rest" data-i="${i}" value="${e.rest ?? 120}"></label>
            <label>Incremento kg<input type="number" step="0.5" data-ed="increment" data-i="${i}" value="${e.increment ?? 2.5}"></label>
          </div>
        </div>`).join('') : '<div class="empty">Añade el primer ejercicio.</div>';
    };
    paint();
    modalContent.onclick=ev=>{
      if (ev.target.matches('[data-close-modal]')) return closeModal();
      if (ev.target.id==='addExerciseInEditor') { draftExercises.push({id:uid('ex'),name:'',variant:'',mode:'load',sets:3,repMin:6,repMax:10,rirMin:1,rirMax:2,rest:120,increment:2.5}); paint(); return; }
      if (ev.target.matches('[data-rm-ed]')) { draftExercises.splice(Number(ev.target.dataset.rmEd),1); paint(); return; }
      if (ev.target.matches('[data-move-ed]')) {
        const i=Number(ev.target.dataset.i); const dir=ev.target.dataset.moveEd; const j=dir==='up'?i-1:i+1;
        if (j<0 || j>=draftExercises.length) return;
        [draftExercises[i],draftExercises[j]]=[draftExercises[j],draftExercises[i]]; paint(); return;
      }
      if (ev.target.id==='saveRoutineBtn') {
        r.name=modalContent.querySelector('#routineName').value.trim(); r.note=modalContent.querySelector('#routineNote').value.trim();
        if (!r.name) return toast('Pon un nombre a la rutina');
        if (!draftExercises.length) return toast('Añade al menos un ejercicio');
        if (idx===null) state.routines.push(r); else state.routines[idx]=r;
        saveState(); closeModal(); render(); toast('Rutina guardada'); return;
      }
      if (ev.target.id==='deleteRoutineBtn' && confirm('¿Eliminar esta rutina? El historial no se borrará.')) { state.routines.splice(idx,1); saveState(); closeModal(); render(); }
    };
    modalContent.oninput=modalContent.onchange=ev=>{
      if (!ev.target.matches('[data-ed]')) return;
      const i=Number(ev.target.dataset.i), key=ev.target.dataset.ed;
      const numeric=['sets','repMin','repMax','rirMin','rirMax','rest','increment'].includes(key);
      draftExercises[i][key]=numeric ? Number(ev.target.value) : ev.target.value;
    };
  }

  function renderHistory() {
    title.textContent='Historial';
    const sessions=state.sessions.filter(s=>s.status==='completed').sort((a,b)=>new Date(b.completedAt)-new Date(a.completedAt));
    app.innerHTML=sessions.length ? `<div class="section-head"><h2>Sesiones</h2><span class="muted">${sessions.length}</span></div><div class="stack">${sessions.map(s=>{
      const sets=s.exercises.reduce((n,e)=>n+effectiveSets(e).length,0);
      return `<section class="card history-item" data-history-id="${s.id}"><div class="top"><div><h3>${escapeHtml(s.routineName)}</h3><div class="muted">${localDate(s.completedAt)}</div></div><span class="tag">${sets} series</span></div><div class="muted" style="font-size:13px">RPE sesión: ${s.sessionRPE||'—'}${s.notes?` · ${escapeHtml(s.notes)}`:''}</div><div class="row between"><span class="muted" style="font-size:12px">Toca para ver detalle</span><span>›</span></div></section>`;
    }).join('')}</div>` : '<section class="card empty">Todavía no hay entrenamientos guardados.</section>';
  }

  function historyDetail(id) {
    const s=state.sessions.find(x=>x.id===id); if (!s) return;
    openModal(`<div class="modal-head"><div><div class="eyebrow">${localDate(s.completedAt)}</div><h2>${escapeHtml(s.routineName)}</h2></div><button class="modal-close" data-close-modal>×</button></div><div class="stack">${s.exercises.map(ex=>{
      const decision=ex.decision || progressionDecision(ex);
      return `<section class="card" style="box-shadow:none;margin:0"><div class="row between"><strong>${escapeHtml(ex.name)}</strong><span class="tag ${decision.class||''}">${escapeHtml(decision.label)}</span></div><div class="muted" style="font-size:13px;margin-top:5px">${escapeHtml(formatSets(ex))}</div><div class="rule-box ${decision.class||''}"><strong>${escapeHtml(decision.code)}</strong><br>${escapeHtml(decision.text)}</div></section>`;
    }).join('')}</div><div class="row" style="margin-top:16px"><button class="danger-btn" id="deleteHistoryBtn">Eliminar sesión</button><button class="ghost-btn" data-close-modal style="margin-left:auto">Cerrar</button></div>`);
    modalContent.onclick=ev=>{
      if (ev.target.matches('[data-close-modal]')) return closeModal();
      if (ev.target.id==='deleteHistoryBtn' && confirm('¿Eliminar esta sesión del historial?')) { state.sessions=state.sessions.filter(x=>x.id!==id); saveState(); closeModal(); render(); }
    };
  }

  function allExerciseDefs() {
    const map=new Map();
    state.routines.forEach(r=>r.exercises.forEach(e=>{if(!map.has(e.id)) map.set(e.id,e);}));
    state.sessions.forEach(s=>s.exercises.forEach(e=>{if(!map.has(e.exerciseId)) map.set(e.exerciseId,{id:e.exerciseId,name:e.name,variant:e.variant,mode:e.mode});}));
    return [...map.values()];
  }
  function sparkPath(points,width=300,height=70) {
    if (!points.length) return '';
    const vals=points.map(p=>p.value); const max=Math.max(...vals), min=Math.min(...vals);
    return points.map((p,i)=>{
      const x=points.length===1?width/2:(i/(points.length-1))*width;
      const y=max===min?height/2:(height-5)-((p.value-min)/(max-min))*(height-15);
      return `${i===0?'M':'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
    }).join(' ');
  }
  function recoveryProgressCard() {
    const logs=sortedDailyLogs().slice(-14); const a7=dailyAverages(7);
    const weightPts=logs.map(l=>({date:l.date,value:num(l.bodyWeight)})).filter(p=>p.value!==null);
    const sleepPts=logs.map(l=>({date:l.date,value:num(l.sleepHours)})).filter(p=>p.value!==null);
    return `<section class="card"><div class="row between"><div><div class="eyebrow">RECUPERACIÓN BÁSICA</div><h2>Peso y sueño</h2></div><span class="tag">${logs.length} registros</span></div>
      <div class="grid-2" style="margin-top:12px"><div class="metric"><strong>${a7.weight!==null?a7.weight.toFixed(1):'—'}</strong><small>kg · media 7 días</small></div><div class="metric"><strong>${a7.sleep!==null?formatSleepDuration(a7.sleep):'—'}</strong><small>sueño · media 7 días</small></div></div>
      ${weightPts.length?`<div class="mini-chart-label">Peso · últimos ${weightPts.length}</div><svg class="spark" viewBox="0 0 300 70" preserveAspectRatio="none"><path d="${sparkPath(weightPts)}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`:''}
      ${sleepPts.length?`<div class="mini-chart-label">Sueño · últimos ${sleepPts.length}</div><svg class="spark" viewBox="0 0 300 70" preserveAspectRatio="none"><path d="${sparkPath(sleepPts)}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`:''}
      ${logs.length?`<div class="daily-log-list">${logs.slice().reverse().map(l=>`<div class="progress-row"><div><strong>${dateLabel(l.date)}</strong></div><div style="text-align:right"><strong>${l.bodyWeight??'—'} kg</strong><div class="muted" style="font-size:12px">${l.sleepHours!==null && l.sleepHours!==undefined?formatSleepDuration(l.sleepHours):'—'} sueño</div></div></div>`).join('')}</div>`:'<div class="empty">Aún no hay registros matinales.</div>'}
    </section>`;
  }
  function renderProgress() {
    title.textContent='Progreso';
    const defs=allExerciseDefs();
    if (!progressExerciseId && defs.length) progressExerciseId=defs[0].id;
    const selected=defs.find(e=>e.id===progressExerciseId); const hist=selected?latestExerciseHistory(selected.id,10):[];
    app.innerHTML=`${recoveryProgressCard()}<div class="section-head"><h2>Fuerza</h2></div><section class="card"><label>Ejercicio<select id="progressExerciseSelect">${defs.map(e=>`<option value="${e.id}" ${e.id===progressExerciseId?'selected':''}>${escapeHtml(e.name)}</option>`).join('')}</select></label></section>${selected?renderProgressDetail(selected,hist):'<section class="card empty">Crea una rutina para empezar.</section>'}`;
  }
  function renderProgressDetail(def,hist) {
    if (!hist.length) return `<section class="card empty">Aún no hay datos de ${escapeHtml(def.name)}.</section>`;
    const latest=hist[hist.length-1].exercise; const decision=latest.decision || progressionDecision(latest);
    const points=hist.map(x=>({date:shortDate(x.session.completedAt),value:def.mode==='skill'?effectiveSets(x.exercise).reduce((a,s)=>a+(num(s.reps)||0),0):exerciseBestE1RM(x.exercise)})).filter(p=>p.value!==null);
    return `<section class="card"><div class="row between"><div><div class="eyebrow">ÚLTIMA REFERENCIA</div><h2>${escapeHtml(def.name)}</h2></div><span class="tag ${decision.class||''}">${escapeHtml(decision.label)}</span></div><div style="margin-top:8px" class="muted">${escapeHtml(formatSets(latest))}</div><div class="rule-box ${decision.class||''}"><strong>${escapeHtml(decision.code)}</strong><br>${escapeHtml(decision.text)}</div></section>
      <section class="card"><div class="row between"><h3>${def.mode==='skill'?'Reps totales':'e1RM estimado'}</h3><span class="muted">últimas ${points.length}</span></div>${points.length?`<svg class="spark" viewBox="0 0 300 70" preserveAspectRatio="none"><path d="${sparkPath(points)}" fill="none" stroke="currentColor" stroke-width="3" vector-effect="non-scaling-stroke"/></svg>`:''}<div class="grid-3"><div class="metric"><strong>${points[0]?.value?.toFixed?.(1)??'—'}</strong><small>inicio</small></div><div class="metric"><strong>${points[points.length-1]?.value?.toFixed?.(1)??'—'}</strong><small>actual</small></div><div class="metric"><strong>${points.length>1?((points[points.length-1].value/points[0].value-1)*100).toFixed(1)+'%':'—'}</strong><small>cambio</small></div></div></section>
      <div class="section-head"><h3>Últimas sesiones</h3></div><section class="card">${hist.slice().reverse().map(x=>`<div class="progress-row"><div><strong>${shortDate(x.session.completedAt)}</strong><div class="muted" style="font-size:12px">${escapeHtml(formatSets(x.exercise))}</div></div><div style="text-align:right">${def.mode==='skill'?`${effectiveSets(x.exercise).reduce((a,s)=>a+(num(s.reps)||0),0)} reps`:`${exerciseBestE1RM(x.exercise)?.toFixed(1)??'—'} e1RM`}</div></div>`).join('')}</section>`;
  }

  function renderSettings() {
    title.textContent='Ajustes';
    app.innerHTML=`
      <section class="card"><h3>Objetivo del sistema</h3><p class="muted">${escapeHtml(state.settings.profile.mainGoal)}. En fuerza: ${escapeHtml(state.settings.profile.gymGoal)}.</p></section>
      <section class="card"><h3>Datos</h3><p class="muted">Se guardan localmente en este navegador. Exporta copias de seguridad con frecuencia.</p><div class="grid-2"><button class="ghost-btn" id="exportBtn">Exportar JSON</button><button class="ghost-btn" id="importBtn">Importar JSON</button></div><input id="importFile" type="file" accept="application/json" hidden></section>
      <section class="card"><h3>Motor activo</h3><div class="stack" style="margin-top:10px"><div class="row between"><span>Progresión compuestos</span><span class="tag good">Activo</span></div><div class="row between"><span>Progresión aislamientos</span><span class="tag good">Activo</span></div><div class="row between"><span>Habilidades/calistenia</span><span class="tag good">Activo</span></div><div class="row between"><span>Peso + sueño diario</span><span class="tag good">Activo</span></div><div class="row between"><span>Running/bici/natación</span><span class="tag warn">Siguiente fase</span></div></div></section>
      <section class="card"><button class="danger-btn" id="resetAppBtn">Restablecer aplicación</button></section>`;
  }

  function render() {
    document.querySelectorAll('.nav-item').forEach(b=>b.classList.toggle('active',b.dataset.view===currentView));
    if (currentView==='today') renderToday();
    if (currentView==='routines') renderRoutines();
    if (currentView==='history') renderHistory();
    if (currentView==='progress') renderProgress();
    if (currentView==='settings') renderSettings();
  }

  function exportData() {
    const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}); const url=URL.createObjectURL(blob);
    const a=document.createElement('a'); a.href=url; a.download=`hybrid-training-backup-${todayKey()}.json`; a.click();
    setTimeout(()=>URL.revokeObjectURL(url),500); toast('Copia exportada');
  }
  async function importData(file) {
    try {
      const parsed=JSON.parse(await file.text());
      if (!parsed.routines || !Array.isArray(parsed.sessions)) throw new Error('Formato incompatible');
      state=migrateState(parsed); saveState(); render(); toast('Datos importados');
    } catch(e) { alert('No se pudo importar el archivo: '+e.message); }
  }

  document.querySelector('.bottom-nav').addEventListener('click',e=>{
    const btn=e.target.closest('[data-view]'); if (!btn) return; currentView=btn.dataset.view; render();
  });
  document.getElementById('quickExportBtn').addEventListener('click',exportData);
  modal.addEventListener('click',e=>{if(e.target===modal) closeModal();});

  app.addEventListener('click',e=>{
    const start=e.target.closest('[data-start-routine]'); if(start) return createDraft(start.dataset.startRoutine);
    if (e.target.closest('#saveMorningBtn')) return saveMorningLog();
    if (e.target.closest('#finishSessionBtn')) return finalizeSession();
    if (e.target.closest('#cancelSessionBtn')) return cancelSession();
    const copy=e.target.closest('[data-copy-prev]'); if(copy) return copyPreviousExercise(Number(copy.dataset.copyPrev));
    const add=e.target.closest('[data-add-set]'); if(add) return addSet(Number(add.dataset.addSet));
    const remove=e.target.closest('[data-remove-set]'); if(remove) return removeLastSet(Number(remove.dataset.removeSet));
    const check=e.target.closest('[data-check-set]');
    if (check) {
      const [ei,si]=check.dataset.checkSet.split(':').map(Number); const s=state.draftSession.exercises[ei].sets[si]; s.done=!s.done;
      if (s.done && (s.reps==='' || s.reps===null)) s.reps=state.draftSession.exercises[ei].target.repMin;
      saveState(); render(); return;
    }
    if (e.target.id==='newRoutineBtn') return routineEditor(null);
    const edit=e.target.closest('[data-edit-routine]'); if(edit) return routineEditor(Number(edit.dataset.editRoutine));
    const hist=e.target.closest('[data-history-id]'); if(hist) return historyDetail(hist.dataset.historyId);
    if (e.target.id==='exportBtn') return exportData();
    if (e.target.id==='importBtn') return document.getElementById('importFile').click();
    if (e.target.id==='resetAppBtn' && confirm('Esto borrará rutinas, historial y registros diarios locales. ¿Continuar?')) { state=defaultState(); saveState(); progressExerciseId=null; render(); }
  });

  app.addEventListener('input',e=>{
    if (e.target.matches('[data-set-field]')) {
      const ex=Number(e.target.dataset.ex), set=Number(e.target.dataset.set), field=e.target.dataset.setField;
      state.draftSession.exercises[ex].sets[set][field]=e.target.value; saveState();
    }
    if (e.target.matches('[data-session-field]')) { state.draftSession[e.target.dataset.sessionField]=e.target.value; saveState(); }
  });
  app.addEventListener('change',e=>{
    if (e.target.id==='morningDate') {
      const log=dailyLogByDate(e.target.value);
      const sleep=document.getElementById('morningSleep'); const weight=document.getElementById('morningWeight');
      if (sleep) sleep.value=formatSleepDuration(log?.sleepHours); if (weight) weight.value=log?.bodyWeight ?? '';
    }
    if (e.target.id==='progressExerciseSelect') { progressExerciseId=e.target.value; render(); }
    if (e.target.id==='importFile' && e.target.files[0]) importData(e.target.files[0]);
  });

  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
  saveState();
  render();
})();
