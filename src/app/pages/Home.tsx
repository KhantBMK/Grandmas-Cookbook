import { Clock, Users } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router";
import { Navigation } from "../components/Navigation";
import { api } from "../../api";

interface Recipe {
    id: number;
    name: string;
    image_url: string;
    cook_time: number;
    servings: number;
    cuisine: string;
    meal_type: string;
}

interface Tag {
    id: number;
    name: string;
}

export default function Home() {
    const [recommendedRecipe, setRecommendedRecipe] = useState<Recipe | null>(null);

    useEffect(() => {
        // Fetch tags to find the "Healthy" tag ID
        api.get('/reference/tags').then((tags: Tag[]) => {
            const healthyTag = tags.find(t => t.name === 'Healthy');
            const url = healthyTag
                ? `/recipes?tags=${healthyTag.id}`
                : '/recipes';

            api.get(url).then((data: Recipe[]) => {
                if (data.length > 0) {
                    const randomIndex = Math.floor(Math.random() * data.length);
                    setRecommendedRecipe(data[randomIndex]);
                }
            });
        });
    }, []);

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            {/* Hero Section */}
            <div className="relative h-[300px] overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1617735605078-8a9336be0816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHxjb29raW5nJTIwZm9vZCUyMGluZ3JlZGllbnRzJTIwa2l0Y2hlbnxlbnwxfHx8fDE3NzM4OTI3MDB8MA&ixlib=rb-4.1.0&q=80&w=1080"
                    alt="Cooking hero"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#f5f1e8]/80 via-[#f5f1e8]/50 to-[#f5f1e8]/30 flex items-center">
                    <div className="max-w-7xl mx-auto px-6 w-full">
                        <h1 className="text-4xl md:text-5xl text-orange-900 mb-3">Welcome to Our Kitchen</h1>
                        <p className="text-lg text-orange-900/80 max-w-2xl">
                            Discover delicious recipes, save family favorites and keep plates full!
                        </p>
                    </div>
                </div>
            </div>

            {/* Two Feature Boxes */}
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* About Box */}
                    <Link to="/about" className="block group">
                        <div className="border-2 border-orange-900/20 rounded-3xl overflow-hidden bg-white hover:border-orange-600 transition-all h-full">
                            <div className="aspect-[4/3] overflow-hidden relative">
                                <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                    <svg viewBox="0 0 64 64" className="w-24 h-24 text-orange-300" fill="currentColor">
                                        <rect x="6" y="34" width="20" height="20" rx="2" />
                                        <polygon points="32,10 52,38 12,38" />
                                        <circle cx="48" cy="46" r="10" />
                                    </svg>
                                </div>
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex items-end justify-center p-6">
                                    <h2 className="text-2xl text-white group-hover:text-orange-300 transition-colors">Meet the Team</h2>
                                </div>
                            </div>
                        </div>
                    </Link>

                    {/* Healthy Recommendation Box */}
                    {recommendedRecipe ? (
                        <Link to={`/recipe/${recommendedRecipe.id}`} className="block group">
                            <div className="border-2 border-orange-900/20 rounded-3xl overflow-hidden bg-white hover:border-orange-600 transition-all h-full">
                                <div className="aspect-[4/3] overflow-hidden relative">
                                    {recommendedRecipe.image_url ? (
                                        <img
                                            src={recommendedRecipe.image_url}
                                            alt={recommendedRecipe.name}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                                            <svg viewBox="0 0 64 64" className="w-24 h-24 text-orange-300" fill="currentColor">
                                                <rect x="6" y="34" width="20" height="20" rx="2" />
                                                <polygon points="32,10 52,38 12,38" />
                                                <circle cx="48" cy="46" r="10" />
                                            </svg>
                                        </div>
                                    )}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent flex flex-col items-center justify-end p-6 gap-2">
                                        <span className="text-xs text-orange-300 font-medium uppercase tracking-wider">Healthy Pick</span>
                                        <h2 className="text-2xl text-white group-hover:text-orange-300 transition-colors text-center">{recommendedRecipe.name}</h2>
                                        <div className="flex items-center gap-4 text-white/90">
                                            <div className="flex items-center gap-1">
                                                <Clock className="w-4 h-4" />
                                                <span className="text-sm">{recommendedRecipe.cook_time} min</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Users className="w-4 h-4" />
                                                <span className="text-sm">{recommendedRecipe.servings} servings</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ) : (
                        <div className="border-2 border-orange-900/20 rounded-3xl overflow-hidden bg-white h-full flex items-center justify-center min-h-[240px]">
                            <p className="text-orange-900/40">No healthy recipes yet — create one!</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
