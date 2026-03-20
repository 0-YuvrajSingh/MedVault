import { AlertTriangle, CheckCircle, Eye, Search, Trash2, UserCheck, XCircle } from 'lucide-react';
import { useEffect, useState } from 'react';
import { adminAPI, doctorAPI } from '../../api';
import { useAuth } from '../../context/AuthContext';
import logger from '../../utils/logger';
import { toast } from '../../utils/toast';
import Navbar from '../Navbar';
import { StatCardSkeleton, TableSkeleton } from '../ui/Skeleton';
import AdminSidebar from './AdminSidebar';


export default function ManageDoctors() {
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
    const fetchDoctorsAndUsers = async () => {
      try {
        setLoading(true);
        const [allDoctorsRes, unverifiedRes, allUsersRes] = await Promise.all([
          doctorAPI.getAll(),
          adminAPI.getUnverifiedDoctors(),
          adminAPI.getUsers()
        ]);

        if (allDoctorsRes.data.success) {
          setDoctors(allDoctorsRes.data.data || []);
        }

        if (unverifiedRes.data.success) {
          setUnverifiedDoctors(unverifiedRes.data.data || []);
        }

        if (allUsersRes.data.success) {
          setDoctorUsers((allUsersRes.data.data || []).filter(u => u.role === 'DOCTOR'));
        }
      } catch (err) {
        logger.error('Error fetching doctors/users:', err);
        toast.error('Failed to load doctors/users');
      } finally {
        setLoading(false);
      }
    };
  // Removed Create Profile modal state
  // (removed duplicate)
  const [doctors, setDoctors] = useState([]);
  const [unverifiedDoctors, setUnverifiedDoctors] = useState([]);
  const [doctorUsers, setDoctorUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [doctorToDelete, setDoctorToDelete] = useState(null);
  const [activeTab, setActiveTab] = useState('all'); // 'all' or 'unverified'

  useEffect(() => {
    fetchDoctorsAndUsers();
  }, []);

  // Removed open/close Create Profile modal handlers
  const handleDeleteDoctor = async () => {
    if (!doctorToDelete) return;

    try {
      const res = await doctorAPI.delete(doctorToDelete.id);
      if (res.data.success) {
        toast.success('Doctor deleted successfully');
        setShowDeleteModal(false);
        setDoctorToDelete(null);
        fetchDoctorsAndUsers();
      }
    } catch (err) {
      logger.error('Error deleting doctor:', err);
      toast.error(err.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const openDeleteModal = (doctor) => {
    setDoctorToDelete(doctor);
    setShowDeleteModal(true);
  };

  const openDetailsModal = (doctor) => {
    setSelectedDoctor(doctor);
    setShowDetailsModal(true);
  };

  // Merge doctorUsers (all users with DOCTOR role) with doctors (profiles)
  const mergedDoctors = doctorUsers.map(user => {
    const profile = doctors.find(d => d.userId === user.id);
    return {
      ...user,
      ...(profile || {}),
      hasProfile: !!profile,
      profileId: profile ? profile.id : null // Add profileId for correct verification
    };
  });

  const filteredDoctors = (activeTab === 'unverified'
    ? mergedDoctors.filter(d => !d.isVerified)
    : mergedDoctors
  ).filter(doctor =>
    doctor.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <>
        <Navbar />
        <AdminSidebar />
        <div className="ml-64 pt-16 min-h-screen bg-slate-50">
          <div className="max-w-7xl mx-auto p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
                <UserCheck className="text-blue-600" size={36} />
                Manage Doctors
              </h1>
              <p className="text-gray-600 mt-2">Verify and manage doctor accounts</p>
            </div>

            <div className="mb-8">
              <StatCardSkeleton count={3} />
            </div>

            {/* Skeleton for Tabs and Search */}
            <div className="bg-white rounded-t-lg shadow-md p-6 border-b h-32 animate-pulse"></div>

            <div className="bg-white rounded-b-lg shadow-md p-6">
               <TableSkeleton rows={5} columns={5} />
            </div>
          </div>
        </div>
      </>
    );
  }

  // Always use doctor.profileId (doctor profile UUID) for verification
  const handleVerifyDoctor = async (profileId) => {
    if (!profileId) {
      toast.error('Doctor profile ID not found.');
      return;
    }
    try {
      await adminAPI.verifyDoctor(profileId);
      toast.success('Doctor verified successfully');
      fetchDoctorsAndUsers();
    } catch (err) {
      logger.error('Error verifying doctor:', err);
      toast.error(err.response?.data?.message || 'Failed to verify doctor');
    }
  };

  return (
    <>
      <Navbar />
      <AdminSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
          <UserCheck className="text-blue-600" size={36} />
          Manage Doctors
        </h1>
        <p className="text-gray-600 mt-2">Verify and manage doctor accounts</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Doctors</p>
              <p className="text-3xl font-bold text-blue-600 mt-2">{doctors.length}</p>
            </div>
            <UserCheck className="text-blue-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Verified Doctors</p>
              <p className="text-3xl font-bold text-green-600 mt-2">
                {doctors.filter(d => d.isVerified).length}
              </p>
            </div>
            <CheckCircle className="text-green-600" size={40} />
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Pending Verification</p>
              <p className="text-3xl font-bold text-orange-600 mt-2">{unverifiedDoctors.length}</p>
            </div>
            <AlertTriangle className="text-orange-600" size={40} />
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="flex border-b">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'all'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            All Doctors ({doctors.length})
          </button>
          <button
            onClick={() => setActiveTab('unverified')}
            className={`px-6 py-3 font-medium transition-colors ${
              activeTab === 'unverified'
                ? 'text-orange-600 border-b-2 border-orange-600'
                : 'text-gray-600 hover:text-gray-800'
            }`}
          >
            Unverified ({unverifiedDoctors.length})
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-6 border-b">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search by name, specialization, or email..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Doctors Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Specialization</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">License</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Profile</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map(doctor => (
                  <tr key={doctor.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <p className="font-semibold text-gray-900">{doctor.name}</p>
                        <p className="text-sm text-gray-500">{doctor.email}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{doctor.specialization || <span className="text-gray-400">No profile</span>}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-900">{doctor.licenseNumber || <span className="text-gray-400">No profile</span>}</span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.hasProfile ? (
                        <span className="text-green-600 text-xs font-semibold">Profile</span>
                      ) : (
                        <span className="text-red-500 text-xs font-semibold">Missing</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {doctor.isVerified ? (
                        <span className="flex items-center gap-1 text-green-600 text-sm font-medium">
                          <CheckCircle size={16} />
                          Verified
                        </span>
                      ) : doctor.hasProfile ? (
                        <span className="flex items-center gap-1 text-orange-600 text-sm font-medium">
                          <AlertTriangle size={16} />
                          Pending
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-gray-500 text-sm font-medium">
                          <XCircle size={16} />
                          No Profile
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openDetailsModal(doctor)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="View Details"
                        >
                          <Eye size={18} />
                        </button>
                        {!doctor.isVerified && doctor.hasProfile && (
                          <button
                            onClick={async () => {
                              await handleVerifyDoctor(doctor.profileId);
                              fetchDoctorsAndUsers();
                            }}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                            title="Verify Doctor"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {/* Removed Create Profile button */}
                        <button
                          onClick={() => openDeleteModal(doctor)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete Doctor"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="5" className="px-6 py-12 text-center">
                    <UserCheck className="mx-auto text-gray-300 mb-3" size={48} />
                    <p className="text-gray-500">No doctors found</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Removed Create Profile Modal */}

      {/* Details Modal */}
      {showDetailsModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800">Doctor Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <XCircle size={24} />
                </button>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-600">Name</label>
                <p className="text-lg text-gray-900">{selectedDoctor.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Email</label>
                <p className="text-lg text-gray-900">{selectedDoctor.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Specialization</label>
                <p className="text-lg text-gray-900">{selectedDoctor.specialization}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">License Number</label>
                <p className="text-lg text-gray-900">{selectedDoctor.licenseNumber || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Experience</label>
                <p className="text-lg text-gray-900">{selectedDoctor.experienceYears || 'N/A'} years</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Consultation Fee</label>
                <p className="text-lg text-gray-900">${selectedDoctor.consultationFee || 'N/A'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-600">Status</label>
                <p className="text-lg">
                  {selectedDoctor.isVerified ? (
                    <span className="text-green-600 font-medium">Verified</span>
                  ) : (
                    <span className="text-orange-600 font-medium">Pending Verification</span>
                  )}
                </p>
              </div>
            </div>
            <div className="p-6 border-t bg-gray-50 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && doctorToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 mx-auto bg-red-100 rounded-full mb-4">
                <Trash2 className="text-red-600" size={24} />
              </div>
              <h2 className="text-xl font-bold text-gray-800 text-center mb-2">Delete Doctor</h2>
              <p className="text-gray-600 text-center mb-6">
                Are you sure you want to delete <strong>{doctorToDelete.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDoctorToDelete(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteDoctor}
                  className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </>
  );
}
