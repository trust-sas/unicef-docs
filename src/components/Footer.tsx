import React from 'react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      {/* Langues officielles */}
      <div className="border-t border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-300">Langues disponibles:</span>
              <div className="flex gap-2">
                <button className="px-3 py-1 bg-gray-700 rounded-full text-sm font-medium hover:bg-gray-600 transition-colors">
                  Français
                </button>
                <button className="px-3 py-1 bg-gray-700/50 rounded-full text-sm hover:bg-gray-600 transition-colors">
                  English
                </button>
              </div>
            </div>
            <div className="flex items-center gap-4 text-sm text-gray-300">
              <a href="/confidentialite" className="hover:text-white transition-colors">Confidentialité</a>
              <span>•</span>
              <a href="/mentions-legales" className="hover:text-white transition-colors">Mentions légales</a>
              <span>•</span>
              <a href="/accessibilite" className="hover:text-white transition-colors">Accessibilité</a>
            </div>
          </div>
        </div>
      </div>

      {/* Barre finale */}
      <div className="bg-gray-950 border-t border-gray-800">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-2 text-sm">
            <p className="text-gray-400">
              © 2025 Centre de Ressources sur les Droits de l&#39;Enfant - Cameroun. Tous droits réservés.
            </p>
            <div className="flex items-center gap-2 text-gray-400">
              <span>Propulsé par</span>
              <span className="font-semibold text-blue-400">UNICEF Cameroun</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;