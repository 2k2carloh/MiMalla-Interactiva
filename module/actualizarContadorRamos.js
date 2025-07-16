function actualizarContadorRamos() {
  const todosRamos = carrera.semestres.flatMap(s => s.ramos);
  const aprobados = todosRamos.filter(r => r.completado).length;
  const total = todosRamos.length;
  const el = document.getElementById("contadorRamos");
  if (el) el.textContent = `${aprobados} / ${total} ramos aprobados`;
}

module.exports = {

    actualizarContadorRamos

}