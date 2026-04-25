import { useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../../context/AuthContext";

export default function AuthCallback() {
    const navigate = useNavigate();
    const { login } = useAuth();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (token) {
            // Decode the JWT payload to get user info
            const payload = JSON.parse(atob(token.split('.')[1]));
            login(token, { id: payload.id, username: payload.username, email: payload.email || '' });
            navigate('/', { replace: true });
        } else {
            navigate('/login', { replace: true });
        }
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f1e8] flex items-center justify-center">
            <p className="text-orange-900 text-lg">Signing you in...</p>
        </div>
    );
}
