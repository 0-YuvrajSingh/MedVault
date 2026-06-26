import React from 'react';
import { Mail, Github, Linkedin, Send, TerminalSquare } from 'lucide-react';

const ContactPage: React.FC = () => (
  <div className="bg-slate-50 min-h-screen">
    {/* Header */}
    <div className="bg-[#0F4C81] py-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 tracking-tight">Developer Contact</h1>
        <p className="text-lg text-blue-100 max-w-xl mx-auto font-medium">
          Have technical questions about the MedVault architecture, code review, or hiring inquiries? Connect with me.
        </p>
      </div>
    </div>

    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
            <h2 className="text-2xl font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Social & Links</h2>
            <div className="space-y-6">
              
              <a href="https://github.com/YuvrajSingh/MedVault" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#0369A1] group-hover:bg-[#0369A1] group-hover:text-white transition-colors">
                  <Github className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#0369A1] transition-colors">GitHub Repository</h3>
                  <p className="text-gray-600 font-medium text-sm mt-1 leading-relaxed">
                    View the full Spring Boot + React source code.
                  </p>
                </div>
              </a>

              <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="flex items-start gap-4 group cursor-pointer">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#0369A1] group-hover:bg-[#0369A1] group-hover:text-white transition-colors">
                  <Linkedin className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 group-hover:text-[#0369A1] transition-colors">LinkedIn Profile</h3>
                  <p className="text-gray-600 font-medium text-sm mt-1 leading-relaxed">
                    Connect professionally.
                  </p>
                </div>
              </a>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-[#EFF6FF] flex items-center justify-center flex-shrink-0 text-[#0369A1]">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">Email Address</h3>
                  <p className="text-gray-600 font-medium text-sm mt-1 leading-relaxed">
                    yuvraj@example.com
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-[#EFF6FF] rounded-xl p-6 border-l-4 border-[#0369A1] shadow-sm flex items-start gap-4">
            <TerminalSquare className="w-6 h-6 text-[#0369A1] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-[#0F4C81] mb-1 text-lg">Looking to test the API locally?</h3>
              <p className="text-sm text-[#0369A1] font-medium leading-relaxed">Visit the GitHub repository for detailed setup instructions and Docker Compose commands to run MedVault on your machine.</p>
            </div>
          </div>
        </div>

        {/* Message Form */}
        <div className="bg-white rounded-xl p-8 border border-gray-200 shadow-sm">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Send a Message</h2>
          <form onSubmit={(e) => { e.preventDefault(); alert('This is a static portfolio form — no backend email service is connected.'); }} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Name</label>
              <input type="text" className="input block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" placeholder="Your name" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Email Address</label>
              <input type="email" className="input block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none" placeholder="you@example.com" required />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
              <textarea className="input block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0369A1] sm:text-sm bg-gray-50 focus:bg-white transition-colors outline-none min-h-[120px] resize-y" placeholder="Your message..." required />
            </div>
            <button type="submit" className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-bold text-white bg-[#0369A1] hover:bg-[#02598B] transition-all">
              Send Message
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
          <p className="text-xs text-gray-400 font-medium mt-4 text-center">This form is UI-only. Connect via LinkedIn for direct messaging.</p>
        </div>

      </div>
    </div>
  </div>
);

export default ContactPage;
