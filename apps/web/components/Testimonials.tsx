import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/pro-solid-svg-icons';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

type Testimonial = {
  name: string;
  location: string;
  rating: number;
  text: string;
  date: string;
};

const testimonials: Testimonial[] = [
  {
    name: 'Sarah M.',
    location: 'London',
    rating: 5,
    text: "Since this shop opened, my Black hair shop experience has changed and not only do they provide the products, but they have the KNOWLEDGE too! Best customer service I've ever had.",
    date: '2 months ago',
  },
  {
    name: 'Amara K.',
    location: 'Manchester',
    rating: 5,
    text: 'The range of products is incredible! I finally found everything I need for my natural hair journey in one place. Fast delivery and great prices too.',
    date: '1 month ago',
  },
  {
    name: 'Keisha B.',
    location: 'Birmingham',
    rating: 5,
    text: 'Love this shop! They stock all my favourite brands and the staff really understand textured hair. The rewards programme is a nice bonus too!',
    date: '3 weeks ago',
  },
  {
    name: 'Marcus T.',
    location: 'Leeds',
    rating: 5,
    text: 'Finally a shop that caters to men with textured hair! Great selection and the Click & Collect service is super convenient.',
    date: '1 month ago',
  },
  {
    name: 'Nia L.',
    location: 'Bristol',
    rating: 5,
    text: 'I literally drive 30 mins each way to come to this Black owned well run business. The team are so friendly and really take time to listen and understand your hair needs.',
    date: '2 weeks ago',
  },
];

const Testimonials = () => (
  <section className="py-16 sm:py-24 bg-warm-beige">
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-playfair font-bold text-cocoa mb-4">
          What Our Customers Say!
        </h2>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Real stories from our family. ❤️
        </p>
      </div>

      <Carousel
        opts={{
          align: 'start',
          loop: true,
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-6">
          {testimonials.map((testimonial, index) => (
            <CarouselItem
              key={index}
              className="pl-6 basis-full md:basis-1/2 lg:basis-1/3"
            >
              <div className="bg-white p-6 rounded-xl shadow-md h-full flex flex-col">
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <FontAwesomeIcon
                      key={i}
                      icon={faStar}
                      className="text-amber-400"
                      size="sm"
                    />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 flex-grow">
                  {testimonial.text}
                </p>
                <div className="border-t border-gray-200 pt-4">
                  <p className="font-semibold text-cocoa">{testimonial.name}</p>
                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>{testimonial.location}</span>
                    <span>{testimonial.date}</span>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden sm:flex left-4" />
        <CarouselNext className="hidden sm:flex right-4" />
      </Carousel>
    </div>
  </section>
);

export default Testimonials;
