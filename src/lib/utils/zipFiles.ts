import { ZipWriter, BlobWriter, BlobReader } from '@zip.js/zip.js';

export default async function zipFiles(
  zipFileName: string,
  files: File[],
): Promise<File> {
  const zipWriter = new ZipWriter(new BlobWriter('application/zip'));

  for (const file of files) {
    await zipWriter.add(file.name, new BlobReader(file));
  }

  const blob = await zipWriter.close();
  return new File([blob], zipFileName, { type: 'application/zip' });
}
