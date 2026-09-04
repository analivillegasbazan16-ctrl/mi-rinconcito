const STORAGE_KEY = "mi_rinconcito_v1";


const seedData = {

  workTasks: [

    {
      id: "w1",
      title: "Preparar presentación para capacitación APP HE",
      project: "APP HE",
      date: "2026-09-08",
      priority: "Alta",
      done: false
    },

    {
      id: "w2",
      title: "Preparar demostración del Portal EPP",
      project: "Portal EPP",
      date: "2026-09-08",
      priority: "Alta",
      done: false
    },

    {
      id: "w3",
      title: "Preparar preguntas frecuentes de HE y EPP",
      project: "General",
      date: "2026-09-07",
      priority: "Media",
      done: false
    },

    {
      id: "w4",
      title: "Revisar avance de automatización STS",
      project: "Automatización STS",
      date: "2026-09-11",
      priority: "Media",
      done: false
    },

    {
      id: "w5",
      title: "Actualizar interpretación del modelo de dotación",
      project: "Modelo de dotación",
      date: "2026-09-10",
      priority: "Media",
      done: true
    }

  ],


  personal: [

    {
      id: "p1",
      title: "Salir a tomar un café",
      category: "Social",
      date: "2026-09-05",
      time: "18:00",
      details: "Un rato para desconectarme.",
      done: false
    },

    {
      id: "p2",
      title: "Planificar panorama del fin de semana",
      category: "Salida",
      date: "2026-09-06",
      time: "",
      details: "Buscar algo entretenido para hacer.",
      done: false
    },

    {
      id: "p3",
      title: "Leer un rato",
      category: "Ocio",
      date: "2026-09-04",
      time: "21:00",
      details: "",
      done: true
    }

  ],


  projects: [

    {
      id: "pr1",
      title: "APP Horas Extras",
      progress: 78,
      target: "2026-09-30",
      details:
        "Reglas de cálculo, conciliación SAP, permanencia y capacitación."
    },

    {
      id: "pr2",
      title: "Portal EPP",
      progress: 82,
      target: "2026-09-20",
      details:
        "Solicitudes, stock, movimientos, alertas y capacitación."
    },

    {
      id: "pr3",
      title: "Automatización STS",
      progress: 58,
      target: "2026-09-25",
      details:
        "Captura diaria, histórico y reporte semanal automatizado."
    },

    {
      id: "pr4",
      title: "Modelo de dotación",
      progress: 90,
      target: "2026-09-15",
      details:
        "Informe, gráficos, análisis e interpretación ejecutiva."
    },

    {
      id: "pr5",
      title: "Automatización de boletas",
      progress: 35,
      target: "2026-10-15",
      details:
        "OCR, extracción de datos y rendición editable."
    }

  ],


  meetings: [

    {
      id: "m1",
      title: "Reunión de seguimiento APP HE",
      date: "2026-09-07",
      time: "10:00",
      details:
        "Revisar avances y pendientes antes de la capacitación."
    },

    {
      id: "m2",
      title: "Revisión de avances STS",
      date: "2026-09-15",
      time: "11:00",
      details:
        "Validar flujo y reporte semanal."
    }

  ],


  trainings: [

    {
      id: "t1",
      title: "Capacitación virtual APP HE y Portal EPP",
      date: "2026-09-08",
      time: "10:00",
      details:
        "Mostrar flujo completo, demostración práctica y resolver dudas."
    }

  ],


  ideas: [

    {
      id: "i1",
      title: "Dashboard de indicadores personales",
      details:
        "Crear una vista mensual con avances, hábitos y carga de trabajo."
    },

    {
      id: "i2",
      title: "Banco de preguntas frecuentes",
      details:
        "Dejar una sección reutilizable para capacitaciones y soporte."
    },

    {
      id: "i3",
      title: "Resumen automático de la semana",
      details:
        "Mostrar qué terminé, qué quedó pendiente y qué viene después."
    }

  ],


  notes: [

    {
      id: "n1",
      title: "Recordatorio",
      details:
        "No olvidar revisar el flujo completo antes de cada capacitación."
    },

    {
      id: "n2",
      title: "Para mí",
      details:
        "Organizar también espacios personales, no solo trabajo ♡"
    }

  ],


  goals: [

    {
      id: "g1",
      title: "Cerrar capacitación HE + EPP",
      date: "2026-09-08",
      details:
        "Llegar con material, demostración y preguntas frecuentes listas.",
      progress: 55
    },

    {
      id: "g2",
      title: "Mantener mi semana ordenada",
      date: "2026-09-13",
      details:
        "Registrar tareas y planes personales sin dejar todo para último momento.",
      progress: 40
    }

  ]

};



let state = loadState();

let currentView = "inicio";

let taskFilter = "all";

let calendarCursor =
  new Date(2026, 8, 1);



const viewTitles = {

  inicio:
    "Inicio",

  agenda:
    "Agenda",

  trabajo:
    "Tareas de trabajo",

  personal:
    "Cosas personales",

  proyectos:
    "Proyectos",

  reuniones:
    "Reuniones",

  capacitaciones:
    "Capacitaciones",

  ideas:
    "Ideas / Por crear",

  notas:
    "Notas",

  metas:
    "Metas",

  estadisticas:
    "Mi avance"

};



const $ =
  (selector, root = document) =>
    root.querySelector(selector);


const $$ =
  (selector, root = document) =>
    [...root.querySelectorAll(selector)];



function clone(obj) {

  return JSON.parse(
    JSON.stringify(obj)
  );

}



