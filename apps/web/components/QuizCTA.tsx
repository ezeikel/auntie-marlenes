import { faArrowRight, faSparkles } from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import Link from 'next/link';

const quizzes = [
  {
    title: 'Find Your Hair Type',
    description:
      'Discover your curl pattern from 1A to 4C, plus your porosity, density, and scalp type. Get personalised product recommendations.',
    href: '/hair-type',
    gradient: 'from-cocoa to-deep-earth',
  },
  {
    title: 'Find Your Skin Type',
    description:
      'A quiz designed for melanin-rich skin. Discover your skin type, hydration level, sensitivity, and the best ingredients for you.',
    href: '/skin-type',
    gradient: 'from-terracotta to-warm-clay',
  },
];

const QuizCTA = () => (
  <section className="py-16 sm:py-24 bg-white">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 text-terracotta font-inter font-semibold text-sm uppercase tracking-wider mb-4">
          <FontAwesomeIcon icon={faSparkles} />
          <span>Personalised For You</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4 uppercase">
          Not Sure Where to Start?
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Take our free quizzes to discover exactly what your hair and skin
          need. Get personalised product recommendations in under 2 minutes.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
        {quizzes.map((quiz) => (
          <Link
            key={quiz.href}
            href={quiz.href}
            className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
          >
            <div
              className={`bg-gradient-to-br ${quiz.gradient} p-8 md:p-10 h-full flex flex-col justify-between min-h-[280px]`}
            >
              <div>
                <h3 className="text-2xl md:text-3xl font-playfair font-bold text-white mb-4">
                  {quiz.title}
                </h3>
                <p className="text-white/85 font-inter leading-relaxed">
                  {quiz.description}
                </p>
              </div>
              <div className="flex items-center gap-2 text-white font-inter font-semibold mt-6 group-hover:gap-3 transition-all">
                <span>Take the Quiz</span>
                <FontAwesomeIcon
                  icon={faArrowRight}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

export default QuizCTA;
