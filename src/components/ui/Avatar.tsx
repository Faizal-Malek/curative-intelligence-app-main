import { User } from 'lucide-react';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  email: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

function getInitials(name: string, email: string): string {
  if (name && name.trim()) {
    const parts = name.trim().split(/\s+/);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  }
  // Fallback to email
  return email.slice(0, 2).toUpperCase();
}

const sizeClasses = {
  sm: 'h-8 w-8 text-sm',
  md: 'h-12 w-12 text-lg',
  lg: 'h-16 w-16 text-xl',
  xl: 'h-20 w-20 text-2xl',
};

const iconSizes = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8',
  xl: 'h-10 w-10',
};

export function Avatar({ imageUrl, name, email, size = 'md', className = '' }: AvatarProps) {
  const sizeClass = sizeClasses[size];
  const iconSize = iconSizes[size];

  return (
    <div 
      className={`flex items-center justify-center rounded-2xl bg-gradient-to-br from-[#D2B193] to-[#B89B7B] shadow-lg overflow-hidden ${sizeClass} ${className}`}
      title={name || email}
    >
      {imageUrl ? (
        <img
          src={imageUrl}
          alt={name || email}
          className="h-full w-full object-cover"
          onError={(e) => {
            // Fallback to initials if image fails to load
            e.currentTarget.style.display = 'none';
          }}
        />
      ) : (
        <span className="font-semibold text-white select-none">
          {getInitials(name, email)}
        </span>
      )}
    </div>
  );
}
