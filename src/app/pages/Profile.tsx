import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { User } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../api";

interface SavedRecipe {
    id: number;
    name: string;
    image_url: string;
    cuisine: string;
    meal_type: string;
    cook_time: number;
    servings: number;
}

export default function Profile() {
    const { user, isLoggedIn } = useAuth();
    const navigate = useNavigate();
    const [savedRecipes, setSavedRecipes] = useState<SavedRecipe[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!isLoggedIn) {
            navigate('/login', { replace: true });
            return;
        }
        if (user) {
            api.get(`/users/${user.id}/saved-recipes`, true).then(data => {
                setSavedRecipes(Array.isArray(data) ? data : []);
                setLoading(false);
            });
        }
    }, [isLoggedIn, user]);

    if (!isLoggedIn || !user) return null;

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                    {/* Profile Header */}
                    <div className="flex items-center gap-6 mb-8 pb-8 border-b-2 border-orange-900/20">
                        <div className="w-20 h-20 rounded-full border-2 border-orange-600 flex items-center justify-center bg-orange-50 flex-shrink-0">
                            <User className="w-10 h-10 text-orange-600" />
                        </div>
                        <div>
                            <h1 className="text-3xl text-orange-900">{user.username}</h1>
                            {user.email && <p className="text-orange-900/60 mt-1">{user.email}</p>}
                        </div>
                    </div>

                    {/* Saved Recipes */}
                    <h2 className="text-2xl text-orange-900 mb-6">Saved Recipes</h2>
                    {loading ? (
                        <p className="text-orange-900/60">Loading...</p>
                    ) : savedRecipes.length === 0 ? (
                        <div className="text-center py-12 border-2 border-dashed border-orange-900/20 rounded-2xl">
                            <p className="text-orange-900/60">No saved recipes yet.</p>
                            <Link to="/search" className="text-orange-600 hover:underline text-sm mt-2 inline-block">
                                Browse recipes to save some
                            </Link>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {savedRecipes.map(recipe => (
                                <Link
                                    key={recipe.id}
                                    to={`/recipe/${recipe.id}`}
                                    className="flex gap-3 p-3 rounded-xl border-2 border-orange-900/10 hover:border-orange-600 bg-white transition-all group"
                                >
                                    {recipe.image_url ? (
                                        <img
                                            src={recipe.image_url}
                                            alt={recipe.name}
                                            className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                                        />
                                    ) : (
                                        <div className="w-16 h-16 rounded-lg flex-shrink-0 bg-orange-50 border border-orange-900/10 flex items-center justify-center">
                                            <svg viewBox="0 0 64 64" className="w-9 h-9 text-orange-300" fill="currentColor">
                                                {/* square */}
                                                <rect x="6" y="34" width="20" height="20" rx="2" />
                                                {/* triangle */}
                                                <polygon points="32,10 52,38 12,38" />
                                                {/* circle */}
                                                <circle cx="48" cy="46" r="10" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-orange-900 text-sm font-medium group-hover:text-orange-600 transition-colors line-clamp-2">
                                            {recipe.name}
                                        </h3>
                                        <p className="text-orange-900/50 text-xs mt-1">{recipe.cuisine} · {recipe.meal_type}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
