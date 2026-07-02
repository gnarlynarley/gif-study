export default function downloadFile(file: File) {
  var link = document.createElement('a');
  link.download = file.name;
  const uri = URL.createObjectURL(file);
  link.href = uri;
  link.click();
  URL.revokeObjectURL(uri);
}
