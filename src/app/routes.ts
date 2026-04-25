import { createBrowserRouter } from "react-router";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Profile from "./pages/Profile";
import RecipeDetail from "./pages/RecipeDetail";
import Search from "./pages/Search";
import About from "./pages/About";
import CreateRecipe from "./pages/CreateRecipe";
import EditRecipe from "./pages/EditRecipe";
import AuthCallback from "./pages/AuthCallback";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Home,
  },
  {
    path: "/login",
    Component: Login,
  },
  {
    path: "/profile",
    Component: Profile,
  },
  {
    path: "/recipe/:id",
    Component: RecipeDetail,
  },
  {
    path: "/search",
    Component: Search,
  },
  {
    path: "/about",
    Component: About,
  },
  {
    path: "/create",
    Component: CreateRecipe,
  },
  {
    path: "/recipe/:id/edit",
    Component: EditRecipe,
  },
  {
    path: "/auth/callback",
    Component: AuthCallback,
  },
]);