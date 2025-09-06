import React from 'react';
import Layout from '../component/Layout';
import { Mail, Github, Linkedin, Instagram, Twitter, User, Heart } from 'lucide-react';

const ContactPage = () => {
  return (
    <Layout showSidebar={true} showNavbar={true}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        {/* Header */}
        <div className="flex items-center gap-2 sm:gap-3 mb-6">
          <User className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold">Contact Developer</h1>
        </div>

        {/* Developer Info Card */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-4 sm:p-6">
            <div className="text-center mb-6">
              <h2 className="text-xl sm:text-2xl font-bold mb-2">Aayush Bhadula</h2>
              <p className="text-sm sm:text-base text-gray-600">Full Stack Developer</p>
            </div>

            {/* Contact Methods */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold mb-4">Get in Touch</h3>
              
              {/* Email */}
              <a 
                href="mailto:aayushbhadula567@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-base-200 transition-colors"
              >
                <Mail className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-sm text-gray-600">aayushbhadula567@gmail.com</p>
                </div>
              </a>
            </div>
          </div>
        </div>

        {/* Social Media Links */}
        <div className="card bg-base-100 shadow-lg mb-6">
          <div className="card-body p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">Follow Me</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              
              {/* GitHub */}
              <a 
                href="https://github.com/aayush-a27"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-base-200 transition-colors"
              >
                <Github className="w-8 h-8 text-gray-700 mb-2" />
                <span className="text-sm font-medium">GitHub</span>
              </a>

              {/* LinkedIn */}
              <a 
                href="https://www.linkedin.com/in/aayush-bhadula-a78a67298/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-base-200 transition-colors"
              >
                <Linkedin className="w-8 h-8 text-blue-600 mb-2" />
                <span className="text-sm font-medium">LinkedIn</span>
              </a>

              {/* Instagram */}
              <a 
                href="https://www.instagram.com/aayush.developer"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-base-200 transition-colors"
              >
                <Instagram className="w-8 h-8 text-pink-500 mb-2" />
                <span className="text-sm font-medium">Instagram</span>
              </a>

              {/* Twitter */}
              <a 
                href="https://x.com/MaNuShYa_NORMAL"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center p-4 rounded-lg hover:bg-base-200 transition-colors"
              >
                <Twitter className="w-8 h-8 text-blue-400 mb-2" />
                <span className="text-sm font-medium">Twitter</span>
              </a>
            </div>
          </div>
        </div>

        {/* About Project */}
        <div className="card bg-base-100 shadow-lg">
          <div className="card-body p-4 sm:p-6">
            <h3 className="text-lg font-semibold mb-4">About Linkee</h3>
            <p className="text-sm sm:text-base text-gray-600 mb-4">
              Linkee is a modern, real-time chat application built with React, Node.js, and Stream Chat API. 
              It features video/voice calling, friend system, and real-time notifications.
            </p>
            <div className="flex items-center gap-2 text-sm text-gray-500">
              <span>Made with</span>
              <Heart className="w-4 h-4 text-red-500" />
              <span>by Developer</span>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;