function loadState() {

  try {

    const saved =
      localStorage.getItem(
        STORAGE_KEY
      );


    if (!saved) {

      return clone(
        seedData
      );

    }


    const parsed =
      JSON.parse(saved);


    return {

      ...clone(seedData),

      ...parsed

    };

  }

  catch (error) {

    console.warn(
      "No se pudo cargar la información guardada.",
      error
    );


    return clone(
      seedData
    );

  }

}



function saveState() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(state)
  );

}



function uid(prefix = "id") {

  return `${prefix}_${Date.now()}_${Math.random()
    .toString(36)
    .slice(2, 8)}`;

}



function esc(value = "") {

  return String(value)

    .replaceAll(
      "&",
      "&amp;"
    )

    .replaceAll(
      "<",
      "&lt;"
    )

    .replaceAll(
      ">",
      "&gt;"
    )

    .replaceAll(
      '"',
      "&quot;"
    )

    .replaceAll(
      "'",
      "&#039;"
    );

}



function localDateLabel() {

  const date =
    new Date();


  return date.toLocaleDateString(
    "es-CL",

    {

      weekday:
        "long",

      day:
        "numeric",

      month:
        "long",

      year:
        "numeric"

    }

  );

}



function parseDateOnly(dateStr) {

  if (!dateStr)
    return null;


  const [
    y,
    m,
    d
  ] =
    dateStr
      .split("-")
      .map(Number);


  if (
    !y ||
    !m ||
    !d
  ) {

    return null;

  }


  return new Date(
    y,
    m - 1,
    d,
    12,
    0,
    0
  );

}



function formatDate(

  dateStr,

  options = {

    day:
      "2-digit",

    month:
      "2-digit",

    year:
      "numeric"

  }

) {

  const d =
    parseDateOnly(
      dateStr
    );


  return d

    ? d.toLocaleDateString(
        "es-CL",
        options
      )

    : "Sin fecha";

}



function shortMonth(dateStr) {

  const d =
    parseDateOnly(
      dateStr
    );


  return d

    ? d.toLocaleDateString(
        "es-CL",

        {
          month:
            "short"
        }
      )
      .replace(
        ".",
        ""
      )

    : "";

}



function isToday(dateStr) {

  const d =
    parseDateOnly(
      dateStr
    );


  if (!d)
    return false;


  const now =
    new Date();


  return (

    d.getFullYear() ===
      now.getFullYear()

    &&

    d.getMonth() ===
      now.getMonth()

    &&

    d.getDate() ===
      now.getDate()

  );

}



function daysUntil(dateStr) {

  const d =
    parseDateOnly(
      dateStr
    );


  if (!d)
    return Infinity;


  const now =
    new Date();


  const today =
    new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      12
    );


  return Math.round(

    (d - today)
      /
    86400000

  );

}



function showToast(message) {

  const toast =
    $("#toast");


  toast.textContent =
    message;


  toast.classList.add(
    "show"
  );


  clearTimeout(
    showToast.timer
  );


  showToast.timer =
    setTimeout(
      () =>
        toast.classList.remove(
          "show"
        ),

      2200
    );

}



function emptyState(
  icon,
  text
) {

  return `

    <div class="empty-state">

      <div class="icon">
        ${icon}
      </div>

      <p>
        ${esc(text)}
      </p>

    </div>

  `;

}



function switchView(view) {

  if (
    !viewTitles[view]
  ) {

    return;

  }


  currentView =
    view;


  $$(".view")
    .forEach(
      v =>
        v.classList.remove(
          "active"
        )
    );


  $(`#view-${view}`)
    .classList.add(
      "active"
    );


  $$(".nav-item")
    .forEach(

      btn =>

        btn.classList.toggle(

          "active",

          btn.dataset.view ===
            view

        )

    );


  $("#viewTitle")
    .textContent =
      viewTitles[view];


  $("#sidebar")
    .classList.remove(
      "open"
    );


  window.scrollTo({

    top:
      0,

    behavior:
      "smooth"

  });

}



function renderAll() {

  $("#todayLabel")
    .textContent =
      localDateLabel();


  renderHome();

  renderWorkTasks();

  renderPersonal();

  renderProjects();

  renderMeetings();

  renderTrainings();

  renderIdeas();

  renderNotes();

  renderGoals();

  renderStats();

  renderCalendar();

  applySearch();

}



