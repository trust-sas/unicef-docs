'use client'

import { useState, useEffect } from 'react'
// import Link from 'next/link';
import Image from 'next/image'
import { cn } from '@/lib/utils'

interface HeaderProps {
  onSearch: (searchTerm: string) => void
}

export default function Header({ onSearch }: HeaderProps) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isScrolled, setIsScrolled] = useState(false)
  const [showFixedBar, setShowFixedBar] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY
      const threshold = 200 // Position à partir de laquelle le header se masque

      if (scrollPosition > threshold) {
        setIsScrolled(true)
        // Petit délai pour une transition plus fluide
        setTimeout(() => setShowFixedBar(true), 100)
      } else {
        setShowFixedBar(false)
        setTimeout(() => setIsScrolled(false), 100)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleSearch = () => {
    onSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setSearchTerm(value)
    // Recherche en temps réel (optionnel)
    onSearch(value)
  }

  return (
    <>
      <header
        className={cn(
          'text-white shadow-lg relative overflow-hidden transition-all duration-500 ease-in-out',
          {
            'transform -translate-y-full opacity-0': isScrolled,
            'transform translate-y-0 opacity-100': !isScrolled,
          },
        )}
        style={{ backgroundColor: '#1CABE2' }}
      >
        {/* Image de fond pour toute la zone bleue - positionnée à droite */}
        <div className="absolute right-0 top-0 bottom-0 w-1/2 md:w-2/5 lg:w-2/3 opacity-30 overflow-hidden">
          <Image
            src="/des-enfants-africains-profitent-de-la-vie.jpg"
            alt="Header Background"
            fill
            className="object-cover object-right"
            style={{
              filter: 'brightness(1.3)',
              maskImage:
                'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
              WebkitMaskImage:
                'linear-gradient(to left, rgba(0,0,0,1) 0%, rgba(0,0,0,0.8) 30%, rgba(0,0,0,0.4) 70%, rgba(0,0,0,0) 100%)',
            }}
          />
        </div>

        {/* Top bar with UNICEF logo */}
        <TopBarUnicefLogo />

        {/* Main header */}
        <div className="py-8">
          <div className="container mx-auto px-4 relative z-10">
            <h1 className="text-5xl font-bold mb-6 text-center text-white leading-tight ">
              CAMEROON CHILD RIGHTS RESOURCE CENTER
            </h1>

            {/* Search bar - full width avec enhanced functionality */}
            <div className="w-full mb-6">
              <div className="relative max-w-full">
                <input
                  type="text"
                  placeholder="Rechercher des ressources, documents, articles..."
                  value={searchTerm}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyPress}
                  className="w-full px-6 py-4 rounded-xl text-gray-800 bg-white shadow-lg focus:outline-none focus:ring-4 focus:ring-white/30 text-lg"
                />
                <button
                  onClick={handleSearch}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 px-6 py-2 rounded-lg transition-colors duration-200 shadow-md hover:opacity-80"
                  style={{ backgroundColor: '#1CABE2' }}
                >
                  <svg
                    className="w-5 h-5 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-4.35-4.35M16.65 11.35a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z"
                    />
                  </svg>
                </button>

                {/* Clear search button */}
                {searchTerm && (
                  <button
                    onClick={() => {
                      setSearchTerm('')
                      onSearch('')
                    }}
                    className="absolute right-16 top-1/2 transform -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>

              {/* Search status indicator */}
              {searchTerm && (
                <div className="mt-2 text-white/80 text-sm">
                  <span className="bg-white/20 px-3 py-1 rounded-full">
                    🔍 Recherche active : &quot;{searchTerm}&quot;
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Navigation - full width with modern design */}

          {/* 
        <nav className="pb-2">
          <div className="w-full bg-white/10 backdrop-blur-sm rounded-xl px-6 py-4">
            <div className="flex flex-wrap items-center justify-between">
              <ul className="flex flex-wrap space-x-8">
                <li>
                  <Link href="/" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    Accueil
                  </Link>
                </li>
                <li>
                  <Link href="/apropos" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    À propos
                  </Link>
                </li>
                <li>
                  <Link href="/aide" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    Aide
                  </Link>
                </li>
                <li>
                  <Link href="/tutoriel" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    Tutoriel
                  </Link>
                </li>
                <li>
                  <Link href="/faq" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    FAQ
                  </Link>
                </li>
                <li>
                  <Link href="/contacts" className="hover:text-cyan-200 transition-colors duration-200 font-medium text-lg py-2 px-4 rounded-lg hover:bg-white/10">
                    Contacts
                  </Link>
                </li>
              </ul>
              

            </div>
          </div>
        </nav>
        */}
        </div>
      </header>

      <TopBarUnicefLogo
        isFixed
        showFixedBar={showFixedBar}
        searchTerm={searchTerm}
        onSearch={onSearch}
        onSearchChange={setSearchTerm}
      />
    </>
  )
}

type TopBarUnicefLogoProps = {
  isFixed?: boolean
  showFixedBar?: boolean
  searchTerm?: string
  onSearch?: (searchTerm: string) => void
  onSearchChange?: (searchTerm: string) => void
}

const TopBarUnicefLogo = ({
  isFixed = false,
  showFixedBar = false,
  searchTerm = '',
  onSearch,
  onSearchChange,
}: TopBarUnicefLogoProps) => {
  const [language, setLanguage] = useState('FR')

  const handleSearch = () => {
    if (onSearch) onSearch(searchTerm)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (onSearchChange) onSearchChange(value)
    if (onSearch) onSearch(value)
  }

  return (
    <div
      id="TopBar_Unicef_logo"
      className={cn('py-3 border-b border-white/20 z-50 transition-all duration-300 ease-in-out', {
        'fixed top-0 left-0 w-full bg-[#1cabe2] backdrop-blur-lg shadow-lg transform translate-y-0 opacity-100':
          isFixed && showFixedBar,
        'fixed top-0 left-0 w-full bg-[#1cabe2] backdrop-blur-lg transform -translate-y-full opacity-0 pointer-events-none':
          isFixed && !showFixedBar,
        relative: !isFixed,
      })}
    >
      <div className="flex justify-between items-center container mx-auto px-3">
        <div className="flex items-center space-x-3 -ml-10">
          <Image
            src="/logo_unicef_3.png"
            alt="UNICEF Logo"
            width={isFixed ? 300 : 400}
            height={isFixed ? 210 : 280}
            className="object-contain transition-all duration-300 ml-6"
          />
        </div>

        <div className="flex items-center space-x-3">
          {/* Search bar pour la barre fixe */}
          {isFixed && showFixedBar && (
            <div className="relative hidden lg:block">
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={handleInputChange}
                onKeyDown={handleKeyPress}
                className="w-64 px-4 py-2 rounded-lg text-gray-800 bg-white shadow-md focus:outline-none focus:ring-2 focus:ring-white/30 text-sm"
              />
              <button
                onClick={handleSearch}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 px-2 py-1 rounded-md transition-colors duration-200 hover:opacity-80"
                style={{ backgroundColor: '#1CABE2' }}
              >
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-4.35-4.35M16.65 11.35a5.65 5.65 0 11-11.3 0 5.65 5.65 0 0111.3 0z"
                  />
                </svg>
              </button>
            </div>
          )}

          <button
            className="flex items-center space-x-2 bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200 font-semibold text-sm hover:text-blue-500"
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#1CABE2')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = 'white')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
              />
            </svg>
            <span className="hidden sm:inline">Inscription</span>
          </button>
          <button
            className="flex items-center space-x-2 bg-transparent border-2 border-white text-white px-4 py-2 rounded-lg hover:bg-white transition-colors duration-200 font-semibold text-sm hover:text-blue-500"
            onMouseEnter={(e) => ((e.target as HTMLButtonElement).style.color = '#1CABE2')}
            onMouseLeave={(e) => ((e.target as HTMLButtonElement).style.color = 'white')}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
            <span className="hidden sm:inline">Connexion</span>
          </button>
          {/* Language selector */}
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-white border border-white/30 hover:bg-white/30 transition-colors duration-200 font-medium"
          >
            <option value="FR" className="text-gray-800">
              FR
            </option>
            <option value="EN" className="text-gray-800">
              EN
            </option>
          </select>
        </div>
      </div>
    </div>
  )
}
