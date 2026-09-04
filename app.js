import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";

import {
  getFirestore,
  collection,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  serverTimestamp,
  getDoc,
  setDoc
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";


const firebaseConfig = {
  apiKey: "AIzaSyACzQsjHBi6hJ61DrBt05jarP3isY_z9v4",
  authDomain: "mi-rinconcito-c01c8.firebaseapp.com",
  projectId: "mi-rinconcito-c01c8",
  storageBucket: "mi-rinconcito-c01c8.firebasestorage.app",
  messagingSenderId: "156606204911",
  appId: "1:156606204911:web:9f9622dd25d4691ca8841a"
};


const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);

const db = getFirestore(firebaseApp);


setPersistence(
  auth,
  browserLocalPersistence
).catch(console.error);



const COLLECTION_KEYS = [
  "workTasks",
  "personal",
  "projects",
  "projectTasks",
  "meetings",
  "trainings",
  "ideas",
  "notes",
  "goals"
];


const state = Object.fromEntries(
  COLLECTION_KEYS.map(
    key => [
      key,
      []
    ]
  )
);


let currentUser = null;

let unsubscribeListeners = [];

let currentView = "inicio";

let taskFilter = "all";

let calendarCursor = new Date();

let editContext = null;

let currentProjectForTask = null;



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



const typeToCollection = {

  work:
    "workTasks",

  personal:
    "personal",

  project:
    "projects",

  projectTask:
    "projectTasks",

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



const $ =
  (selector, root = document) =>
    root.querySelector(selector);


const $$ =
  (selector, root = document) =>
    [...root.querySelectorAll(selector)];



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

    ?

    d.toLocaleDateString(
      "es-CL",
      options
    )

    :

    "Sin fecha";

}



