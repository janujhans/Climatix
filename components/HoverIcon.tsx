import React from 'react';
import { LucideProps } from 'lucide-react';

interface HoverIconProps extends LucideProps {
  icon: React.ElementType;
  /**
   * If true, the icon is always filled.
   * If false/undefined, it fills on hover.
   */
  active?: boolean; 
}

/**
 * A wrapper for Lucide icons that adds a smooth "Outline -> Filled" animation on hover.
 * Fills with purple color.
 */
const HoverIcon: React.FC<HoverIconProps> = ({ icon: Icon, active, className = '', ...props }) => {
  return (
    <Icon
      {...props}
      className={`transition-all duration-150 ease-out ${
        active 
          ? 'fill-purple-500 dark:fill-purple-400' 
          : 'fill-transparent hover:fill-purple-500 dark:hover:fill-purple-400 group-hover:fill-purple-500 dark:group-hover:fill-purple-400'
      } ${className}`}
    />
  );
};

export default HoverIcon;