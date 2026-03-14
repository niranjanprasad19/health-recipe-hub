import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { supportedLanguages } from '@/i18n';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

export const LanguageSelector = () => {
  const { i18n } = useTranslation();
  const { user } = useAuth();

  const changeLanguage = async (langCode: string) => {
    i18n.changeLanguage(langCode);
    localStorage.setItem('i18nextLng', langCode);

    if (user) {
      await supabase
        .from('profiles')
        .update({ preferred_language: langCode } as any)
        .eq('user_id', user.id);
    }
  };

  const currentLang = supportedLanguages.find(l => l.code === i18n.language) || supportedLanguages[0];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-1.5">
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline text-xs">{currentLang.nativeName}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto">
        {supportedLanguages.map((lang) => (
          <DropdownMenuItem
            key={lang.code}
            onClick={() => changeLanguage(lang.code)}
            className={i18n.language === lang.code ? 'bg-primary/10 text-primary' : ''}
          >
            <span className="font-medium">{lang.nativeName}</span>
            <span className="ml-2 text-muted-foreground text-xs">{lang.name}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
