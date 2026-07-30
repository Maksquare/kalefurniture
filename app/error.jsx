"use client";

import { useEffect } from "react";
import Link from "next/link";
import { PiWarningCircleFill } from "react-icons/pi";

export default function GlobalError({ error, reset }) {
  useEffect(() => {
    // Optionally log the error to an error reporting service
    console.error("Global Error Boundary caught:", error);
  }, [error]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <div className="bg-white border border-secondary/10 rounded-3xl p-8 md:p-12 shadow-sm max-w-lg w-full text-center">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <PiWarningCircleFill className="text-3xl text-red-500" />
        </div>
        
        <h2 className="font-primary text-[28px] text-secondary mb-3 leading-tight">
          Oops! Something went wrong.
        </h2>
        
        <p className="font-secondary text-[14px] text-secondary/60 mb-8 max-w-md mx-auto">
          We apologize for the inconvenience. An unexpected error occurred while loading this page. 
          {process.env.NODE_ENV === 'development' && (
            <span className="block mt-2 text-xs text-red-400 bg-red-50 p-2 rounded-lg text-left overflow-auto max-h-32">
              {error.message}
            </span>
          )}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto px-8 py-3 bg-secondary text-primary font-secondary text-[12px] font-bold tracking-widest uppercase rounded-full hover:bg-secondary/90 transition-colors"
          >
            Try Again
          </button>
          
          <Link 
            href="/"
            className="w-full sm:w-auto px-8 py-3 bg-secondary/5 text-secondary font-secondary text-[12px] font-bold tracking-widest uppercase rounded-full hover:bg-secondary/10 transition-colors"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
