import { createRoot } from 'react-dom/client';
import PrintableReceipt from './PrintableReceipt';

export const printReceipt = (data) => {
  const printWindow = window.open('', '_blank', 'width=800,height=600');
  printWindow.document.write(`
    <html>
      <head>
        <title>Imprimir recibo</title>
        <link href="/tailwind.css" rel="stylesheet">
      </head>
      <body>
        <div id="print-root"></div>
      </body>
    </html>
  `);
  printWindow.document.close();

  printWindow.onload = () => {
    const rootElement = printWindow.document.getElementById('print-root');
    const root = createRoot(rootElement);
    root.render(<PrintableReceipt data={data} />);

    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
    }, 500); // Espera a que se renderice bien antes de imprimir
  };
};
