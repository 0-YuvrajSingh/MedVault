// @ts-nocheck
import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { doctorAPI, fileAPI } from '../../api';
import { toast } from '../../utils/toast';
import logger from '../../utils/logger';
import { User, Mail, Phone, MapPin, Briefcase, Award, Calendar, Edit, Save, X, Upload, Camera } from 'lucide-react';
import Navbar from '../Navbar';
import DoctorSidebar from './DoctorSidebar';

export default function DoctorProfile() {
  const { user } = useAuth();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    specialization: '',
    qualifications: '',
    experienceYears: '',
    hospitalAffiliation: '',
    licenseNumber: '',
    phone: '',
    consultationFee: '',
    bio: ''
  });

  useEffect(() => {
    fetchDoctorProfile();
  }, [user]);

  const fetchDoctorProfile = async () => {
    try {
      setLoading(true);
      const response = await doctorAPI.getByUser(user.id);
      if (response.data.success) {
        const doctorData = response.data.data;
        setDoctor(doctorData);
        setFormData({
          specialization: doctorData.specialization || '',
          qualifications: doctorData.qualifications || '',
          experienceYears: doctorData.experienceYears || '',
          hospitalAffiliation: doctorData.hospitalAffiliation || '',
          licenseNumber: doctorData.licenseNumber || '',
          phone: doctorData.phone || '',
          consultationFee: doctorData.consultationFee || '',
          bio: doctorData.bio || ''
        });
      }
    } catch (err) {
      logger.error('Failed to load doctor profile:', err);
      // Only show error if it's not a 404 (profile not found is expected for new doctors)
      if (err.response?.status !== 404) {
        // Silently fail - backend issue, don't spam user with errors
      }
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    try {
      const payload = {
        ...formData,
        userId: user.id
      };
      const response = await doctorAPI.update(doctor.id, payload);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setEditing(false);
        fetchDoctorProfile();
      }
    } catch (err) {
      toast.error('Failed to update profile');
    }
  };

  const handleCancel = () => {
    setEditing(false);
    if (doctor) {
      setFormData({
        specialization: doctor.specialization || '',
        qualifications: doctor.qualifications || '',
        experienceYears: doctor.experienceYears || '',
        hospitalAffiliation: doctor.hospitalAffiliation || '',
        licenseNumber: doctor.licenseNumber || '',
        phone: doctor.phone || '',
        consultationFee: doctor.consultationFee || '',
        bio: doctor.bio || ''
      });
    }
  };

  const handleProfilePictureUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    try {
      setUploading(true);
      const response = await fileAPI.uploadProfilePicture(file, user.id);
      if (response.data.success) {
        toast.success('Profile picture updated');
        fetchDoctorProfile();
      }
    } catch (err) {
      toast.error('Failed to upload profile picture');
    } finally {
      setUploading(false);
    }
  };

  if (loading) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    </>
  );

  if (!doctor) return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-4xl mx-auto p-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
            <p className="text-yellow-800">Doctor profile not found. Please contact support.</p>
          </div>
        </div>
      </div>
    </>
  );

  return (
    <>
      <Navbar />
      <DoctorSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50">
        <div className="max-w-5xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-gray-800">My Profile</h1>
        {!editing ? (
          <button
            onClick={() => setEditing(true)}
            className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <Edit size={20} />
            Edit Profile
          </button>
        ) : (
          <div className="flex gap-2">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
            >
              <Save size={20} />
              Save
            </button>
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              <X size={20} />
              Cancel
            </button>
          </div>
        )}
      </div>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Header Section with Profile Picture */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-8">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-32 h-32 bg-white rounded-full flex items-center justify-center overflow-hidden">
                {doctor.profilePicture ? (
                  <img src={doctor.profilePicture} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-blue-600" size={64} />
                )}
              </div>
              <label className="absolute bottom-0 right-0 bg-white rounded-full p-2 cursor-pointer shadow-lg hover:bg-gray-100">
                <Camera className="text-blue-600" size={20} />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePictureUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </label>
              {uploading && (
                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                </div>
              )}
            </div>
            <div className="text-white">
              <h2 className="text-3xl font-bold mb-1">{user.name}</h2>
              <p className="text-blue-100 text-lg mb-2">{doctor.specialization}</p>
              <div className="flex items-center gap-4 text-sm">
                {doctor.isVerified ? (
                  <span className="bg-green-500 px-3 py-1 rounded-full flex items-center gap-1">
                    <Award size={16} />
                    Verified Doctor
                  </span>
                ) : (
                  <span className="bg-yellow-500 px-3 py-1 rounded-full">Pending Verification</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Specialization */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={18} className="text-blue-600" />
                Specialization
              </label>
              {editing ? (
                <input
                  type="text"
                  name="specialization"
                  value={formData.specialization}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Cardiologist"
                />
              ) : (
                <p className="text-gray-800 font-semibold">{doctor.specialization || 'Not specified'}</p>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award size={18} className="text-blue-600" />
                Qualifications
              </label>
              {editing ? (
                <input
                  type="text"
                  name="qualifications"
                  value={formData.qualifications}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., MBBS, MD"
                />
              ) : (
                <p className="text-gray-800 font-semibold">{doctor.qualifications || 'Not specified'}</p>
              )}
            </div>

            {/* License Number */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Award size={18} className="text-blue-600" />
                License Number
              </label>
              {editing ? (
                <input
                  type="text"
                  name="licenseNumber"
                  value={formData.licenseNumber}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., LIC-12345"
                />
              ) : (
                <p className="text-gray-800 font-semibold">{doctor.licenseNumber || 'Not specified'}</p>
              )}
            </div>

            {/* Experience Years */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Calendar size={18} className="text-blue-600" />
                Experience (years)
              </label>
              {editing ? (
                <input
                  type="number"
                  name="experienceYears"
                  value={formData.experienceYears}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 10"
                />
              ) : (
                <p className="text-gray-800 font-semibold">{doctor.experienceYears ? `${doctor.experienceYears} years` : 'Not specified'}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Phone size={18} className="text-blue-600" />
                Phone
              </label>
              {editing ? (
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., +1234567890"
                />
              ) : (
                <p className="text-gray-800 font-semibold">{doctor.phone || 'Not specified'}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Mail size={18} className="text-blue-600" />
                Email
              </label>
              <p className="text-gray-800 font-semibold">{user.email}</p>
            </div>

            {/* Consultation Fee */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
                <Briefcase size={18} className="text-blue-600" />
                Consultation Fee
              </label>
              {editing ? (
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 500"
                />
              ) : (
                <p className="text-gray-800 font-semibold">
                  {doctor.consultationFee ? `₹${doctor.consultationFee}` : 'Not specified'}
                </p>
              )}
            </div>
          </div>

          {/* Hospital Affiliation */}
          <div className="mb-6">
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <MapPin size={18} className="text-blue-600" />
              Hospital Affiliation
            </label>
            {editing ? (
              <textarea
                name="hospitalAffiliation"
                value={formData.hospitalAffiliation}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="2"
                placeholder="Enter hospital affiliation"
              />
            ) : (
              <p className="text-gray-800">{doctor.hospitalAffiliation || 'Not specified'}</p>
            )}
          </div>

          {/* Bio */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-2">
              <User size={18} className="text-blue-600" />
              Bio
            </label>
            {editing ? (
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="4"
                placeholder="Write something about yourself..."
              />
            ) : (
              <p className="text-gray-800">{doctor.bio || 'No bio added yet'}</p>
            )}
          </div>
        </div>

        {/* Stats Section */}
        <div className="bg-gray-50 px-8 py-6 border-t">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Registration Number</p>
              <p className="text-lg font-semibold text-gray-800">{doctor.registrationNumber || 'N/A'}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">User ID</p>
              <p className="text-lg font-semibold text-gray-800">{user.id}</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <p className="text-sm text-gray-600">Account Status</p>
              <p className="text-lg font-semibold text-green-600">Active</p>
            </div>
          </div>
        </div>
      </div>
        </div>
      </div>
    </>
  );
}
