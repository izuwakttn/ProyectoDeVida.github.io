// dash.js

import { db, auth } from './firebase-init.js';
import {
  doc, setDoc, getDoc, serverTimestamp
} from "https://www.gstatic.com/firebasejs/11.9.0/firebase-firestore.js";

let tasks = [];

// ========== TAREAS ==========

const addTask = () => {
    const taskInput = document.getElementById("taskinput");
    const text = taskInput.value.trim();

    if (text) {
        tasks.push({ text: text, completed: false });
        taskInput.value = "";
        updateTaskList();
        guardarProgreso();
    }
    updateStats();
};

const toggleTaskComplete = (index) => {
    tasks[index].completed = !tasks[index].completed;
    updateTaskList();
    updateStats();
    guardarProgreso();
};

const deleteTask = (index) => {
    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
    guardarProgreso();
};

const editTask = (index) => {
    const taskInput = document.getElementById("taskinput");
    taskInput.value = tasks[index].text;

    tasks.splice(index, 1);
    updateTaskList();
    updateStats();
    guardarProgreso();
};

const updateStats = () => {
    const completeTasks = tasks.filter(task => task.completed).length;
    const totalTasks = tasks.length;
    const progreso = totalTasks === 0 ? 0 : (completeTasks / totalTasks) * 100;

    const progresoBar = document.getElementById("progreso");
    progresoBar.style.width = `${progreso}%`;

    const num = document.getElementById("num");
    num.textContent = `${completeTasks} / ${totalTasks}`;

    // ✅ Checkbox oculto para evaluación interna
    const internoCompleto = document.getElementById("internoCompleto");
    internoCompleto.checked = totalTasks > 0 && completeTasks === totalTasks;

    if (totalTasks > 0 && completeTasks === totalTasks) {
        confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 }
        });
    }
};

const updateTaskList = () => {
    const taskList = document.getElementById("lista-tareas");
    taskList.innerHTML = "";

    tasks.forEach((task, index) => {
        const listItem = document.createElement("li");

        listItem.innerHTML = `
            <div class="taskItem">
                <div class="task ${task.completed ? 'completed' : ''}">
                    <input type="checkbox" class="checkbox" ${task.completed ? "checked" : ""}/>
                    <p>${task.text}</p>
                </div>
                <div class="icons">
                    <img src="edit.png" onclick="editTask(${index})"/>
                    <img src="bin.png" onclick="deleteTask(${index})"/>
                </div>
            </div>
        `;

        listItem.querySelector(".checkbox").addEventListener("change", () => toggleTaskComplete(index));
        taskList.appendChild(listItem);
    });
};

// ========== GUARDAR EN FIRESTORE ==========

const guardarProgreso = async () => {
    try {
        updateStats(); // <-- Fuerza actualización antes de leer el checkbox
        
        const user = auth.currentUser;
        if (!user) {
            alert("No has iniciado sesión");
            return;
        }

        const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
        const progresoDocRef = doc(db, 'progresos', `${user.uid}_${fecha}`);

        // 🟨 Obtener estado del checkbox oculto
        const internoCompleto = document.getElementById("internoCompleto");
        const diaCompletado = internoCompleto.checked;

        await setDoc(progresoDocRef, {
            tareas: tasks,
            fecha: fecha,
             completado: diaCompletado, // ✅ Se guarda el estado oculto aquí
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Error guardando progreso:", error);
    }
};

// ========== CARGAR AL INICIAR ==========

const cargarProgreso = async () => {
    try {
        const user = auth.currentUser;
        if (!user) return;

        const hoy = new Date();
        const hoyStr = hoy.toISOString().split('T')[0];
        const ayer = new Date(hoy.getTime() - 86400000);
        const ayerStr = ayer.toISOString().split('T')[0];

        const docRefHoy = doc(db, 'progresos', `${user.uid}_${hoyStr}`);
        const docSnapHoy = await getDoc(docRefHoy);

        if (docSnapHoy.exists()) {
            const dataHoy = docSnapHoy.data();

            // 🔁 Convertimos la fecha guardada en string tipo "YYYY-MM-DD"
            const fechaGuardada = new Date(dataHoy.fecha).toISOString().split('T')[0];
            const esOtroDia = fechaGuardada !== hoyStr;

            if (esOtroDia) {
                tasks = dataHoy.tareas.map(t => ({ text: t.text, completed: false }));

                await setDoc(docRefHoy, {
                    fecha: hoyStr,
                    tareas: tasks
                });
            } else {
                tasks = dataHoy.tareas;
            }
        } else {
            const docRefAyer = doc(db, 'progresos', `${user.uid}_${ayerStr}`);
            const docSnapAyer = await getDoc(docRefAyer);

            if (docSnapAyer.exists()) {
                const tareasAyer = docSnapAyer.data().tareas;
                tasks = tareasAyer.map(t => ({ text: t.text, completed: false }));
            } else {
                tasks = [];
            }

            await setDoc(docRefHoy, {
                fecha: hoyStr,
                tareas: tasks
            });
        }

        updateTaskList();
        updateStats();
    } catch (error) {
        console.error("Error al cargar progreso:", error);
    }
};



// ========== EVENTOS ==========

document.getElementById("newTask").addEventListener("click", function (e) {
    e.preventDefault();
    addTask();
});

document.getElementById("guardarbtn").addEventListener("click", (e) => {
    e.preventDefault();
    guardarProgreso();
});

// ========== INICIO DE SESIÓN DETECTADO ==========

import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.9.0/firebase-auth.js";

onAuthStateChanged(auth, (user) => {
    if (user) {
        cargarProgreso(); // Cargar datos cuando el usuario inicia sesión
    }
});

// Exporta funciones si las necesitas en otros archivos
export { addTask, toggleTaskComplete, deleteTask, editTask, updateStats, updateTaskList };

// Hacer funciones disponibles globalmente para los botones HTML
window.editTask = editTask;
window.deleteTask = deleteTask;

