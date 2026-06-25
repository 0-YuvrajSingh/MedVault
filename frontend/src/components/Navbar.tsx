import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut, Activity } from 'lucide-react';

const Navbar: React.FC = () => {
    const { role, logout, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    if (!isAuthenticated) {
        return null; // Render null if the user is not authenticated per constraints
    }

    return (
        <nav className="bg-blue-600 shadow-lg">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="flex-shrink-0 flex items-center text-white space-x-2">
                            <Activity className="h-8 w-8 text-blue-100" />
                            <span className="font-bold text-xl tracking-wider">MedVault</span>
                        </Link>
                    </div>

                    <div className="flex items-center space-x-4">
                        <span className="bg-blue-700 text-blue-100 px-3 py-1 rounded-full text-xs font-semibold tracking-wide shadow-inner">
                            {role === 'ROLE_ADMIN' && 'ADMIN'}
                            {role === 'ROLE_DOCTOR' && 'DOCTOR'}
                            {role === 'ROLE_PATIENT' && 'PATIENT'}
                        </span>
                        
                        <button
                            onClick={handleLogout}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-sm ml-4"
                        >
                            <LogOut className="h-4 w-4 mr-2" />
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
