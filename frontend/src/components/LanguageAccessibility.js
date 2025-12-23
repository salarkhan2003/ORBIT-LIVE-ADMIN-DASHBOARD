/**
 * APSRTC Control Room - Language & Accessibility
 * Multi-language support and accessibility settings
 */

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Label } from './ui/label';
import {
  Languages,
  Volume2,
  Eye,
  Type,
  Palette,
  Moon,
  Sun,
  CheckCircle2,
  Globe,
  Accessibility,
  RefreshCw
} from 'lucide-react';
import { db } from '../lib/firebase';
import { ref, onValue, set } from 'firebase/database';
import { useTheme } from '../contexts/ThemeContext';

const LanguageAccessibility = () => {
  const { theme, toggleTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState({
    language: 'en',
    fontSize: 'medium',
    contrast: 'normal',
    textToSpeech: false,
    reducedMotion: false,
    screenReader: false
  });

  // Available languages
  const languages = [
    { code: 'en', name: 'English', native: 'English', flag: '🇬🇧' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు', flag: '🇮🇳' },
    { code: 'hi', name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
    { code: 'ta', name: 'Tamil', native: 'தமிழ்', flag: '🇮🇳' },
    { code: 'kn', name: 'Kannada', native: 'ಕನ್ನಡ', flag: '🇮🇳' },
    { code: 'ml', name: 'Malayalam', native: 'മലയാളം', flag: '🇮🇳' }
  ];

  // Sample translations
  const translations = {
    en: {
      welcome: 'Welcome to APSRTC Control Room',
      dashboard: 'Dashboard',
      operations: 'Operations Map',
      routes: 'Route Management',
      fleet: 'Fleet Management'
    },
    te: {
      welcome: 'APSRTC కంట్రోల్ రూమ్‌కు స్వాగతం',
      dashboard: 'డాష్‌బోర్డ్',
      operations: 'ఆపరేషన్స్ మ్యాప్',
      routes: 'రూట్ మేనేజ్‌మెంట్',
      fleet: 'ఫ్లీట్ మేనేజ్‌మెంట్'
    },
    hi: {
      welcome: 'APSRTC कंट्रोल रूम में आपका स्वागत है',
      dashboard: 'डैशबोर्ड',
      operations: 'ऑपरेशंस मैप',
      routes: 'रूट प्रबंधन',
      fleet: 'फ्लीट प्रबंधन'
    }
  };

  // Font size options
  const fontSizes = [
    { value: 'small', label: 'Small', size: '14px' },
    { value: 'medium', label: 'Medium', size: '16px' },
    { value: 'large', label: 'Large', size: '18px' },
    { value: 'xlarge', label: 'Extra Large', size: '20px' }
  ];

  // Contrast options
  const contrastOptions = [
    { value: 'normal', label: 'Normal', description: 'Standard colors' },
    { value: 'high', label: 'High Contrast', description: 'Enhanced visibility' },
    { value: 'dark', label: 'Dark Mode', description: 'Dark background' }
  ];

  // Load settings from Firebase
  useEffect(() => {
    const settingsRef = ref(db, 'accessibility_settings');
    
    const unsubscribe = onValue(settingsRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setSettings(data);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Save settings
  const saveSettings = async (newSettings) => {
    try {
      await set(ref(db, 'accessibility_settings'), newSettings);
      setSettings(newSettings);
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  // Update individual setting
  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    saveSettings(newSettings);
  };

  // Text to speech
  const speakText = (text) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = settings.language === 'te' ? 'te-IN' : 
                       settings.language === 'hi' ? 'hi-IN' : 'en-US';
      speechSynthesis.speak(utterance);
    }
  };

  // Get current translation
  const t = (key) => {
    return translations[settings.language]?.[key] || translations.en[key] || key;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-1">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Accessibility className="w-7 h-7 text-blue-500" />
            Language & Accessibility
          </h2>
          <p className="text-muted-foreground">Configure language preferences and accessibility options</p>
        </div>
      </div>

      {/* Language Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-blue-500" />
            Language Selection
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`p-4 rounded-xl border-2 cursor-pointer transition-all text-center ${
                  settings.language === lang.code
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
                onClick={() => updateSetting('language', lang.code)}
              >
                <span className="text-3xl">{lang.flag}</span>
                <p className="font-medium mt-2">{lang.name}</p>
                <p className="text-sm text-muted-foreground">{lang.native}</p>
                {settings.language === lang.code && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 mx-auto mt-2" />
                )}
              </div>
            ))}
          </div>

          {/* Translation Preview */}
          <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
            <h4 className="font-medium mb-3">Translation Preview</h4>
            <div className="grid grid-cols-2 gap-2">
              {Object.entries(translations[settings.language] || translations.en).map(([key, value]) => (
                <div key={key} className="flex items-center justify-between p-2 bg-white dark:bg-slate-700 rounded">
                  <span className="text-xs text-muted-foreground">{key}:</span>
                  <span className="text-sm font-medium">{value}</span>
                  {settings.textToSpeech && (
                    <Button variant="ghost" size="sm" onClick={() => speakText(value)}>
                      <Volume2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility Settings */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Font Size */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="w-5 h-5 text-purple-500" />
              Font Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-2">
              {fontSizes.map((size) => (
                <Button
                  key={size.value}
                  variant={settings.fontSize === size.value ? 'default' : 'outline'}
                  className="h-auto py-4 flex-col"
                  onClick={() => updateSetting('fontSize', size.value)}
                >
                  <span style={{ fontSize: size.size }}>Aa</span>
                  <span className="text-xs mt-1">{size.label}</span>
                </Button>
              ))}
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Current font size: <strong>{fontSizes.find(f => f.value === settings.fontSize)?.size}</strong>
            </p>
          </CardContent>
        </Card>

        {/* Contrast & Theme */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-amber-500" />
              Display Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                {theme === 'light' ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-blue-500" />}
                <div>
                  <p className="font-medium">Dark Mode</p>
                  <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
                </div>
              </div>
              <Button variant="outline" onClick={toggleTheme}>
                {theme === 'light' ? 'Enable' : 'Disable'}
              </Button>
            </div>

            <div className="space-y-2">
              <Label>Contrast Level</Label>
              <div className="grid grid-cols-3 gap-2">
                {contrastOptions.map((option) => (
                  <Button
                    key={option.value}
                    variant={settings.contrast === option.value ? 'default' : 'outline'}
                    className="h-auto py-3 flex-col"
                    onClick={() => updateSetting('contrast', option.value)}
                  >
                    <span>{option.label}</span>
                    <span className="text-xs mt-1 opacity-70">{option.description}</span>
                  </Button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Audio Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume2 className="w-5 h-5 text-green-500" />
              Audio & Speech
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="w-5 h-5" />
                <div>
                  <p className="font-medium">Text-to-Speech</p>
                  <p className="text-sm text-muted-foreground">Read content aloud</p>
                </div>
              </div>
              <Button 
                variant={settings.textToSpeech ? 'default' : 'outline'}
                onClick={() => updateSetting('textToSpeech', !settings.textToSpeech)}
              >
                {settings.textToSpeech ? 'On' : 'Off'}
              </Button>
            </div>

            {settings.textToSpeech && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm text-green-700 mb-2">Text-to-Speech is enabled</p>
                <Button
                  size="sm"
                  onClick={() => speakText(t('welcome'))}
                  className="gap-2"
                >
                  <Volume2 className="w-4 h-4" />
                  Test Speech
                </Button>
              </div>
            )}

            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Eye className="w-5 h-5" />
                <div>
                  <p className="font-medium">Screen Reader Support</p>
                  <p className="text-sm text-muted-foreground">Enhanced ARIA labels</p>
                </div>
              </div>
              <Button 
                variant={settings.screenReader ? 'default' : 'outline'}
                onClick={() => updateSetting('screenReader', !settings.screenReader)}
              >
                {settings.screenReader ? 'On' : 'Off'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Motion & Animation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="w-5 h-5 text-red-500" />
              Motion & Animation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-6 h-6 rounded-full ${!settings.reducedMotion ? 'animate-pulse' : ''} bg-blue-500`} />
                <div>
                  <p className="font-medium">Reduced Motion</p>
                  <p className="text-sm text-muted-foreground">Minimize animations and transitions</p>
                </div>
              </div>
              <Button 
                variant={settings.reducedMotion ? 'default' : 'outline'}
                onClick={() => updateSetting('reducedMotion', !settings.reducedMotion)}
              >
                {settings.reducedMotion ? 'On' : 'Off'}
              </Button>
            </div>

            {settings.reducedMotion && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-700">
                  ⚠️ Reduced motion is enabled. Animations and transitions will be minimized.
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Access Shortcuts */}
      <Card>
        <CardHeader>
          <CardTitle>Keyboard Shortcuts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { keys: 'Alt + 1', action: 'Dashboard' },
              { keys: 'Alt + 2', action: 'Operations Map' },
              { keys: 'Alt + M', action: 'Toggle Menu' },
              { keys: 'Alt + D', action: 'Toggle Dark Mode' },
              { keys: 'Alt + S', action: 'Search' },
              { keys: 'Ctrl + +', action: 'Zoom In' },
              { keys: 'Ctrl + -', action: 'Zoom Out' },
              { keys: 'Esc', action: 'Close Modal' }
            ].map((shortcut, idx) => (
              <div key={idx} className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                <Badge variant="outline" className="font-mono mb-2">{shortcut.keys}</Badge>
                <p className="text-sm">{shortcut.action}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageAccessibility;

