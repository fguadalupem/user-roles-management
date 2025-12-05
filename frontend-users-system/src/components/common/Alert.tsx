// src/components/common/Alert.tsx
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

interface AlertProps {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  onClose?: () => void;
}

export default function Alert({ type, message, onClose }: AlertProps) {
  const config = {
    success: {
      icon: CheckCircle,
      bg: 'bg-qbit-green/10',
      border: 'border-qbit-green/20',
      text: 'text-qbit-green',
      iconBg: 'bg-qbit-green/20',
    },
    error: {
      icon: AlertCircle,
      bg: 'bg-red-50',
      border: 'border-red-200',
      text: 'text-red-600',
      iconBg: 'bg-red-100',
    },
    info: {
      icon: Info,
      bg: 'bg-qbit-blue/10',
      border: 'border-qbit-blue/20',
      text: 'text-qbit-blue',
      iconBg: 'bg-qbit-blue/20',
    },
    warning: {
      icon: AlertTriangle,
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      text: 'text-yellow-600',
      iconBg: 'bg-yellow-100',
    },
  };

  const { icon: Icon, bg, border, text, iconBg } = config[type];

  return (
    <div className={`${bg} border ${border} rounded-lg p-4 flex items-start space-x-3`}>
      <div className={`${iconBg} p-2 rounded-lg`}>
        <Icon className={`w-5 h-5 ${text}`} />
      </div>
      <div className="flex-1">
        <p className={`text-sm font-medium ${text}`}>{message}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className={`${text} hover:opacity-70`}>
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
