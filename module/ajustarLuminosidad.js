function ajustarLuminosidad(hex, cantidad) {
  let c = hex.replace(/^#/, '');
  if (c.length === 3) {
    c = c.split('').map(ch => ch + ch).join('');
  }

  const num = parseInt(c, 16);
  let r = (num >> 16) + cantidad;
  let g = ((num >> 8) & 0x00FF) + cantidad;
  let b = (num & 0x0000FF) + cantidad;

  r = Math.min(255, Math.max(0, r));
  g = Math.min(255, Math.max(0, g));
  b = Math.min(255, Math.max(0, b));

  return `#${(r << 16 | g << 8 | b).toString(16).padStart(6, '0')}`;
}

module.exports = {
  ajustarLuminosidad
}