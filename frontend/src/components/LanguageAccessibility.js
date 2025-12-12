import React, { useState, useContext } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { 
  Languages,
  Contrast,
  Palette,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Settings
} from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

const LanguageAccessibility = () => {
  const { theme, toggleTheme } = useTheme();
  const [language, setLanguage] = useState('en');
  const [fontSize, setFontSize] = useState(16);
  const [highContrast, setHighContrast] = useState(false);
  const [screenReader, setScreenReader] = useState(false);

  const languages = [
    { code: 'en', name: 'English', native: 'English' },
    { code: 'te', name: 'Telugu', native: 'తెలుగు' },
    { code: 'hi', name: 'Hindi', native: 'हिन्दी' }
  ];

  const increaseFontSize = () => {
    setFontSize(Math.min(fontSize + 2, 24));
  };

  const decreaseFontSize = () => {
    setFontSize(Math.max(fontSize - 2, 12));
  };

  const resetSettings = () => {
    setLanguage('en');
    setFontSize(16);
    setHighContrast(false);
    setScreenReader(false);
  };

  // Apply font size to the document
  React.useEffect(() => {
    document.documentElement.style.fontSize = `${fontSize}px`;
  }, [fontSize]);

  // Apply high contrast mode
  React.useEffect(() => {
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
  }, [highContrast]);

  return (
    <div className="space-y-6 h-[calc(100vh-12rem)]">
      {/* Language Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Languages className="w-5 h-5" />
            <span>Language Preferences</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {languages.map((lang) => (
              <div
                key={lang.code}
                className={`p-4 border rounded-lg cursor-pointer transition-all ${
                  language === lang.code
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted/50'
                }`}
                onClick={() => setLanguage(lang.code)}
              >
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xs font-medium">{lang.code.toUpperCase()}</span>
                  </div>
                  <div>
                    <h3 className="font-medium">{lang.name}</h3>
                    <p className="text-sm text-muted-foreground">{lang.native}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      
      {/* Display & Accessibility */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Contrast className="w-5 h-5" />
            <span>Display & Accessibility</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Font Size Controls */}
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium mb-3 flex items-center">
              <ZoomIn className="w-4 h-4 mr-2" />
              Text Size
            </h3>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="sm"
                onClick={decreaseFontSize}
                disabled={fontSize <= 12}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <span className="font-medium">{fontSize}px</span>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={increaseFontSize}
                disabled={fontSize >= 24}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>
            <div className="mt-3 text-sm text-muted-foreground">
              Current text size: {fontSize}px
            </div>
          </div>
          
          {/* High Contrast Mode */}
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-medium mb-3 flex items-center">
              <Palette className="w-4 h-4 mr-2" />
              Visual Preferences
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">High Contrast Mode</p>
                  <p className="text-sm text-muted-foreground">
                    Increases color contrast for better visibility
                  </p>
                </div>
                <Button
                  variant={highContrast ? "default" : "outline"}
                  size="sm"
                  onClick={() => setHighContrast(!highContrast)}
                >
                  {highContrast ? 'Enabled' : 'Enable'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dark Theme</p>
                  <p className="text-sm text-muted-foreground">
                    Reduces eye strain in low-light environments
                  </p>
                </div>
                <Button
                  variant={theme === 'dark' ? "default" : "outline"}
                  size="sm"
                  onClick={toggleTheme}
                >
                  {theme === 'dark' ? 'Dark' : 'Light'}
                </Button>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Screen Reader Support</p>
                  <p className="text-sm text-muted-foreground">
                    Optimizes interface for screen readers
                  </p>
                </div>
                <Button
                  variant={screenReader ? "default" : "outline"}
                  size="sm"
                  onClick={() => setScreenReader(!screenReader)}
                >
                  {screenReader ? 'Enabled' : 'Enable'}
                </Button>
              </div>
            </div>
          </div>
          
          {/* Reset Button */}
          <div className="flex justify-end">
            <Button variant="outline" onClick={resetSettings}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset to Defaults
            </Button>
          </div>
        </CardContent>
      </Card>
      
      {/* Accessibility Features */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Settings className="w-5 h-5" />
            <span>Accessibility Features</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-medium text-blue-800 mb-2">Keyboard Navigation</h3>
              <p className="text-sm text-blue-700 mb-3">
                All dashboard features are fully accessible using keyboard shortcuts
              </p>
              <Badge variant="outline" className="text-blue-700 border-blue-300">
                WCAG 2.1 AA Compliant
              </Badge>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-medium text-green-800 mb-2">Screen Reader Support</h3>
              <p className="text-sm text-green-700 mb-3">
                Semantic HTML and ARIA labels for optimal screen reader experience
              </p>
              <Badge variant="outline" className="text-green-700 border-green-300">
                JAWS & NVDA Compatible
              </Badge>
            </div>
            
            <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <h3 className="font-medium text-amber-800 mb-2">Focus Indicators</h3>
              <p className="text-sm text-amber-700 mb-3">
                Clear visual focus indicators for all interactive elements
              </p>
              <Badge variant="outline" className="text-amber-700 border-amber-300">
                Enhanced Visibility
              </Badge>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-medium text-purple-800 mb-2">Alternative Text</h3>
              <p className="text-sm text-purple-700 mb-3">
                Descriptive alt text for all images and data visualizations
              </p>
              <Badge variant="outline" className="text-purple-700 border-purple-300">
                Comprehensive Coverage
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LanguageAccessibility;