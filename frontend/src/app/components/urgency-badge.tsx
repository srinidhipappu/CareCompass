import { cn } from '../components/ui/utils';

interface UrgencyBadgeProps {
  level: 'mild' | 'urgent' | 'emergency';
  className?: string;
}

export function UrgencyBadge({ level, className }: UrgencyBadgeProps) {
  const variants = {
    mild: 'bg-green-100 text-green-700 border-green-200',
    urgent: 'bg-orange-100 text-orange-700 border-orange-200',
    emergency: 'bg-red-100 text-red-700 border-red-200',
  };

  const labels = {
    mild: 'Mild',
    urgent: 'Urgent',
    emergency: 'Emergency',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-4 py-1.5 rounded-full text-sm font-medium border',
        variants[level],
        className
      )}
    >
      {labels[level]}
    </span>
  );
}
