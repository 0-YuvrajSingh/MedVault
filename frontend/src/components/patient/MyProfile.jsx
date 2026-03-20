import React, { useEffect, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { patientAPI, fileAPI } from '../../api';
import { toast } from '../../utils/toast';
import logger from '../../utils/logger';
import { 
  User, Edit, Save, Camera, Mail, Phone, MapPin, Activity, HeartPulse,
  ChevronDown, ChevronUp, UserCircle, CreditCard, Utensils, Bed, Dumbbell,
  Brain, Droplet, Scale, Thermometer
} from 'lucide-react';
import Navbar from '../Navbar';
import PatientSidebar from './PatientSidebar';

export default function MyProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Expanded form data with lifestyle and health metrics
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    bloodGroup: '',
    dateOfBirth: '',
    gender: '',
    emergencyContact: '',
    weight: '',
    height: '',
    allergies: '',
    medicalHistory: '',
    maritalStatus: '',
    patientId: '',
    aadhaarNumber: '',
    profilePicture: '',
    lifestyle: {
      smoking: 'NO',
      alcohol: 'NO',
      diet: 'VEG',
      sleepHours: 7,
      physicalActivity: 'MODERATE',
      stressLevel: 'MEDIUM'
    },
    currentHealth: {
      height: '',
      weight: '',
      bmi: '',
      bloodPressure: '',
      pulse: '',
      temperature: '',
      bloodSugar: ''
    }
  });

  // Expandable sections state
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    identification: true,
    lifestyle: true,
    currentHealth: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Auto-calculate BMI when height or weight changes
  useEffect(() => {
    if (formData.currentHealth.height && formData.currentHealth.weight) {
      const heightInMeters = parseFloat(formData.currentHealth.height) / 100;
      const weight = parseFloat(formData.currentHealth.weight);
      if (heightInMeters > 0 && weight > 0) {
        const bmi = (weight / (heightInMeters * heightInMeters)).toFixed(1);
        setFormData(prev => ({
          ...prev,
          currentHealth: { ...prev.currentHealth, bmi }
        }));
      }
    }
  }, [formData.currentHealth.height, formData.currentHealth.weight]);

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await patientAPI.getByUser(user.id);
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);

        // Parse JSON fields if present
        let lifestyle = {};
        let currentHealth = {};
        try {
          lifestyle = data.lifestyle ? JSON.parse(data.lifestyle) : {};
        } catch (e) {
          lifestyle = {};
        }
        try {
          currentHealth = data.currentHealth ? JSON.parse(data.currentHealth) : {};
        } catch (e) {
          currentHealth = {};
        }

        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || data.phoneNumber || '',
          address: data.address || '',
          bloodGroup: data.bloodGroup || '',
          dateOfBirth: data.dateOfBirth || '',
          gender: data.gender || '',
          emergencyContact: data.emergencyContact || data.emergencyContactPhone || '',
          weight: currentHealth.weight || '',
          height: currentHealth.height || '',
          allergies: data.allergies || '',
          medicalHistory: data.medicalHistory || '',
          maritalStatus: data.maritalStatus || '',
          patientId: data.patientId || '',
          aadhaarNumber: data.aadhaarNumber || '',
          profilePicture: data.profilePicture || '',
          lifestyle: {
            smoking: lifestyle.smoking || 'NO',
            alcohol: lifestyle.alcohol || 'NO',
            diet: lifestyle.diet || 'VEG',
            sleepHours: lifestyle.sleepHours || 7,
            physicalActivity: lifestyle.physicalActivity || 'MODERATE',
            stressLevel: lifestyle.stressLevel || 'MEDIUM'
          },
          currentHealth: {
            height: currentHealth.height || '',
            weight: currentHealth.weight || '',
            bmi: currentHealth.bmi || '',
            bloodPressure: currentHealth.bloodPressure || '',
            pulse: currentHealth.pulse || '',
            temperature: currentHealth.temperature || '',
            bloodSugar: currentHealth.bloodSugar || ''
          }
        });
      }
    } catch (err) {
      logger.error('Profile load error:', err);
    } finally {
      setLoading(false);
    }
  }, [user.id]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleUpdate = async (e) => {
    e.preventDefault();

    if (!profile?.id) {
      toast.error('No profile ID available');
      return;
    }

    // Prepare data for backend: stringify lifestyle and currentHealth
    const payload = {
      ...formData,
      userId: user.id,
      phoneNumber: formData.phone,
      emergencyContactPhone: formData.emergencyContact,
      lifestyle: JSON.stringify(formData.lifestyle),
      currentHealth: JSON.stringify(formData.currentHealth)
    };

    try {
      const response = await patientAPI.update(profile.id, payload);
      if (response.data.success) {
        toast.success('Profile updated successfully');
        setIsEditing(false);
        fetchProfile();
      }
    } catch (err) {
      logger.error('Profile update error:', err);
      toast.error('Failed to update profile');
    }
  };

  const handlePhotoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      const uploadData = new FormData();
      uploadData.append('file', file);
      uploadData.append('userId', user.id);

      const response = await fileAPI.uploadProfilePicture(file, user.id);
      if (response.data.success) {
        toast.success('Profile picture updated');
        // Wait a moment to ensure backend updates, then fetch profile
        setTimeout(() => fetchProfile(), 500);
      }
    } catch (err) {
      toast.error('Failed to upload profile picture');
    }
  };

  const getBMICategory = (bmi) => {
    const bmiValue = parseFloat(bmi);
    if (bmiValue < 18.5) return { text: 'Underweight', color: 'text-amber-600' };
    if (bmiValue < 25) return { text: 'Normal', color: 'text-green-600' };
    if (bmiValue < 30) return { text: 'Overweight', color: 'text-orange-600' };
    return { text: 'Obese', color: 'text-red-600' };
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <PatientSidebar />
        <div className="ml-64 pt-16 flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <PatientSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-6xl mx-auto p-6">
          {/* Header Card */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg p-8 mb-6"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="relative">
                  {profile?.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.nextSibling.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div 
                    className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-3xl font-bold text-white"
                    style={{ display: profile?.profilePicture ? 'none' : 'flex' }}
                  >
                    {profile?.name?.charAt(0) || 'P'}
                  </div>
                  <label className="absolute bottom-0 right-0 bg-blue-600 text-white p-2 rounded-full cursor-pointer hover:bg-blue-700 transition-colors shadow-md">
                    <Camera size={16} />
                    <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
                  </label>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-800">{profile?.name}</h1>
                  <p className="text-gray-600 flex items-center mt-1">
                    <Mail size={16} className="mr-2" />{profile?.email}
                  </p>
                  {formData.patientId && (
                    <p className="text-sm text-blue-600 font-mono mt-1">ID: {formData.patientId}</p>
                  )}
                </div>
              </div>

              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl hover:from-blue-700 hover:to-purple-700 flex items-center transition-all shadow-md hover:shadow-lg"
                >
                  <Edit size={18} className="mr-2" />Edit Profile
                </button>
              ) : (
                <div className="flex space-x-3">
                  <button 
                    onClick={() => { setIsEditing(false); fetchProfile(); }} 
                    className="bg-gray-200 text-gray-800 px-5 py-3 rounded-xl hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleUpdate} 
                    className="bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl hover:from-green-700 hover:to-emerald-700 flex items-center transition-all shadow-md"
                  >
                    <Save size={18} className="mr-2" />Save Changes
                  </button>
                </div>
              )}
            </div>
          </motion.div>

          {/* Basic Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('basicInfo')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <User className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Basic Information</h2>
              </div>
              {expandedSections.basicInfo ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.basicInfo && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Full Name *</label>
                    <input 
                      type="text" 
                      value={formData.name} 
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                    <input 
                      type="email" 
                      value={formData.email} 
                      disabled 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Phone *</label>
                    <input 
                      type="tel" 
                      value={formData.phone} 
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Blood Group</label>
                    <select 
                      value={formData.bloodGroup} 
                      onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="">Select Blood Group</option>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Date of Birth</label>
                    <input 
                      type="date" 
                      value={formData.dateOfBirth} 
                      onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Gender</label>
                    <select 
                      value={formData.gender} 
                      onChange={(e) => setFormData({ ...formData, gender: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="">Select Gender</option>
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Marital Status</label>
                    <select 
                      value={formData.maritalStatus} 
                      onChange={(e) => setFormData({ ...formData, maritalStatus: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="">Select Marital Status</option>
                      <option value="SINGLE">Single</option>
                      <option value="MARRIED">Married</option>
                      <option value="DIVORCED">Divorced</option>
                      <option value="WIDOWED">Widowed</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Emergency Contact</label>
                    <input 
                      type="tel" 
                      value={formData.emergencyContact} 
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                    <textarea 
                      value={formData.address} 
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })} 
                      disabled={!isEditing} 
                      rows={3} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none transition-all" 
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Known Allergies</label>
                    <textarea 
                      value={formData.allergies} 
                      onChange={(e) => setFormData({ ...formData, allergies: e.target.value })} 
                      disabled={!isEditing} 
                      rows={2} 
                      placeholder="e.g., Penicillin, Peanuts, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none transition-all" 
                    />
                  </div>

                  <div className="md:col-span-2 lg:col-span-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Medical History</label>
                    <textarea 
                      value={formData.medicalHistory} 
                      onChange={(e) => setFormData({ ...formData, medicalHistory: e.target.value })} 
                      disabled={!isEditing} 
                      rows={3} 
                      placeholder="Previous illnesses, surgeries, chronic conditions, etc."
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 resize-none transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Identification */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('identification')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <UserCircle className="text-purple-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Identification</h2>
              </div>
              {expandedSections.identification ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.identification && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Patient ID</label>
                    <input 
                      type="text" 
                      value={formData.patientId} 
                      disabled
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 font-mono" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Aadhaar Number</label>
                    <input 
                      type="text" 
                      value={formData.aadhaarNumber} 
                      onChange={(e) => setFormData({ ...formData, aadhaarNumber: e.target.value })} 
                      disabled={!isEditing} 
                      placeholder="XXXX-XXXX-XXXX"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Lifestyle Information */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg mb-6 overflow-hidden"
          >
            <button
              onClick={() => toggleSection('lifestyle')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <Activity className="text-green-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Lifestyle Information</h2>
              </div>
              {expandedSections.lifestyle ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.lifestyle && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplet className="mr-2 text-gray-500" size={16} />
                      Smoking
                    </label>
                    <select 
                      value={formData.lifestyle.smoking} 
                      onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, smoking: e.target.value } })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="NO">No</option>
                      <option value="OCCASIONALLY">Occasionally</option>
                      <option value="REGULARLY">Regularly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplet className="mr-2 text-gray-500" size={16} />
                      Alcohol
                    </label>
                    <select 
                      value={formData.lifestyle.alcohol} 
                      onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, alcohol: e.target.value } })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="NO">No</option>
                      <option value="OCCASIONALLY">Occasionally</option>
                      <option value="REGULARLY">Regularly</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Utensils className="mr-2 text-gray-500" size={16} />
                      Diet
                    </label>
                    <select 
                      value={formData.lifestyle.diet} 
                      onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, diet: e.target.value } })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="VEG">Vegetarian</option>
                      <option value="NON_VEG">Non-Vegetarian</option>
                      <option value="VEGAN">Vegan</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Bed className="mr-2 text-gray-500" size={16} />
                      Sleep Hours (per day)
                    </label>
                    <input 
                      type="number" 
                      min="0" 
                      max="24"
                      value={formData.lifestyle.sleepHours} 
                      onChange={(e) => {
                        const val = e.target.value;
                        setFormData({ 
                          ...formData, 
                          lifestyle: { 
                            ...formData.lifestyle, 
                            sleepHours: val === '' ? '' : parseInt(val) 
                          } 
                        });
                      }}
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Dumbbell className="mr-2 text-gray-500" size={16} />
                      Physical Activity
                    </label>
                    <select 
                      value={formData.lifestyle.physicalActivity} 
                      onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, physicalActivity: e.target.value } })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="SEDENTARY">Sedentary</option>
                      <option value="LIGHT">Light</option>
                      <option value="MODERATE">Moderate</option>
                      <option value="ACTIVE">Active</option>
                      <option value="VERY_ACTIVE">Very Active</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Brain className="mr-2 text-gray-500" size={16} />
                      Stress Level
                    </label>
                    <select 
                      value={formData.lifestyle.stressLevel} 
                      onChange={(e) => setFormData({ ...formData, lifestyle: { ...formData.lifestyle, stressLevel: e.target.value } })} 
                      disabled={!isEditing} 
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Current Health Status */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg overflow-hidden"
          >
            <button
              onClick={() => toggleSection('currentHealth')}
              className="w-full flex items-center justify-between p-6 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <HeartPulse className="text-red-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-800">Current Health Metrics</h2>
              </div>
              {expandedSections.currentHealth ? <ChevronUp /> : <ChevronDown />}
            </button>
            
            {expandedSections.currentHealth && (
              <div className="p-6 pt-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Scale className="mr-2 text-gray-500" size={16} />
                      Height (cm)
                    </label>
                    <input 
                      type="number" 
                      value={formData.currentHealth.height} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, height: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="170"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Scale className="mr-2 text-gray-500" size={16} />
                      Weight (kg)
                    </label>
                    <input 
                      type="number" 
                      value={formData.currentHealth.weight} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, weight: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="70"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">BMI (Auto-calculated)</label>
                    <div className="relative">
                      <input 
                        type="text" 
                        value={formData.currentHealth.bmi} 
                        disabled
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl bg-gray-100 text-gray-700 font-semibold" 
                      />
                      {formData.currentHealth.bmi && (
                        <span className={`absolute right-4 top-3 text-sm font-medium ${getBMICategory(formData.currentHealth.bmi).color}`}>
                          {getBMICategory(formData.currentHealth.bmi).text}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <HeartPulse className="mr-2 text-gray-500" size={16} />
                      Blood Pressure
                    </label>
                    <input 
                      type="text" 
                      value={formData.currentHealth.bloodPressure} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, bloodPressure: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="120/80"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Activity className="mr-2 text-gray-500" size={16} />
                      Pulse Rate (bpm)
                    </label>
                    <input 
                      type="number" 
                      value={formData.currentHealth.pulse} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, pulse: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="72"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Thermometer className="mr-2 text-gray-500" size={16} />
                      Temperature (°C)
                    </label>
                    <input 
                      type="number" 
                      step="0.1"
                      value={formData.currentHealth.temperature} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, temperature: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="37.0"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center">
                      <Droplet className="mr-2 text-gray-500" size={16} />
                      Blood Sugar (mg/dL)
                    </label>
                    <input 
                      type="number" 
                      value={formData.currentHealth.bloodSugar} 
                      onChange={(e) => setFormData({ ...formData, currentHealth: { ...formData.currentHealth, bloodSugar: e.target.value } })} 
                      disabled={!isEditing} 
                      placeholder="100"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 transition-all" 
                    />
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </>
  );
}
