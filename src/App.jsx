import { useEffect, useMemo, useRef, useState } from "react";
import { schedule, days, dayLabels } from "./data/schedule";
import { rooms } from "./data/rooms";
import { MapContext } from "../aitumap-main/src/shared/util/MapContext";
import { C1_1_1, C1_1_2, C1_1_3, C1_2_1, C1_2_2, C1_2_3, C1_3_1, C1_3_2, C1_3_3 } from "../aitumap-main/src/shared/ui/separate";

const mapComponents = { "C1.1-1": C1_1_1, "C1.1-2": C1_1_2, "C1.1-3": C1_1_3, "C1.2-1": C1_2_1, "C1.2-2": C1_2_2, "C1.2-3": C1_2_3, "C1.3-1": C1_3_1, "C1.3-2": C1_3_2, "C1.3-3": C1_3_3 };
const minute = (time) => { const [h, m] = time.split(":").map(Number); return h * 60 + m; };
const todayKey = () => days[(new Date().getDay() + 6) % 7];
const prettyDate = new Intl.DateTimeFormat("en", { weekday: "long", month: "long", day: "numeric" });

function getCurrent() {
  const now = new Date(); const nowMinute = now.getHours() * 60 + now.getMinutes(); const day = todayKey();
  return schedule.find((item) => item.day === day && nowMinute >= minute(item.start) && nowMinute < minute(item.end));
}
function getNext() {
  const now = new Date(); const nowMinute = now.getHours() * 60 + now.getMinutes(); const currentDayIndex = days.indexOf(todayKey());
  for (let offset = 0; offset < 7; offset += 1) {
    const day = days[(currentDayIndex + offset) % 7];
    const first = schedule.filter((item) => item.day === day && (offset > 0 || minute(item.start) > nowMinute))[0];
    if (first) return first;
  }
  return null;
}

function ClassCard({ item, onMap, current, selected }) {
  return <article id={`class-${item.id}`} className={`class-card ${current ? "current" : ""} ${selected ? "linked" : ""}`}>
    {current && <span className="now">Now</span>}
    <div className="class-time">{item.start}–{item.end}</div>
    <h3>{item.subject}</h3>
    <button className="room-button" onClick={() => onMap(item.room)} aria-label={`View ${item.room} on campus map`}>⌖ {item.room}</button>
    <p>{item.teacher}</p><div className="card-foot"><span className={`type ${item.type === "Practical" ? "practical" : ""}`}>{item.type}</span><small>{item.code}</small></div>
    <button className="map-link" onClick={() => onMap(item.room)}>View on map <span aria-hidden="true">→</span></button>
  </article>;
}

