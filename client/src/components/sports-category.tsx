interface SportsCategoryProps {
  onSportSelect?: (sport: string) => void;
}

const sportsData = [
  { id: 'basketball', name: 'Basketball', icon: 'fas fa-basketball-ball', color: 'from-orange-400 to-orange-600', count: 120 },
  { id: 'football', name: 'Football', icon: 'fas fa-futbol', color: 'from-green-400 to-green-600', count: 80 },
  { id: 'tennis', name: 'Tennis', icon: 'fas fa-table-tennis', color: 'from-blue-400 to-blue-600', count: 95 },
  { id: 'volleyball', name: 'Volleyball', icon: 'fas fa-volleyball-ball', color: 'from-purple-400 to-purple-600', count: 60 },
  { id: 'badminton', name: 'Badminton', icon: 'fas fa-dumbbell', color: 'from-red-400 to-red-600', count: 150 },
  { id: 'swimming', name: 'Swimming', icon: 'fas fa-swimmer', color: 'from-cyan-400 to-cyan-600', count: 35 },
];

export default function SportsCategory({ onSportSelect }: SportsCategoryProps) {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Popular Sports</h2>
          <p className="text-xl text-gray-600">Find the perfect court for your favorite sport</p>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
          {sportsData.map((sport) => (
            <div
              key={sport.id}
              className="group text-center cursor-pointer"
              onClick={() => onSportSelect?.(sport.id)}
            >
              <div className={`w-20 h-20 mx-auto mb-3 bg-gradient-to-br ${sport.color} rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200 shadow-lg card-hover`}>
                <i className={`${sport.icon} text-white text-2xl`}></i>
              </div>
              <h3 className="font-semibold text-gray-800 group-hover:text-brand-indigo transition-colors">
                {sport.name}
              </h3>
              <p className="text-sm text-gray-500">{sport.count}+ Courts</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