function shortMonth(dateStr) {

  const d =
    parseDateOnly(
      dateStr
    );


  return d

    ?

    d.toLocaleDateString(
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

    :

    "";

}



function localDateLabel() {

  return new Date()
    .toLocaleDateString(

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



function priorityWeight(priority) {

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



function showToast(message) {

  const toast =
    $("#toast");


  if (!toast)
    return;


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

      2600

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



function clearState() {

  COLLECTION_KEYS.forEach(

    key => {

      state[key] =
        [];

    }

  );

}



function cleanupSubscriptions() {

  unsubscribeListeners.forEach(

    unsub => {

      try {

        unsub();

      }

      catch (_) {}

    }

  );


  unsubscribeListeners =
    [];

}



function userCollection(key) {

  if (!currentUser) {

    throw new Error(
      "No hay usuario autenticado."
    );

  }


  return collection(

    db,

    "users",

    currentUser.uid,

    key

  );

}



function userDoc(
  key,
  id
) {

  if (!currentUser) {

    throw new Error(
      "No hay usuario autenticado."
    );

  }


  return doc(

    db,

    "users",

    currentUser.uid,

    key,

    id

  );

}



function subscribeUserData() {

  cleanupSubscriptions();

  clearState();

  renderAll();


  COLLECTION_KEYS.forEach(

    key => {

      const unsubscribe =
        onSnapshot(

          userCollection(key),

          snapshot => {

            state[key] =
              snapshot.docs.map(

                item => ({

                  id:
                    item.id,

                  ...item.data()

                })

              );


            renderAll();

          },

          error => {

            console.error(
              `Error leyendo ${key}:`,
              error
            );


            if (
              error.code ===
              "permission-denied"
            ) {

              showToast(
                "Firestore bloqueó el acceso. Revisa las reglas de seguridad."
              );

            }

            else {

              showToast(
                "No se pudieron sincronizar algunos datos."
              );

            }

          }

        );


      unsubscribeListeners.push(
        unsubscribe
      );

    }

  );

}



async function createItem(
  collectionKey,
  data
) {

  if (!currentUser)
    return;


  await addDoc(

    userCollection(
      collectionKey
    ),

    {

      ...data,

      createdAt:
        serverTimestamp(),

      updatedAt:
        serverTimestamp()

    }

  );

}



async function updateItem(
  collectionKey,
  id,
  data
) {

  if (
    !currentUser
    ||
    !id
  ) {

    return;

  }


  await updateDoc(

    userDoc(
      collectionKey,
      id
    ),

    {

      ...data,

      updatedAt:
        serverTimestamp()

    }

  );

}



async function removeItem(
  collectionKey,
  id
) {

  if (
    !currentUser
    ||
    !id
  ) {

    return;

  }


  await deleteDoc(

    userDoc(
      collectionKey,
      id
    )

  );

}



/* =========================================
   MIGRAR DATOS ANTIGUOS
========================================= */


const LEGACY_STORAGE_KEY =
  "mi_rinconcito_v1";


async function migrateLegacyLocalData() {

  if (!currentUser) {

    return {
      migrated:
        false
    };

  }


  const markerRef =
    doc(

      db,

      "users",

      currentUser.uid,

      "meta",

      "legacyMigrationV1"

    );


  try {

    const marker =
      await getDoc(
        markerRef
      );


    if (
      marker.exists()
    ) {

      return {

        migrated:
          false,

        alreadyDone:
          true

      };

    }


    const raw =
      localStorage.getItem(
        LEGACY_STORAGE_KEY
      );


    if (!raw) {

      return {

        migrated:
          false,

        noLocalData:
          true

      };

    }


    const legacy =
      JSON.parse(
        raw
      );


    let imported =
      0;


    for (
      const key
      of
      COLLECTION_KEYS
    ) {

      const items =
        Array.isArray(
          legacy?.[key]
        )

          ?

          legacy[key]

          :

          [];


      for (
        const item
        of
        items
      ) {

        const clean =
          {
            ...item
          };


        const oldId =
          clean.id

            ?

            String(
              clean.id
            )
            .replaceAll(
              "/",
              "_"
            )

            :

            null;


        delete clean.id;


        if (oldId) {

          const targetRef =
            userDoc(
              key,
              oldId
            );


          const existing =
            await getDoc(
              targetRef
            );


          if (
            !existing.exists()
          ) {

            await setDoc(

              targetRef,

              {

                ...clean,

                migratedAt:
                  serverTimestamp(),

                updatedAt:
                  serverTimestamp()

              }

            );


            imported++;

          }

        }

        else {

          await createItem(
            key,
            clean
          );


          imported++;

        }

      }

    }


    await setDoc(

      markerRef,

      {

        completed:
          true,

        importedItems:
          imported,

        completedAt:
          serverTimestamp(),

        source:
          "localStorage",

        version:
          1

      }

    );


    return {

      migrated:
        imported > 0,

      imported

    };

  }

  catch (error) {

    console.error(
      "No se pudieron recuperar los datos anteriores:",
      error
    );


    return {

      migrated:
        false,

      error

    };

  }

}



/* =========================================
   RESPALDO PRIVADO
========================================= */


function sanitizeForBackup(item) {

  const clean =
    {
      ...item
    };


  delete clean.createdAt;

  delete clean.updatedAt;

  delete clean.migratedAt;


  return clean;

}



function buildBackupObject() {

  const data =
    {};


  COLLECTION_KEYS.forEach(

    key => {

      data[key] =
        state[key].map(
          sanitizeForBackup
        );

    }

  );


  return {

    app:
      "Mi Rinconcito",

    version:
      2,

    exportedAt:
      new Date()
        .toISOString(),

    data

  };

}



function ensureBackupUI() {

  if (
    $("#backupBtn")
  ) {

    return;

  }


  const style =
    document.createElement(
      "style"
    );


  style.textContent = `

    .backup-modal-card {
      width: min(760px, 100%);
      max-height: calc(100vh - 40px);
      overflow: auto;
      background: #fff;
      border-radius: 26px;
      padding: 24px;
      box-shadow: 0 25px 80px rgba(74,46,57,.25);
    }

    .backup-textarea {
      width: 100%;
      min-height: 230px;
      border: 1px solid var(--line,#f1dfe5);
      border-radius: 16px;
      padding: 14px;
      resize: vertical;
      background: #fffdfd;
      color: var(--text,#433740);
      font: 13px/1.55 ui-monospace,SFMono-Regular,Consolas,monospace;
    }

    .backup-help {
      font-size: 12px;
      color: var(--muted,#7d6e76);
      line-height: 1.55;
      margin: 8px 0 14px;
    }

    .backup-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 10px;
      justify-content: flex-end;
      margin-top: 14px;
    }

    .project-task-zone {
      margin-top: 16px;
      padding-top: 14px;
      border-top: 1px solid #f3e4e9;
    }

    .project-task-head {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-bottom: 8px;
    }

    .project-task-title {
      font-size: 12px;
      font-weight: 800;
      color: #6d5a63;
    }

    .project-task-list {
      display: grid;
      gap: 7px;
    }

    .project-task-row {
      display: grid;
      grid-template-columns: auto minmax(0,1fr) auto;
      gap: 8px;
      align-items: center;
      padding: 7px 8px;
      border-radius: 12px;
      background: #fff8fa;
    }

    .project-task-row.done .project-task-name {
      text-decoration: line-through;
      color: #aa98a0;
    }

    .project-task-name {
      font-size: 12px;
      font-weight: 700;
    }

    .project-task-actions {
      display: flex;
      gap: 4px;
    }

    .project-mode-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 10px;
      margin-top: 10px;
      font-size: 11px;
      color: var(--muted,#7d6e76);
    }

    .mode-btn {
      border: 1px solid var(--line,#f1dfe5);
      background: #fff;
      border-radius: 999px;
      padding: 6px 10px;
      font-size: 10px;
      font-weight: 800;
      color: var(--rose-700,#b84a68);
    }

    .mini-action-group {
      display: flex;
      gap: 6px;
      align-items: center;
      flex-wrap: wrap;
    }

    .mini-btn.edit {
      color: var(--rose-700,#b84a68);
    }

    .backup-button {
      white-space: nowrap;
    }

    @media(max-width:560px) {

      .backup-button {
        display: none;
      }

      .project-task-row {
        grid-template-columns: auto minmax(0,1fr);
      }

      .project-task-actions {
        grid-column: 2;
        justify-content: flex-end;
      }

    }

  `;


  document.head
    .appendChild(
      style
    );


  const backupBtn =
    document.createElement(
      "button"
    );


  backupBtn.id =
    "backupBtn";


  backupBtn.type =
    "button";


  backupBtn.className =
    "secondary-btn backup-button";


  backupBtn.textContent =
    "Respaldo";


  const logoutBtn =
    $("#logoutBtn");


  logoutBtn
    ?.parentElement
    ?.insertBefore(
      backupBtn,
      logoutBtn
    );


  const backdrop =
    document.createElement(
      "div"
    );


  backdrop.id =
    "backupBackdrop";


  backdrop.className =
    "modal-backdrop";


  backdrop.hidden =
    true;


  backdrop.innerHTML = `

    <div
      class="backup-modal-card"
      role="dialog"
      aria-modal="true"
      aria-labelledby="backupTitle"
    >

      <div class="modal-head">

        <div>

          <span class="section-kicker">
            RESPALDO PRIVADO
          </span>

          <h2 id="backupTitle">
            Importar o exportar
          </h2>

        </div>

        <button
          class="icon-btn"
          id="closeBackupBtn"
          type="button"
          aria-label="Cerrar"
        >
          ×
        </button>

      </div>

      <p class="backup-help">
        Puedes pegar aquí un respaldo para cargarlo en tu Firebase privado.
        También puedes generar una copia de todo lo que ya tienes guardado.
      </p>

      <textarea
        id="backupTextarea"
        class="backup-textarea"
        spellcheck="false"
        placeholder="Pega aquí el JSON del respaldo..."
      ></textarea>

      <p
        id="backupMessage"
        class="backup-help"
        aria-live="polite"
      ></p>

      <div class="backup-actions">

        <button
          id="exportBackupBtn"
          type="button"
          class="secondary-btn"
        >
          Generar respaldo
        </button>

        <button
          id="downloadBackupBtn"
          type="button"
          class="secondary-btn"
        >
          Descargar JSON
        </button>

        <button
          id="importBackupBtn"
          type="button"
          class="primary-btn"
        >
          Importar a Firebase
        </button>

      </div>

    </div>

  `;


  document.body
    .appendChild(
      backdrop
    );


  backupBtn
    .addEventListener(
      "click",
      openBackupModal
    );


  $("#closeBackupBtn")
    ?.addEventListener(
      "click",
      closeBackupModal
    );


  backdrop
    .addEventListener(

      "click",

      event => {

        if (
          event.target ===
          backdrop
        ) {

          closeBackupModal();

        }

      }

    );


  $("#exportBackupBtn")
    ?.addEventListener(

      "click",

      () => {

        $("#backupTextarea")
          .value =
            JSON.stringify(
              buildBackupObject(),
              null,
              2
            );


        $("#backupMessage")
          .textContent =
            "Respaldo generado. Puedes copiarlo o descargarlo.";

      }

    );


  $("#downloadBackupBtn")
    ?.addEventListener(
      "click",
      downloadBackup
    );


  $("#importBackupBtn")
    ?.addEventListener(
      "click",
      importBackupFromTextarea
    );

}



function openBackupModal() {

  const backdrop =
    $("#backupBackdrop");


  if (!backdrop)
    return;


  $("#backupMessage")
    .textContent =
      "";


  backdrop.hidden =
    false;


  document.body.style.overflow =
    "hidden";


  setTimeout(

    () =>
      $("#backupTextarea")
        ?.focus(),

    0

  );

}



function closeBackupModal() {

  const backdrop =
    $("#backupBackdrop");


  if (!backdrop)
    return;


  backdrop.hidden =
    true;


  document.body.style.overflow =
    "";

}



function downloadBackup() {

  const backup =
    JSON.stringify(
      buildBackupObject(),
      null,
      2
    );


  const blob =
    new Blob(

      [
        backup
      ],

      {
        type:
          "application/json"
      }

    );


  const url =
    URL.createObjectURL(
      blob
    );


  const a =
    document.createElement(
      "a"
    );


  a.href =
    url;


  a.download =
    `mi-rinconcito-respaldo-${toISO(
      new Date()
    )}.json`;


  document.body
    .appendChild(
      a
    );


  a.click();


  a.remove();


  URL.revokeObjectURL(
    url
  );


  $("#backupMessage")
    .textContent =
      "Respaldo descargado.";

}



function normalizeBackup(raw) {

  if (
    !raw
    ||
    typeof raw !==
    "object"
  ) {

    throw new Error(
      "El respaldo no tiene un formato válido."
    );

  }


  const data =
    raw.data
    &&
    typeof raw.data ===
    "object"

      ?

      raw.data

      :

      raw;


  const normalized =
    {};


  COLLECTION_KEYS.forEach(

    key => {

      normalized[key] =
        Array.isArray(
          data[key]
        )

          ?

          data[key]

          :

          [];

    }

  );


  return normalized;

}



async function importBackupFromTextarea() {

  if (!currentUser)
    return;


  const textarea =
    $("#backupTextarea");


  const message =
    $("#backupMessage");


  const button =
    $("#importBackupBtn");


  const text =
    textarea.value
      .trim();


  if (!text) {

    message.textContent =
      "Pega primero el respaldo que quieres importar.";


    return;

  }


  let parsed;


  try {

    parsed =
      JSON.parse(
        text
      );

  }

  catch (_) {

    message.textContent =
      "El texto no es un JSON válido.";


    return;

  }


  const normalized =
    normalizeBackup(
      parsed
    );


  button.disabled =
    true;


  button.textContent =
    "Importando...";


  message.textContent =
    "Cargando datos en tu Firebase privado...";


  try {

    let count =
      0;


    for (
      const key
      of
      COLLECTION_KEYS
    ) {

      for (
        const item
        of
        normalized[key]
      ) {

        if (
          !item
          ||
          typeof item !==
          "object"
        ) {

          continue;

        }


        const clean =
          {
            ...item
          };


        const id =
          clean.id

            ?

            String(
              clean.id
            )
            .replaceAll(
              "/",
              "_"
            )

            :

            `${key}_${Date.now()}_${Math.random()
              .toString(36)
              .slice(2,8)}`;


        delete clean.id;

        delete clean.createdAt;

        delete clean.updatedAt;

        delete clean.migratedAt;


        await setDoc(

          userDoc(
            key,
            id
          ),

          {

            ...clean,

            importedAt:
              serverTimestamp(),

            updatedAt:
              serverTimestamp()

          },

          {
            merge:
              true
          }

        );


        count++;

      }

    }


    message.textContent =
      `Listo: ${count} registros cargados o actualizados.`;


    showToast(
      `Importación lista: ${count} registros ♡`
    );

  }

  catch (error) {

    console.error(
      error
    );


    message.textContent =

      error.code ===
      "permission-denied"

        ?

        "Firestore bloqueó la importación. Revisa las reglas."

        :

        "No se pudo terminar la importación.";

  }

  finally {

    button.disabled =
      false;


    button.textContent =
      "Importar a Firebase";

  }

}



/* =========================================
   AUTENTICACIÓN
========================================= */


onAuthStateChanged(

  auth,

  async user => {

    $("#loadingScreen")
      .hidden =
        true;


    currentUser =
      user;


    if (user) {

      $("#loginScreen")
        .hidden =
          true;


      $("#appShell")
        .hidden =
          false;


      $("#userEmail")
        .textContent =
          user.email
          ||
          "Usuario";


      ensureBackupUI();


      const migration =
        await migrateLegacyLocalData();


      subscribeUserData();


      switchView(
        currentView
      );


      if (
        migration.migrated
      ) {

        showToast(
          `Recuperé ${migration.imported} datos de tu versión anterior ♡`
        );

      }

    }

    else {

      cleanupSubscriptions();

      clearState();


      $("#appShell")
        .hidden =
          true;


      $("#loginScreen")
        .hidden =
          false;


      $("#userEmail")
        .textContent =
          "";

    }

  }

);



function authErrorMessage(error) {

  const code =
    error?.code
    ||
    "";


  if (

    code.includes(
      "invalid-credential"
    )

    ||

    code.includes(
      "wrong-password"
    )

    ||

    code.includes(
      "user-not-found"
    )

  ) {

    return "Correo o contraseña incorrectos.";

  }


  if (
    code.includes(
      "too-many-requests"
    )
  ) {

    return "Demasiados intentos. Espera un momento y vuelve a intentar.";

  }


  if (
    code.includes(
      "network-request-failed"
    )
  ) {

    return "No se pudo conectar. Revisa tu internet.";

  }


  if (
    code.includes(
      "unauthorized-domain"
    )
  ) {

    return "Este dominio de GitHub aún no está autorizado en Firebase.";

  }


  return "No se pudo iniciar sesión. Revisa los datos e intenta nuevamente.";

}



async function handleLogin(event) {

  event.preventDefault();


  const email =
    $("#loginEmail")
      .value
      .trim();


  const password =
    $("#loginPassword")
      .value;


  const button =
    $("#loginButton");


  const message =
    $("#loginMessage");


  message.textContent =
    "";


  message.style.color =
    "";


  button.disabled =
    true;


  button.textContent =
    "Entrando...";


  try {

    await signInWithEmailAndPassword(

      auth,

      email,

      password

    );


    $("#loginPassword")
      .value =
        "";

  }

  catch (error) {

    console.error(
      error
    );


    message.textContent =
      authErrorMessage(
        error
      );

  }

  finally {

    button.disabled =
      false;


    button.textContent =
      "Entrar ♡";

  }

}



async function handleResetPassword() {

  const email =
    $("#loginEmail")
      .value
      .trim();


  const message =
    $("#loginMessage");


  if (!email) {

    message.textContent =
      "Escribe primero tu correo.";


    $("#loginEmail")
      .focus();


    return;

  }


  try {

    await sendPasswordResetEmail(

      auth,

      email

    );


    message.style.color =
      "#4f8b64";


    message.textContent =
      "Te envié un correo para cambiar tu contraseña.";

  }

  catch (error) {

    console.error(
      error
    );


    message.style.color =
      "";


    message.textContent =
      "No se pudo enviar el correo de recuperación.";

  }

}



async function handleLogout() {

  try {

    await signOut(
      auth
    );


    showToast(
      "Sesión cerrada"
    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "No se pudo cerrar la sesión."
    );

  }

}



/* =========================================
   NAVEGACIÓN
========================================= */


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


  const target =
    $(`#view-${view}`);


  if (target) {

    target.classList.add(
      "active"
    );

  }


  $$(".nav-item")
    .forEach(

      btn => {

        btn.classList.toggle(

          "active",

          btn.dataset.view
          ===
          view

        );

      }

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



/* =========================================
   PROYECTOS + SUBTAREAS
========================================= */


function tasksForProject(projectId) {

  return state.projectTasks

    .filter(

      task =>
        task.projectId ===
        projectId

    )

    .sort(

      (a,b) => {

        const doneDiff =

          Number(
            Boolean(
              a.done
            )
          )

          -

          Number(
            Boolean(
              b.done
            )
          );


        if (doneDiff) {

          return doneDiff;

        }


        return (
          a.title
          ||
          ""
        )
        .localeCompare(
          b.title
          ||
          ""
        );

      }

    );

}



function projectProgress(project) {

  const mode =
    project.progressMode
    ||
    "manual";


  if (
    mode !==
    "auto"
  ) {

    return clamp(
      project.progress,
      0,
      100
    );

  }


  const tasks =
    tasksForProject(
      project.id
    );


  if (
    !tasks.length
  ) {

    return 0;

  }


  const done =
    tasks.filter(
      task =>
        task.done
    )
    .length;


  return Math.round(

    done
    /
    tasks.length
    *
    100

  );

}



async function toggleProjectProgressMode(projectId) {

  const project =
    state.projects.find(

      item =>
        item.id ===
        projectId

    );


  if (!project)
    return;


  const nextMode =

    (
      project.progressMode
      ||
      "manual"
    )
    ===
    "auto"

      ?

      "manual"

      :

      "auto";


  try {

    await updateItem(

      "projects",

      projectId,

      {
        progressMode:
          nextMode
      }

    );


    showToast(

      nextMode ===
      "auto"

        ?

        "Avance automático activado"

        :

        "Avance manual activado"

    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "No se pudo cambiar el modo de avance."
    );

  }

}



/* =========================================
   RENDERIZADO
========================================= */


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
        `${task.title} ${task.project || ""} ${task.priority || ""}`
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
            task.project
            ||
            "General"
          )}

          ·

          ${formatDate(
            task.date
          )}

          ·

          ${esc(
            task.priority
            ||
            "Media"
          )}

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
        `${item.title} ${item.category || ""}`
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

          ${esc(
            item.category
            ||
            "Personal"
          )}

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



function upcomingEvents() {

  const items =
    [];


  state.workTasks

    .filter(
      t =>
        !t.done
        &&
        t.date
    )

    .forEach(

      t =>
        items.push({

          ...t,

          type:
            "work",

          typeLabel:
            "Tarea"

        })

    );


  state.personal

    .filter(
      t =>
        !t.done
        &&
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
        )
        >=
        0

    )

    .sort(

      (a,b) =>

        (
          a.date
          ||
          "9999"
        )
        .localeCompare(
          b.date
          ||
          "9999"
        )

        ||

        (
          a.time
          ||
          ""
        )
        .localeCompare(
          b.time
          ||
          ""
        )

    );

}



function timelineEvent(item) {

  const typeClass =

    {

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
          ${shortMonth(item.date)}
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
        ${esc(item.typeLabel)}
      </span>

    </div>

  `;

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


  $("#homeStats")
    .innerHTML = [

      statCard(
        "✓",
        "Tareas pendientes",
        pendingWork,
        `${completedWork} completadas`
      ),

      statCard(
        "▣",
        "Próximos eventos",
        upcomingEvents().length,
        "trabajo + vida personal"
      ),

      statCard(
        "▱",
        "Proyectos activos",
        state.projects.length,
        "seguimiento de avance"
      ),

      statCard(
        "♥",
        "Planes personales",
        pendingPersonal,
        "también hay tiempo para ti"
      )

    ]
    .join("");


  const priorities =
    [...state.workTasks]

      .filter(
        t =>
          !t.done
      )

      .sort(

        (a,b) =>

          priorityWeight(
            a.priority
          )

          -

          priorityWeight(
            b.priority
          )

          ||

          (
            a.date
            ||
            "9999"
          )
          .localeCompare(
            b.date
            ||
            "9999"
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
            compactTask
          )
          .join("")

        :

        emptyState(
          "♡",
          "Aún no tienes tareas pendientes. Agrega la primera cuando quieras."
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
                ${shortMonth(next.date)}
              </span>

            </div>

          </div>

          <h4>
            ${esc(next.title)}
          </h4>

          <p>

            ${esc(next.typeLabel)}

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

              projectProgress(b)

              -

              projectProgress(a)

          )

          .slice(
            0,
            4
          )

          .map(

            p => {

              const pct =
                projectProgress(
                  p
                );


              return `

                <div
                  class="project-mini"
                  data-searchable="${esc(
                    `${p.title} ${p.details || ""}`
                  )}"
                >

                  <div>

                    <div class="name">
                      ${esc(p.title)}
                    </div>

                    <div class="progress-track">

                      <div
                        class="progress-fill"
                        style="width:${pct}%"
                      ></div>

                    </div>

                  </div>

                  <div class="pct">
                    ${pct}%
                  </div>

                </div>

              `;

            }

          )

          .join("")

        :

        emptyState(
          "▱",
          "Todavía no has creado proyectos."
        );


  const personal =
    [...state.personal]

      .filter(
        p =>
          !p.done
      )

      .sort(

        (a,b) =>

          (
            a.date
            ||
            "9999"
          )
          .localeCompare(
            b.date
            ||
            "9999"
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
            compactPersonal
          )
          .join("")

        :

        emptyState(
          "♥",
          "Agrega salidas, panoramas o cosas que quieras hacer para ti."
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



function renderWorkTasks() {

  let tasks =
    [...state.workTasks]

      .sort(

        (a,b) =>

          Number(
            Boolean(
              a.done
            )
          )

          -

          Number(
            Boolean(
              b.done
            )
          )

          ||

          (
            a.date
            ||
            "9999"
          )
          .localeCompare(
            b.date
            ||
            "9999"
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

        tasks

          .map(

            t => `

            <article
              class="item-card ${t.done ? "done" : ""}"
              data-searchable="${esc(
                `${t.title} ${t.project || ""} ${t.priority || ""} ${t.details || ""}`
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
                      t.project
                      ||
                      "General"
                    )}
                  </span>

                  <span>
                    •
                  </span>

                  <span>
                    ${formatDate(t.date)}
                  </span>

                  <span
                    class="priority-pill priority-${esc(
                      t.priority
                      ||
                      "Media"
                    )}"
                  >

                    ${esc(
                      t.priority
                      ||
                      "Media"
                    )}

                  </span>

                </div>

                ${
                  t.details

                    ?

                    `<div class="item-meta">${esc(t.details)}</div>`

                    :

                    ""
                }

              </div>

              <div class="item-actions">

                <button
                  class="mini-btn edit js-edit"
                  data-type="work"
                  data-id="${t.id}"
                  type="button"
                  title="Editar"
                >
                  ✎
                </button>

                <button
                  class="mini-btn delete js-delete"
                  data-type="work"
                  data-id="${t.id}"
                  type="button"
                  title="Eliminar"
                >
                  ×
                </button>

              </div>

            </article>

          `

          )

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

          Number(
            Boolean(
              a.done
            )
          )

          -

          Number(
            Boolean(
              b.done
            )
          )

          ||

          (
            a.date
            ||
            "9999"
          )
          .localeCompare(
            b.date
            ||
            "9999"
          )

      );


  $("#personalList")
    .innerHTML =

      items.length

        ?

        items

          .map(

            p => `

            <article
              class="item-card ${p.done ? "done" : ""}"
              data-searchable="${esc(
                `${p.title} ${p.category || ""} ${p.details || ""}`
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

                  <span class="category-pill type-personal">

                    ${esc(
                      p.category
                      ||
                      "Personal"
                    )}

                  </span>

                  <span>
                    ${formatDate(p.date)}
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

                    `<div class="item-meta">${esc(p.details)}</div>`

                    :

                    ""
                }

              </div>

              <div class="item-actions">

                <button
                  class="mini-btn edit js-edit"
                  data-type="personal"
                  data-id="${p.id}"
                  type="button"
                  title="Editar"
                >
                  ✎
                </button>

                <button
                  class="mini-btn delete js-delete"
                  data-type="personal"
                  data-id="${p.id}"
                  type="button"
                  title="Eliminar"
                >
                  ×
                </button>

              </div>

            </article>

          `

          )

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

        [...state.projects]

          .sort(

            (a,b) =>

              (
                a.title
                ||
                ""
              )
              .localeCompare(
                b.title
                ||
                ""
              )

          )

          .map(

            p => {

              const pct =
                projectProgress(
                  p
                );


              const mode =
                p.progressMode
                ||
                "manual";


              const tasks =
                tasksForProject(
                  p.id
                );


              const doneCount =
                tasks.filter(
                  task =>
                    task.done
                )
                .length;


              return `

                <article
                  class="project-card"
                  data-searchable="${esc(
                    `${p.title} ${p.details || ""} ${tasks.map(t => t.title).join(" ")}`
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

                    <div class="mini-action-group">

                      <button
                        class="mini-btn edit js-edit"
                        data-type="project"
                        data-id="${p.id}"
                        type="button"
                        title="Editar"
                      >
                        ✎
                      </button>

                      <button
                        class="mini-btn delete js-delete"
                        data-type="project"
                        data-id="${p.id}"
                        type="button"
                        title="Eliminar"
                      >
                        ×
                      </button>

                    </div>

                  </div>

                  <p>
                    ${esc(
                      p.details
                      ||
                      "Sin descripción todavía."
                    )}
                  </p>

                  <div class="project-progress-row">

                    <span>
                      Avance
                    </span>

                    <strong>
                      ${pct}%
                    </strong>

                  </div>

                  <input
                    class="project-range js-project-range"
                    data-id="${p.id}"
                    type="range"
                    min="0"
                    max="100"
                    value="${pct}"
                    ${mode === "auto" ? "disabled" : ""}
                  >

                  <div class="project-mode-row">

                    <span>

                      ${
                        mode ===
                        "auto"

                          ?

                          "Calculado por subtareas"

                          :

                          "Avance manual"
                      }

                    </span>

                    <button
                      class="mode-btn js-toggle-progress-mode"
                      data-id="${p.id}"
                      type="button"
                    >

                      ${
                        mode ===
                        "auto"

                          ?

                          "Cambiar a manual"

                          :

                          "Usar automático"
                      }

                    </button>

                  </div>

                  <div class="project-footer">

                    <span>
                      Meta:
                      ${formatDate(
                        p.target
                      )}
                    </span>

                    <span>

                      ${
                        pct >=
                        100

                          ?

                          "Completado ✓"

                          :

                          "En progreso"
                      }

                    </span>

                  </div>

                  <div class="project-task-zone">

                    <div class="project-task-head">

                      <div class="project-task-title">

                        Subtareas ·
                        ${doneCount}/${tasks.length}

                      </div>

                      <button
                        class="text-btn js-add-project-task"
                        data-project-id="${p.id}"
                        type="button"
                      >
                        + Agregar
                      </button>

                    </div>

                    <div class="project-task-list">

                      ${
                        tasks.length

                          ?

                          tasks

                            .map(

                              task => `

                              <div
                                class="project-task-row ${task.done ? "done" : ""}"
                              >

                                <input
                                  class="js-toggle-project-task"
                                  type="checkbox"
                                  data-id="${task.id}"
                                  ${task.done ? "checked" : ""}
                                >

                                <span class="project-task-name">
                                  ${esc(task.title)}
                                </span>

                                <div class="project-task-actions">

                                  <button
                                    class="mini-btn edit js-edit"
                                    data-type="projectTask"
                                    data-id="${task.id}"
                                    type="button"
                                    title="Editar"
                                  >
                                    ✎
                                  </button>

                                  <button
                                    class="mini-btn delete js-delete"
                                    data-type="projectTask"
                                    data-id="${task.id}"
                                    type="button"
                                    title="Eliminar"
                                  >
                                    ×
                                  </button>

                                </div>

                              </div>

                            `

                            )

                            .join("")

                          :

                          `
                          <div class="compact-meta">
                            Todavía no hay subtareas.
                          </div>
                          `
                      }

                    </div>

                  </div>

                </article>

              `;

            }

          )

          .join("")

        :

        emptyState(
          "▱",
          "Crea tu primer proyecto."
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

          (
            a.date
            ||
            "9999"
          )
          .localeCompare(
            b.date
            ||
            "9999"
          )

          ||

          (
            a.time
            ||
            ""
          )
          .localeCompare(
            b.time
            ||
            ""
          )

      );


  return list.length

    ?

    list

      .map(

        item => `

        <article
          class="event-card"
          data-searchable="${esc(
            `${item.title} ${item.details || ""}`
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
              ${shortMonth(item.date)}
            </span>

          </div>

          <div>

            <span
              class="type-pill ${
                type ===
                "meeting"

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
                item.details
                ||
                "Sin detalles."
              )}

            </p>

          </div>

          <div class="item-actions">

            <button
              class="mini-btn edit js-edit"
              data-type="${type}"
              data-id="${item.id}"
              type="button"
              title="Editar"
            >
              ✎
            </button>

            <button
              class="mini-btn delete js-delete"
              data-type="${type}"
              data-id="${item.id}"
              type="button"
              title="Eliminar"
            >
              ×
            </button>

          </div>

        </article>

      `

      )

      .join("")

    :

    emptyState(

      type ===
      "meeting"

        ?

        "♙"

        :

        "✦",

      `No hay ${label.toLowerCase()}s registradas.`

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



function renderIdeas() {

  $("#ideaList")
    .innerHTML =

      state.ideas.length

        ?

        state.ideas

          .map(

            i => `

            <article
              class="idea-card"
              data-searchable="${esc(
                `${i.title} ${i.details || ""}`
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
                  i.details
                  ||
                  "Sin descripción."
                )}
              </p>

              <div class="mini-action-group">

                <button
                  class="mini-btn edit js-edit"
                  data-type="idea"
                  data-id="${i.id}"
                  type="button"
                  title="Editar"
                >
                  ✎
                </button>

                <button
                  class="mini-btn delete js-delete"
                  data-type="idea"
                  data-id="${i.id}"
                  type="button"
                  title="Eliminar"
                >
                  ×
                </button>

              </div>

            </article>

          `

          )

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

        state.notes

          .map(

            n => `

            <article
              class="note-card"
              data-searchable="${esc(
                `${n.title} ${n.details || ""}`
              )}"
            >

              <div class="note-pin">
                ●
              </div>

              <h3>
                ${esc(n.title)}
              </h3>

              <p>
                ${esc(n.details || "")}
              </p>

              <div class="note-actions mini-action-group">

                <button
                  class="mini-btn edit js-edit"
                  data-type="note"
                  data-id="${n.id}"
                  type="button"
                  title="Editar"
                >
                  ✎
                </button>

                <button
                  class="mini-btn delete js-delete"
                  data-type="note"
                  data-id="${n.id}"
                  type="button"
                  title="Eliminar"
                >
                  ×
                </button>

              </div>

            </article>

          `

          )

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

        state.goals

          .map(

            g => `

            <article
              class="goal-card"
              data-searchable="${esc(
                `${g.title} ${g.details || ""}`
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

                <div class="mini-action-group">

                  <button
                    class="mini-btn edit js-edit"
                    data-type="goal"
                    data-id="${g.id}"
                    type="button"
                    title="Editar"
                  >
                    ✎
                  </button>

                  <button
                    class="mini-btn delete js-delete"
                    data-type="goal"
                    data-id="${g.id}"
                    type="button"
                    title="Eliminar"
                  >
                    ×
                  </button>

                </div>

              </div>

              <p>
                ${esc(g.details || "")}
              </p>

              <div class="project-progress-row">

                <span>
                  Avance
                </span>

                <strong>

                  ${clamp(
                    g.progress
                    ||
                    0,
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
                  g.progress
                  ||
                  0,
                  0,
                  100
                )}"
              >

              <div class="goal-meta">

                <span>
                  Fecha objetivo
                </span>

                <strong>
                  ${formatDate(g.date)}
                </strong>

              </div>

            </article>

          `

          )

          .join("")

        :

        emptyState(
          "◎",
          "Crea una meta que quieras cumplir."
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
        doneWork
        /
        totalWork
        *
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
        donePersonal
        /
        totalPersonal
        *
        100
      )

      :

      0;


  const projectPct =

    state.projects.length

      ?

      Math.round(

        state.projects.reduce(

          (
            sum,
            p
          ) =>

            sum
            +
            projectProgress(
              p
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
    .innerHTML = [

      statCard(
        "♡",
        "Avance general",
        `${avg}%`,
        "trabajo + vida + proyectos"
      ),

      statCard(
        "✓",
        "Trabajo",
        `${workPct}%`,
        `${doneWork} de ${totalWork} tareas`
      ),

      statCard(
        "♥",
        "Personal",
        `${personalPct}%`,
        `${donePersonal} de ${totalPersonal} actividades`
      ),

      statCard(
        "▱",
        "Proyectos",
        `${projectPct}%`,
        `${state.projects.length} proyectos`
      )

    ]
    .join("");


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



function calendarEvents() {

  const list =
    [];


  state.workTasks

    .filter(
      t =>
        !t.done
        &&
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
        !t.done
        &&
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
      new Date(
        start
      );


    d.setDate(
      start.getDate()
      +
      i
    );


    const iso =
      toISO(
        d
      );


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

          e =>
            `
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