function CampusMap({ selectedRoom, setSelectedRoom, mapState, setMapState, classesForRoom, onShowSchedule }) {
  const hostRef = useRef(null); const [mapError, setMapError] = useState(false); const [roomQuery, setRoomQuery] = useState("");
  const MapFloor = mapComponents[`${mapState.block}-${mapState.floor}`];
  const selectRoom = (room) => { const location = rooms[room]; if (!location) return false; setSelectedRoom(room); setMapState({ block: location.block, floor: location.floor }); return true; };
  const getSvg = () => hostRef.current?.querySelector("svg");
  const reset = () => { const svg = getSvg(); if (svg) svg.setAttribute("viewBox", svg.dataset.originalViewBox || "0 0 347.52 354.54"); };
  const zoom = (factor) => { const svg = getSvg(); if (!svg) return; const b = (svg.getAttribute("viewBox") || "0 0 347.52 354.54").split(" ").map(Number); const w = b[2] * factor, h = b[3] * factor; svg.setAttribute("viewBox", `${b[0] + (b[2] - w) / 2} ${b[1] + (b[3] - h) / 2} ${w} ${h}`); };
  useEffect(() => {
    if (!selectedRoom || !MapFloor) return; const frame = requestAnimationFrame(() => { const svg = getSvg(); const location = rooms[selectedRoom]; const group = svg?.querySelector(`[id="${location?.mapId}"]`); if (!svg || !group) return; svg.querySelectorAll(".map-room-selected").forEach((node) => node.classList.remove("map-room-selected")); group.classList.add("map-room-selected"); if (!svg.dataset.originalViewBox) svg.dataset.originalViewBox = svg.getAttribute("viewBox") || "0 0 347.52 354.54"; const b = group.getBBox(); const pad = Math.max(b.width, b.height) * 2.7; svg.setAttribute("viewBox", `${b.x - pad} ${b.y - pad} ${b.width + pad * 2} ${b.height + pad * 2}`); }); return () => cancelAnimationFrame(frame);
  }, [selectedRoom, MapFloor]);
  useEffect(() => {
    const svg = getSvg(); if (!svg) return; const click = (event) => { const group = event.target.closest?.("g[id]"); const room = Object.entries(rooms).find(([, value]) => value.mapId === group?.id)?.[0]; if (room) selectRoom(room); }; svg.addEventListener("click", click); return () => svg.removeEventListener("click", click);
  });
  useEffect(() => {
    const svg = getSvg(); if (!svg) return; let drag = null;
    const start = (event) => { drag = { x: event.clientX, y: event.clientY, box: (svg.getAttribute("viewBox") || "0 0 347.52 354.54").split(" ").map(Number) }; svg.setPointerCapture?.(event.pointerId); };
    const move = (event) => { if (!drag) return; const rect = svg.getBoundingClientRect(); const dx = (event.clientX - drag.x) * drag.box[2] / rect.width; const dy = (event.clientY - drag.y) * drag.box[3] / rect.height; svg.setAttribute("viewBox", `${drag.box[0] - dx} ${drag.box[1] - dy} ${drag.box[2]} ${drag.box[3]}`); };
    const end = () => { drag = null; };
    svg.addEventListener("pointerdown", start); svg.addEventListener("pointermove", move); svg.addEventListener("pointerup", end); svg.addEventListener("pointercancel", end);
    return () => { svg.removeEventListener("pointerdown", start); svg.removeEventListener("pointermove", move); svg.removeEventListener("pointerup", end); svg.removeEventListener("pointercancel", end); };
  });
  const selected = selectedRoom ? rooms[selectedRoom] : null;
  return <section id="map" className="map-section" aria-labelledby="map-heading"><div className="section-heading"><div><span className="eyebrow">Campus navigation</span><h2 id="map-heading">Find your classroom</h2></div><p>Real AITU map geometry · C1 campus</p></div>
    <div className="map-toolbar"><label className="map-search"><span>⌕</span><input value={roomQuery} onChange={(e) => setRoomQuery(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { const found = selectRoom(roomQuery.trim().toUpperCase()); if (!found) e.currentTarget.setCustomValidity("Room not found on the available campus map."); } }} placeholder="Search classroom" aria-label="Search classroom" /></label>
      <div className="chips" aria-label="Campus block">{["C1.1", "C1.2", "C1.3"].map((block) => <button key={block} className={mapState.block === block ? "active" : ""} onClick={() => { setMapState((s) => ({ ...s, block, floor: 1 })); setSelectedRoom(null); }}>{block}</button>)}</div>
      <div className="chips" aria-label="Floor">{[1, 2, 3].map((floor) => <button key={floor} disabled={!mapComponents[`${mapState.block}-${floor}`]} className={mapState.floor === floor ? "active" : ""} onClick={() => { setMapState((s) => ({ ...s, floor })); setSelectedRoom(null); }}>{floor}</button>)}</div></div>
    <div className="map-layout"><div className="map-panel"><div className="map-controls"><button onClick={() => zoom(.8)} aria-label="Zoom in" title="Zoom in">+</button><button onClick={() => zoom(1.25)} aria-label="Zoom out" title="Zoom out">−</button><button onClick={reset} aria-label="Fit map" title="Fit map">⌗</button><button onClick={() => hostRef.current?.requestFullscreen?.()} aria-label="Fullscreen map" title="Fullscreen">⛶</button></div>
      <div ref={hostRef} className="svg-host" data-selected={selected?.mapId || ""}>{MapFloor && !mapError ? <MapContext.Provider value={{ funMode: false }}><MapFloor /></MapContext.Provider> : <div className="map-unavailable">Campus map could not be loaded. The schedule is still available.</div>}</div>
      <div className="legend"><span><i className="legend-selected" /> Selected</span><span><i className="legend-room" /> Classroom</span><span><i className="legend-area" /> Other area</span></div></div>
      <aside className="room-info" aria-live="polite">{selected ? <><span className="eyebrow">Selected classroom</span><h3>{selectedRoom}</h3><p>{selected.floor}{selected.floor === 1 ? "st" : selected.floor === 2 ? "nd" : "rd"} floor · {selected.block}</p><div className="room-classes"><strong>{classesForRoom.length ? "Scheduled classes" : "No scheduled classes"}</strong>{classesForRoom.slice(0, 3).map((item) => <button key={item.id} onClick={() => onShowSchedule(item)}><b>{dayLabels[item.day]} · {item.start}</b><span>{item.subject}</span><small>{item.type} · {item.teacher}</small></button>)}</div><button className="primary" onClick={() => classesForRoom[0] && onShowSchedule(classesForRoom[0])}>Show in schedule</button></> : <><span className="eyebrow">Map ready</span><h3>Select a classroom</h3><p>Choose a room from the schedule, search by room ID, or click one of the mapped classrooms.</p></>}</aside></div></section>;
}

