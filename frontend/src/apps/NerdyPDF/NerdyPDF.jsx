const SAMPLE_PDF = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";

const NerdyPDF = () => (
  <div className="h-full flex flex-col bg-gray-100">
    <div className="px-3 py-2 text-xs text-gray-500 border-b border-gray-200">PDF Viewer</div>
    <iframe title="PDF Viewer" src={SAMPLE_PDF} className="flex-1 w-full border-0" />
  </div>
);

export default NerdyPDF;
