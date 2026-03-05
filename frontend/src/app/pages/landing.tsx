import { Link } from 'react-router';
import { Navbar } from '../components/navbar';
import { ClipboardList, Brain, Calendar } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-blue-50">
      <Navbar />
      
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h1 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Find the Right Care, <span className="text-[#2563EB]">Instantly.</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Powered by advanced AI, CareCompass analyzes your symptoms and connects you 
              with the right specialists and hospitals in minutes.
            </p>
            <Link
              to="/symptoms"
              className="inline-block bg-[#2563EB] text-white px-8 py-4 rounded-xl text-lg font-medium hover:bg-[#1d4ed8] transition-all shadow-lg shadow-blue-200 hover:shadow-xl"
            >
              Start Symptom Check
            </Link>
            <p className="text-sm text-gray-500 mt-4">
              Free • Instant Results • No Registration Required
            </p>
          </div>
          
          <div className="relative">
            <div className="bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-3xl p-12 shadow-2xl">
              <div className="bg-white/10 backdrop-blur rounded-2xl p-8 border border-white/20">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
                    <Brain className="w-6 h-6 text-[#2563EB]" />
                  </div>
                  <div className="text-white">
                    <p className="text-sm opacity-90">AI Analysis</p>
                    <p className="font-semibold">95% Accuracy</p>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg px-4 py-3 text-white text-sm">
                    Analyzing symptoms...
                  </div>
                  <div className="bg-white/20 rounded-lg px-4 py-3 text-white text-sm">
                    Matching specialists...
                  </div>
                  <div className="bg-white rounded-lg px-4 py-3 text-gray-900 text-sm font-medium">
                    ✓ Recommendation Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* How It Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <h2 className="text-4xl font-bold text-center text-gray-900 mb-4">
          How It Works
        </h2>
        <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
          Get personalized healthcare recommendations in three simple steps
        </p>
        
        <div className="grid md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <ClipboardList className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">1. Enter Symptoms</h3>
            <p className="text-gray-600">
              Describe your symptoms in plain language. Our AI understands natural conversation.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Brain className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">2. AI Analyzes Condition</h3>
            <p className="text-gray-600">
              Advanced algorithms analyze your symptoms and match them with appropriate medical specialties.
            </p>
          </div>
          
          <div className="text-center">
            <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#0EA5E9] rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
              <Calendar className="w-10 h-10 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">3. Book Appointment</h3>
            <p className="text-gray-600">
              Browse nearby specialists and hospitals, then book your appointment instantly.
            </p>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-6">
            <div className="text-center md:text-left">
              <p className="text-sm text-gray-500 mb-2">
                <strong>Medical Disclaimer:</strong> CareCompass AI provides recommendations only. 
                This is not a medical diagnosis. Always consult with qualified healthcare professionals.
              </p>
            </div>
            <div className="flex gap-6">
              <Link to="/about" className="text-gray-600 hover:text-gray-900 transition-colors">
                About
              </Link>
              <Link to="/contact" className="text-gray-600 hover:text-gray-900 transition-colors">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