function renderAll() {

  if (
    !$("#todayLabel")
  ) {

    return;

  }


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



/* =========================================
   MODAL CREAR / EDITAR
========================================= */


const modalConfigs = {

  work: {

    title:
      "Nueva tarea de trabajo",

    editTitle:
      "Editar tarea de trabajo",

    label:
      "Tarea",

    date:
      true,

    dateLabel:
      "Fecha",

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
      true

  },


  personal: {

    title:
      "Nueva actividad personal",

    editTitle:
      "Editar actividad personal",

    label:
      "Actividad",

    date:
      true,

    dateLabel:
      "Fecha",

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

    editTitle:
      "Editar proyecto",

    label:
      "Nombre del proyecto",

    date:
      true,

    dateLabel:
      "Fecha objetivo",

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


  projectTask: {

    title:
      "Nueva subtarea",

    editTitle:
      "Editar subtarea",

    label:
      "Subtarea del proyecto",

    date:
      false,

    dateLabel:
      "Fecha",

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


  meeting: {

    title:
      "Nueva reunión",

    editTitle:
      "Editar reunión",

    label:
      "Nombre de la reunión",

    date:
      true,

    dateLabel:
      "Fecha",

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

    editTitle:
      "Editar capacitación",

    label:
      "Nombre de la capacitación",

    date:
      true,

    dateLabel:
      "Fecha",

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

    editTitle:
      "Editar idea",

    label:
      "Idea",

    date:
      false,

    dateLabel:
      "Fecha",

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

    editTitle:
      "Editar nota",

    label:
      "Título",

    date:
      false,

    dateLabel:
      "Fecha",

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

    editTitle:
      "Editar meta",

    label:
      "Meta",

    date:
      true,

    dateLabel:
      "Fecha objetivo",

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



function resetModalFields() {

  $("#itemForm")
    .reset();


  $("#itemPriority")
    .value =
      "Media";


  $("#itemProgress")
    .value =
      "0";


  $("#itemDate")
    .value =
      toISO(
        new Date()
      );

}



function configureModal(
  type,
  item = null
) {

  const cfg =
    modalConfigs[type]
    ||
    modalConfigs.work;


  resetModalFields();


  $("#itemType")
    .value =
      type;


  $("#modalTitle")
    .textContent =

      item

        ?

        cfg.editTitle

        :

        cfg.title;


  $("#titleFieldLabel")
    .textContent =
      cfg.label;


  $("#dateFieldLabel")
    .textContent =
      cfg.dateLabel
      ||
      "Fecha";


  $("#saveItemBtn")
    .textContent =

      item

        ?

        "Guardar cambios"

        :

        "Guardar";


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


  if (item) {

    $("#itemTitle")
      .value =
        item.title
        ||
        "";


    $("#itemTime")
      .value =
        item.time
        ||
        "";


    $("#itemProject")
      .value =
        item.project
        ||
        "";


    $("#itemPriority")
      .value =
        item.priority
        ||
        "Media";


    $("#itemCategory")
      .value =
        item.category
        ||
        "Personal";


    $("#itemDetails")
      .value =
        item.details
        ||
        "";


    if (
      type ===
      "project"
    ) {

      $("#itemDate")
        .value =
          item.target
          ||
          "";


      $("#itemProgress")
        .value =
          clamp(
            item.progress,
            0,
            100
          );

    }

    else {

      $("#itemDate")
        .value =
          item.date
          ||
          "";


      $("#itemProgress")
        .value =
          clamp(
            item.progress
            ||
            0,
            0,
            100
          );

    }

  }

}



function openModal(type) {

  editContext =
    null;


  if (
    type !==
    "projectTask"
  ) {

    currentProjectForTask =
      null;

  }


  configureModal(
    type
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



function openProjectTaskModal(projectId) {

  editContext =
    null;


  currentProjectForTask =
    projectId;


  configureModal(
    "projectTask"
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



function openEditModal(
  type,
  id
) {

  const key =
    typeToCollection[type];


  if (!key)
    return;


  const item =
    state[key].find(

      entry =>
        entry.id ===
        id

    );


  if (!item)
    return;


  editContext = {

    type,

    id,

    key

  };


  currentProjectForTask =

    type ===
    "projectTask"

      ?

      item.projectId

      :

      null;


  configureModal(
    type,
    item
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



function closeModal() {

  $("#modalBackdrop")
    .hidden =
      true;


  document.body.style.overflow =
    "";


  editContext =
    null;


  currentProjectForTask =
    null;

}



function formPayload(type) {

  const title =
    $("#itemTitle")
      .value
      .trim();


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


  switch (type) {

    case "work":

      return {

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

        details:
          common.details,

        ...(
          editContext

            ?

            {}

            :

            {
              done:
                false
            }
        )

      };


    case "personal":

      return {

        ...common,

        category:
          $("#itemCategory")
            .value,

        ...(
          editContext

            ?

            {}

            :

            {
              done:
                false
            }
        )

      };


    case "project":

      return {

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
          common.details,

        ...(
          editContext

            ?

            {}

            :

            {
              progressMode:
                "manual"
            }
        )

      };


    case "projectTask":

      return {

        title,

        details:
          common.details,

        projectId:
          currentProjectForTask,

        ...(
          editContext

            ?

            {}

            :

            {
              done:
                false
            }
        )

      };


    case "meeting":

    case "training":

      return common;


    case "idea":

    case "note":

      return {

        title,

        details:
          common.details

      };


    case "goal":

      return {

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

      };


    default:

      return common;

  }

}



async function handleFormSubmit(event) {

  event.preventDefault();


  const type =
    $("#itemType")
      .value;


  const title =
    $("#itemTitle")
      .value
      .trim();


  if (
    !title
    ||
    !currentUser
  ) {

    return;

  }


  if (

    type ===
    "projectTask"

    &&

    !currentProjectForTask

  ) {

    showToast(
      "No se pudo identificar el proyecto."
    );


    return;

  }


  const button =
    $("#saveItemBtn");


  button.disabled =
    true;


  button.textContent =

    editContext

      ?

      "Actualizando..."

      :

      "Guardando...";


  try {

    const payload =
      formPayload(
        type
      );


    const collectionKey =
      typeToCollection[type];


    if (editContext) {

      await updateItem(

        collectionKey,

        editContext.id,

        payload

      );


      showToast(
        "Cambios guardados ♡"
      );

    }

    else {

      await createItem(

        collectionKey,

        payload

      );


      showToast(
        "Guardado en Mi Rinconcito ♡"
      );

    }


    closeModal();

  }

  catch (error) {

    console.error(
      error
    );


    showToast(

      error.code ===
      "permission-denied"

        ?

        "Firestore bloqueó el guardado. Revisa las reglas."

        :

        "No se pudo guardar. Intenta nuevamente."

    );

  }

  finally {

    button.disabled =
      false;


    button.textContent =
      "Guardar";

  }

}



async function deleteItem(
  type,
  id
) {

  const key =
    typeToCollection[type];


  if (!key)
    return;


  if (
    !window.confirm(
      "¿Eliminar este elemento?"
    )
  ) {

    return;

  }


  try {

    if (
      type ===
      "project"
    ) {

      const children =
        state.projectTasks.filter(

          task =>
            task.projectId ===
            id

        );


      for (
        const child
        of
        children
      ) {

        await removeItem(

          "projectTasks",

          child.id

        );

      }

    }


    await removeItem(
      key,
      id
    );


    showToast(
      "Elemento eliminado"
    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "No se pudo eliminar."
    );

  }

}



async function toggleDone(
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


  try {

    await updateItem(

      key,

      id,

      {
        done
      }

    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "No se pudo actualizar."
    );

  }

}



async function toggleProjectTask(
  id,
  done
) {

  try {

    await updateItem(

      "projectTasks",

      id,

      {
        done
      }

    );

  }

  catch (error) {

    console.error(
      error
    );


    showToast(
      "No se pudo actualizar la subtarea."
    );

  }

}



/* =========================================
   BUSCADOR
========================================= */


function applySearch() {

  const input =
    $("#globalSearch");


  if (!input)
    return;


  const q =
    input.value
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

        Boolean(

          q
          &&
          !text.includes(q)

        )

      );

    }

  );

}



/* =========================================
   EVENTOS
========================================= */


function bindEvents() {

  $("#loginForm")
    .addEventListener(
      "submit",
      handleLogin
    );


  $("#resetPasswordBtn")
    .addEventListener(
      "click",
      handleResetPassword
    );


  $("#logoutBtn")
    .addEventListener(
      "click",
      handleLogout
    );


  $$(".nav-item")
    .forEach(

      btn => {

        btn.addEventListener(

          "click",

          () =>
            switchView(
              btn.dataset.view
            )

        );

      }

    );


  $("#menuToggle")
    .addEventListener(

      "click",

      () => {

        $("#sidebar")
          .classList
          .toggle(
            "open"
          );

      }

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


  $("#itemForm")
    .addEventListener(
      "submit",
      handleFormSubmit
    );


  $("#modalBackdrop")
    .addEventListener(

      "click",

      event => {

        if (
          event.target ===
          $("#modalBackdrop")
        ) {

          closeModal();

        }

      }

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

    event => {

      const addBtn =
        event.target.closest(
          "[data-open-add]"
        );


      if (addBtn) {

        openModal(
          addBtn.dataset.openAdd
        );

      }


      const goBtn =
        event.target.closest(
          "[data-go]"
        );


      if (goBtn) {

        switchView(
          goBtn.dataset.go
        );

      }


      const editBtn =
        event.target.closest(
          ".js-edit"
        );


      if (editBtn) {

        openEditModal(

          editBtn.dataset.type,

          editBtn.dataset.id

        );

      }


      const deleteBtn =
        event.target.closest(
          ".js-delete"
        );


      if (deleteBtn) {

        deleteItem(

          deleteBtn.dataset.type,

          deleteBtn.dataset.id

        );

      }


      const addProjectTaskBtn =
        event.target.closest(
          ".js-add-project-task"
        );


      if (addProjectTaskBtn) {

        openProjectTaskModal(
          addProjectTaskBtn.dataset.projectId
        );

      }


      const modeBtn =
        event.target.closest(
          ".js-toggle-progress-mode"
        );


      if (modeBtn) {

        toggleProjectProgressMode(
          modeBtn.dataset.id
        );

      }


      const filterBtn =
        event.target.closest(
          "[data-task-filter]"
        );


      if (filterBtn) {

        taskFilter =
          filterBtn.dataset.taskFilter;


        $$(
          "[data-task-filter]"
        )
        .forEach(

          btn => {

            btn.classList.toggle(

              "active",

              btn ===
              filterBtn

            );

          }

        );


        renderWorkTasks();


        applySearch();

      }

    }

  );


  document.addEventListener(

    "change",

    async event => {

      if (
        event.target.matches(
          ".js-toggle-work"
        )
      ) {

        await toggleDone(

          "work",

          event.target.dataset.id,

          event.target.checked

        );

      }


      if (
        event.target.matches(
          ".js-toggle-personal"
        )
      ) {

        await toggleDone(

          "personal",

          event.target.dataset.id,

          event.target.checked

        );

      }


      if (
        event.target.matches(
          ".js-toggle-project-task"
        )
      ) {

        await toggleProjectTask(

          event.target.dataset.id,

          event.target.checked

        );

      }


      if (
        event.target.matches(
          ".js-project-range"
        )
      ) {

        try {

          await updateItem(

            "projects",

            event.target.dataset.id,

            {

              progress:
                clamp(
                  event.target.value,
                  0,
                  100
                )

            }

          );

        }

        catch (error) {

          console.error(
            error
          );


          showToast(
            "No se pudo actualizar el proyecto."
          );

        }

      }


      if (
        event.target.matches(
          ".js-goal-range"
        )
      ) {

        try {

          await updateItem(

            "goals",

            event.target.dataset.id,

            {

              progress:
                clamp(
                  event.target.value,
                  0,
                  100
                )

            }

          );

        }

        catch (error) {

          console.error(
            error
          );


          showToast(
            "No se pudo actualizar la meta."
          );

        }

      }

    }

  );


  document.addEventListener(

    "keydown",

    event => {

      if (
        event.key !==
        "Escape"
      ) {

        return;

      }


      if (
        !$("#modalBackdrop")
          .hidden
      ) {

        closeModal();

      }


      if (

        $("#backupBackdrop")

        &&

        !$("#backupBackdrop")
          .hidden

      ) {

        closeBackupModal();

      }

    }

  );

}



bindEvents();

renderAll();
