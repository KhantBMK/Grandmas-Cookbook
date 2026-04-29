import { Navigation } from "../components/Navigation";
import { Mail, MapPin, Calendar } from "lucide-react";

export default function About() {
  return (
    <div className="min-h-screen bg-[#f5f1e8]">
      <Navigation />
      
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="border-2 border-orange-900/20 rounded-3xl p-8 md:p-12 bg-white">
          <h1 className="text-4xl text-orange-900 mb-8 text-center">Meet the Team!</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Author Image */}
            <div className="border-2 border-orange-900/20 rounded-2xl overflow-hidden aspect-square bg-orange-50 flex items-center justify-center">
              <svg viewBox="0 0 64 64" className="w-2/5 h-2/5 text-orange-300" fill="currentColor">
                <rect x="6" y="34" width="20" height="20" rx="2" />
                <polygon points="32,10 52,38 12,38" />
                <circle cx="48" cy="46" r="10" />
              </svg>
            </div>

            {/* Author Info */}
            <div className="flex flex-col justify-center space-y-6">
              <div>
                <h2 className="text-3xl text-orange-900 mb-2">Team Name</h2>
                <p className="text-orange-600">Developer Team</p>
              </div>

              <div className="space-y-3">
                <div className="flex items-center gap-3 text-orange-900/70">
                  <MapPin className="w-5 h-5 text-orange-600" />
                  <span>St. Charles Community College</span>
                </div>
                <div className="flex items-center gap-3 text-orange-900/70">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span>Making your plate full since 2026</span>
                </div>
                <div className="flex items-center gap-3 text-orange-900/70">
                  <Mail className="w-5 h-5 text-orange-600" />
                  <span>team.leader@email.com</span>
                </div>
              </div>

              <div className="pt-4">
                <button className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Mail className="w-5 h-5" />
                  Contact Us
                </button>
              </div>
            </div>
          </div>

          {/* Bio Section */}
          <div className="border-t-2 border-orange-900/20 pt-8">
            <h3 className="text-2xl text-orange-900 mb-4">Our Story</h3>
            <div className="space-y-4 text-orange-900/70 leading-relaxed">
              <p>
                Welcome to Grandma's Cookbook! Our Team created this project in hopes of continuing traditions from one family to another.
              </p>
              <p>
                Our Team worked hard for not only for others but for our own use as well. We wanted to create a website that can store your delicious family recipes while also keeping them safe. Our Team uses this website for personal use as well to optimize the user experience. We came up with this idea as a team since most of us enjoy cooking and want to enjoy our family recipes without worrying about damaging or losing the original copy.
              </p>
              <p>
                Through Grandma's Cookbook, we hope to keep family traditions alive and keep plates full! Thank you for checking our team's site and hope you enjoy!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}