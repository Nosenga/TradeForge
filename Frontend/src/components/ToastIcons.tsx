import React from 'react';
import { CheckCircle, XCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastSuccess = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3">
    <CheckCircle className="w-5 h-5 text-trade-green" />
    <span>{message}</span>
  </div>
);

export const ToastError = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3">
    <XCircle className="w-5 h-5 text-trade-red" />
    <span>{message}</span>
  </div>
);

export const ToastInfo = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3">
    <Info className="w-5 h-5 text-trade-blue" />
    <span>{message}</span>
  </div>
);

export const ToastWarning = ({ message }: { message: string }) => (
  <div className="flex items-center gap-3">
    <AlertTriangle className="w-5 h-5 text-trade-yellow" />
    <span>{message}</span>
  </div>
);