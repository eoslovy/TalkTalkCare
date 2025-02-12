import React from 'react';

interface MenuItemProps {
  icon: React.ElementType;
  text?: string;
}

const MenuItem = ({ icon: Icon, text }: MenuItemProps) => (
  <div className="bg-green-100 rounded-xl p-6 flex flex-col items-center justify-center hover:bg-green-200 cursor-pointer transition-colors">
    <Icon className="w-8 h-8 mb-2" />
    {text && <span className="text-sm font-medium">{text}</span>}
  </div>
);

export default MenuItem;