function renderHome() {

  const pendingWork =
    state.workTasks
      .filter(
        t =>
          !t.done
      )
      .length;


  const completedWork =
    state.workTasks
      .filter(
        t =>
          t.done
      )
      .length;


  const pendingPersonal =
    state.personal
      .filter(
        p =>
          !p.done
      )
      .length;


  const activeProjects =
    state.projects.length;



  $("#homeStats")
    .innerHTML = `

      ${statCard(
        "✓",
        "Tareas pendientes",
        pendingWork,
        `${completedWork} completadas`
      )}

      ${statCard(
        "▣",
        "Próximos eventos",
        upcomingEvents().length,
        "trabajo + vida personal"
      )}

      ${statCard(
        "▱",
        "Proyectos activos",
        activeProjects,
        "seguimiento de avance"
      )}

      ${statCard(
        "♥",
        "Planes personales",
        pendingPersonal,
        "también hay tiempo para ti"
      )}

    `;



  const priorities =

    state.workTasks

      .filter(
        t =>
          !t.done
      )

      .sort(

        (a, b) =>

          priorityWeight(
            a.priority
          )

          -

          priorityWeight(
            b.priority
          )

          ||

          (a.date || "9999")
            .localeCompare(
              b.date || "9999"
            )

      )

      .slice(
        0,
        5
      );



  $("#homePriorities")
    .innerHTML =

      priorities.length

        ?

        priorities
          .map(
            t =>
              compactTask(t)
          )
          .join("")

        :

        emptyState(
          "♡",
          "No tienes tareas pendientes."
        );



  const next =
    upcomingEvents()[0];


  $("#nextCommitment")
    .innerHTML =

      next

        ?

        `

        <div class="next-card">

          <div class="next-date-badge">

            <div>

              <strong>

                ${formatDate(
                  next.date,
                  {
                    day:
                      "2-digit"
                  }
                )}

              </strong>

              <span>

                ${shortMonth(
                  next.date
                )}

              </span>

            </div>

          </div>


          <h4>
            ${esc(next.title)}
          </h4>


          <p>

            ${esc(
              next.typeLabel
            )}

            ${
              next.time
                ?
                ` · ${esc(next.time)}`
                :
                ""
            }

          </p>

        </div>

        `

        :

        emptyState(
          "♡",
          "No hay compromisos próximos."
        );



  $("#homeProjects")
    .innerHTML =

      state.projects.length

        ?

        [...state.projects]

          .sort(
            (a,b) =>
              b.progress -
              a.progress
          )

          .slice(
            0,
            4
          )

          .map(

            p => `

            <div
              class="project-mini"
              data-searchable="${esc(
                `${p.title} ${p.details}`
              )}"
            >

              <div>

                <div class="name">
                  ${esc(p.title)}
                </div>


                <div class="progress-track">

                  <div
                    class="progress-fill"
                    style="width:${clamp(
                      p.progress,
                      0,
                      100
                    )}%"
                  ></div>

                </div>

              </div>


              <div class="pct">

                ${clamp(
                  p.progress,
                  0,
                  100
                )}%

              </div>

            </div>

          `)

          .join("")

        :

        emptyState(
          "▱",
          "Aún no tienes proyectos."
        );



  const personal =

    state.personal

      .filter(
        p =>
          !p.done
      )

      .sort(

        (a,b) =>

          (a.date || "9999")
            .localeCompare(
              b.date || "9999"
            )

      )

      .slice(
        0,
        4
      );



  $("#homePersonal")
    .innerHTML =

      personal.length

        ?

        personal
          .map(
            p =>
              compactPersonal(p)
          )
          .join("")

        :

        emptyState(
          "♥",
          "No tienes actividades personales pendientes."
        );



  const upcoming =
    upcomingEvents()
      .slice(
        0,
        6
      );


  $("#homeUpcoming")
    .innerHTML =

      upcoming.length

        ?

        upcoming
          .map(
            timelineEvent
          )
          .join("")

        :

        emptyState(
          "▣",
          "Tu agenda está libre por ahora."
        );

}



function statCard(
  icon,
  label,
  value,
  sub
) {

  return `

    <div class="stat-card">

      <div class="stat-top">

        <div>

          <div class="stat-label">
            ${esc(label)}
          </div>

          <div class="stat-value">
            ${esc(value)}
          </div>

          <div class="stat-sub">
            ${esc(sub)}
          </div>

        </div>


        <div class="stat-icon">
          ${icon}
        </div>

      </div>

    </div>

  `;

}



function compactTask(task) {

  return `

    <label
      class="compact-item ${task.done ? "done" : ""}"
      data-searchable="${esc(
        `${task.title} ${task.project} ${task.priority}`
      )}"
    >

      <input
        class="check js-toggle-work"
        type="checkbox"
        data-id="${task.id}"
        ${task.done ? "checked" : ""}
      >


      <span class="compact-main">

        <span class="compact-title">

          ${esc(task.title)}

        </span>


        <span class="compact-meta">

          ${esc(
            task.project ||
            "General"
          )}

          ·

          ${formatDate(
            task.date
          )}

          ·

          ${esc(task.priority)}

        </span>

      </span>

    </label>

  `;

}



function compactPersonal(item) {

  return `

    <label
      class="compact-item ${item.done ? "done" : ""}"
      data-searchable="${esc(
        `${item.title} ${item.category}`
      )}"
    >

      <input
        class="check js-toggle-personal"
        type="checkbox"
        data-id="${item.id}"
        ${item.done ? "checked" : ""}
      >


      <span class="compact-main">

        <span class="compact-title">

          ${esc(item.title)}

        </span>


        <span class="compact-meta">

          ${esc(item.category)}

          ·

          ${formatDate(
            item.date
          )}

          ${
            item.time
              ?
              ` · ${esc(item.time)}`
              :
              ""
          }

        </span>

      </span>

    </label>

  `;

}



