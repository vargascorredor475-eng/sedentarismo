/* ===== Utilidades ===== */
function $(id){ return document.getElementById(id); }
// Devuelve el valor del botón de opción marcado (por ejemplo, "estudiante")
function val(n){ var e=document.querySelector('input[name="'+n+'"]:checked'); return e?e.value:""; }
// Pasa a minúsculas y quita tildes para comparar textos fácilmente
function limpiar(t){ return t.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,""); }

/* ===== Datos: recomendaciones según la edad ===== */
var EDADES = {
  a: {meta:"60 min al día", info:"Entre los 13 y 15 años el cuerpo está creciendo. Lo ideal es al menos 60 minutos diarios de actividad moderada o intensa, y fortalecer músculos y huesos con saltos o carreras 3 días a la semana.",
      ej:[["Saltar la cuerda","3 series de 1 minuto"],["Sentadillas","3 series de 12"],["Caminata rápida o trote","20 minutos"],["Estiramientos","5 minutos al terminar"]]},
  b: {meta:"60 min al día", info:"A los 16 y 17 años baja mucho la actividad por estudio y pantallas. Mantén 60 minutos al día combinando deporte, caminatas y fuerza 3 días a la semana.",
      ej:[["Flexiones (con rodillas apoyadas si es necesario)","3 series de 10"],["Plancha","3 series de 20 segundos"],["Trote o bicicleta","25 minutos"],["Pausa activa cada hora de estudio","5 minutos"]]},
  c: {meta:"150 min a la semana", info:"Desde los 18 años se recomiendan entre 150 y 300 minutos semanales de actividad moderada, más fuerza muscular 2 días a la semana. Sentarse menos también cuenta.",
      ej:[["Caminata rápida","30 minutos, 5 días"],["Sentadillas y zancadas","3 series de 15"],["Flexiones y plancha","3 series"],["Subir escaleras en vez del ascensor","Cada vez que puedas"]]}
};
function grupo(e){ return e<=15 ? "a" : e<=17 ? "b" : "c"; }

/* ===== Datos: ejercicios adaptados a un problema (solo profesores) ===== */
// "re" busca palabras clave en lo que escribió el profesor
var LIMITES = [
  {re:/coraz|cardi|presion|hipertens|mareo|desmay|diabet/, ej:[["Caminata muy suave en plano","10 minutos"],["Estiramientos suaves sentado","5 minutos"],["Respiración profunda","2 minutos"]]},
  {re:/asma|respir|pulmon|aliento|fatiga/, ej:[["Caminata lenta con pausas","10 minutos"],["Inhalar 4 s por la nariz y exhalar 6 s","3 minutos"],["Elevación de brazos sentado","2 series de 8"]]},
  {re:/espalda|columna|lumbar|escoliosis|hernia|cuello/, ej:[["Báscula de pelvis acostado","2 series de 10"],["Gato-camello en cuatro apoyos, muy suave","2 series de 8"],["Caminata lenta en plano","10 minutos"],["Estiramiento de piernas acostado","2 series de 20 s"]]},
  {re:/rodilla|pierna|pie|pies|tobillo|cadera|muslo|musculo|cojo/, ej:[["Círculos de brazos sentado","3 series de 10"],["Elevación de brazos con una botella de agua","3 series de 10"],["Estiramiento suave de cuello y hombros","5 minutos"],["Respiración profunda sentado","2 minutos"]]},
  {re:/brazo|hombro|muneca|mano|codo|dedo/, ej:[["Caminata a ritmo cómodo","15 minutos"],["Sentadillas apoyándote en una silla","3 series de 8"],["Elevación de talones","3 series de 12"],["Marcha en el sitio","3 minutos"]]},
  {re:/peso|obes/, ej:[["Caminata a ritmo cómodo","15 a 20 minutos"],["Bicicleta estática o pedaleo suave","10 minutos"],["Sentadillas apoyándote en una silla","2 series de 8"],["Estiramientos","5 minutos"]]}
];
var GENERAL = [["Caminata suave","10 a 15 minutos"],["Estiramientos suaves","5 minutos"],["Respiración profunda","2 minutos"]];

