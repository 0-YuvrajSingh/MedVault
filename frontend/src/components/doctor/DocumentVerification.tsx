// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { documentAPI } from '../../api';
import { toast } from '../../utils/toast';
import { formatDate } from '../../utils/dateUtils';
import { FileText, Calendar, CheckCircle, XCircle, Eye } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';

export default function DocumentVerification() {
  const { user } = useAuth();
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('ALL');

  useEffect(() => {
    fetchDocuments();
  }, [user]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const response = await documentAPI.getByDoctor(user.id);
      if (response.data.success) {
        const docs = response.data.data || [];
        docs.sort((a, b) => new Date(b.uploadDate) - new Date(a.uploadDate));
        setDocuments(docs);
      }
    } catch (err) {
      toast.error('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (documentId) => {
    if (!window.confirm('Verify this document?')) return;
    
    try {
      const response = await documentAPI.verify(documentId);
      if (response.data.success) {
        toast.success('Document verified successfully');
        fetchDocuments();
      }
    } catch (err) {
      toast.error('Failed to verify document');
    }
  };

  const getFilteredDocuments = () => {
    if (filter === 'VERIFIED') {
      return documents.filter(doc => doc.verified);
    } else if (filter === 'UNVERIFIED') {
      return documents.filter(doc => !doc.verified);
    }
    return documents;
  };

  const getDocumentTypeColor = (type) => {
    const colors = {
      LAB_REPORT: 'bg-purple-100 text-purple-800',
      PRESCRIPTION: 'bg-green-100 text-green-800',
      MEDICAL_CERTIFICATE: 'bg-blue-100 text-blue-800',
      IMAGING: 'bg-orange-100 text-orange-800',
      OTHER: 'bg-gray-100 text-gray-800'
    };
    return colors[type] || 'bg-gray-100 text-gray-800';
  };

  const filteredDocs = getFilteredDocuments();


  if (loading) {
    return (
      <div className="min-h-screen bg-surface dark:bg-neutral-900">
        <Navbar />
        <DoctorSidebar />
        <main className="pl-64 pt-24 p-8 flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface dark:bg-neutral-900">
      <Navbar />
      <DoctorSidebar />
      <main className="pl-64 pt-24 p-8 transition-all duration-300">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Document Verification</h1>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Total Documents</p>
                  <p className="text-3xl font-bold text-blue-600">{documents.length}</p>
                </div>
                <FileText className="text-blue-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Pending Verification</p>
                  <p className="text-3xl font-bold text-yellow-600">
                    {documents.filter(d => !d.verified).length}
                  </p>
                </div>
                <XCircle className="text-yellow-600" size={40} />
              </div>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm">Verified</p>
                  <p className="text-3xl font-bold text-green-600">
                    {documents.filter(d => d.verified).length}
                  </p>
                </div>
                <CheckCircle className="text-green-600" size={40} />
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="bg-white rounded-lg shadow mb-6">
            <div className="flex border-b">
              <button
                onClick={() => setFilter('ALL')}
                className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                  filter === 'ALL' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                All Documents ({documents.length})
              </button>
              <button
                onClick={() => setFilter('UNVERIFIED')}
                className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                  filter === 'UNVERIFIED' 
                    ? 'text-yellow-600 border-b-2 border-yellow-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Unverified ({documents.filter(d => !d.verified).length})
              </button>
              <button
                onClick={() => setFilter('VERIFIED')}
                className={`flex-1 px-6 py-3 font-semibold transition-colors ${
                  filter === 'VERIFIED' 
                    ? 'text-green-600 border-b-2 border-green-600' 
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Verified ({documents.filter(d => d.verified).length})
              </button>
            </div>
          </div>

          {/* Documents List */}
          <div className="space-y-4">
            {filteredDocs.map(document => (
              <div key={document.id} className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <FileText className="text-blue-600" size={24} />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg text-gray-800">{document.fileName || 'Document'}</h3>
                        <p className="text-sm text-gray-600">Patient: {document.patientName}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Document Type</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${getDocumentTypeColor(document.documentType)}`}>
                          {document.documentType?.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Upload Date</p>
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-gray-500" />
                          <span className="text-sm text-gray-800">{formatDate(document.uploadDate)}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Status</p>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                          document.verified 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {document.verified ? 'Verified' : 'Pending'}
                        </span>
                      </div>
                    </div>

                    {document.description && (
                      <div className="bg-gray-50 rounded-lg p-3 mb-3">
                        <p className="text-sm font-medium text-gray-700 mb-1">Description:</p>
                        <p className="text-gray-600">{document.description}</p>
                      </div>
                    )}

                    {document.filePath && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Eye size={16} />
                        <span className="font-mono text-xs">{document.filePath}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-2 ml-4">
                    {!document.verified && (
                      <button
                        onClick={() => handleVerify(document.id)}
                        className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
                      >
                        <CheckCircle size={18} />
                        Verify
                      </button>
                    )}
                    {document.verified && (
                      <div className="flex items-center gap-2 text-green-600 font-semibold">
                        <CheckCircle size={18} />
                        Verified
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {filteredDocs.length === 0 && (
              <div className="text-center py-16 bg-white rounded-lg shadow">
                <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                <h3 className="text-xl font-semibold text-gray-700 mb-2">No Documents Found</h3>
                <p className="text-gray-500">
                  {filter === 'UNVERIFIED' 
                    ? 'All documents have been verified' 
                    : filter === 'VERIFIED'
                    ? 'No verified documents yet'
                    : 'No documents available for verification'}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
