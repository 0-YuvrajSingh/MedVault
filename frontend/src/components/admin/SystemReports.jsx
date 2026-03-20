import { motion } from "framer-motion";
import { Activity, ArrowLeft, Calendar, Download, FileText, TrendingUp, Users } from "lucide-react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { adminAPI } from "../../api";
import logger from "../../utils/logger";
import { showToast } from "../../utils/toast";
import Navbar from '../Navbar';
import AdminSidebar from './AdminSidebar';

export default function SystemReports() {
  const navigate = useNavigate();
  const [selectedReport, setSelectedReport] = useState("");
  const [dateRange, setDateRange] = useState({ start: "", end: "" });
  const [loading, setLoading] = useState(false);

  const colorMap = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600' },
    green: { bg: 'bg-green-50', text: 'text-green-600' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600' },
    teal: { bg: 'bg-teal-50', text: 'text-teal-600' }
  };

  const reportTypes = [
    {
      id: "user-analytics",
      title: "User Analytics",
      description: "Detailed user registration and activity metrics",
      icon: Users,
      color: "blue"
    },
    {
      id: "appointment-stats",
      title: "Appointment Statistics",
      description: "Comprehensive appointment booking and completion data",
      icon: Calendar,
      color: "green"
    },
    {
      id: "system-health",
      title: "System Health Report",
      description: "Platform performance and health metrics",
      icon: Activity,
      color: "purple"
    },
    {
      id: "revenue-report",
      title: "Revenue Report",
      description: "Financial transactions and revenue analytics",
      icon: TrendingUp,
      color: "teal"
    }
  ];

  const handleGenerateReport = async () => {
    if (!selectedReport) {
      showToast.error("Please select a report type");
      return;
    }
    if (!dateRange.start || !dateRange.end) {
      showToast.error("Please select date range");
      return;
    }

    try {
      setLoading(true);

      // Generate report data based on type
      let reportData = {};

      switch (selectedReport) {
        case "user-analytics":
          // Pass date range as query params
          const usersResponse = await adminAPI.getUsers({
            startDate: dateRange.start,
            endDate: dateRange.end
          });
          reportData = {
            totalUsers: usersResponse.data?.length || 0,
            dateRange: dateRange,
            reportType: "User Analytics",
            generatedAt: new Date().toISOString()
          };
          break;

        case "appointment-stats":
          const statsResponse = await adminAPI.getDashboardStats();
          reportData = {
            stats: statsResponse.data || {},
            dateRange: dateRange,
            reportType: "Appointment Statistics",
            generatedAt: new Date().toISOString()
          };
          break;

        case "system-health":
          const healthResponse = await adminAPI.getDashboardStats();
          reportData = {
            systemHealth: healthResponse.data || {},
            dateRange: dateRange,
            reportType: "System Health",
            generatedAt: new Date().toISOString()
          };
          break;

        case "revenue-report":
          showToast.info("Revenue reporting coming soon");
          return;

        default:
          showToast.error("Invalid report type");
          return;
      }

      // Download report as JSON
      const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedReport}-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      showToast.success("Report generated and downloaded successfully");
    } catch (error) {
      logger.error("Report generation error:", error);
      showToast.error("Failed to generate report");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <AdminSidebar />
      <div className="ml-64 pt-16 min-h-screen bg-slate-50 p-6">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate("/admin/dashboard")}
            className="flex items-center gap-2 text-slate-600 hover:text-purple-600 mb-4 transition-colors"
          >
            <ArrowLeft className="size-5" />
            Back to Dashboard
          </button>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2">
                System Reports
              </h1>
              <p className="text-slate-600">Generate comprehensive analytics and reports</p>
            </div>
            <div className="size-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <FileText className="size-8 text-white" />
            </div>
          </div>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Type Selection */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-2 space-y-4"
          >
            <h2 className="text-xl font-semibold text-slate-900 mb-4">Select Report Type</h2>
            {reportTypes.map((report, index) => (
              <motion.div
                key={report.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.05 }}
                onClick={() => setSelectedReport(report.id)}
                className={`bg-white rounded-2xl p-6 cursor-pointer transition-all ${
                  selectedReport === report.id
                    ? "ring-2 ring-purple-500 shadow-lg"
                    : "hover:shadow-md"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`size-14 rounded-xl ${colorMap[report.color]?.bg || 'bg-slate-50'} flex items-center justify-center flex-shrink-0`}>
                    <report.icon className={`size-7 ${colorMap[report.color]?.text || 'text-slate-600'}`} />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-slate-900 mb-1">
                      {report.title}
                    </h3>
                    <p className="text-sm text-slate-600">{report.description}</p>
                  </div>
                  {selectedReport === report.id && (
                    <div className="size-6 rounded-full bg-purple-500 flex items-center justify-center">
                      <svg className="size-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>

          {/* Report Configuration */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-6"
          >
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-xl font-semibold text-slate-900 mb-4">Report Configuration</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Start Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    End Date
                  </label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                    className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none transition-all"
                  />
                </div>

                <button
                  onClick={handleGenerateReport}
                  className="w-full h-12 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl hover:shadow-lg transition-all flex items-center justify-center gap-2 font-medium"
                >
                  <Download className="size-5" />
                  Generate Report
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl p-6 text-white">
              <h3 className="text-lg font-semibold mb-4">Quick Stats</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Reports Generated</span>
                  <span className="font-bold">0</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-white/80">Last Generated</span>
                  <span className="font-bold text-sm">Never</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    </>
  );
}
