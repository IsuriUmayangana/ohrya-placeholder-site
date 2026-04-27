export default function NotFound() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-white">
            <div className="flex flex-col items-center gap-5">
    
                {/* Logo */}
                <img
                src="/logo.png"
                alt="Not Found"
                className="w-48 object-contain"
                />

                {/* Message */}
                <p style={{ fontFamily: "Georgia, serif", fontSize: "1.1rem", color: "#555", marginTop: 16 }}>
                    Dashboard not found. Please complete the survey to get your personal link.
                </p>
                <a href="/" className="btn-primary" style={{ textDecoration: "none", padding: "12px 32px", borderRadius: 9999 }}>
                    Take the Survey
                </a>
    
            </div>
        </div>
    );
}