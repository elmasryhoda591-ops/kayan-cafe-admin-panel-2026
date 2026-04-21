import { Home, Coffee, User } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/menu', icon: Coffee, label: 'المنيو' },
    { path: '/admin', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-analog-900 border-t border-analog-border pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center w-full h-full space-y-1 ${isActive ? 'text-analog-coral' : 'text-analog-muted hover:text-analog-light'} transition-colors`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-mono tracking-wider uppercase">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
