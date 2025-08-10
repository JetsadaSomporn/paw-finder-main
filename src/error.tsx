import { AlertTriangle } from 'lucide-react';
import React from 'react';
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

const ErrorPage: React.FC = () => {
  const error = useRouteError();
  let errorMessage: string;
  let errorStatus: number | undefined;

  if (isRouteErrorResponse(error)) {
    errorMessage = error.data?.message || error.statusText;
    errorStatus = error.status;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === 'string') {
    errorMessage = error;
  } else {
    console.error("Unknown error type:", error);
    errorMessage = 'An unexpected error occurred.';
  }

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-background p-4 text-center"
      style={{ fontFamily: 'Rounded Sans Serif, sans-serif' }}
    >
      <div className="bg-white p-10 rounded-2xl shadow-lg max-w-lg w-full">
        <div className="flex justify-center mb-6">
          <div className="bg-red-100 p-4 rounded-full">
            <AlertTriangle className="h-12 w-12 text-red-500" />
          </div>
        </div>
        <h1 className="text-4xl font-bold text-textPrimary mb-2">
          {errorStatus ? `${errorStatus} Error` : 'เกิดข้อผิดพลาด'}
        </h1>
        <p className="text-lg text-textSecondary mb-6">
          ขออภัย, เกิดข้อผิดพลาดที่ไม่คาดคิด
        </p>

        {errorMessage && (
          <pre className="bg-gray-100 p-4 rounded-lg text-left text-sm text-red-700 overflow-x-auto whitespace-pre-wrap break-words mb-8">
            <code>{errorMessage}</code>
          </pre>
        )}

        <Link
          to="/"
          className="inline-block bg-primary text-white font-bold py-3 px-8 rounded-xl hover:bg-[#e85c50] transition-colors duration-200"
        >
          กลับไปหน้าหลัก
        </Link>
      </div>
    </div>
  );
};

export default ErrorPage;
