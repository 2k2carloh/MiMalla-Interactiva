function actualizarDesbloqueos() {
  const todosRamos = carrera.semestres.flatMap(s => s.ramos);
  todosRamos.forEach(ramo => {
    if (ramo.requisitos.length > 0) {
      const ok = ramo.requisitos.every(id => {
        const req = todosRamos.find(r => r.id === id);
        return req && req.completado;
      });
      ramo.desbloqueado = ok;
    } else {
      ramo.desbloqueado = true;
    }
  });
  actualizarContadorRamos()
}

module.exports = {
  actualizarDesbloqueos
}