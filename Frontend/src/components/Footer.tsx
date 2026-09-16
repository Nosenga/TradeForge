import React from 'react';
import { Link } from 'react-router-dom';
import Logo from './Logo';
import { GitBranch, Globe2, Mail, AlertTriangle } from 'lucide-react';

const APP_VERSION = '1.0.0';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const quickLinks = [
    { path: '/', label: 'Dashboard' },
    { path: '/strategies', label: 'Strategies' },
    { path: '/chart', label: 'Charts' },
    { path: '/backtest', label: 'Backtest' },
    { path: '/trading', label: 'Trading' },
    { path: '/learn', label: 'Learn' },
  ];

  const legalLinks = [
    { path: '/terms', label: 'Terms of Service' },
    { path: '/privacy', label: 'Privacy Policy' },
    { path: '/risk', label: 'Risk Disclosure' },
  ];

  return (
    <footer className="border-t border-trade-border/50 mt-16 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div className="lg:col-span-2">
            <Logo size="md" />
            <p className="text-text-secondary text-sm mt-3 max-w-sm">
              A modern algorithmic trading platform for building, testing, and running automated strategies.
            </p>
            <div className="flex items-center gap-3 mt-5">
              <a
                href="https://github.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-trade-bg/50 border border-trade-border flex items-center justify-center text-text-tertiary hover:text-trade-blue hover:border-trade-blue/40 transition"
                aria-label="GitHub"
              >
                <GitBranch className="w-4 h-4" />
              </a>
              <a
                href="https://twitter.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 rounded-lg bg-trade-bg/50 border border-trade-border flex items-center justify-center text-text-tertiary hover:text-trade-blue hover:border-trade-blue/40 transition"
                aria-label="Social media"
              >
                <Globe2 className="w-4 h-4" />
              </a>
              <a
                href="mailto:godfreynosenga19@gmail.com"
                className="w-9 h-9 rounded-lg bg-trade-bg/50 border border-trade-border flex items-center justify-center text-text-tertiary hover:text-trade-blue hover:border-trade-blue/40 transition"
                aria-label="Email"
              >
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Platform
            </h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-text-secondary text-sm hover:text-trade-blue transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-text-primary font-semibold text-sm uppercase tracking-wider mb-4">
              Legal
            </h4>
            <ul className="space-y-2">
              {legalLinks.map((link) => (
                <li key={link.path}>
                  <Link
                    to={link.path}
                    className="text-text-secondary text-sm hover:text-trade-blue transition"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-trade-border/50 pt-6 mb-6">
          <div className="flex items-start gap-3 p-4 rounded-lg bg-trade-bg/30 border border-trade-border/50">
            <AlertTriangle className="w-4 h-4 text-trade-yellow flex-shrink-0 mt-0.5" />
            <p className="text-text-tertiary text-xs leading-relaxed">
              <span className="text-trade-yellow font-medium">Risk Warning:</span> Trading foreign exchange, CFDs, and other leveraged products carries a high level of risk and may not be suitable for all investors. Past performance is not indicative of future results. This platform is a software tool — it does not provide investment advice.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center gap-3 pt-6 border-t border-trade-border/50">
          <p className="text-text-tertiary text-xs">
            © {currentYear} TradeForge. All rights reserved.
          </p>
          <p className="text-text-tertiary text-xs font-mono">
            v{APP_VERSION}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;