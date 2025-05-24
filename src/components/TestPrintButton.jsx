import React, { useRef, useState } from 'react'; // Import useState
import { useReactToPrint } from 'react-to-print';

const PrintableContent = React.forwardRef((props, ref) => (
  <div
    ref={ref}
    // Remove print:block from here as it will be handled by conditional rendering
    className="w-[210mm] h-[297mm] bg-white text-black p-6 text-sm font-sans"
  >
    <div className="w-full h-[148mm] border-b border-black p-6 relative">
      <img
        src="/TMBC.png"
        alt="Marca de agua"
        className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 opacity-10 w-1/2 z-0"
      />

      <div className="relative z-10">
        <p className="text-center font-bold underline my-2">COMPROBANTE</p>
        <p>Cubierta: #101</p>
        <p>Marca: Michelin</p>
        <p>Vehículo: Movil 02</p>
        <p>Patente: ABC-123</p>
        <p>Acción: Asignación</p>
      </div>
    </div>
  </div>
));

// ---

const TestPrintButton = () => {
  const printRef = useRef();
  // State to control when the printable content is in the DOM
  const [showPrintableContent, setShowPrintableContent] = useState(false);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    documentTitle: "Comprobante",
    onBeforeGetContent: () => {
      // Before getting content, ensure the component is rendered
      setShowPrintableContent(true);
      return Promise.resolve(); // Return a promise to indicate readiness
    },
    onAfterPrint: () => {
      // After printing, remove the component from the DOM
      setShowPrintableContent(false);
    },
    removeAfterPrint: true, // Keep this if you want it removed from the print preview history
  });

  return (
    <>
      <button
        onClick={handlePrint}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Imprimir prueba
      </button>

      {/* Conditionally render the printable content */}
      {showPrintableContent && (
        <div className="fixed top-0 left-0 w-full h-full opacity-0 pointer-events-none z-[9999]">
          <PrintableContent ref={printRef} />
        </div>
      )}
    </>
  );
};

export default TestPrintButton;
