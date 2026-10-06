import { useAuthStore } from '@/stores/auth.store';
import { useAccessibilityStore } from '@/stores/accessibility.store';
import { useStores, useActiveStore } from '@/services/stores.service';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tag, Accessibility, Store as StoreIcon, Check, ChevronDown } from 'lucide-react';

interface HeaderProps {
  onOpenPriceCheck?: () => void;
}

export default function Header({ onOpenPriceCheck }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { openMenu } = useAccessibilityStore();
  const { data: stores = [] } = useStores();
  const { activeStore, changeStore } = useActiveStore();

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div className="flex items-center gap-3">
        {/* Store Switcher */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="gap-2 border-emerald-300/80 bg-emerald-50/60 hover:bg-emerald-100 text-emerald-950 font-semibold shadow-xs"
              title="Cambiar sucursal / tienda de trabajo"
            >
              <StoreIcon className="h-4 w-4 text-emerald-700" />
              <div className="flex items-center gap-1.5 text-xs text-left">
                <span className="font-bold text-emerald-900 truncate max-w-[140px]">
                  {activeStore ? activeStore.name : 'Sucursal'}
                </span>
                {activeStore && (
                  <span className="hidden sm:inline text-[10px] bg-emerald-200/80 text-emerald-800 px-1.5 py-0.2 rounded font-mono font-medium">
                    PV:{activeStore.posNumber || '0001'}
                  </span>
                )}
              </div>
              <ChevronDown className="h-3 w-3 text-emerald-700 opacity-70" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            <DropdownMenuLabel className="text-xs text-muted-foreground flex items-center justify-between">
              <span>Sucursales & Tiendas</span>
              <span className="text-[10px] font-mono">{stores.length} disponibles</span>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            {stores.map((s) => {
              const isSelected = activeStore?.id === s.id;
              return (
                <DropdownMenuItem
                  key={s.id}
                  onClick={() => changeStore(s.id)}
                  className="flex items-center justify-between py-2 cursor-pointer"
                >
                  <div className="flex flex-col">
                    <span className="font-semibold text-sm flex items-center gap-1.5">
                      {s.name}
                      {s.isMain && (
                        <span className="text-[9px] bg-primary/10 text-primary px-1 rounded font-bold">
                          Central
                        </span>
                      )}
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {s.code} • PV {s.posNumber || '0001'}
                    </span>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-emerald-600 font-bold" />}
                </DropdownMenuItem>
              );
            })}
          </DropdownMenuContent>
        </DropdownMenu>

        {onOpenPriceCheck && (
          <Button
            variant="outline"
            size="sm"
            onClick={onOpenPriceCheck}
            className="bg-amber-50 hover:bg-amber-100 text-amber-950 border-amber-300 font-semibold gap-2 shadow-xs transition-colors"
          >
            <Tag className="h-4 w-4 text-amber-700" />
            <span className="hidden sm:inline">Consultar Precio</span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-black bg-amber-200 text-amber-900 rounded border border-amber-400">
              F3
            </kbd>
          </Button>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={openMenu}
          aria-label="Abrir panel de opciones de accesibilidad (Alt + A)"
          className="bg-blue-50/70 hover:bg-blue-100 text-blue-950 border-blue-200 font-semibold gap-2 shadow-xs transition-colors"
          title="Accesibilidad (Alt + A)"
        >
          <Accessibility className="h-4 w-4 text-blue-700" />
          <span className="hidden md:inline">Accesibilidad</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-bold bg-blue-100 text-blue-900 rounded border border-blue-300">
            Alt+A
          </kbd>
        </Button>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right hidden sm:block">
          <div className="text-xs font-bold text-foreground leading-none">{user?.name || 'Administrador'}</div>
          <div className="text-[10px] text-muted-foreground font-mono mt-0.5">{user?.email || 'admin@ferreteria.local'}</div>
        </div>
        <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full border bg-primary/10 text-primary border-primary/20">
          {user?.role || 'ADMIN'}
        </span>
        <Button variant="outline" size="sm" onClick={logout} className="text-xs">
          Cerrar Sesión
        </Button>
      </div>
    </header>
  );
}


