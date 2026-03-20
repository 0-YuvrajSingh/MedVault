import { motion } from 'framer-motion';
import { AlertCircle, CheckCircle, Download, Eye, FileText, LayoutGrid, List, Trash2, Upload } from 'lucide-react';
import { useEffect, useState } from 'react';
import { fileAPI, medicalRecordAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import logger from '../../utils/logger';
import Navbar from '../Navbar';
import { Badge, Button, Card, CardContent, EmptyState, Input, Modal, ProgressBar, Select } from '../ui';
import Skeleton, { AppointmentListSkeleton } from '../ui/Skeleton';
import { useToast } from '../ui/Toast';
import PatientSidebar from './PatientSidebar';

export default function MedicalRecords() {
  const { user } = useAuth();
  const toast = useToast();
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  // Upload State
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadFile, setUploadFile] = useState(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadType, setUploadType] = useState('');
  const [uploadDescription, setUploadDescription] = useState('');

  // Preview State
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);

  // Delete State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [recordToDelete, setRecordToDelete] = useState(null);

  useEffect(() => {
    fetchRecords();
  }, [user]);

  const fetchRecords = async () => {
    try {
      setLoading(true);
      const response = await medicalRecordAPI.getPatientRecords();
      if (response.data && response.data.success && Array.isArray(response.data.data)) {
        const data = response.data.data;
        setRecords(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } else {
        setRecords([]);
      }
    } catch (err) {
      logger.error('Error fetching medical records:', err);
      toast.error('Error', 'Failed to load medical records');
      setRecords([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!recordToDelete) return;

    try {
      await medicalRecordAPI.delete(recordToDelete.id);
      toast.success('Success', 'Record deleted successfully');
      setShowDeleteModal(false);
      setRecordToDelete(null);
      fetchRecords();
    } catch (err) {
      logger.error('Error deleting record:', err);
      toast.error('Error', 'Failed to delete record');
    }
  };

  const handleDownload = async (recordId, fileName) => {
    try {
      const response = await fileAPI.download(recordId);
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${fileName || 'medical-record'}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success('Success', `Downloaded ${fileName || 'file'}`);
    } catch (err) {
      logger.error('Error downloading record:', err);
      toast.error('Error', 'Failed to download record');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        toast.error('Error', 'File size must be less than 10MB');
        return;
      }
      setUploadFile(file);
    }
  };

  const handleUpload = async () => {
    if (!uploadFile || !uploadType) {
      toast.error('Error', 'Please select a file and document type');
      return;
    }

    try {
      setUploading(true);
      setUploadProgress(0);

      // Simulate progress (in real scenario, use axios config for upload progress)
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => Math.min(prev + 10, 90));
      }, 200);

      await fileAPI.uploadMedicalDocument(
        uploadFile,
        uploadDescription
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      toast.success('Success', 'Document uploaded successfully');

      // Reset form
      setUploadFile(null);
      setUploadType('');
      setUploadDescription('');
      setShowUploadModal(false);
      setUploadProgress(0);

      fetchRecords();
    } catch (err) {
      logger.error('Error uploading document:', err);
      toast.error('Error', err.response?.data?.message || 'Failed to upload document');
    } finally {
      setUploading(false);
    }
  };

  const documentTypes = [
    { value: 'LAB_REPORT', label: 'Lab Report' },
    { value: 'PRESCRIPTION', label: 'Prescription' },
    { value: 'XRAY', label: 'X-Ray' },
    { value: 'MRI', label: 'MRI Scan' },
    { value: 'CT_SCAN', label: 'CT Scan' },
    { value: 'DISCHARGE_SUMMARY', label: 'Discharge Summary' },
    { value: 'OTHER', label: 'Other' },
  ];

  const getTypeColor = (type) => {
    const colors = {
      LAB_REPORT: 'info',
      PRESCRIPTION: 'success',
      XRAY: 'warning',
      MRI: 'error',
      CT_SCAN: 'warning',
      DISCHARGE_SUMMARY: 'info',
      OTHER: 'default',
    };
    return colors[type] || 'default';
  };

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50 dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto p-6 space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
                  Medical Records
                </h1>
                <p className="text-neutral-600 dark:text-neutral-400">
                  Manage your medical documents and records
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* View Toggle */}
                <div className="flex items-center gap-2 bg-white dark:bg-neutral-800 p-1 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'grid'
                        ? 'bg-patient-50 dark:bg-patient-900/20 text-patient-600 dark:text-patient-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <LayoutGrid className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-lg transition-colors ${
                      viewMode === 'list'
                        ? 'bg-patient-50 dark:bg-patient-900/20 text-patient-600 dark:text-patient-400'
                        : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
                    }`}
                  >
                    <List className="w-5 h-5" />
                  </button>
                </div>

                <Button
                  variant="primary"
                  leftIcon={Upload}
                  onClick={() => setShowUploadModal(true)}
                >
                  Upload Document
                </Button>
              </div>
            </div>
          </motion.div>

          {/* Records Display */}
          {loading ? (
            viewMode === 'grid' ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="bg-white dark:bg-neutral-800 rounded-2xl p-6 space-y-4 shadow-sm">
                    <div className="flex items-center space-x-3">
                      <Skeleton variant="circular" width={48} height={48} />
                      <div className="flex-1 space-y-2">
                        <Skeleton variant="title" width="60%" />
                        <Skeleton variant="text" width="40%" />
                      </div>
                    </div>
                    <Skeleton variant="text" count={3} />
                  </div>
                ))}
              </div>
            ) : (
              <AppointmentListSkeleton count={6} />
            )
          ) : records.length > 0 ? (
            <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
              {records.map((record) => (
                <motion.div
                  key={record.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <Card variant="premium" hover>
                    <CardContent className="p-6">
                      {viewMode === 'grid' ? (
                        <>
                          <div className="flex items-start justify-between mb-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <button
                              onClick={() => {
                                setRecordToDelete(record);
                                setShowDeleteModal(true);
                              }}
                              className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>

                          <h3 className="font-bold text-lg text-neutral-900 dark:text-white mb-1">
                            {record.diagnosis || record.documentType || 'Medical Record'}
                          </h3>

                          <div className="flex items-center gap-2 mb-3">
                            <Badge variant={getTypeColor(record.category || record.documentType)}>
                              {record.category || record.documentType || 'General'}
                            </Badge>
                            <span className="text-xs text-neutral-500 dark:text-neutral-400">
                              {new Date(record.createdAt).toLocaleDateString()}
                            </span>
                          </div>

                          {record.prescription && (
                            <p className="text-sm text-neutral-600 dark:text-neutral-400 mb-4 line-clamp-2">
                              {record.prescription}
                            </p>
                          )}

                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              fullWidth
                              leftIcon={Eye}
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowPreviewModal(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              fullWidth
                              leftIcon={Download}
                              onClick={() => handleDownload(record.id, record.diagnosis)}
                            >
                              Download
                            </Button>
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1">
                            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/20">
                              <FileText className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                              <h3 className="font-bold text-neutral-900 dark:text-white">
                                {record.diagnosis || record.documentType || 'Medical Record'}
                              </h3>
                              <div className="flex items-center gap-3 mt-1">
                                <Badge variant={getTypeColor(record.category || record.documentType)} size="sm">
                                  {record.category || record.documentType || 'General'}
                                </Badge>
                                <span className="text-xs text-neutral-500 dark:text-neutral-400">
                                  {new Date(record.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Eye}
                              onClick={() => {
                                setSelectedRecord(record);
                                setShowPreviewModal(true);
                              }}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              leftIcon={Download}
                              onClick={() => handleDownload(record.id, record.diagnosis)}
                            >
                              Download
                            </Button>
                            <button
                              onClick={() => {
                                setRecordToDelete(record);
                                setShowDeleteModal(true);
                              }}
                              className="text-error hover:bg-error/10 p-2 rounded-lg transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <EmptyState
              icon={FileText}
              title="No medical records yet"
              description="Upload your first medical document to get started"
              actionLabel="Upload Document"
              onAction={() => setShowUploadModal(true)}
            />
          )}

          {/* Upload Modal */}
          <Modal
            isOpen={showUploadModal}
            onClose={() => !uploading && setShowUploadModal(false)}
            title="Upload Medical Document"
            size="md"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowUploadModal(false)} disabled={uploading}>
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  loading={uploading}
                  onClick={handleUpload}
                  disabled={!uploadFile || !uploadType}
                >
                  Upload
                </Button>
              </>
            }
          >
            <div className="space-y-6">
              {/* File Upload Area */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Select File
                </label>
                <div className={`
                  border-2 border-dashed rounded-2xl p-8 text-center transition-colors
                  ${uploadFile
                    ? 'border-patient-500 bg-patient-50 dark:bg-patient-900/20'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-patient-400'
                  }
                `}>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={handleFileSelect}
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    disabled={uploading}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer">
                    {uploadFile ? (
                      <div className="flex flex-col items-center gap-2">
                        <CheckCircle className="w-12 h-12 text-patient-500" />
                        <p className="font-semibold text-neutral-900 dark:text-white">{uploadFile.name}</p>
                        <p className="text-sm text-neutral-500">
                          {(uploadFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Upload className="w-12 h-12 text-neutral-400" />
                        <p className="font-semibold text-neutral-700 dark:text-neutral-300">
                          Click to upload or drag and drop
                        </p>
                        <p className="text-sm text-neutral-500">
                          PDF, JPG, PNG or DOC (max 10MB)
                        </p>
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Document Type */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Document Type *
                </label>
                <Select
                  options={[
                    { value: '', label: 'Select document type...' },
                    ...documentTypes
                  ]}
                  value={uploadType}
                  onChange={(e) => setUploadType(e.target.value)}
                  disabled={uploading}
                  fullWidth
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-2">
                  Description (Optional)
                </label>
                <Input
                  placeholder="Add a brief description..."
                  value={uploadDescription}
                  onChange={(e) => setUploadDescription(e.target.value)}
                  disabled={uploading}
                  fullWidth
                />
              </div>

              {/* Upload Progress */}
              {uploading && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-neutral-600 dark:text-neutral-400">Uploading...</span>
                    <span className="font-semibold text-neutral-900 dark:text-white">{uploadProgress}%</span>
                  </div>
                  <ProgressBar value={uploadProgress} variant="primary" />
                </div>
              )}
            </div>
          </Modal>

          {/* Preview Modal */}
          <Modal
            isOpen={showPreviewModal}
            onClose={() => setShowPreviewModal(false)}
            title="Document Details"
            size="lg"
          >
            {selectedRecord && (
              <div className="space-y-6">
                <div className="flex items-center gap-4 p-4 bg-neutral-50 dark:bg-neutral-800 rounded-2xl">
                  <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center">
                    <FileText className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <h3 className="font-bold text-xl text-neutral-900 dark:text-white">
                      {selectedRecord.diagnosis || selectedRecord.documentType || 'Medical Record'}
                    </h3>
                    <p className="text-neutral-600 dark:text-neutral-400">
                      {selectedRecord.category || selectedRecord.documentType || 'General'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Created</p>
                    <p className="font-semibold text-neutral-900 dark:text-white">
                      {new Date(selectedRecord.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-4 border border-neutral-200 dark:border-neutral-700 rounded-xl">
                    <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-1">Type</p>
                    <Badge variant={getTypeColor(selectedRecord.category || selectedRecord.documentType)}>
                      {selectedRecord.category || selectedRecord.documentType || 'General'}
                    </Badge>
                  </div>
                </div>

                {selectedRecord.prescription && (
                  <div>
                    <h4 className="font-semibold text-neutral-900 dark:text-white mb-2">Details</h4>
                    <p className="text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-800 p-4 rounded-xl whitespace-pre-wrap">
                      {selectedRecord.prescription}
                    </p>
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    variant="primary"
                    fullWidth
                    leftIcon={Download}
                    onClick={() => handleDownload(selectedRecord.id, selectedRecord.diagnosis)}
                  >
                    Download
                  </Button>
                </div>
              </div>
            )}
          </Modal>

          {/* Delete Confirmation Modal */}
          <Modal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            title="Delete Record"
            footer={
              <>
                <Button variant="outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button variant="danger" onClick={handleDelete}>
                  Delete
                </Button>
              </>
            }
          >
            <div className="flex flex-col items-center text-center p-4">
              <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                <AlertCircle className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
                Delete this record?
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                This action cannot be undone. The record will be permanently removed from your medical history.
              </p>
            </div>
          </Modal>
        </div>
      </div>
    </>
  );
}
