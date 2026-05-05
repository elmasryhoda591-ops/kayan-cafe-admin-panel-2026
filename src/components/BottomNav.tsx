import { Home, Coffee, User, PhoneCall, Image as ImageIcon } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function BottomNav() {
  const location = useLocation();
  
  const navItems = [
    { path: '/', icon: Home, label: 'الرئيسية' },
    { path: '/menu', icon: Coffee, label: 'المنيو' },
    { path: '/decor', icon: ImageIcon, label: 'ديكور المكان' },
    { path: '/admin', icon: User, label: 'حسابي' },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-analog-900 border-t border-analog-border pb-safe z-50">
      <div className="flex justify-around items-center h-16 px-2">
        {/* Regular Nav Items */}
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link 
              key={item.path} 
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full space-y-1 ${isActive ? 'text-analog-coral' : 'text-analog-muted hover:text-analog-light'} transition-colors`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[10px] font-mono tracking-wider uppercase whitespace-nowrap">{item.label}</span>
            </Link>
          );
        })}

        {/* Delivery Call Button */}
        <a 
          href="tel:01040144888"
          className="flex flex-col items-center justify-center flex-1 h-full space-y-1 text-analog-muted hover:text-green-500 transition-colors"
        >
          <PhoneCall size={20} strokeWidth={2} />
          <span className="text-[10px] font-mono tracking-wider uppercase whitespace-nowrap">دليفري</span>
        </a>
      </div>
    </div>
  );
}