function renderWorkTasks() {

  let tasks =
    [...state.workTasks]

      .sort(

        (a,b) =>

          Number(a.done)

          -

          Number(b.done)

          ||

          (a.date || "9999")
            .localeCompare(
              b.date || "9999"
            )

      );


  if (
    taskFilter ===
    "pending"
  ) {

    tasks =
      tasks.filter(
        t =>
          !t.done
      );

  }


  if (
    taskFilter ===
    "done"
  ) {

    tasks =
      tasks.filter(
        t =>
          t.done
      );

  }



  $("#workTaskList")
    .innerHTML =

      tasks.length

        ?

        tasks.map(

          t => `

          <article
            class="item-card ${t.done ? "done" : ""}"
            data-searchable="${esc(
              `${t.title} ${t.project} ${t.priority}`
            )}"
          >

            <input
              class="item-check js-toggle-work"
              type="checkbox"
              data-id="${t.id}"
              ${t.done ? "checked" : ""}
            >


            <div>

              <div class="item-title">
                ${esc(t.title)}
              </div>


              <div class="item-meta">

                <span>
                  ${esc(
                    t.project ||
                    "General"
                  )}
                </span>

                <span>
                  •
                </span>

                <span>
                  ${formatDate(
                    t.date
                  )}
                </span>

                <span
                  class="priority-pill priority-${esc(
                    t.priority
                  )}"
                >
                  ${esc(t.priority)}
                </span>

              </div>

            </div>


            <div class="item-actions">

              <button
                class="mini-btn delete js-delete"
                data-type="work"
                data-id="${t.id}"
              >
                ×
              </button>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "✓",
          "No hay tareas en este filtro."
        );

}



function renderPersonal() {

  const items =

    [...state.personal]

      .sort(

        (a,b) =>

          Number(a.done)

          -

          Number(b.done)

          ||

          (a.date || "9999")
            .localeCompare(
              b.date || "9999"
            )

      );



  $("#personalList")
    .innerHTML =

      items.length

        ?

        items.map(

          p => `

          <article
            class="item-card ${p.done ? "done" : ""}"
            data-searchable="${esc(
              `${p.title} ${p.category} ${p.details}`
            )}"
          >

            <input
              class="item-check js-toggle-personal"
              type="checkbox"
              data-id="${p.id}"
              ${p.done ? "checked" : ""}
            >


            <div>

              <div class="item-title">
                ${esc(p.title)}
              </div>


              <div class="item-meta">

                <span
                  class="category-pill type-personal"
                >
                  ${esc(p.category)}
                </span>

                <span>
                  ${formatDate(
                    p.date
                  )}
                </span>

                ${
                  p.time
                    ?
                    `<span>· ${esc(p.time)}</span>`
                    :
                    ""
                }

              </div>


              ${
                p.details
                  ?
                  `
                  <div class="item-meta">
                    ${esc(p.details)}
                  </div>
                  `
                  :
                  ""
              }

            </div>


            <div class="item-actions">

              <button
                class="mini-btn delete js-delete"
                data-type="personal"
                data-id="${p.id}"
              >
                ×
              </button>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "♥",
          "Agrega algo que quieras hacer para ti."
        );

}



function renderProjects() {

  $("#projectList")
    .innerHTML =

      state.projects.length

        ?

        state.projects.map(

          p => `

          <article
            class="project-card"
            data-searchable="${esc(
              `${p.title} ${p.details}`
            )}"
          >

            <div class="project-card-head">

              <div>

                <span class="section-kicker">
                  PROYECTO
                </span>

                <h3>
                  ${esc(p.title)}
                </h3>

              </div>


              <button
                class="mini-btn delete js-delete"
                data-type="project"
                data-id="${p.id}"
              >
                ×
              </button>

            </div>


            <p>

              ${esc(
                p.details ||
                "Sin descripción todavía."
              )}

            </p>


            <div class="project-progress-row">

              <span>
                Avance
              </span>

              <strong>

                ${clamp(
                  p.progress,
                  0,
                  100
                )}%

              </strong>

            </div>


            <input
              class="project-range js-project-range"
              data-id="${p.id}"
              type="range"
              min="0"
              max="100"
              value="${clamp(
                p.progress,
                0,
                100
              )}"
            >


            <div class="project-footer">

              <span>

                Meta:

                ${formatDate(
                  p.target
                )}

              </span>


              <span>

                ${
                  clamp(
                    p.progress,
                    0,
                    100
                  ) >= 100

                  ?

                  "Completado ✓"

                  :

                  "En progreso"
                }

              </span>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "▱",
          "Crea tu primer proyecto."
        );

}



function renderMeetings() {

  $("#meetingList")
    .innerHTML =
      renderEventCards(
        state.meetings,
        "meeting",
        "Reunión"
      );

}



function renderTrainings() {

  $("#trainingList")
    .innerHTML =
      renderEventCards(
        state.trainings,
        "training",
        "Capacitación"
      );

}



function renderEventCards(
  items,
  type,
  label
) {

  const list =

    [...items]

      .sort(

        (a,b) =>

          (a.date || "9999")
            .localeCompare(
              b.date || "9999"
            )

          ||

          (a.time || "")
            .localeCompare(
              b.time || ""
            )

      );



  return list.length

    ?

    list.map(

      item => `

      <article
        class="event-card"
        data-searchable="${esc(
          `${item.title} ${item.details}`
        )}"
      >

        <div class="event-date">

          <strong>

            ${formatDate(
              item.date,
              {
                day:
                  "2-digit"
              }
            )}

          </strong>

          <span>

            ${shortMonth(
              item.date
            )}

          </span>

        </div>


        <div>

          <span
            class="type-pill ${
              type === "meeting"
                ?
                "type-meeting"
                :
                "type-training"
            }"
          >

            ${label}

          </span>


          <h3>
            ${esc(item.title)}
          </h3>


          <p>

            ${
              item.time
                ?
                `Hora: ${esc(item.time)}<br>`
                :
                ""
            }

            ${esc(
              item.details ||
              "Sin detalles."
            )}

          </p>

        </div>


        <div class="item-actions">

          <button
            class="mini-btn delete js-delete"
            data-type="${type}"
            data-id="${item.id}"
          >
            ×
          </button>

        </div>

      </article>

    `)

    .join("")

    :

    emptyState(
      type === "meeting"
        ?
        "♙"
        :
        "✦",

      `No hay ${label.toLowerCase()}s registradas.`
    );

}



function renderIdeas() {

  $("#ideaList")
    .innerHTML =

      state.ideas.length

        ?

        state.ideas.map(

          i => `

          <article
            class="idea-card"
            data-searchable="${esc(
              `${i.title} ${i.details}`
            )}"
          >

            <div class="idea-bulb">
              ✧
            </div>


            <h3>
              ${esc(i.title)}
            </h3>


            <p>

              ${esc(
                i.details ||
                "Sin descripción."
              )}

            </p>


            <div>

              <button
                class="mini-btn delete js-delete"
                data-type="idea"
                data-id="${i.id}"
              >
                ×
              </button>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "✧",
          "Guarda aquí todo lo que se te ocurra para más adelante."
        );

}



