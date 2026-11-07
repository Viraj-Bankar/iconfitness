import React from 'react';
import {
  Dumbbell,
  Flame,
  Flower2,
  Sparkles,
  UserCheck,
  Activity,
  Maximize2,
  Layers,
  Apple,
  HeartHandshake,
  MapPin,
  Phone,
  Clock,
  Star,
  CheckCircle2,
  ArrowRight,
  ChevronRight,
  ChevronLeft,
  X,
  ExternalLink,
  MessageCircle,
  Menu,
  ShieldCheck,
  Sparkle,
  Compass
} from 'lucide-react';

interface IconHelperProps {
  name: string;
  className?: string;
}

export const IconHelper: React.FC<IconHelperProps> = ({ name, className = 'w-5 h-5' }) => {
  switch (name) {
    case 'Dumbbell':
      return <Dumbbell className={className} />;
    case 'Flame':
      return <Flame className={className} />;
    case 'Flower2':
      return <Flower2 className={className} />;
    case 'Sparkles':
      return <Sparkles className={className} />;
    case 'UserCheck':
      return <UserCheck className={className} />;
    case 'Activity':
      return <Activity className={className} />;
    case 'Maximize2':
      return <Maximize2 className={className} />;
    case 'Layers':
      return <Layers className={className} />;
    case 'Apple':
      return <Apple className={className} />;
    case 'HeartHandshake':
      return <HeartHandshake className={className} />;
    case 'MapPin':
      return <MapPin className={className} />;
    case 'Phone':
      return <Phone className={className} />;
    case 'Clock':
      return <Clock className={className} />;
    case 'Star':
      return <Star className={className} />;
    case 'CheckCircle2':
      return <CheckCircle2 className={className} />;
    case 'ArrowRight':
      return <ArrowRight className={className} />;
    case 'ChevronRight':
      return <ChevronRight className={className} />;
    case 'ChevronLeft':
      return <ChevronLeft className={className} />;
    case 'X':
      return <X className={className} />;
    case 'ExternalLink':
      return <ExternalLink className={className} />;
    case 'MessageCircle':
      return <MessageCircle className={className} />;
    case 'Menu':
      return <Menu className={className} />;
    case 'ShieldCheck':
      return <ShieldCheck className={className} />;
    case 'Sparkle':
      return <Sparkle className={className} />;
    case 'Compass':
      return <Compass className={className} />;
    default:
      return <Activity className={className} />;
  }
};

