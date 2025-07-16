function actualizarEstadoMallaSellada() {
  const botonesAgregar = document.querySelectorAll("button.agregar");
  botonesAgregar.forEach(btn => {
    btn.style.display = mallaSellada ? "none" : "flex";
  });

  const toggleBtn = document.getElementById("btnToggleSellado");
  toggleBtn.textContent = mallaSellada ? "Abrir Malla" : "Sellar Malla";
}

module.exports = {
    actualizarEstadoMallaSellada
}