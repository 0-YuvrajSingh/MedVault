import { AlertCircle, File, Upload, X } from 'lucide-react';
import { useState } from 'react';
import { fileAPI } from '../api';
import { fileTypeCategories } from '../utils/config';
import { handleError } from '../utils/errorHandler';
import { formatFileSize, validateFile } from '../utils/fileValidation';
import { sanitizeText } from '../utils/sanitization';
import { toast } from '../utils/toast';

export default function FileUploadForm({ onUploadSuccess }) {
  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('GENERAL');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [validationErrors, setValidationErrors] = useState([]);

  const getCategoryKey = (categoryValue) => {
    const categoryMap = {
      'LAB_REPORT': 'LAB_REPORT',
      'PRESCRIPTION': 'PRESCRIPTION',
      'IMAGING': 'MEDICAL_DOCUMENT',
      'MEDICAL_HISTORY': 'MEDICAL_DOCUMENT',
      'GENERAL': 'MEDICAL_DOCUMENT',
    };
    return categoryMap[categoryValue] || 'MEDICAL_DOCUMENT';
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files?.[0] || null;
    setValidationErrors([]);
    setFile(selectedFile);
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error('Please select a file');
      return;
    }

    if (!title.trim()) {
      toast.error('Please provide a document title');
      return;
    }

    // Re-validate file before upload
    const categoryKey = getCategoryKey(category);
    const validation = await validateFile(file, { category: categoryKey });

    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      toast.error('File validation failed', validation.getErrorMessage());
      return;
    }

    try {
      setUploading(true);
      setProgress(0);
      setValidationErrors([]);

      // Sanitize user inputs
      const sanitizedTitle = sanitizeText(title);
      const sanitizedDescription = sanitizeText(description);

      // Only send file and description, backend uses JWT for user and always MEDICAL_DOCUMENT
      const fullDescription = sanitizedTitle + (sanitizedDescription ? ` - ${sanitizedDescription}` : '');

      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const response = await fileAPI.uploadMedicalDocument(file, fullDescription);

      clearInterval(progressInterval);
      setProgress(100);

      if (response.data.success) {
        toast.success('File uploaded successfully!');
        setFile(null);
        setTitle('');
        setDescription('');
        setCategory('GENERAL');
        setProgress(0);

        // Reset file input
        const fileInput = document.getElementById('file-upload');
        if (fileInput) fileInput.value = '';

        if (onUploadSuccess) {
          onUploadSuccess(response.data.data);
        }
      } else {
        toast.error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      handleError(err, { error: (title, message) => toast.error(message) }, 'Upload failed. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
        <Upload className="mr-2 text-blue-600" size={24} />
        Upload Medical Document
      </h2>

      <form onSubmit={handleUpload} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Document Title *
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Blood Test Report"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Additional details about the document..."
            rows={3}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Category *
          </label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="GENERAL">General</option>
            <option value="LAB_REPORT">Lab Report</option>
            <option value="PRESCRIPTION">Prescription</option>
            <option value="IMAGING">Imaging</option>
            <option value="MEDICAL_HISTORY">Medical History</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select File * (Max {formatFileSize(fileTypeCategories[getCategoryKey(category)]?.maxSize || 10485760)})
          </label>

          {validationErrors.length > 0 && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-start">
                <AlertCircle className="text-red-600 mr-2 flex-shrink-0 mt-0.5" size={16} />
                <div className="text-sm text-red-700">
                  <p className="font-medium mb-1">Validation Errors:</p>
                  <ul className="list-disc list-inside space-y-1">
                    {validationErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-500 transition-colors">
            <input
              type="file"
              onChange={handleFileChange}
              accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="mx-auto text-gray-400 mb-2" size={40} />
              <p className="text-gray-600">
                {file ? file.name : 'Click to upload or drag and drop'}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                PDF, JPG, PNG, DOC, DOCX
              </p>
            </label>
            {file && (
              <div className="mt-4">
                <div className="flex items-center justify-center space-x-2">
                  <File size={20} className="text-blue-600" />
                  <span className="text-sm text-gray-700">{file.name}</span>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null);
                      setValidationErrors([]);
                      document.getElementById('file-upload').value = '';
                    }}
                    className="text-red-500 hover:text-red-700"
                  >
                    <X size={16} />
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                  Size: {formatFileSize(file.size)}
                </p>
              </div>
            )}
          </div>
        </div>

        {uploading && (
          <div>
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={uploading || !file || !title.trim()}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
        >
          <Upload size={20} />
          <span>{uploading ? 'Uploading...' : 'Upload Document'}</span>
        </button>
      </form>
    </div>
  );
}
