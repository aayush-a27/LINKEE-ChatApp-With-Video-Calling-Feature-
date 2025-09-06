import { Mail, Github, Linkedin, Instagram, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-base-200 border-t border-base-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Contact Info */}
          <div className="text-center sm:text-left">
            <h3 className="font-semibold text-sm mb-2">Contact Developer</h3>
            <a 
              href="mailto:your-email@example.com" 
              className="flex items-center gap-2 text-sm text-gray-600 hover:text-primary transition-colors"
            >
              <Mail className="w-4 h-4" />
              your-email@example.com
            </a>
          </div>

          {/* Social Links */}
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-600 hidden sm:block">Follow:</span>
            <div className="flex gap-3">
              <a 
                href="https://github.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                title="GitHub"
              >
                <Github className="w-5 h-5" />
              </a>
              <a 
                href="https://linkedin.com/in/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                title="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </a>
              <a 
                href="https://instagram.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                title="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="https://twitter.com/yourusername" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-primary transition-colors"
                title="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        {/* Copyright */}
        <div className="text-center mt-4 pt-4 border-t border-base-300">
          <p className="text-xs text-gray-500">
            © 2024 Linkee. Built with ❤️ by Developer
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;