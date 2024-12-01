import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import classNames from 'classnames';

interface BackButtonProps {
  label?: string;
  className?: string;
  onClick?: () => void;
}

function BackButton({ label, className = '', onClick }: BackButtonProps) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      onClick={handleClick}
      className={classNames(
        "md:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900",
        className
      )}
    >
      <ArrowLeft className="h-5 w-5" />
      {label && <span className="text-sm font-medium">{label}</span>}
    </button>
  );
}

export default BackButton;