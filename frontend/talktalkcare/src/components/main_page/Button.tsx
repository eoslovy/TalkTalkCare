import React from 'react';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary';
  className?: string;
}

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = '' 
}: ButtonProps) => {
  const baseStyles = "px-4 py-2 rounded-lg font-medium";
  const variantStyles = {
    primary: "bg-green-500 text-white hover:bg-green-600",
    secondary: "bg-gray-100 text-gray-800 hover:bg-gray-200"
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;