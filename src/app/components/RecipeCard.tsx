import { Link } from "react-router";
import { Clock, Users } from "lucide-react";

interface RecipeCardProps {
    id: number;
    name: string;
    image_url: string;
    cook_time: number;
    servings: number;
    cuisine: string;
    meal_type: string;
}

export default function RecipeCard({ id, name, image_url, cook_time, servings, cuisine, meal_type }: RecipeCardProps) {
    return (
        <Link to={`/recipe/${id}`} className="group">
            <div className="bg-white border-2 border-orange-900/20 rounded-2xl overflow-hidden hover:border-orange-600 transition-all">
                <div className="aspect-square overflow-hidden">
                    {image_url ? (
                        <img
                            src={image_url}
                            alt={name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
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
                <div className="p-4">
                    <div className="flex gap-2 mb-2 flex-wrap">
                        <span className="text-xs text-orange-600">{cuisine}</span>
                        <span className="text-xs text-orange-900/40">·</span>
                        <span className="text-xs text-orange-900/60">{meal_type}</span>
                    </div>
                    <h3 className="mb-3 line-clamp-2 text-orange-900 group-hover:text-orange-600 transition-colors">
                        {name}
                    </h3>
                    <div className="flex items-center gap-4 text-sm text-orange-900/60">
                        <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>{cook_time} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Users className="w-4 h-4" />
                            <span>{servings} servings</span>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    );
}
