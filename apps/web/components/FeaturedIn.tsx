const pressLogos = [
  { name: 'Vogue', width: 120 },
  { name: 'Daily Mail', width: 140 },
  { name: 'Forbes', width: 120 },
  { name: 'BBC', width: 100 },
  { name: 'The Guardian', width: 140 },
  { name: 'Cosmopolitan', width: 140 },
];

const FeaturedIn = () => {
  return (
    <section className="py-12 bg-white border-y border-gray-200">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
          As Featured In
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-12">
          {pressLogos.map((logo) => (
            <div
              key={logo.name}
              className="text-gray-400 font-serif text-2xl md:text-3xl opacity-60 hover:opacity-100 transition-opacity"
            >
              {logo.name}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedIn;
