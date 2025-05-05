import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  title?: string;
  className?: string;
  footer?: ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  className = '',
  footer,
}) => {
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-xl shadow-lg overflow-hidden ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-800">
          <h3 className="text-lg font-medium text-white">{title}</h3>
        </div>
      )}
      <div className="px-6 py-4">{children}</div>
      {footer && (
        <div className="px-6 py-4 bg-gray-950 border-t border-gray-800">
          {footer}
        </div>
      )}
    </div>
  );
};

export default Card;
