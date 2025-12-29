import { Bell, BellOff, BellRing, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import usePushNotifications from '@/hooks/usePushNotifications';
import { motion, AnimatePresence } from 'framer-motion';

interface NotificationButtonProps {
  variant?: 'icon' | 'full';
  className?: string;
}

const NotificationButton = ({ variant = 'icon', className = '' }: NotificationButtonProps) => {
  const { isSupported, permission, isLoading, requestPermission } = usePushNotifications();

  // Don't render if not supported
  if (!isSupported) {
    return null;
  }

  const getIcon = () => {
    if (isLoading) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }
    
    switch (permission) {
      case 'granted':
        return <BellRing className="w-4 h-4" />;
      case 'denied':
        return <BellOff className="w-4 h-4" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const getTooltipText = () => {
    switch (permission) {
      case 'granted':
        return 'Notifications activées';
      case 'denied':
        return 'Notifications bloquées';
      default:
        return 'Activer les notifications';
    }
  };

  const isDisabled = permission === 'granted' || permission === 'denied' || isLoading;

  if (variant === 'icon') {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
          >
            <Button
              variant="ghost"
              size="icon"
              onClick={requestPermission}
              disabled={isDisabled}
              className={`relative ${className}`}
              aria-label={getTooltipText()}
            >
              {getIcon()}
              <AnimatePresence>
                {permission === 'default' && !isLoading && (
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    className="absolute -top-1 -right-1 w-2 h-2 bg-primary rounded-full"
                  />
                )}
              </AnimatePresence>
            </Button>
          </motion.div>
        </TooltipTrigger>
        <TooltipContent>
          <p>{getTooltipText()}</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  // Full button variant
  return (
    <Button
      variant={permission === 'granted' ? 'secondary' : 'default'}
      onClick={requestPermission}
      disabled={isDisabled}
      className={className}
    >
      {getIcon()}
      <span className="ml-2">
        {permission === 'granted' 
          ? 'Notifications activées' 
          : permission === 'denied'
          ? 'Notifications bloquées'
          : 'Activer les notifications'}
      </span>
    </Button>
  );
};

export default NotificationButton;
