function lanzarConfirmacion(mensaje) {
  return new Promise((resolve) => {
    const confirmElem = document.getElementById("custom-confirm");
    const mensajeElem = document.getElementById("custom-confirm-message");
    const btnYes = document.getElementById("confirm-yes");
    const btnNo = document.getElementById("confirm-no");

    mensajeElem.textContent = mensaje;
    confirmElem.style.display = "flex";

    btnYes.onclick = () => {
      confirmElem.style.display = "none";
      resolve(true);
    };

    btnNo.onclick = () => {
      confirmElem.style.display = "none";
      resolve(false);
    };
  });
}

module.exports = {
  lanzarConfirmacion
};
