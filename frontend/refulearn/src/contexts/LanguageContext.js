// DEPRECATED: This file is no longer used. The app now uses react-i18next for i18n. You can safely delete this file.
import React, { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  en: {
    welcome: 'Welcome to RefuLearn',
    empowering: 'Empowering refugees through education',
    continue: 'Continue',
    loading: 'Loading...',
    error: 'Error',
    success: 'Success',
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    edit: 'Edit',
    view: 'View',
    search: 'Search',
    filter: 'Filter',
    sort: 'Sort',
    next: 'Next',
    previous: 'Previous',
    submit: 'Submit',
    back: 'Back',
    close: 'Close',
    open: 'Open',
    yes: 'Yes',
    no: 'No',
    ok: 'OK',
    confirm: 'Confirm',
    dashboard: 'Dashboard',
    profile: 'Profile',
    settings: 'Settings',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    courses: 'Courses',
    jobs: 'Jobs',
    assessments: 'Assessments',
    certificates: 'Certificates',
    help: 'Help',
    scholarships: 'Scholarships',
    peerLearning: 'Peer Learning',
    notifications: 'Notifications',
    messages: 'Messages',
    language: 'Language',
    english: 'English',
    kinyarwanda: 'Kinyarwanda',
    french: 'French',
    swahili: 'Swahili'
  },
  rw: {
    welcome: 'Murakaza neza kuri RefuLearn',
    empowering: 'Gufasha abimukira binyuze mu masomo',
    continue: 'Komeza',
    loading: 'Birakora...',
    error: 'Ikibazo',
    success: 'Intsinzi',
    save: 'Bika',
    cancel: 'Hagarika',
    delete: 'Siba',
    edit: 'Hindura',
    view: 'Reba',
    search: 'Shakisha',
    filter: 'Shungura',
    sort: 'Shungura',
    next: 'Ibikurikira',
    previous: 'Ibanza',
    submit: 'Ohereza',
    back: 'Subira inyuma',
    close: 'Funga',
    open: 'Fungura',
    yes: 'Yego',
    no: 'Oya',
    ok: 'Sawa',
    confirm: 'Emeza',
    dashboard: 'Ikibaho',
    profile: 'Imyirondoro',
    settings: 'Igenamiterere',
    logout: 'Sohoka',
    login: 'Injira',
    register: 'Iyandikishe',
    courses: 'Amasomo',
    jobs: 'Akazi',
    assessments: 'Ibizamini',
    certificates: 'Impamyabumenyi',
    help: 'Ubufasha',
    scholarships: 'Ubwishingizi',
    peerLearning: 'Kwiga hamwe',
    notifications: 'Imenyesha',
    messages: 'Ubutumwa',
    language: 'Ururimi',
    english: 'Icyongereza',
    kinyarwanda: 'Ikinyarwanda',
    french: 'Igifaransa',
    swahili: 'Igiswahili'
  },
  fr: {
    welcome: 'Bienvenue sur RefuLearn',
    empowering: 'Autonomiser les réfugiés par l\'éducation',
    continue: 'Continuer',
    loading: 'Chargement...',
    error: 'Erreur',
    success: 'Succès',
    save: 'Enregistrer',
    cancel: 'Annuler',
    delete: 'Supprimer',
    edit: 'Modifier',
    view: 'Voir',
    search: 'Rechercher',
    filter: 'Filtrer',
    sort: 'Trier',
    next: 'Suivant',
    previous: 'Précédent',
    submit: 'Soumettre',
    back: 'Retour',
    close: 'Fermer',
    open: 'Ouvrir',
    yes: 'Oui',
    no: 'Non',
    ok: 'OK',
    confirm: 'Confirmer',
    dashboard: 'Tableau de bord',
    profile: 'Profil',
    settings: 'Paramètres',
    logout: 'Déconnexion',
    login: 'Connexion',
    register: 'S\'inscrire',
    courses: 'Cours',
    jobs: 'Emplois',
    assessments: 'Évaluations',
    certificates: 'Certificats',
    help: 'Aide',
    scholarships: 'Bourses',
    peerLearning: 'Apprentissage par les pairs',
    notifications: 'Notifications',
    messages: 'Messages',
    language: 'Langue',
    english: 'Anglais',
    kinyarwanda: 'Kinyarwanda',
    french: 'Français',
    swahili: 'Swahili'
  },
  sw: {
    welcome: 'Karibu kwenye RefuLearn',
    empowering: 'Kuwawezesha wakimbizi kupitia elimu',
    continue: 'Endelea',
    loading: 'Inapakia...',
    error: 'Hitilafu',
    success: 'Mafanikio',
    save: 'Hifadhi',
    cancel: 'Ghairi',
    delete: 'Futa',
    edit: 'Hariri',
    view: 'Tazama',
    search: 'Tafuta',
    filter: 'Chuja',
    sort: 'Panga',
    next: 'Ifuatayo',
    previous: 'Iliyotangulia',
    submit: 'Wasilisha',
    back: 'Rudi nyuma',
    close: 'Funga',
    open: 'Fungua',
    yes: 'Ndiyo',
    no: 'Hapana',
    ok: 'Sawa',
    confirm: 'Thibitisha',
    dashboard: 'Jopo la udhibiti',
    profile: 'Wasifu',
    settings: 'Mipangilio',
    logout: 'Ondoka',
    login: 'Ingia',
    register: 'Jisajili',
    courses: 'Kozi',
    jobs: 'Kazi',
    assessments: 'Tathmini',
    certificates: 'Vyeti',
    help: 'Msaada',
    scholarships: 'Mikopo',
    peerLearning: 'Kujifunza na wenzake',
    notifications: 'Arifa',
    messages: 'Ujumbe',
    language: 'Lugha',
    english: 'Kiingereza',
    kinyarwanda: 'Kinyarwanda',
    french: 'Kifaransa',
    swahili: 'Kiswahili'
  }
};

const supportedLanguages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'rw', name: 'Kinyarwanda', nativeName: 'Ikinyarwanda' },
  { code: 'fr', name: 'French', nativeName: 'Français' },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili' }
];

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    return localStorage.getItem('language') || 'en';
  });

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    // Save language preference
    localStorage.setItem('language', currentLanguage);

    // Update document language
    document.documentElement.lang = currentLanguage;

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [currentLanguage]);

  const t = (key, params = {}) => {
    let translation = translations[currentLanguage]?.[key] || translations.en[key] || key;
    
    // Replace parameters
    Object.keys(params).forEach(param => {
      translation = translation.replace(`{{${param}}}`, params[param]);
    });
    
    return translation;
  };

  const changeLanguage = (languageCode) => {
    if (translations[languageCode]) {
      setCurrentLanguage(languageCode);
    }
  };

  const getCurrentLanguage = () => {
    return supportedLanguages.find(lang => lang.code === currentLanguage);
  };

  const value = {
    currentLanguage,
    changeLanguage,
    t,
    isOnline,
    supportedLanguages,
    getCurrentLanguage
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
}; 