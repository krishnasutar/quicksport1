import { Users, Gift, MessageCircle, Wallet } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Split Payments",
    description: "Share costs with friends instantly using UPI. No more awkward money conversations!",
    gradient: "from-brand-indigo to-brand-purple"
  },
  {
    icon: Gift,
    title: "Rewards & Referrals", 
    description: "Earn points with every booking and invite friends for bonus rewards. Play more, save more!",
    gradient: "from-brand-cyan to-brand-emerald"
  },
  {
    icon: MessageCircle,
    title: "WhatsApp Confirmations",
    description: "Get instant booking confirmations with venue details, directions, and ride booking options.",
    gradient: "from-brand-yellow to-brand-orange"
  },
  {
    icon: Wallet,
    title: "Digital Wallet",
    description: "Quick and secure payments with our built-in wallet. Add funds once, book multiple times!",
    gradient: "from-brand-purple to-pink-500"
  }
];

export default function FeatureSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-gray-50 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 slide-in-up">
              Built for Gen-Z Athletes
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Experience the future of sports booking with features designed for the modern athlete.
            </p>
            
            <div className="space-y-6">
              {features.map((feature, index) => (
                <div key={index} className="flex items-start space-x-4 p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-300 card-hover">
                  <div className={`flex-shrink-0 w-12 h-12 bg-gradient-to-br ${feature.gradient} rounded-xl flex items-center justify-center`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">
              <div className="transform rotate-3 hover:rotate-0 transition-transform duration-300">
                <img
                  src="https://images.unsplash.com/photo-1551650975-87deedd944c3?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
                  alt="Mobile app interface showing sports booking"
                  className="rounded-2xl shadow-xl w-full"
                />
              </div>
              
              <div className="transform -rotate-3 hover:rotate-0 transition-transform duration-300 mt-8">
                <img
                  src="https://images.unsplash.com/photo-1563770660941-20978e870e26?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=600"
                  alt="Smartphone displaying modern mobile app interface"
                  className="rounded-2xl shadow-xl w-full"
                />
              </div>
            </div>
            
            <div className="absolute -top-8 -left-8 w-16 h-16 bg-brand-yellow rounded-full flex items-center justify-center animate-bounce shadow-lg">
              <i className="fas fa-star text-white text-xl"></i>
            </div>
            
            <div className="absolute -bottom-4 -right-4 w-12 h-12 bg-brand-indigo rounded-full flex items-center justify-center shadow-lg">
              <i className="fas fa-heart text-white"></i>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