export default function App() {
  const url = new URLSearchParams(window.location.search); const initialRoom = rooms[url.get("room")?.toUpperCase()] ? url.get("room").toUpperCase() : null;
  const [theme, setTheme] = useState(() => localStorage.getItem("schedule-theme") || "light"); const [day, setDay] = useState(() => url.get("day") || localStorage.getItem("schedule-day") || todayKey()); const [view, setView] = useState(() => localStorage.getItem("schedule-view") || "day"); const [query, setQuery] = useState(""); const [subject, setSubject] = useState(() => localStorage.getItem("schedule-filter") || "all"); const [selectedRoom, setSelectedRoom] = useState(initialRoom); const [mapState, setMapState] = useState(() => initialRoom ? { block: rooms[initialRoom].block, floor: rooms[initialRoom].floor } : { block: localStorage.getItem("map-block") || "C1.2", floor: Number(localStorage.getItem("map-floor")) || 2 });
  const current = getCurrent(), next = getNext();
  useEffect(() => { document.documentElement.dataset.theme = theme; localStorage.setItem("schedule-theme", theme); }, [theme]);
  useEffect(() => { localStorage.setItem("schedule-day", day); localStorage.setItem("schedule-view", view); localStorage.setItem("schedule-filter", subject); }, [day, view, subject]);
  useEffect(() => { localStorage.setItem("map-block", mapState.block); localStorage.setItem("map-floor", mapState.floor); }, [mapState]);
  const openMap = (room) => { const location = rooms[room]; if (!location) return; setSelectedRoom(room); setMapState({ block: location.block, floor: location.floor }); const params = new URLSearchParams(window.location.search); params.set("room", room); history.replaceState({}, "", `${window.location.pathname}?${params}`); setTimeout(() => document.getElementById("map")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0); };
  const showSchedule = (item) => { setDay(item.day); setView("day"); setTimeout(() => document.getElementById(`class-${item.id}`)?.scrollIntoView({ behavior: "smooth", block: "center" }), 0); };
  const filtered = useMemo(() => schedule.filter((item) => subject === "all" || item.subject === subject).filter((item) => `${item.subject} ${item.teacher} ${item.room} ${item.code} ${item.location.block}`.toLowerCase().includes(query.toLowerCase())), [query, subject]);
  const visibleDays = view === "week" ? days : [day]; const roomsToday = [...new Set(schedule.filter((item) => item.day === todayKey()).map((item) => item.room))]; const subjects = [...new Set(schedule.map((item) => item.subject))];
  return <div className="app"><header><a className="brand" href="#top"><span>AITU</span> Schedule</a><nav><a href="#today">Today</a><a href="#schedule">Schedule</a><a href="#map">Map</a></nav><button className="theme" onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle color theme">{theme === "dark" ? "☀" : "◐"}</button></header>
    <main id="top"><section id="today" className="hero"><div><span className="eyebrow">Today</span><h1>{prettyDate.format(new Date())}</h1><p>Master’s programme · Software Engineering</p></div><div className="hero-cards"><div className="status-card"><span>{current ? "Now" : "Next class"}</span><strong>{(current || next)?.start || "—"}</strong><p>{(current || next)?.subject || "No upcoming classes"}</p><button onClick={() => openMap((current || next)?.room)} disabled={!(current || next)}>Open classroom →</button></div><div className="status-card subtle"><span>This week</span><strong>{schedule.length} classes</strong><p>{subjects.length} subjects · {roomsToday.length} rooms today</p></div></div></section>
    <section id="schedule" className="schedule-section"><div className="section-heading"><div><span className="eyebrow">Timetable</span><h2>Your academic week</h2></div><div className="view-toggle"><button className={view === "day" ? "active" : ""} onClick={() => setView("day")}>Day</button><button className={view === "week" ? "active" : ""} onClick={() => setView("week")}>Week</button></div></div><div className="filter-row"><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search subject, teacher, room or code" aria-label="Search schedule" /><select value={subject} onChange={(e) => setSubject(e.target.value)} aria-label="Filter by subject"><option value="all">All subjects</option>{subjects.map((name) => <option key={name} value={name}>{name}</option>)}</select></div><div className="day-tabs">{days.map((key) => <button key={key} className={key === day ? "active" : ""} onClick={() => { setDay(key); setView("day"); }}>{dayLabels[key].slice(0, 3)}</button>)}</div><div className={`schedule-grid ${view}`}>{visibleDays.map((key) => <div className="day-column" key={key}><div className="day-title"><b>{dayLabels[key]}</b><span>{filtered.filter((item) => item.day === key).length} classes</span></div>{filtered.filter((item) => item.day === key).map((item) => <ClassCard key={item.id} item={item} onMap={openMap} current={current?.id === item.id} selected={selectedRoom === item.room} />)}{!filtered.some((item) => item.day === key) && <div className="empty">No classes match this view.</div>}</div>)}</div></section>
    <section className="today-rooms"><span className="eyebrow">Quick access</span><h2>Today's classrooms</h2><div>{roomsToday.length ? roomsToday.map((room) => <button key={room} onClick={() => openMap(room)}>⌖ {room}</button>) : <p>No classes today.</p>}</div></section>
    <CampusMap selectedRoom={selectedRoom} setSelectedRoom={setSelectedRoom} mapState={mapState} setMapState={setMapState} classesForRoom={schedule.filter((item) => item.room === selectedRoom)} onShowSchedule={showSchedule} />
    </main><footer>Schedule data preserved from the original timetable · Campus geometry © 2023 Yuujiso, MIT licensed.</footer></div>;
}
