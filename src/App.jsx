import React, { useEffect, useMemo, useState } from 'react';
import {
  Activity, AirVent, BatteryCharging, Bolt, Check, ChevronDown, CircleHelp,
  Fan, Gauge, Leaf, Lightbulb, Lock, Power, RefreshCw, Settings2, ShieldCheck,
  Smartphone, Thermometer, Wind, Zap, Droplets, Cpu, Radio, PlugZap
} from 'lucide-react';

const RHO = 1.2;
const DIAMETER = 0.5;
const AREA = Math.PI * DIAMETER * DIAMETER / 4;
const CP = 0.15;
const ETA_GEN = 0.60;
const ETA_ELEC = 0.80;
const BLOWER_W = 370;
const STORAGE_EFF = 0.85;

function fmt(n, digits=1) {
  return Number.isFinite(n) ? n.toFixed(digits) : '0.0';
}
function clamp(n,min,max){ return Math.min(max,Math.max(min,n)); }

function Metric({icon:Icon,label,value,unit,sub,accent='blue'}) {
  return <div className={`metric metric-${accent}`}>
    <div className="metric-top"><span className="metric-icon"><Icon size={17}/></span><span>{label}</span></div>
    <div className="metric-value">{value}<small>{unit}</small></div>
    <div className="metric-sub">{sub}</div>
  </div>;
}

function Toggle({checked,onChange,label,disabled=false}) {
  return <button className={`toggle ${checked?'on':''}`} onClick={()=>!disabled&&onChange(!checked)} aria-pressed={checked} disabled={disabled} aria-label={label}>
    <span />
  </button>;
}

function FanVisual({active,speed}) {
  return <div className={`fan-stage ${active?'running':''}`}>
    <div className="air-stream stream-one"/><div className="air-stream stream-two"/><div className="air-stream stream-three"/>
    <div className="fan-ring">
      <div className="fan-rotor" style={{'--spin-duration':`${Math.max(.22,1.45-speed*.16)}s`}}>
        {[0,1,2,3].map(i=><span className="blade" key={i} style={{transform:`rotate(${i*90}deg) skewY(-12deg)`}}/>)}
        <span className="hub"/>
      </div>
    </div>
    <div className="fan-caption"><span className={`live-dot ${active?'':'off'}`}/>{active?'TURBIN AKTIF':'SISTEM BERHENTI'}</div>
  </div>;
}

function EnergyChart({series}) {
  const max = Math.max(5,...series.map(x=>x.generated));
  const points = series.map((x,i)=>`${24+i*(252/Math.max(1,series.length-1))},${100-(x.generated/max)*78}`).join(' ');
  const fill = `24,100 ${points} 276,100`;
  return <div className="chart-wrap">
    <svg viewBox="0 0 300 120" role="img" aria-label="Grafik simulasi energi">
      {[22,48,74,100].map(y=><line key={y} x1="24" x2="276" y1={y} y2={y} className="grid-line"/> )}
      <polygon points={fill} className="chart-fill"/>
      <polyline points={points} className="chart-line"/>
      {series.map((x,i)=><circle key={i} cx={24+i*(252/Math.max(1,series.length-1))} cy={100-(x.generated/max)*78} r="2.7" className="chart-point"/>)}
    </svg>
    <div className="chart-labels"><span>−60 menit</span><span>−40</span><span>−20</span><span>Sekarang</span></div>
  </div>;
}

