import React from 'react';
import { Linkedin, Github } from "lucide-react";
import { X as XLogo } from "lucide-react";
import SortMyAILogo from '@/components/ui/SortMyAILogo';

const Footer = () => {
  return (
    <footer className="pt-12 pb-8 px-4 border-t border-sortmy-gray/20">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between mb-12">
          <div className="mb-8 md:mb-0">
            <div className="flex items-center mb-4">
              <SortMyAILogo className="w-8 h-8 mr-2 text-sortmy-blue" />
              <span className="text-lg font-bold">
                <span className="text-white">SortMy</span>
                <span className="text-sortmy-blue">AI</span>
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs">
              A sleek, fast, no-nonsense digital tool to help organize your AI outputs and digital chaos.
            </p>
            <div className="flex space-x-4 mt-4">
              <SocialLink icon={<XLogo size={18} />} href="https://twitter.com/sortmyai" />
              <SocialLink icon={<Linkedin size={18} />} href="#" />
              <SocialLink icon={<Github size={18} />} href="#" />
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
            <FooterLinkGroup
              title="Product"
              links={[
                { text: "Features", href: "#features" },
                { text: "How It Works", href: "#how-it-works" },
                { text: "Pricing", href: "#" },
                { text: "FAQ", href: "#" }
              ]}
            />

            <FooterLinkGroup
              title="Company"
              links={[
                { text: "About Us", href: "#" },
                { text: "Careers", href: "#" },
                { text: "Blog", href: "#" },
                { text: "Contact", href: "#" }
              ]}
            />

            <FooterLinkGroup
              title="Legal"
              links={[
                { text: "Privacy Policy", href: "#" },
                { text: "Terms of Service", href: "#" },
                { text: "Cookie Policy", href: "#" }
              ]}
            />
          </div>
        </div>

        <div className="text-center pt-8 border-t border-sortmy-gray/20">
          <p className="text-gray-500 text-sm">
            © {new Date().getFullYear()} SortMyAI. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

const SocialLink = ({ icon, href }: { icon: React.ReactNode, href: string }) => {
  return (
    <a
      href={href}
      className="w-8 h-8 rounded-full bg-sortmy-gray/10 flex items-center justify-center text-gray-400 hover:bg-sortmy-blue/10 hover:text-sortmy-blue transition-colors"
    >
      {icon}
    </a>
  );
};

interface LinkItem {
  text: string;
  href: string;
}

const FooterLinkGroup = ({ title, links }: { title: string; links: LinkItem[] }) => {
  return (
    <div>
      <h4 className="font-semibold mb-4">{title}</h4>
      <ul className="space-y-2">
        {links.map((link, index) => (
          <li key={index}>
            <a href={link.href} className="text-gray-400 hover:text-white text-sm transition-colors">
              {link.text}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Footer;
