import { useRouteError, Link } from "react-router";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import { Button } from "./ui/button";

export function ErrorBoundary() {
  const error = useRouteError() as Error;

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-6">
      <div className="max-w-2xl w-full">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="bg-red-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-red-600" />
          </div>
          
          <h1 className="text-3xl font-bold mb-4">Oops! Something went wrong</h1>
          
          <p className="text-gray-600 mb-6">
            We encountered an unexpected error. Please try again or return to the home page.
          </p>

          {error && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-mono text-gray-700">
                {error.message || "Unknown error"}
              </p>
            </div>
          )}

          <div className="flex gap-4 justify-center">
            <Button
              onClick={() => window.history.back()}
              variant="outline"
              className="flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
            <Link to="/">
              <Button className="bg-[#1A5C1A] hover:bg-[#145014] flex items-center gap-2">
                <Home className="w-4 h-4" />
                Return Home
              </Button>
            </Link>
          </div>
        </div>

        <div className="text-center mt-6">
          <p className="text-sm text-gray-500">
            If this problem persists, please contact support at{" "}
            <a href="mailto:parivesh@nic.in" className="text-[#1A5C1A] hover:underline">
              parivesh@nic.in
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
