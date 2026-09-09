import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: {
          "welcome": "Welcome to Addis MESOB IMS",
          "login": "Login with Fayda ID",
          "dashboard": "Dashboard",
          "inventory": "Inventory",
          "requests": "Requests",
          "approvals": "Approvals",
          "dispatch": "Dispatch",
          "logout": "Logout",
          "role": "Role",
          "status": "Status",
          "actions": "Actions"
        }
      },
      am: {
        translation: {
          "welcome": "እንኳን ወደ አዲስ መሰብ IMS በደህና መጡ",
          "login": "በፋይዳ መታወቂያ ይግቡ",
          "dashboard": "ዳሽቦርድ",
          "inventory": "ንብረት",
          "requests": "ጥያቄዎች",
          "approvals": "ማጽደቆች",
          "dispatch": "ስርጭት",
          "logout": "ውጣ",
          "role": "ሚና",
          "status": "ሁኔታ",
          "actions": "ተግባራት"
        }
      }
    },
    lng: "en", // default language
    fallbackLng: "en",
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
