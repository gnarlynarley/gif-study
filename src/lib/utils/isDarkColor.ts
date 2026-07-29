function parse(hex: string) {
  var c = hex.substring(1); // strip #
  var rgb = parseInt(c, 16); // convert rrggbb to decimal
  var r = (rgb >> 16) & 0xff; // extract red
  var g = (rgb >> 8) & 0xff; // extract green
  var b = (rgb >> 0) & 0xff; // extract blue

  return { r, g, b };
}

export default function isDarkColor(hex: string) {
  const { r, g, b } = parse(hex);
  var luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;

  return luma < 50;
}
