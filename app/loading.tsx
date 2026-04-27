export default function Loading() {
    return (
      <div className="flex items-center justify-center min-h-screen bg-transparent">
        <div className="flex flex-col items-center gap-0">
  
          {/* Logo */}
          <img
            src="/logo.png"
            alt="Loading"
            className="w-48 object-contain"
          />
  
          {/* Loader */}
          <div className="relative w-48 h-2 overflow-hidden rounded-full bg-gray-200">
            <div className="absolute top-0 left-0 h-full w-1/3 bg-black animate-loading-bar"></div>
          </div>
  
        </div>
      </div>
    );
  }