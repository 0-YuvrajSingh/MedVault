// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';

import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';
import { documentAPI } from '../../api';
import { toast } from '../../utils/toast';
import logger from '../../utils/logger';
import { FileText, CheckCircle, XCircle, AlertTriangle, Eye, Search, Download } from 'lucide-react';
import { formatDateTime } from '../../utils/dateUtils';
// ...existing code...

export default function AdminDocumentVerification() {
  const { user } = useAuth();
  // Only allow ADMINs to access this page
  if (user?.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-surface dark:bg-neutral-900 flex flex-col items-center justify-center">
        <Navbar />
        <AdminSidebar />
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h2>
            <p className="text-neutral-600 dark:text-neutral-300">You do not have permission to view this page.</p>
          </div>
        </main>
      </div>
    );
  }
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDocument, setSelectedDocument] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [documentToAction, setDocumentToAction] = useState(null);
  const [filterType, setFilterType] = useState('all'); // 'all', 'pending', 'verified', 'rejected'

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const res = await documentAPI.getUnverified();
      
      if (res.data.success) {
        setDocuments(res.data.data || []);
      }
    } catch (err) {
      logger.error('Error fetching documents:', err);
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyDocument = async () => {
    if (!documentToAction) return;
    
    try {
      const res = await documentAPI.verify(documentToAction.id);
      if (res.data.success) {
        toast.success('Document verified successfully');
        setShowVerifyModal(false);
        setDocumentToAction(null);
        fetchDocuments();
      }
    } catch (err) {
      logger.error('Error verifying document:', err);
      toast.error(err.response?.data?.message || 'Failed to verify document');
    }
  };

  const handleRejectDocument = async () => {
    if (!documentToAction) return;
    
    try {
      const res = await documentAPI.delete(documentToAction.id);
      if (res.data.success) {
        toast.success('Document rejected successfully');
        setShowRejectModal(false);
        setDocumentToAction(null);
        fetchDocuments();
      }
    } catch (err) {
      logger.error('Error rejecting document:', err);
      toast.error(err.response?.data?.message || 'Failed to reject document');
    }
  };

  const openVerifyModal = (document) => {
    setDocumentToAction(document);
    setShowVerifyModal(true);
  };

  const openRejectModal = (document) => {
    setDocumentToAction(document);
    setShowRejectModal(true);
  };

  const openDetailsModal = (document) => {
    setSelectedDocument(document);
    setShowDetailsModal(true);
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      'MEDICAL_RECORD': 'bg-blue-100 text-blue-800',
      'LAB_REPORT': 'bg-purple-100 text-purple-800',
      'PRESCRIPTION': 'bg-green-100 text-green-800',
      'XRAY': 'bg-orange-100 text-orange-800',
      'OTHER': 'bg-gray-100 text-gray-800'
    };
    return colors[type] || colors.OTHER;
  };

  const getStatusBadge = (status) => {
    const badges = {
      'VERIFIED': { icon: CheckCircle, class: 'bg-green-100 text-green-800', text: 'Verified' },
      'PENDING': { icon: AlertTriangle, class: 'bg-orange-100 text-orange-800', text: 'Pending' },
      'REJECTED': { icon: XCircle, class: 'bg-red-100 text-red-800', text: 'Rejected' }
    };
    const badge = badges[status] || badges.PENDING;
    const Icon = badge.icon;
    return (
      <span className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.class}`}>
        <Icon size={14} />
        {badge.text}
      </span>
    );
  };

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.fileName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.documentType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patientName?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'all') return matchesSearch;
    return matchesSearch && doc.verificationStatus === filterType.toUpperCase();
  });

  if (loading) {
    return (
      <>
        <Navbar />
        <AdminSidebar />
        <div className="min-h-screen bg-surface dark:bg-neutral-900">
          <main className="pl-64 pt-24 p-8 transition-all duration-300">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              </div>
            </div>
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <AdminSidebar />
      <div className="min-h-screen bg-surface dark:bg-neutral-900">
        <main className="pl-64 pt-24 p-8 transition-all duration-300">
          <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <FileText className="text-orange-600" size={36} />
          Document Verification
        </h1>
        <p className="text-gray-600 mt-2">Review and verify pending documents</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Documents</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{documents.length}</p>
            </div>
            <FileText className="text-blue-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Review</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">
                {documents.filter(d => d.verificationStatus === 'PENDING').length}
              </p>
            </div>
            <AlertTriangle className="text-orange-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Verified</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {documents.filter(d => d.verificationStatus === 'VERIFIED').length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Rejected</p>
              <p className="text-3xl font-bold text-red-600 mt-2">
                {documents.filter(d => d.verificationStatus === 'REJECTED').length}
              </p>
            </div>
            <XCircle className="text-red-600" size={40} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b overflow-x-auto">
          {['all', 'pending', 'verified', 'rejected'].map(filter => (
            <button
              key={filter}
              onClick={() => setFilterType(filter)}
              className={`px-6 py-3 font-medium capitalize transition-colors whitespace-nowrap ${
                filterType === filter
                  ? 'text-orange-600 border-b-2 border-orange-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              {filter} ({documents.filter(d => 
                filter === 'all' || d.verificationStatus === filter.toUpperCase()
              ).length})
            </button>
          ))}
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by filename, type, or patient name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Documents Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Document</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Uploaded</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDocuments.length > 0 ? (
                filteredDocuments.map(document => (
                  <tr key={document.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <FileText className="text-blue-600" size={20} />
                        <div>
                          <p className="font-semibold text-gray-900">{document.fileName}</p>
                          <p className="text-xs text-gray-500">{document.fileSize || 'N/A'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{document.patientName || 'Unknown'}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDocumentTypeColor(document.documentType)}`}>
                        {document.documentType?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">
                        {document.uploadedAt ? formatDateTime(document.uploadedAt) : 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(document.verificationStatus || 'PENDING')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailsModal(document)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {document.verificationStatus === 'PENDING' && (
                          <>
                            <button
                              onClick={() => openVerifyModal(document)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verify Document"
                            >
                              <CheckCircle size={18} />
                            </button>
                            <button
                              onClick={() => openRejectModal(document)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Reject Document"
                            >
                              <XCircle size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center">
                    <FileText className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No documents found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailsModal && selectedDocument && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Document Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">File Name</label>
                <p className="text-lg text-gray-900">{selectedDocument.fileName}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Document Type</label>
                <p className="text-lg text-gray-900">{selectedDocument.documentType?.replace('_', ' ')}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Patient Name</label>
                <p className="text-lg text-gray-900">{selectedDocument.patientName || 'Unknown'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Uploaded Date</label>
                <p className="text-lg text-gray-900">
                  {selectedDocument.uploadedAt ? formatDateTime(selectedDocument.uploadedAt) : 'N/A'}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Description</label>
                <p className="text-lg text-gray-900">{selectedDocument.description || 'No description provided'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Verification Status</label>
                <div className="mt-2">
                  {getStatusBadge(selectedDocument.verificationStatus || 'PENDING')}
                </div>
              </div>
              {selectedDocument.filePath && (
                <div>
                  <label className="text-sm font-medium text-gray-600">File Path</label>
                  <p className="text-sm text-gray-900 break-all">{selectedDocument.filePath}</p>
                </div>
              )}
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-between">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
              {selectedDocument.verificationStatus === 'PENDING' && (
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openRejectModal(selectedDocument);
                    }}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => {
                      setShowDetailsModal(false);
                      openVerifyModal(selectedDocument);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Verify
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Verify Confirmation Modal */}
      {showVerifyModal && documentToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-green-100 rounded-full mb-4">
                <CheckCircle className="text-green-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Verify Document</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to verify <strong>{documentToAction.fileName}</strong>?
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowVerifyModal(false);
                    setDocumentToAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyDocument}
                  className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Verify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reject Confirmation Modal */}
      {showRejectModal && documentToAction && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <XCircle className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Reject Document</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to reject and delete <strong>{documentToAction.fileName}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowRejectModal(false);
                    setDocumentToAction(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleRejectDocument}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </main>
    </div>
    </>
  );
}
