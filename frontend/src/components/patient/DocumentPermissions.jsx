import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { accessRequestAPI, documentPermissionAPI } from '../../api';
import { Shield, CheckCircle, XCircle, Clock, Lock, AlertTriangle } from 'lucide-react';
import logger from '../../utils/logger';
import Navbar from '../Navbar';
import PatientSidebar from './PatientSidebar';
import PageContainer from '../PageContainer';
import { Card, CardContent, Button, Badge, Modal, EmptyState, Skeleton, useToast } from '../ui';

export default function DocumentPermissions() {
  const { user } = useAuth();
  const toast = useToast();
  const [requests, setRequests] = useState([]);
  const [permissions, setPermissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('requests');
  const [revokeModal, setRevokeModal] = useState(false);
  const [selectedPermission, setSelectedPermission] = useState(null);

  useEffect(() => {
    fetchData();
  }, [user]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [requestsRes, permissionsRes] = await Promise.all([
        accessRequestAPI.getByPatient(),
        documentPermissionAPI.getByPatient(user.id)
      ]);

      setRequests((requestsRes.data && requestsRes.data.data) || []);
      setPermissions(permissionsRes.data || []);
    } catch (err) {
      logger.error('Error loading data:', err);
      toast.error('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId) => {
    try {
      await accessRequestAPI.approve(requestId);
      toast.success('Success', 'Access request approved');
      fetchData();
    } catch (err) {
      logger.error('Error approving request:', err);
      toast.error('Error', 'Failed to approve request');
    }
  };

  const handleReject = async (requestId) => {
    try {
      await accessRequestAPI.reject(requestId);
      toast.success('Success', 'Access request rejected');
      fetchData();
    } catch (err) {
      logger.error('Error rejecting request:', err);
      toast.error('Error', 'Failed to reject request');
    }
  };

  const handleRevoke = async () => {
    if (!selectedPermission) return;
    
    try {
      await documentPermissionAPI.revoke(selectedPermission.id);
      toast.success('Success', 'Permission revoked successfully');
      setRevokeModal(false);
      setSelectedPermission(null);
      fetchData();
    } catch (err) {
      logger.error('Error revoking permission:', err);
      toast.error('Error', 'Failed to revoke permission');
    }
  };

  const getStatusVariant = (status) => {
    const variants = {
      PENDING: 'warning',
      APPROVED: 'success', 
      REJECTED: 'error'
    };
    return variants[status] || 'default';
  };

  const pendingCount = requests.filter(r => r.status === 'PENDING').length;

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <PageContainer>
        <div className="space-y-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-bold text-neutral-900 dark:text-white mb-2">
            Document Permissions
          </h1>
          <p className="text-neutral-600 dark:text-neutral-400">
            Manage who has access to your medical records
          </p>
        </motion.div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-neutral-200 dark:border-neutral-700">
          <button
            onClick={() => setActiveTab('requests')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'requests'
                ? 'text-patient-600 dark:text-patient-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Access Requests
            {pendingCount > 0 && (
              <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-red-600 text-white">
                {pendingCount}
              </span>
            )}
            {activeTab === 'requests' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-patient-600 dark:bg-patient-400" />
            )}
          </button>
          <button
            onClick={() => setActiveTab('permissions')}
            className={`px-6 py-3 font-medium transition-colors relative ${
              activeTab === 'permissions'
                ? 'text-patient-600 dark:text-patient-400'
                : 'text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white'
            }`}
          >
            Active Permissions ({permissions.length})
            {activeTab === 'permissions' && (
              <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-patient-600 dark:bg-patient-400" />
            )}
          </button>
        </div>

        {/* Requests Tab */}
        {activeTab === 'requests' && (
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} variant="premium">
                  <CardContent className="p-6">
                    <Skeleton height="100px" />
                  </CardContent>
                </Card>
              ))
            ) : requests.length > 0 ? (
              requests.map((request) => (
                <motion.div
                  key={request.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="premium" hover>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Shield className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                              {request.doctorName ? `Dr. ${request.doctorName}` : 'Access Request'}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                              {request.reason || 'Requesting access to your medical records'}
                            </p>
                            <div className="flex items-center gap-2 text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                              <Clock className="w-4 h-4" />
                              <span>{new Date(request.createdAt).toLocaleString()}</span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end gap-3">
                          <Badge variant={getStatusVariant(request.status)}>
                            {request.status}
                          </Badge>
                          
                          {request.status === 'PENDING' && (
                            <div className="flex gap-2">
                              <Button
                                variant="success"
                                size="sm"
                                leftIcon={CheckCircle}
                                onClick={() => handleApprove(request.id)}
                              >
                                Approve
                              </Button>
                              <Button
                                variant="danger"
                                size="sm"
                                leftIcon={XCircle}
                                onClick={() => handleReject(request.id)}
                              >
                                Reject
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={Shield}
                title="No access requests"
                description="Doctors who need access to your records will appear here"
              />
            )}
          </div>
        )}

        {/* Permissions Tab */}
        {activeTab === 'permissions' && (
          <div className="space-y-4">
            {loading ? (
              [1, 2, 3].map(i => (
                <Card key={i} variant="premium">
                  <CardContent className="p-6">
                    <Skeleton height="100px" />
                  </CardContent>
                </Card>
              ))
            ) : permissions.length > 0 ? (
              permissions.map((permission) => (
                <motion.div
                  key={permission.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <Card variant="premium" hover>
                    <CardContent className="p-6">
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1">
                          <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center shadow-lg shadow-green-500/20">
                            <Lock className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-lg text-neutral-900 dark:text-white">
                              {permission.doctorName ? `Dr. ${permission.doctorName}` : 'Permission'}
                            </h3>
                            <p className="text-neutral-600 dark:text-neutral-400 mt-1">
                              Has access to your medical records
                            </p>
                            <div className="grid grid-cols-2 gap-4 mt-3 text-sm">
                              <div>
                                <span className="text-neutral-500 dark:text-neutral-400">Granted:</span>
                                <span className="ml-2 text-neutral-900 dark:text-white">
                                  {new Date(permission.grantedAt).toLocaleDateString()}
                                </span>
                              </div>
                              {permission.expiresAt && (
                                <div>
                                  <span className="text-neutral-500 dark:text-neutral-400">Expires:</span>
                                  <span className="ml-2 text-neutral-900 dark:text-white">
                                    {new Date(permission.expiresAt).toLocaleDateString()}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            setSelectedPermission(permission);
                            setRevokeModal(true);
                          }}
                        >
                          Revoke Access
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            ) : (
              <EmptyState
                icon={Lock}
                title="No active permissions"
                description="You haven't granted access to any doctors yet"
              />
            )}
          </div>
        )}

        {/* Revoke Confirmation Modal */}
        <Modal
          isOpen={revokeModal}
          onClose={() => setRevokeModal(false)}
          title="Revoke Access"
          footer={
            <>
              <Button variant="outline" onClick={() => setRevokeModal(false)}>
                Cancel
              </Button>
              <Button variant="danger" onClick={handleRevoke}>
                Revoke Access
              </Button>
            </>
          }
        >
          <div className="flex flex-col items-center text-center p-4">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
              <AlertTriangle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-neutral-900 dark:text-white mb-2">
              Revoke Access Permission?
            </h3>
            <p className="text-neutral-600 dark:text-neutral-400">
              {selectedPermission?.doctorName && `Dr. ${selectedPermission.doctorName}`} will no longer be able to view your medical records.
            </p>
          </div>
        </Modal>
      </div>
        </PageContainer>
    </>
  );
}
