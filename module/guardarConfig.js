async function guardarConfig() {
  await ipcRenderer.invoke('guardar-config', JSON.stringify(carrera));
}

module.exports = {
  guardarConfig
}