import React from 'react';

interface ComplianceWarningProps {
  complianceLevel?: string;
  communicationScore?: number;
  className?: string;
  showDetails?: boolean;
}

const ComplianceWarning: React.FC<ComplianceWarningProps> = ({ 
  complianceLevel, 
  communicationScore = 0,
  className = '',
  showDetails = false
}) => {
  if (!complianceLevel || complianceLevel.toLowerCase() === 'verified') {
    return null;
  }

  const getWarningConfig = (level: string, score: number) => {
    switch (level.toLowerCase()) {
      case 'unlikely':
        return {
          type: 'error',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-red-50 border-red-200',
          textColor: 'text-red-800',
          iconColor: 'text-red-500',
          title: 'Low Platform Integration',
          message: score === 0 
            ? 'This agent has not been analyzed for platform compatibility.'
            : `This agent shows minimal platform integration patterns (Score: ${score}/100).`,
          recommendation: 'Use with caution. This agent may have limited functionality with platform features.'
        };
      case 'likely':
        return {
          type: 'warning',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ),
          bgColor: 'bg-amber-50 border-amber-200',
          textColor: 'text-amber-800',
          iconColor: 'text-amber-500',
          title: 'Moderate Platform Integration',
          message: `This agent shows some platform integration patterns (Score: ${score}/100).`,
          recommendation: 'Review functionality before use. Some platform features may work partially.'
        };
      default:
        return null;
    }
  };

  const config = getWarningConfig(complianceLevel, communicationScore);
  if (!config) return null;

  return (
    <div className={`${config.bgColor} border rounded-lg p-4 ${className}`}>
      <div className="flex">
        <div className={`flex-shrink-0 ${config.iconColor}`}>
          {config.icon}
        </div>
        <div className="ml-3 flex-1">
          <h3 className={`text-sm font-medium ${config.textColor}`}>
            {config.title}
          </h3>
          <div className={`mt-2 text-sm ${config.textColor}`}>
            <p>{config.message}</p>
            {showDetails && (
              <p className="mt-1 font-medium">{config.recommendation}</p>
            )}
          </div>
          {showDetails && communicationScore > 0 && (
            <div className="mt-3">
              <div className="flex items-center justify-between text-xs mb-1">
                <span className={config.textColor}>Platform Integration Score</span>
                <span className={`font-medium ${config.textColor}`}>{communicationScore}/100</span>
              </div>
              <div className="w-full bg-white/50 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${
                    communicationScore >= 80 ? 'bg-green-500' :
                    communicationScore >= 40 ? 'bg-amber-500' : 'bg-red-500'
                  }`}
                  style={{ width: `${Math.max(communicationScore, 5)}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ComplianceWarning;