export default function App() {
  const [blowers,setBlowers] = useState([true,true,true,true,true,true]);
  const [wind,setWind] = useState(5);
  const [hours,setHours] = useState(9);
  const [auto,setAuto] = useState(true);
  const [usbManual,setUsbManual] = useState(false);
  const [battery,setBattery] = useState(72);
  const [temp,setTemp] = useState(28.4);
  const [humidity,setHumidity] = useState(72);
  const [sensorLoad,setSensorLoad] = useState(1.0);
  const [deltaPct,setDeltaPct] = useState(0.2);
  const [history,setHistory] = useState(Array.from({length:13},(_,i)=>({generated:Math.max(0,Math.random()*1.4+0.2),time:i})));
  const [showAssumptions,setShowAssumptions] = useState(false);

  const activeCount = blowers.filter(Boolean).length;
  const powerPerBlower = 0.5*RHO*AREA*Math.pow(wind,3)*CP*ETA_GEN*ETA_ELEC;
  const totalPower = powerPerBlower*activeCount;
  const dailyGross = totalPower*hours;
  const usableDaily = dailyGross*STORAGE_EFF;
  const sensorDaily = sensorLoad*24;
  const surplus = usableDaily-sensorDaily;
  const deltaPower = BLOWER_W*(deltaPct/100);
  const netPower = powerPerBlower-deltaPower;
  const netDaily = netPower*activeCount*hours;
  const running = activeCount>0;
  const usbAvailable = auto ? (battery>=65 && surplus>0) : usbManual && battery>20 && surplus>0;
  const usbOn = usbAvailable && activeCount>0;
  const batteryStatus = battery>=70?'Baik':battery>=35?'Sedang':'Rendah';

  useEffect(()=>{
    const id=setInterval(()=>{
      setBattery(b=>clamp(b+(totalPower>0?0.018:-0.012),8,100));
      setTemp(t=>clamp(t+(running?Math.sin(Date.now()/90000)*0.012:0.005),24,35));
      setHumidity(h=>clamp(h+Math.sin(Date.now()/70000)*0.025,45,90));
      setHistory(prev=>[...prev.slice(1),{generated:totalPower,time:Date.now()}]);
    },2500);
    return ()=>clearInterval(id);
  },[totalPower,running]);

  const toggleAll = (value)=>setBlowers(blowers.map(()=>value));
  const reset = ()=>{
    setBlowers([true,true,true,true,true,true]); setWind(5); setHours(9);
    setAuto(true); setUsbManual(false); setBattery(72); setDeltaPct(.2);
  };

  return <div className="app-shell">
    <header className="topbar">
      <div className="brand">
        <div className="brand-mark"><Fan size={24}/></div>
        <div><div className="brand-name">BLOW<span>NERGY</span></div><div className="brand-sub">SMART ENERGY CONTROL</div></div>
      </div>
      <div className="top-status"><span className="live-dot"/> SIMULATOR ONLINE <span className="top-divider"/> <span className="system-tag">DEMO MODE</span></div>
    </header>

    <main className="main">
      <section className="welcome">
        <div><div className="eyebrow">FACULTAS PETERNAKAN · UGM</div><h1>Smart Control <em>Dashboard</em></h1><p>Simulasi pemulihan energi aliran udara blower untuk mendukung monitoring lingkungan kandang.</p></div>
        <button className="reset-btn" onClick={reset}><RefreshCw size={15}/> Reset simulasi</button>
      </section>

      <section className="metric-grid">
        <Metric icon={Zap} label="Daya generator" value={fmt(totalPower,2)} unit="W" sub={`${fmt(powerPerBlower,2)} W per blower`} accent="cyan"/>
        <Metric icon={BatteryCharging} label="Energi harian" value={fmt(dailyGross,1)} unit="Wh" sub={`${fmt(usableDaily,1)} Wh setelah rugi 15%`} accent="green"/>
        <Metric icon={BatteryCharging} label="Baterai" value={fmt(battery,0)} unit="%" sub={`Status ${batteryStatus}`} accent="purple"/>
        <Metric icon={Activity} label="Net energy benefit" value={fmt(netDaily,1)} unit="Wh/hari" sub={netDaily>=0?'Estimasi neraca positif':'Estimasi neraca negatif'} accent={netDaily>=0?'green':'orange'}/>
      </section>

      <section className="dashboard-grid">
        <div className="panel system-panel">
          <div className="panel-heading"><div><span className="section-kicker">01 / VISUALISASI</span><h2>Alur pemulihan energi</h2></div><span className="panel-pill"><span className="live-dot"/> LIVE SIMULATION</span></div>
          <div className="system-visual">
            <div className="stage-label"><Wind size={14}/> ALIRAN UDARA BUANGAN</div>
            <FanVisual active={running} speed={wind}/>
            <div className="flow-pipeline">
              <div className={`flow-node ${running?'active':''}`}><Fan size={20}/><b>Turbin mikro</b><small>{running?'Berputar':'Standby'}</small></div>
              <div className="flow-arrow"><span/></div>
              <div className={`flow-node ${running?'active':''}`}><Zap size={20}/><b>Generator</b><small>{fmt(totalPower,2)} W DC*</small></div>
              <div className="flow-arrow"><span/></div>
              <div className="flow-node battery-node"><BatteryCharging size={20}/><b>Baterai</b><small>{fmt(battery,0)}% SoC</small></div>
              <div className="flow-arrow"><span/></div>
              <div className="flow-node sems-node"><Cpu size={20}/><b>SEMS</b><small>{auto?'Otomatis':'Manual'}</small></div>
            </div>
            <div className="visual-footnote">*Nilai generator merupakan estimasi model, bukan pembacaan perangkat keras.</div>
          </div>
          <div className="priority-row">
            <div className="priority-card primary"><div className="priority-icon"><Thermometer size={18}/></div><div><b>Prioritas utama</b><span>Sensor suhu & kelembapan</span></div><Check size={17}/></div>
            <div className={`priority-card ${usbOn?'secondary-on':'secondary'}`}><div className="priority-icon"><Smartphone size={18}/></div><div><b>Beban sekunder</b><span>USB {usbOn?'Aktif':'Nonaktif'}</span></div><span className="priority-state">{usbOn?'ON':'OFF'}</span></div>
          </div>
        </div>

        <div className="panel controls-panel">
          <div className="panel-heading"><div><span className="section-kicker">02 / KENDALI</span><h2>Kontrol sistem</h2></div><Settings2 size={19} className="muted-icon"/></div>
          <div className="control-block">
            <div className="control-title"><span>Unit blower</span><div className="quick-actions"><button onClick={()=>toggleAll(true)}>Semua ON</button><button onClick={()=>toggleAll(false)}>Semua OFF</button></div></div>
            <div className="blower-list">{blowers.map((on,i)=><div className="blower-row" key={i}><div className="blower-label"><span className={`blower-dot ${on?'on':''}`}/><span>Blower {String(i+1).padStart(2,'0')}</span></div><Toggle checked={on} onChange={v=>setBlowers(prev=>prev.map((x,j)=>j===i?v:x))} label={`Blower ${i+1}`}/></div>)}</div>
            <div className="active-summary"><span>{activeCount} dari 6 blower aktif</span><span>{Math.round(activeCount/6*100)}%</span></div>
            <div className="progress-track"><span style={{width:`${activeCount/6*100}%`}}/></div>
          </div>
          <div className="control-block slider-block">
            <div className="slider-head"><label htmlFor="wind">Kecepatan udara</label><strong>{wind.toFixed(1)} <small>m/s</small></strong></div>
            <input id="wind" type="range" min="3" max="7" step=".1" value={wind} onChange={e=>setWind(+e.target.value)}/>
            <div className="range-labels"><span>3 m/s</span><span>7 m/s</span></div>
          </div>
          <div className="control-block slider-block">
            <div className="slider-head"><label htmlFor="hours">Jam operasi per hari</label><strong>{hours} <small>jam</small></strong></div>
            <input id="hours" type="range" min="1" max="24" step="1" value={hours} onChange={e=>setHours(+e.target.value)}/>
            <div className="range-labels"><span>1 jam</span><span>24 jam</span></div>
          </div>
          <div className="control-block slider-block">
            <div className="slider-head"><label htmlFor="delta">Tambahan daya blower</label><strong>{fmt(deltaPct,2)} <small>%</small></strong></div>
            <input id="delta" type="range" min="0" max="2" step=".05" value={deltaPct} onChange={e=>setDeltaPct(+e.target.value)}/>
            <div className="range-labels"><span>0%</span><span>2%</span></div>
          </div>
        </div>
      </section>

      <section className="lower-grid">
        <div className="panel chart-panel">
          <div className="panel-heading"><div><span className="section-kicker">03 / ANALITIK</span><h2>Produksi energi</h2></div><span className="unit-chip">W · simulasi</span></div>
          <div className="chart-summary"><strong>{fmt(totalPower,2)} W</strong><span>Estimasi daya saat ini</span></div>
          <EnergyChart series={history}/>
          <div className="chart-legend"><span><i/> Daya generator</span><span className="chart-legend-note">Pembaruan otomatis</span></div>
        </div>

        <div className="panel sems-panel">
          <div className="panel-heading"><div><span className="section-kicker">04 / MANAJEMEN</span><h2>Smart Energy Management</h2></div><Cpu size={19} className="muted-icon"/></div>
          <div className="sems-mode"><div className="mode-icon"><Lightbulb size={19}/></div><div className="mode-copy"><b>Mode pengelolaan energi</b><span>{auto?'Prioritas beban otomatis':'Pengendalian USB manual'}</span></div><Toggle checked={auto} onChange={setAuto} label="Mode otomatis"/></div>
          {!auto&&<div className="manual-usb"><div><Smartphone size={17}/><span>Aktifkan port USB</span></div><Toggle checked={usbManual} onChange={setUsbManual} label="Port USB manual"/></div>}
          <div className="energy-allocation">
            <div className="allocation-head"><span>Alokasi energi harian</span><span>{fmt(usableDaily,1)} Wh tersedia*</span></div>
            <div className="allocation-bar"><span style={{width:`${clamp(sensorDaily/Math.max(usableDaily,1)*100,0,100)}%`}}/><i style={{left:`${clamp(sensorDaily/Math.max(usableDaily,1)*100,0,100)}%`}}/></div>
            <div className="allocation-legend"><span><i className="sensor-key"/>Sensor: {fmt(sensorDaily,1)} Wh</span><span><i className="surplus-key"/>Surplus: {fmt(Math.max(0,surplus),1)} Wh</span></div>
          </div>
          <div className="sems-alert"><ShieldCheck size={17}/><span>{usbOn?'USB diizinkan: estimasi surplus tersedia dan SoC memenuhi ambang.':'USB diputus/ditahan. Energi diprioritaskan untuk monitoring.'}</span></div>
          <small className="fine-print">*Energi setelah asumsi rugi penyimpanan 15%; belum dikurangi tambahan konsumsi blower.</small>
        </div>

        <div className="panel environment-panel">
          <div className="panel-heading"><div><span className="section-kicker">05 / LINGKUNGAN</span><h2>Monitoring kandang</h2></div><span className="demo-badge">DATA DEMO</span></div>
          <div className="environment-values">
            <div className="environment-card temp-card"><div className="env-icon"><Thermometer size={20}/></div><span>Suhu udara</span><strong>{fmt(temp,1)}<small>°C</small></strong><em>Simulasi sensor</em></div>
            <div className="environment-card humidity-card"><div className="env-icon"><Droplets size={20}/></div><span>Kelembapan</span><strong>{fmt(humidity,0)}<small>%</small></strong><em>Simulasi sensor</em></div>
          </div>
          <div className="sensor-setting"><label htmlFor="load">Beban dua node sensor</label><strong>{fmt(sensorLoad,1)} W</strong></div>
          <input id="load" type="range" min=".2" max="2" step=".1" value={sensorLoad} onChange={e=>setSensorLoad(+e.target.value)}/>
          <div className="range-labels"><span>0,2 W</span><span>2,0 W</span></div>
        </div>
      </section>

      <section className="insight-row">
        <div className={`insight-card ${netDaily>=0?'good':'warning'}`}>
          {netDaily>=0?<ShieldCheck size={20}/>:<CircleHelp size={20}/>}
          <div><b>{netDaily>=0?'Neraca energi teoritis positif':'Neraca energi teoritis negatif'}</b><span>{netDaily>=0?'Estimasi daya pulih melebihi tambahan daya blower pada asumsi saat ini.':'Tambahan daya blower melebihi estimasi keluaran generator. Evaluasi konfigurasi turbin.'}</span></div>
        </div>
        <button className="assumption-btn" onClick={()=>setShowAssumptions(v=>!v)}><CircleHelp size={16}/> Asumsi perhitungan <ChevronDown size={15} className={showAssumptions?'rotated':''}/></button>
      </section>
      {showAssumptions&&<section className="panel assumptions">
        <h3>Parameter model dari naskah BLOWNERGY</h3>
        <div className="assumption-grid">
          <span>Massa jenis udara <b>1,2 kg/m³</b></span><span>Diameter keluaran <b>0,5 m</b></span>
          <span>Koefisien daya (Cp) <b>0,15</b></span><span>Efisiensi generator <b>60%</b></span>
          <span>Efisiensi elektronika <b>80%</b></span><span>Efisiensi simpan <b>85% (asumsi)</b></span>
          <span>Daya blower acuan <b>370 W</b></span><span>Kebutuhan sensor default <b>1 W total</b></span>
        </div>
        <p>Model: P = ½ ρ A v³ × Cp × ηg × ηe. Hasil adalah estimasi teoretis; output aktual dan manfaat energi bersih harus divalidasi dengan pengukuran daya blower, debit udara, dan daya generator.</p>
      </section>}

      <footer className="footer"><div className="footer-brand"><Fan size={16}/> BLOWNERGY <span>SMART CONTROL</span></div><span>Prototype dashboard · Simulation only · v1.0.0</span></footer>
    </main>
  </div>;
}