/* ===== Mostrar u ocultar campos según el tipo de usuario ===== */
function cambiarRol(){
  var est = val("rol")==="estudiante";
  $("campo-grado").hidden = !est;
  $("campos-prof").hidden = est;
  $("edad-nota").textContent = est ? "(obligatorio)" : "(opcional)";
}
function cambiarCorreo(){
  $("correo").placeholder = val("tipo")==="colegio" ? "nombre@colegio.edu.co" : "nombre@gmail.com";
}
document.querySelectorAll('input[name="rol"]').forEach(function(r){ r.addEventListener("change",cambiarRol); });
document.querySelectorAll('input[name="tipo"]').forEach(function(r){ r.addEventListener("change",cambiarCorreo); });

/* ===== Construir el plan personal ===== */
function construirPlan(rol, nombre, edad, problema){
  var ej, meta, info, aviso = "";
  var txt = limpiar(problema);
  var sinProblema = /^(no|ninguno|ninguna|nada|n\/a|-)?$/.test(txt.trim());

  if(rol==="profesor" && !sinProblema){
    // Se busca el primer problema que coincida; si ninguno coincide, se usa el plan general
    var hallado = LIMITES.filter(function(l){ return l.re.test(txt); })[0];
    ej = hallado ? hallado.ej : GENERAL;
    meta = "Ejercicio adaptado";
    info = "Por lo que nos cuentas («"+problema+"»), te sugerimos movimientos suaves y de bajo impacto.";
    aviso = "Estas ideas son generales. Si tienes un diagnóstico, consulta a tu médico antes de empezar y para si sientes dolor.";
  } else {
    var d = EDADES[grupo(edad || 18)];
    ej = d.ej; meta = d.meta; info = d.info;
  }
  if(rol==="profesor" && edad>=50){
    aviso += " Empieza con ritmo suave y sube poco a poco.";
  }
  $("plan-titulo").textContent = nombre ? "Tu plan, "+nombre : "Tu plan para moverte";
  $("plan-meta").textContent = meta;
  $("plan-info").textContent = info;
  $("plan-ej").innerHTML = ej.map(function(x){ return "<li><b>"+x[0]+"</b>"+x[1]+"</li>"; }).join("");
  $("plan-aviso").textContent = aviso.trim();
  $("plan-aviso").hidden = !aviso.trim();
}

/* ===== Enviar el registro ===== */
$("f").addEventListener("submit", function(ev){
  ev.preventDefault();
  var rol = val("rol"), ok = true;
  var correo = $("correo").value.trim(), edTxt = $("edad").value.trim();
  ["e-correo","e-grado","e-edad"].forEach(function(i){ $(i).textContent=""; });

  if(!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(correo)){
    $("e-correo").textContent="Escribe un correo válido, por ejemplo nombre@dominio.com."; ok=false;
  }
  if(rol==="estudiante" && !$("grado").value.trim()){
    $("e-grado").textContent="Escribe tu grado para continuar."; ok=false;
  }
  // La edad es obligatoria para estudiantes; para profesores solo se revisa si la escriben
  var edad = parseInt(edTxt,10);
  if((rol==="estudiante" || edTxt) && (!/^\d{1,2}$/.test(edTxt) || edad<5)){
    $("e-edad").textContent="Escribe tu edad con números, por ejemplo 15."; ok=false;
  }
  if(!ok) return;

  construirPlan(rol, $("nombre").value.trim(), edad, rol==="profesor" ? $("problema").value.trim() : "");
  $("registro").hidden = true;
  $("sitio").hidden = false;
  window.scrollTo(0,0);
  setTimeout(animarBarras,200);
});

/* ===== Encuesta: las barras crecen hasta su porcentaje ===== */
function animarBarras(){
  document.querySelectorAll(".bar").forEach(function(b){
    b.querySelector("i").style.width = b.dataset.v + "%";
  });
}

/* ===== Pausas activas: contador de 30 segundos ===== */
document.querySelectorAll(".timer").forEach(function(b){
  b.addEventListener("click", function(){
    if(b.dataset.on) return;       // evita iniciar dos veces
    b.dataset.on = 1;
    var s = 30;
    b.textContent = "Quedan 30 s";
    var t = setInterval(function(){
      s--;
      if(s<=0){ clearInterval(t); b.textContent="¡Listo! Repetir"; delete b.dataset.on; }
      else { b.textContent = "Quedan "+s+" s"; }
    }, 1000);
  });
});

// Estado inicial de los campos
cambiarRol();
cambiarCorreo();
