/**
 * Utility to export HTML content to a Microsoft Word (.doc) file
 * using a standardized HTML-to-Word XML wrapper.
 */
export function exportToWord(html: string, filename: string = "report.doc") {
  if (typeof window === "undefined") return;

  // Word-compatible XML/HTML headers
  const header = `
    <html xmlns:o='urn:schemas-microsoft-com:office:office' 
          xmlns:w='urn:schemas-microsoft-com:office:word' 
          xmlns='http://www.w3.org/TR/REC-html40'>
    <head>
      <meta charset='utf-8'>
      <title>Exported Report</title>
      <style>
        body { 
          font-family: 'Malgun Gothic', 'Inter', 'Apple SD Gothic Neo', sans-serif; 
          line-height: 1.6;
          color: #000000;
        }
        h1 { font-size: 16pt; font-weight: bold; margin-bottom: 24pt; text-align: center; }
        h2 { font-size: 13pt; font-weight: bold; margin-top: 24pt; margin-bottom: 12pt; color: #000000; }
        h3 { font-size: 13pt; font-weight: bold; margin-top: 18pt; margin-bottom: 9pt; color: #000000; }
        p { font-size: 10pt; margin-bottom: 10pt; color: #000000; text-align: justify; }
        span { font-size: 10pt; }
        table { border-collapse: collapse; width: 100%; margin: 20pt 0; }
        th, td { border: 1px solid #000000; padding: 8pt; text-align: left; }
        th { background-color: #f3f4f6; font-weight: bold; }
        hr { border: none; border-top: 1px solid #000000; margin: 24pt 0; }
        .metadata { color: #000000; font-size: 10pt; margin-bottom: 6pt; }
      </style>
    </head>
    <body>
  `;
  
  const footer = "</body></html>";
  
  // Combine all parts
  const source = header + html + footer;
  
  // Create a Blob from the combined source string
  const blob = new Blob(['\ufeff', source], {
    type: 'application/msword'
  });
  
  // Trigger download
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename.endsWith(".doc") ? filename : `${filename}.doc`;
  
  document.body.appendChild(link);
  link.click();
  
  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
