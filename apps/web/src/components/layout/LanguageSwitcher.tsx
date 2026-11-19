import { useI18n } from '@/i18n';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Globe, Check, ChevronDown } from 'lucide-react';
import type { SupportedLanguage } from '@ferreteria/shared';

export default function LanguageSwitcher() {
  const { currentLanguage, setLanguage, supportedLanguages, currentLanguageInfo, t } = useI18n();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="gap-2 border-indigo-200/90 bg-indigo-50/60 hover:bg-indigo-100 text-indigo-950 font-semibold shadow-xs transition-colors"
          title={t('header.switchLanguage')}
          aria-label={t('header.switchLanguage')}
        >
          <Globe className="h-4 w-4 text-indigo-700" />
          <span className="text-base leading-none">{currentLanguageInfo.flag}</span>
          <span className="text-xs font-bold text-indigo-900 hidden sm:inline">
            {currentLanguageInfo.nativeName}
          </span>
          <ChevronDown className="h-3 w-3 text-indigo-700 opacity-70" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
          <span>{t('header.language')}</span>
          <span className="text-[10px] font-mono uppercase">{currentLanguage}</span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {supportedLanguages.map((lang) => {
          const isSelected = currentLanguage === lang.code;
          return (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code as SupportedLanguage)}
              className="flex items-center justify-between py-2 cursor-pointer font-medium text-sm"
            >
              <div className="flex items-center gap-2.5">
                <span className="text-lg leading-none">{lang.flag}</span>
                <div className="flex flex-col">
                  <span className="font-semibold text-foreground text-xs leading-tight">
                    {lang.nativeName}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {lang.name} ({lang.code.toUpperCase()})
                  </span>
                </div>
              </div>
              {isSelected && <Check className="h-4 w-4 text-emerald-600 font-bold" />}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
