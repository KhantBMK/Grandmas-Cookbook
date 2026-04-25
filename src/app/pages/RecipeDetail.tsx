import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { Navigation } from "../components/Navigation";
import { Clock, Users, Bookmark, ChefHat, Trash2, Pencil } from "lucide-react";
import { api } from "../../api";
import { useAuth } from "../../context/AuthContext";

interface Recipe {
    id: number;
    name: string;
    image_url: string;
    cook_time: number;
    prep_time: number;
    servings: number;
    description: string;
    cuisine: string;
    meal_type: string;
    author: string;
    ingredients: { id: number; ingredient_desc: string }[];
    instructions: { id: number; step_num: number; instruction_desc: string }[];
    tags: { id: number; name: string }[];
}

export default function RecipeDetail() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, isLoggedIn } = useAuth();
    const [recipe, setRecipe] = useState<Recipe | null>(null);
    const [loading, setLoading] = useState(true);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        api.get(`/recipes/${id}`).then(data => {
            if (data.error) navigate('/search');
            else setRecipe(data);
            setLoading(false);
        });
    }, [id]);

    useEffect(() => {
        if (!isLoggedIn || !user || !recipe) return;
        api.get(`/users/${user.id}/saved-recipes`, true).then((savedList: { id: number }[]) => {
            if (Array.isArray(savedList)) {
                setSaved(savedList.some(r => r.id === recipe.id));
            }
        });
    }, [recipe, isLoggedIn, user]);

    const handleSave = async () => {
        if (!isLoggedIn) { navigate('/login', { replace: true }); return; }
        if (saved) {
            await api.delete(`/users/${id}/save`, true);
            setSaved(false);
        } else {
            await api.post(`/users/${id}/save`, {}, true);
            setSaved(true);
        }
    };

    const handleDelete = async () => {
        if (!confirm('Delete this recipe?')) return;
        await api.delete(`/recipes/${id}`, true);
        navigate('/search');
    };

    if (loading) return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />
            <div className="flex items-center justify-center py-32">
                <p className="text-orange-900/60 text-lg">Loading recipe...</p>
            </div>
        </div>
    );

    if (!recipe) return null;

    const isOwner = isLoggedIn && user?.username === recipe.author;

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                    {/* Image */}
                    <div className="border-2 border-orange-900/20 rounded-3xl overflow-hidden aspect-square">
                        {recipe.image_url ? (
                            <img
                                src={recipe.image_url}
                                alt={recipe.name}
                                className="w-full h-full object-cover"
                            />
                        ) : (
                            <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                <svg viewBox="0 0 64 64" className="w-2/5 h-2/5 text-orange-300" fill="currentColor">
                                    <rect x="6" y="34" width="20" height="20" rx="2" />
                                    <polygon points="32,10 52,38 12,38" />
                                    <circle cx="48" cy="46" r="10" />
                                </svg>
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                        <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                                <div className="text-orange-600 text-sm mb-2">{recipe.cuisine} · {recipe.meal_type}</div>
                                <h1 className="text-4xl text-orange-900 mb-1">{recipe.name}</h1>
                                <p className="text-sm text-orange-900/50">by {recipe.author}</p>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={handleSave}
                                    className={`p-3 rounded-full border-2 transition-all ${
                                        saved ? 'bg-orange-600 border-orange-600 text-white' : 'border-orange-900/20 text-orange-900/60 hover:border-orange-600 hover:text-orange-600'
                                    }`}
                                >
                                    <Bookmark className="w-6 h-6" fill={saved ? 'currentColor' : 'none'} />
                                </button>
                                {isOwner && (
                                    <>
                                        <button
                                            onClick={() => navigate(`/recipe/${id}/edit`)}
                                            className="p-3 rounded-full border-2 border-orange-900/20 text-orange-900/60 hover:border-orange-600 hover:text-orange-600 transition-all"
                                        >
                                            <Pencil className="w-6 h-6" />
                                        </button>
                                        <button
                                            onClick={handleDelete}
                                            className="p-3 rounded-full border-2 border-red-200 text-red-400 hover:bg-red-50 transition-all"
                                        >
                                            <Trash2 className="w-6 h-6" />
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        <p className="text-orange-900/60 mb-6">{recipe.description}</p>

                        <div className="flex items-center gap-6 mb-6 pb-6 border-b-2 border-orange-900/20">
                            <div className="flex items-center gap-2 text-orange-900">
                                <Clock className="w-5 h-5 text-orange-600" />
                                <span>{recipe.cook_time} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-900">
                                <Users className="w-5 h-5 text-orange-600" />
                                <span>{recipe.servings} servings</span>
                            </div>
                            <div className="flex items-center gap-2 text-orange-900">
                                <ChefHat className="w-5 h-5 text-orange-600" />
                                <span>{recipe.prep_time} min prep</span>
                            </div>
                        </div>

                        {recipe.tags.length > 0 && (
                            <div className="mb-6 flex flex-wrap gap-2">
                                {recipe.tags.map(tag => (
                                    <span key={tag.id} className="px-3 py-1 bg-orange-50 border-2 border-orange-900/20 text-orange-600 rounded-full text-sm">
                                        {tag.name}
                                    </span>
                                ))}
                            </div>
                        )}

                    </div>
                </div>

                {/* Ingredients & Instructions */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                        <h2 className="text-2xl text-orange-900 mb-6 pb-3 border-b-2 border-orange-900/20">Ingredients</h2>
                        <ul className="space-y-3">
                            {recipe.ingredients.map(ing => (
                                <li key={ing.id} className="flex items-start gap-3 text-orange-900/80">
                                    <span className="text-orange-600 mt-1">•</span>
                                    <span>{ing.ingredient_desc}</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                        <h2 className="text-2xl text-orange-900 mb-6 pb-3 border-b-2 border-orange-900/20">Directions</h2>
                        <ol className="space-y-4">
                            {recipe.instructions.map(step => (
                                <li key={step.id} className="flex gap-4">
                                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-600 flex items-center justify-center text-white text-sm">
                                        {step.step_num}
                                    </span>
                                    <p className="text-orange-900/80 flex-1 pt-1">{step.instruction_desc}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </div>
            </div>
        </div>
    );
}
