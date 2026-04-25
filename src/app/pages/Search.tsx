import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router";
import { Navigation } from "../components/Navigation";
import RecipeCard from "../components/RecipeCard";
import { Search as SearchIcon, ChevronDown, X } from "lucide-react";
import { api } from "../../api";

interface Recipe {
    id: number;
    name: string;
    image_url: string;
    cook_time: number;
    servings: number;
    cuisine: string;
    meal_type: string;
    is_recommended: boolean;
}

interface FilterOption {
    id: number;
    name: string;
}

function Dropdown({
    label,
    options,
    selected,
    onSelect,
    onClear,
    multi = false,
    selectedMulti = [],
}: {
    label: string;
    options: FilterOption[];
    selected?: number | null;
    onSelect: (id: number) => void;
    onClear: () => void;
    multi?: boolean;
    selectedMulti?: number[];
}) {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState('');
    const ref = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (ref.current && !ref.current.contains(e.target as Node)) {
                setOpen(false);
                setQuery('');
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    useEffect(() => {
        if (open) setTimeout(() => inputRef.current?.focus(), 0);
        else setQuery('');
    }, [open]);

    const filtered = query.trim()
        ? options.filter(o => o.name.toLowerCase().includes(query.toLowerCase()))
        : options;

    const hasValue = multi ? selectedMulti.length > 0 : !!selected;
    const displayLabel = multi
        ? selectedMulti.length > 0 ? `${label} (${selectedMulti.length})` : label
        : selected ? options.find(o => o.id === selected)?.name ?? label : label;

    return (
        <div ref={ref} className="relative">
            <button
                onClick={() => setOpen(!open)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full border-2 text-sm transition-all ${
                    hasValue
                        ? 'bg-orange-600 text-white border-orange-600'
                        : 'bg-white border-orange-900/20 text-orange-900/70 hover:border-orange-600 hover:text-orange-600'
                }`}
            >
                <span>{displayLabel}</span>
                {hasValue
                    ? <X className="w-3 h-3" onClick={e => { e.stopPropagation(); onClear(); }} />
                    : <ChevronDown className={`w-4 h-4 transition-transform ${open ? 'rotate-180' : ''}`} />
                }
            </button>

            {open && (
                <div className="absolute top-11 left-0 z-20 bg-white border-2 border-orange-900/20 rounded-2xl shadow-lg min-w-[180px] w-max max-w-[220px] overflow-hidden">
                    <div className="p-2 border-b border-orange-900/10">
                        <input
                            ref={inputRef}
                            type="text"
                            value={query}
                            onChange={e => setQuery(e.target.value)}
                            placeholder="Search..."
                            className="w-full text-sm px-3 py-1.5 rounded-lg border border-orange-900/20 focus:outline-none focus:border-orange-600 text-orange-900"
                        />
                    </div>
                    <div className="max-h-52 overflow-y-auto py-1">
                        {filtered.length === 0 ? (
                            <p className="text-center text-orange-900/40 text-xs py-3">No results</p>
                        ) : filtered.map(option => {
                            const isSelected = multi ? selectedMulti.includes(option.id) : selected === option.id;
                            return (
                                <button
                                    key={option.id}
                                    onClick={() => { onSelect(option.id); if (!multi) { setOpen(false); setQuery(''); } }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors flex items-center justify-between ${
                                        isSelected
                                            ? 'bg-orange-50 text-orange-600 font-medium'
                                            : 'text-orange-900/70 hover:bg-orange-50 hover:text-orange-600'
                                    }`}
                                >
                                    <span>{option.name}</span>
                                    {isSelected && (
                                        <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                        </svg>
                                    )}
                                </button>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function Search() {
    const [searchParams] = useSearchParams();
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [cuisines, setCuisines] = useState<FilterOption[]>([]);
    const [mealTypes, setMealTypes] = useState<FilterOption[]>([]);
    const [tags, setTags] = useState<FilterOption[]>([]);
    const [loading, setLoading] = useState(true);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCuisine, setSelectedCuisine] = useState<number | null>(
        searchParams.get('cuisine') ? Number(searchParams.get('cuisine')) : null
    );
    const [selectedMealType, setSelectedMealType] = useState<number | null>(null);
    const [selectedTags, setSelectedTags] = useState<number[]>([]);

    useEffect(() => {
        api.get('/reference/cuisines').then(setCuisines);
        api.get('/reference/meal-types').then(setMealTypes);
        api.get('/reference/tags').then(setTags);
    }, []);

    useEffect(() => {
        setLoading(true);
        const params = new URLSearchParams();
        if (searchQuery)      params.set('search', searchQuery);
        if (selectedCuisine)  params.set('cuisine', String(selectedCuisine));
        if (selectedMealType) params.set('meal_type', String(selectedMealType));
        if (selectedTags.length > 0) params.set('tags', selectedTags.join(','));

        const query = params.toString() ? `?${params.toString()}` : '';
        api.get(`/recipes${query}`).then(data => {
            setRecipes(Array.isArray(data) ? data : []);
            setLoading(false);
        });
    }, [searchQuery, selectedCuisine, selectedMealType, selectedTags]);

    const toggleTag = (id: number) => {
        setSelectedTags(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);
    };

    const clearFilters = () => {
        setSelectedCuisine(null);
        setSelectedMealType(null);
        setSelectedTags([]);
        setSearchQuery('');
    };

    const hasFilters = selectedCuisine || selectedMealType || selectedTags.length > 0 || searchQuery;

    return (
        <div className="min-h-screen bg-[#f5f1e8]">
            <Navigation />

            <div className="max-w-7xl mx-auto px-6 py-8">
                <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white mb-8">
                    <h1 className="text-4xl text-orange-900 mb-6 text-center">Browse Recipes</h1>

                    {/* Search Bar */}
                    <div className="relative max-w-2xl mx-auto mb-6">
                        <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-orange-900/40" />
                        <input
                            type="text"
                            placeholder="Search for recipes..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="w-full bg-white border-2 border-orange-900/20 rounded-full px-12 py-4 text-orange-900 focus:outline-none focus:border-orange-600 transition-colors"
                        />
                    </div>

                    {/* Dropdowns */}
                    <div className="flex items-center gap-3 flex-wrap justify-center">
                        <Dropdown
                            label="Cuisine"
                            options={cuisines}
                            selected={selectedCuisine}
                            onSelect={id => setSelectedCuisine(selectedCuisine === id ? null : id)}
                            onClear={() => setSelectedCuisine(null)}
                        />
                        <Dropdown
                            label="Meal Type"
                            options={mealTypes}
                            selected={selectedMealType}
                            onSelect={id => setSelectedMealType(selectedMealType === id ? null : id)}
                            onClear={() => setSelectedMealType(null)}
                        />
                        <Dropdown
                            label="Dietary Tags"
                            options={tags}
                            multi
                            selectedMulti={selectedTags}
                            onSelect={toggleTag}
                            onClear={() => setSelectedTags([])}
                        />
                        {hasFilters && (
                            <button onClick={clearFilters} className="text-sm text-orange-600 hover:text-orange-700 underline px-2">
                                Clear all
                            </button>
                        )}
                    </div>
                </div>

                <div className="mb-6">
                    <p className="text-orange-900/60">
                        {loading ? 'Searching...' : `Found ${recipes.length} ${recipes.length === 1 ? 'recipe' : 'recipes'}`}
                    </p>
                </div>

                <div className="border-2 border-orange-900/20 rounded-3xl p-8 bg-white">
                    {loading ? (
                        <div className="text-center py-16">
                            <p className="text-orange-900/60 text-lg">Loading recipes...</p>
                        </div>
                    ) : recipes.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {recipes.map(recipe => (
                                <RecipeCard key={recipe.id} {...recipe} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16">
                            <SearchIcon className="w-16 h-16 text-orange-900/20 mx-auto mb-4" />
                            <p className="text-orange-900/60 text-lg">No recipes found</p>
                            <p className="text-orange-900/40 text-sm">Try adjusting your search or filters</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
