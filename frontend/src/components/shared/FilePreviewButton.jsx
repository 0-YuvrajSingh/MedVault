import React from 'react';
import { Eye, Download, FileText, Image, File } from 'lucide-react';

export default function FilePreviewButton({ file, fileUrl, fileName, fileType }) {
  const [showPreview, setShowPreview] = React.useState(false);

  const getFileIcon = () => {
    if (fileType?.includes('image')) return <Image className="size-5" />;
    if (fileType?.includes('pdf')) return <FileText className="size-5" />;
    return <File className="size-5" />;
  };

  const handlePreview = () => {
    if (fileType?.includes('image') || fileType?.includes('pdf')) {
      setShowPreview(true);
    } else {
      // For other file types, trigger download
      handleDownload();
    }
  };

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = fileUrl;
    link.download = fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={handlePreview}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
        >
          <Eye className="size-4" />
          Preview
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-4 py-2 bg-slate-200 text-slate-700 rounded-lg hover:bg-slate-300 transition-colors text-sm font-medium"
        >
          <Download className="size-4" />
          Download
        </button>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileIcon()}
                <h3 className="font-semibold text-slate-900">{fileName || 'File Preview'}</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleDownload}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  title="Download"
                >
                  <Download className="size-5 text-slate-600" />
                </button>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <svg className="size-5 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-4 overflow-auto max-h-[calc(90vh-80px)]">
              {fileType?.includes('image') ? (
                <img src={fileUrl} alt={fileName} className="w-full h-auto rounded-lg" />
              ) : fileType?.includes('pdf') ? (
                <iframe
                  src={fileUrl}
                  className="w-full h-[70vh] rounded-lg border border-slate-200"
                  title={fileName}
                  sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
                />
              ) : (
                <div className="text-center py-12 text-slate-500">
                  <File className="size-16 mx-auto mb-4 opacity-30" />
                  <p>Preview not available for this file type</p>
                  <button
                    onClick={handleDownload}
                    className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Download File
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
