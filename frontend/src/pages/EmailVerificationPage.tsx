import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/LoadingSpinner';

const EmailVerificationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [message, setMessage] = useState('Hold on while we verify your email...');

  useEffect(() => {
    const verifyEmail = async () => {
      const token = searchParams.get('token');

      if (!token) {
        setMessage('Invalid verification link. Redirecting to login...');
        setTimeout(() => navigate('/login'), 1000);
        return;
      }

      try {
        const response = await fetch(`/api/auth/verify-email?token=${token}`);
        const data = await response.json();

        if (response.ok && data.success) {
          setMessage('Verification complete. Redirecting to login...');
        } else {
          setMessage((data.message || 'Verification failed.') + ' Redirecting to login...');
        }
      } catch (error) {
        setMessage('An error occurred during verification. Redirecting to login...');
      } finally {
        setTimeout(() => navigate('/login'), 1000);
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full text-center">
        <LoadingSpinner size="lg" color="blue" text={message} />
      </div>
    </div>
  );
};

export default EmailVerificationPage;