function renderNotes() {

  $("#noteList")
    .innerHTML =

      state.notes.length

        ?

        state.notes.map(

          n => `

          <article
            class="note-card"
            data-searchable="${esc(
              `${n.title} ${n.details}`
            )}"
          >

            <div class="note-pin">
              ●
            </div>


            <h3>
              ${esc(n.title)}
            </h3>


            <p>
              ${esc(
                n.details ||
                ""
              )}
            </p>


            <div class="note-actions">

              <button
                class="mini-btn delete js-delete"
                data-type="note"
                data-id="${n.id}"
              >
                ×
              </button>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "▤",
          "Aún no tienes notas rápidas."
        );

}



function renderGoals() {

  $("#goalList")
    .innerHTML =

      state.goals.length

        ?

        state.goals.map(

          g => `

          <article
            class="goal-card"
            data-searchable="${esc(
              `${g.title} ${g.details}`
            )}"
          >

            <div class="project-card-head">

              <div>

                <span class="section-kicker">
                  META
                </span>

                <h3>
                  ${esc(g.title)}
                </h3>

              </div>


              <button
                class="mini-btn delete js-delete"
                data-type="goal"
                data-id="${g.id}"
              >
                ×
              </button>

            </div>


            <p>
              ${esc(
                g.details ||
                ""
              )}
            </p>


            <div class="project-progress-row">

              <span>
                Avance
              </span>

              <strong>

                ${clamp(
                  g.progress || 0,
                  0,
                  100
                )}%

              </strong>

            </div>


            <input
              class="project-range js-goal-range"
              data-id="${g.id}"
              type="range"
              min="0"
              max="100"
              value="${clamp(
                g.progress || 0,
                0,
                100
              )}"
            >


            <div class="goal-meta">

              <span>
                Fecha objetivo
              </span>

              <strong>
                ${formatDate(
                  g.date
                )}
              </strong>

            </div>

          </article>

        `)

        .join("")

        :

        emptyState(
          "◎",
          "Crea una meta que quieras cumplir."
        );

}



function renderStats() {

  const totalWork =
    state.workTasks.length;


  const doneWork =
    state.workTasks
      .filter(
        t =>
          t.done
      )
      .length;


  const workPct =
    totalWork

      ?

      Math.round(
        doneWork /
        totalWork *
        100
      )

      :

      0;



  const totalPersonal =
    state.personal.length;


  const donePersonal =
    state.personal
      .filter(
        t =>
          t.done
      )
      .length;


  const personalPct =
    totalPersonal

      ?

      Math.round(
        donePersonal /
        totalPersonal *
        100
      )

      :

      0;



  const projectPct =

    state.projects.length

      ?

      Math.round(

        state.projects.reduce(

          (sum,p) =>

            sum +
            clamp(
              p.progress,
              0,
              100
            ),

          0

        )

        /

        state.projects.length

      )

      :

      0;



  const avg =
    Math.round(

      (
        workPct
        +
        personalPct
        +
        projectPct
      )

      /

      3

    );



  $("#progressSummary")
    .innerHTML = `

      ${statCard(
        "♡",
        "Avance general",
        `${avg}%`,
        "balance de trabajo, vida y proyectos"
      )}

      ${statCard(
        "✓",
        "Trabajo",
        `${workPct}%`,
        `${doneWork} de ${totalWork} tareas`
      )}

      ${statCard(
        "♥",
        "Personal",
        `${personalPct}%`,
        `${donePersonal} de ${totalPersonal} actividades`
      )}

      ${statCard(
        "▱",
        "Proyectos",
        `${projectPct}%`,
        `${state.projects.length} proyectos activos`
      )}

    `;



  $("#workProgress")
    .innerHTML =
      donutBlock(

        workPct,

        `${doneWork} de ${totalWork} tareas completadas`

      );



  $("#personalProgress")
    .innerHTML =
      donutBlock(

        personalPct,

        `${donePersonal} de ${totalPersonal} actividades completadas`

      );



  $("#projectProgress")
    .innerHTML =
      donutBlock(

        projectPct,

        "promedio de avance de tus proyectos"

      );

}



function donutBlock(
  percent,
  label
) {

  const p =
    clamp(
      percent,
      0,
      100
    );


  return `

    <div class="big-progress">

      <div
        class="donut"
        style="
          background:
            conic-gradient(
              var(--rose-500)
              0
              ${p}%,
              #f2e7eb
              ${p}%
              100%
            )
        "
      >

        <strong>
          ${p}%
        </strong>

      </div>


      <div class="big-label">
        ${esc(label)}
      </div>

    </div>

  `;

}



function upcomingEvents() {

  const items =
    [];


  state.workTasks

    .filter(
      t =>
        !t.done &&
        t.date
    )

    .forEach(

      t =>
        items.push({

          ...t,

          type:
            "work",

          typeLabel:
            "Tarea de trabajo"

        })

    );



  state.personal

    .filter(
      t =>
        !t.done &&
        t.date
    )

    .forEach(

      t =>
        items.push({

          ...t,

          type:
            "personal",

          typeLabel:
            "Personal"

        })

    );



  state.meetings

    .filter(
      t =>
        t.date
    )

    .forEach(

      t =>
        items.push({

          ...t,

          type:
            "meeting",

          typeLabel:
            "Reunión"

        })

    );



  state.trainings

    .filter(
      t =>
        t.date
    )

    .forEach(

      t =>
        items.push({

          ...t,

          type:
            "training",

          typeLabel:
            "Capacitación"

        })

    );



  return items

    .filter(

      i =>
        daysUntil(
          i.date
        ) >= 0

    )

    .sort(

      (a,b) =>

        (a.date || "9999")
          .localeCompare(
            b.date || "9999"
          )

        ||

        (a.time || "")
          .localeCompare(
            b.time || ""
          )

    );

}



function timelineEvent(item) {

  const typeClass = {

    work:
      "type-work",

    personal:
      "type-personal",

    meeting:
      "type-meeting",

    training:
      "type-training"

  }[item.type]
  ||
  "type-work";



  return `

    <div
      class="timeline-item"
      data-searchable="${esc(
        `${item.title} ${item.typeLabel}`
      )}"
    >

      <div class="date-chip">

        <strong>

          ${formatDate(
            item.date,
            {
              day:
                "2-digit"
            }
          )}

        </strong>


        <span>

          ${shortMonth(
            item.date
          )}

        </span>

      </div>


      <div>

        <div class="timeline-title">
          ${esc(item.title)}
        </div>

        <div class="timeline-meta">

          ${
            item.time
              ?
              `${esc(item.time)} · `
              :
              ""
          }

          ${esc(
            item.typeLabel
          )}

        </div>

      </div>


      <span
        class="type-pill ${typeClass}"
      >

        ${esc(
          item.typeLabel
        )}

      </span>

    </div>

  `;

}



function renderCalendar() {

  const year =
    calendarCursor
      .getFullYear();


  const month =
    calendarCursor
      .getMonth();



  $("#calendarTitle")
    .textContent =

      calendarCursor
        .toLocaleDateString(

          "es-CL",

          {

            month:
              "long",

            year:
              "numeric"

          }

        );



  const first =
    new Date(
      year,
      month,
      1
    );


  const mondayIndex =
    (
      first.getDay()
      +
      6
    )
    %
    7;


  const start =
    new Date(
      year,
      month,
      1 - mondayIndex
    );


  const allEvents =
    calendarEvents();


  const cells =
    [];



  for (
    let i = 0;
    i < 42;
    i++
  ) {

    const d =
      new Date(start);


    d.setDate(
      start.getDate()
      +
      i
    );


    const iso =
      toISO(d);


    const outside =
      d.getMonth()
      !==
      month;


    const todayClass =
      isSameDate(
        d,
        new Date()
      )

      ?

      "today"

      :

      "";



    const dots =

      allEvents

        .filter(
          e =>
            e.date ===
            iso
        )

        .slice(
          0,
          4
        )

        .map(

          e => `

            <span
              class="event-dot dot-${e.type}"
              title="${esc(e.title)}"
            ></span>

          `

        )

        .join("");



    cells.push(`

      <div
        class="
          calendar-cell
          ${outside ? "outside" : ""}
          ${todayClass}
        "
      >

        <span class="calendar-day">
          ${d.getDate()}
        </span>

        <div class="dot-row">
          ${dots}
        </div>

      </div>

    `);

  }



  $("#calendarGrid")
    .innerHTML =
      cells.join("");



  const upcoming =
    upcomingEvents()
      .slice(
        0,
        10
      );


  $("#agendaEvents")
    .innerHTML =

      upcoming.length

        ?

        upcoming
          .map(
            timelineEvent
          )
          .join("")

        :

        emptyState(
          "▣",
          "No hay eventos próximos."
        );

}



function calendarEvents() {

  const list =
    [];


  state.workTasks

    .filter(
      t =>
        !t.done &&
        t.date
    )

    .forEach(

      t =>

        list.push({

          date:
            t.date,

          title:
            t.title,

          type:
            "work"

        })

    );



  state.personal

    .filter(
      t =>
        !t.done &&
        t.date
    )

    .forEach(

      t =>

        list.push({

          date:
            t.date,

          title:
            t.title,

          type:
            "personal"

        })

    );



  state.meetings

    .filter(
      t =>
        t.date
    )

    .forEach(

      t =>

        list.push({

          date:
            t.date,

          title:
            t.title,

          type:
            "meeting"

        })

    );



  state.trainings

    .filter(
      t =>
        t.date
    )

    .forEach(

      t =>

        list.push({

          date:
            t.date,

          title:
            t.title,

          type:
            "training"

        })

    );


  return list;

}



function toISO(date) {

  const y =
    date.getFullYear();


  const m =
    String(
      date.getMonth()
      +
      1
    )
    .padStart(
      2,
      "0"
    );


  const d =
    String(
      date.getDate()
    )
    .padStart(
      2,
      "0"
    );


  return `${y}-${m}-${d}`;

}



function isSameDate(
  a,
  b
) {

  return (

    a.getFullYear()
    ===
    b.getFullYear()

    &&

    a.getMonth()
    ===
    b.getMonth()

    &&

    a.getDate()
    ===
    b.getDate()

  );

}



function priorityWeight(
  priority
) {

  return {

    Alta:
      0,

    Media:
      1,

    Baja:
      2

  }[priority]
  ??
  3;

}



function clamp(
  value,
  min,
  max
) {

  const n =
    Number(value);


  if (
    !Number.isFinite(n)
  ) {

    return min;

  }


  return Math.min(

    max,

    Math.max(
      min,
      n
    )

  );

}



/* MODAL */

function openModal(type) {

  const cfg =
    modalConfig(
      type
    );


  $("#itemType")
    .value =
      type;


  $("#modalTitle")
    .textContent =
      cfg.title;


  $("#titleFieldLabel")
    .textContent =
      cfg.label;


  $("#itemForm")
    .reset();


  $("#itemType")
    .value =
      type;


  $("#itemPriority")
    .value =
      "Media";


  $("#itemProgress")
    .value =
      "0";


  const today =
    new Date();


  $("#itemDate")
    .value =
      toISO(today);



  toggleField(
    "#dateFieldWrap",
    cfg.date
  );


  toggleField(
    "#timeFieldWrap",
    cfg.time
  );


  toggleField(
    "#projectFieldWrap",
    cfg.project
  );


  toggleField(
    "#priorityFieldWrap",
    cfg.priority
  );


  toggleField(
    "#categoryFieldWrap",
    cfg.category
  );


  toggleField(
    "#progressFieldWrap",
    cfg.progress
  );


  toggleField(
    "#detailsFieldWrap",
    cfg.details
  );



  $("#modalBackdrop")
    .hidden =
      false;


  document.body.style.overflow =
    "hidden";


  setTimeout(

    () =>
      $("#itemTitle")
        .focus(),

    0

  );

}



function modalConfig(type) {

  const configs = {

    work: {

      title:
        "Nueva tarea de trabajo",

      label:
        "Tarea",

      date:
        true,

      time:
        false,

      project:
        true,

      priority:
        true,

      category:
        false,

      progress:
        false,

      details:
        false

    },


    personal: {

      title:
        "Nueva actividad personal",

      label:
        "Actividad",

      date:
        true,

      time:
        true,

      project:
        false,

      priority:
        false,

      category:
        true,

      progress:
        false,

      details:
        true

    },


    project: {

      title:
        "Nuevo proyecto",

      label:
        "Nombre del proyecto",

      date:
        true,

      time:
        false,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        true,

      details:
        true

    },


    meeting: {

      title:
        "Nueva reunión",

      label:
        "Nombre de la reunión",

      date:
        true,

      time:
        true,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        false,

      details:
        true

    },


    training: {

      title:
        "Nueva capacitación",

      label:
        "Nombre de la capacitación",

      date:
        true,

      time:
        true,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        false,

      details:
        true

    },


    idea: {

      title:
        "Nueva idea",

      label:
        "Idea",

      date:
        false,

      time:
        false,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        false,

      details:
        true

    },


    note: {

      title:
        "Nueva nota",

      label:
        "Título",

      date:
        false,

      time:
        false,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        false,

      details:
        true

    },


    goal: {

      title:
        "Nueva meta",

      label:
        "Meta",

      date:
        true,

      time:
        false,

      project:
        false,

      priority:
        false,

      category:
        false,

      progress:
        true,

      details:
        true

    }

  };


  return configs[type]
    ||
    configs.work;

}



function toggleField(
  selector,
  visible
) {

  $(selector)
    .classList
    .toggle(
      "hidden-field",
      !visible
    );

}



function closeModal() {

  $("#modalBackdrop")
    .hidden =
      true;


  document.body.style.overflow =
    "";

}



function handleFormSubmit(event) {

  event.preventDefault();


  const type =
    $("#itemType")
      .value;


  const title =
    $("#itemTitle")
      .value
      .trim();


  if (!title)
    return;



  const common = {

    title,

    date:
      $("#itemDate")
        .value,

    time:
      $("#itemTime")
        .value,

    details:
      $("#itemDetails")
        .value
        .trim()

  };



  if (
    type ===
    "work"
  ) {

    state.workTasks
      .unshift({

        id:
          uid("w"),

        title,

        project:
          $("#itemProject")
            .value
            .trim()
          ||
          "General",

        date:
          common.date,

        priority:
          $("#itemPriority")
            .value,

        done:
          false

      });

  }


  else if (
    type ===
    "personal"
  ) {

    state.personal
      .unshift({

        id:
          uid("p"),

        ...common,

        category:
          $("#itemCategory")
            .value,

        done:
          false

      });

  }


  else if (
    type ===
    "project"
  ) {

    state.projects
      .unshift({

        id:
          uid("pr"),

        title,

        progress:
          clamp(
            $("#itemProgress")
              .value,
            0,
            100
          ),

        target:
          common.date,

        details:
          common.details

      });

  }


  else if (
    type ===
    "meeting"
  ) {

    state.meetings
      .unshift({

        id:
          uid("m"),

        ...common

      });

  }


  else if (
    type ===
    "training"
  ) {

    state.trainings
      .unshift({

        id:
          uid("t"),

        ...common

      });

  }


  else if (
    type ===
    "idea"
  ) {

    state.ideas
      .unshift({

        id:
          uid("i"),

        title,

        details:
          common.details

      });

  }


  else if (
    type ===
    "note"
  ) {

    state.notes
      .unshift({

        id:
          uid("n"),

        title,

        details:
          common.details

      });

  }


  else if (
    type ===
    "goal"
  ) {

    state.goals
      .unshift({

        id:
          uid("g"),

        title,

        date:
          common.date,

        details:
          common.details,

        progress:
          clamp(
            $("#itemProgress")
              .value,
            0,
            100
          )

      });

  }



  saveState();

  closeModal();

  renderAll();


  showToast(
    "Guardado en Mi Rinconcito ♡"
  );

}



function deleteItem(
  type,
  id
) {

  const map = {

    work:
      "workTasks",

    personal:
      "personal",

    project:
      "projects",

    meeting:
      "meetings",

    training:
      "trainings",

    idea:
      "ideas",

    note:
      "notes",

    goal:
      "goals"

  };


  const key =
    map[type];


  if (!key)
    return;


  state[key] =
    state[key]
      .filter(
        item =>
          item.id !==
          id
      );


  saveState();

  renderAll();


  showToast(
    "Elemento eliminado"
  );

}



function toggleDone(
  type,
  id,
  done
) {

  const key =

    type ===
    "work"

      ?

      "workTasks"

      :

      "personal";


  const item =
    state[key]
      .find(
        i =>
          i.id ===
          id
      );


  if (!item)
    return;


  item.done =
    done;


  saveState();

  renderAll();

}



function applySearch() {

  const q =
    $("#globalSearch")
      .value
      .trim()
      .toLowerCase();


  $$(
    "[data-searchable]"
  )
  .forEach(

    el => {

      const text =

        (
          el.dataset.searchable
          ||
          ""
        )
        .toLowerCase();


      el.classList.toggle(

        "search-hidden",

        q &&
        !text.includes(q)

      );

    }

  );

}



/* EVENTOS */

function bindEvents() {

  $$(".nav-item")
    .forEach(

      btn =>

        btn.addEventListener(

          "click",

          () =>
            switchView(
              btn.dataset.view
            )

        )

    );



  $("#menuToggle")
    .addEventListener(

      "click",

      () =>
        $("#sidebar")
          .classList
          .toggle(
            "open"
          )

    );



  $("#globalSearch")
    .addEventListener(

      "input",

      applySearch

    );



  $("#closeModal")
    .addEventListener(

      "click",

      closeModal

    );



  $("#cancelModal")
    .addEventListener(

      "click",

      closeModal

    );



  $("#modalBackdrop")
    .addEventListener(

      "click",

      e => {

        if (
          e.target ===
          $("#modalBackdrop")
        ) {

          closeModal();

        }

      }

    );



  $("#itemForm")
    .addEventListener(

      "submit",

      handleFormSubmit

    );



  $("#prevMonth")
    .addEventListener(

      "click",

      () => {

        calendarCursor =
          new Date(

            calendarCursor
              .getFullYear(),

            calendarCursor
              .getMonth()
              -
              1,

            1

          );


        renderCalendar();

      }

    );



  $("#nextMonth")
    .addEventListener(

      "click",

      () => {

        calendarCursor =
          new Date(

            calendarCursor
              .getFullYear(),

            calendarCursor
              .getMonth()
              +
              1,

            1

          );


        renderCalendar();

      }

    );



  document.addEventListener(

    "click",

    e => {


      const addBtn =
        e.target.closest(
          "[data-open-add]"
        );


      if (addBtn) {

        openModal(
          addBtn.dataset.openAdd
        );

      }



      const goBtn =
        e.target.closest(
          "[data-go]"
        );


      if (goBtn) {

        switchView(
          goBtn.dataset.go
        );

      }



      const delBtn =
        e.target.closest(
          ".js-delete"
        );


      if (delBtn) {

        deleteItem(

          delBtn.dataset.type,

          delBtn.dataset.id

        );

      }



      const filterBtn =
        e.target.closest(
          "[data-task-filter]"
        );


      if (filterBtn) {

        taskFilter =
          filterBtn.dataset.taskFilter;


        $$(
          "[data-task-filter]"
        )
        .forEach(

          b =>

            b.classList.toggle(

              "active",

              b === filterBtn

            )

        );


        renderWorkTasks();

        applySearch();

      }

    }

  );



  document.addEventListener(

    "change",

    e => {


      if (
        e.target.matches(
          ".js-toggle-work"
        )
      ) {

        toggleDone(

          "work",

          e.target.dataset.id,

          e.target.checked

        );

      }



      if (
        e.target.matches(
          ".js-toggle-personal"
        )
      ) {

        toggleDone(

          "personal",

          e.target.dataset.id,

          e.target.checked

        );

      }



      if (
        e.target.matches(
          ".js-project-range"
        )
      ) {

        const p =
          state.projects
            .find(
              x =>
                x.id ===
                e.target.dataset.id
            );


        if (p) {

          p.progress =
            clamp(
              e.target.value,
              0,
              100
            );


          saveState();

          renderAll();

        }

      }



      if (
        e.target.matches(
          ".js-goal-range"
        )
      ) {

        const g =
          state.goals
            .find(
              x =>
                x.id ===
                e.target.dataset.id
            );


        if (g) {

          g.progress =
            clamp(
              e.target.value,
              0,
              100
            );


          saveState();

          renderAll();

        }

      }

    }

  );



  document.addEventListener(

    "keydown",

    e => {

      if (
        e.key ===
        "Escape"

        &&

        !$("#modalBackdrop")
          .hidden
      ) {

        closeModal();

      }

    }

  );

}



bindEvents();

renderAll();

switchView(
  "inicio"
);
