function lanzarAlerta(message) {
  const alertBox = document.getElementById("custom-alert");
  const messageElem = document.getElementById("custom-alert-message");
  const okButton = document.getElementById("custom-alert-ok");

  messageElem.textContent = message;
  alertBox.style.display = "flex";

  okButton.onclick = () => cerrarAlerta();
}

function cerrarAlerta() {
  const alertBox = document.getElementById("custom-alert");
  alertBox.style.display = "none";
}

module.exports = {
  lanzarAlerta,
  cerrarAlerta
};
