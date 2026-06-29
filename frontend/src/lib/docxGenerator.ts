import Docxtemplater from 'docxtemplater';
import PizZip from 'pizzip';
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateDocx(data: any, fileName: string) {
  try {
    // 1. Fetch the template from the public folder
    const response = await fetch('/templates/resume_template.docx');
    if (!response.ok) {
      throw new Error('Could not fetch template');
    }
    const arrayBuffer = await response.arrayBuffer();

    // 2. Load the zip file using PizZip
    const zip = new PizZip(arrayBuffer);

    // 3. Initialize docxtemplater
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // 4. Set the data
    doc.render(data);

    // 5. Generate the blob
    const blob = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    });

    // 6. Download the file
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 100);
  } catch (error) {
    console.error('Error generating docx:', error);
    throw error;
  }
}
