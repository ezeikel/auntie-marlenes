import { setRequestLocale } from 'next-intl/server';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faHandHoldingSeedling,
  faPeopleGroup,
  faStarSharp,
  faBookOpenReader,
  faEnvelope,
  faGlobe,
  faStore,
} from '@fortawesome/pro-regular-svg-icons';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Auntie Marlene's is a Black-owned, family-run beauty store from South London. We curate the best products for textured hair with care, knowledge, and community spirit.",
};

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="bg-warm-beige min-h-screen py-12">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-4xl">
        <div className="bg-white rounded-2xl shadow-md p-8 md:p-12">
          <h1 className="text-4xl font-playfair font-bold text-cocoa mb-4">
            About Us
          </h1>
          <p className="text-lg text-gray-600 mb-12">
            The trusted auntie your hair has been waiting for.
          </p>

          {/* Our Story */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faHeart}
                className="text-terracotta"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Our Story
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                If you grew up in the Black British community, you know the
                auntie. Not necessarily your mum&apos;s sister &mdash; but that
                woman in your life who always knew exactly what your hair
                needed. The one who&apos;d take one look at your curls and say,
                &ldquo;Come here, let me sort that out.&rdquo; She knew the
                products, the techniques, the remedies. And she made you feel
                beautiful while she did it.
              </p>
              <p>
                That&apos;s who Auntie Marlene is. She&apos;s not one person
                &mdash; she&apos;s every auntie who ever shared her wisdom in
                the kitchen, at the salon, or over the garden fence. We built
                this store to carry that same energy: warm, knowledgeable, and
                always in your corner.
              </p>
              <p>
                We started Auntie Marlene&apos;s because we were tired. Tired of
                walking into high street stores and finding our products shoved
                in a corner. Tired of being an afterthought. Tired of brands
                that didn&apos;t understand textured hair trying to sell us
                things that didn&apos;t work. So we decided to build something
                better &mdash; a place where our community comes first, always.
              </p>
              <p>
                Based in South London, we&apos;re Black-owned, family-run, and
                proud of it. Every product on our shelves has been tried,
                tested, and chosen with care. Nothing ends up here by accident.
                If it&apos;s on our site, it&apos;s because we believe in it.
              </p>
            </div>
          </section>

          {/* Our Mission */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faHandHoldingSeedling}
                className="text-sage-green"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Our Mission
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                Our mission is simple: to make sure no one ever has to settle
                when it comes to their hair. We want every person with coils,
                curls, kinks, and locs to have easy access to products that
                actually work &mdash; and the knowledge to use them with
                confidence.
              </p>
              <p>
                We&apos;re not here to just sell you things. We&apos;re here to
                educate, support, and celebrate. Whether you&apos;re starting
                your natural hair journey, maintaining your locs, or looking for
                something new to try, we want you to feel guided, not
                overwhelmed.
              </p>
            </div>
          </section>

          {/* Why Auntie Marlene's? */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-4">
              <FontAwesomeIcon
                icon={faStore}
                className="text-warm-clay"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Why Auntie Marlene&apos;s?
              </h2>
            </div>

            <div className="space-y-4 text-gray-700">
              <p>
                There are plenty of places to buy hair products online. So why
                us?
              </p>
              <p>
                Because we don&apos;t just stock products &mdash; we curate
                them. Every single item in our store has been chosen for a
                reason. We think about ingredients, we think about results, and
                we think about value. We&apos;re not trying to be the biggest
                store on the internet. We&apos;re trying to be the most trusted
                one.
              </p>
              <p>
                When you shop with us, you&apos;re not just another order
                number. You&apos;re part of a community. We read your messages,
                we listen to your feedback, and we genuinely care about your
                experience. That&apos;s the Auntie Marlene&apos;s difference.
              </p>
              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5 mt-4">
                <ul className="space-y-2 text-sm">
                  <li className="flex items-start gap-2">
                    <span className="text-sage-green font-bold mt-0.5">
                      &#10003;
                    </span>
                    <span>Black-owned and family-run from South London</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-green font-bold mt-0.5">
                      &#10003;
                    </span>
                    <span>Every product hand-picked and tested</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-green font-bold mt-0.5">
                      &#10003;
                    </span>
                    <span>
                      Community-first &mdash; we educate and support, not just
                      sell
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-sage-green font-bold mt-0.5">
                      &#10003;
                    </span>
                    <span>UK-based with worldwide shipping</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Our Values */}
          <section className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <FontAwesomeIcon
                icon={faStarSharp}
                className="text-deep-earth"
                size="2x"
              />
              <h2 className="text-2xl font-playfair font-bold text-cocoa">
                Our Values
              </h2>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="bg-terracotta/5 border border-terracotta/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon icon={faHeart} className="text-terracotta" />
                  <h3 className="font-semibold text-cocoa">Authenticity</h3>
                </div>
                <p className="text-sm text-gray-700">
                  We keep it real. No gimmicks, no empty promises. Just honest
                  recommendations from people who actually use these products
                  and understand your hair.
                </p>
              </div>

              <div className="bg-sage-green/5 border border-sage-green/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faPeopleGroup}
                    className="text-sage-green"
                  />
                  <h3 className="font-semibold text-cocoa">Community</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Everything we do is rooted in community. We exist because of
                  you, and we grow with you. Your voice shapes what we stock,
                  how we show up, and where we go next.
                </p>
              </div>

              <div className="bg-warm-clay/5 border border-warm-clay/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faStarSharp}
                    className="text-warm-clay"
                  />
                  <h3 className="font-semibold text-cocoa">Quality</h3>
                </div>
                <p className="text-sm text-gray-700">
                  If it&apos;s not good enough for our own hair, it&apos;s not
                  going on our shelves. We test, we research, and we only stock
                  products we genuinely stand behind.
                </p>
              </div>

              <div className="bg-deep-earth/5 border border-deep-earth/20 rounded-lg p-5">
                <div className="flex items-center gap-2 mb-2">
                  <FontAwesomeIcon
                    icon={faBookOpenReader}
                    className="text-deep-earth"
                  />
                  <h3 className="font-semibold text-cocoa">Knowledge</h3>
                </div>
                <p className="text-sm text-gray-700">
                  Like any good auntie, we share what we know. Through our blog,
                  our socials, and our customer care, we&apos;re here to help
                  you learn and grow on your hair journey.
                </p>
              </div>
            </div>
          </section>

          {/* Get in Touch */}
          <section className="bg-sage-green/10 rounded-lg p-6 text-center">
            <FontAwesomeIcon
              icon={faEnvelope}
              className="text-sage-green mb-3"
              size="2x"
            />
            <h3 className="font-semibold text-cocoa text-lg mb-2">
              Get in Touch
            </h3>
            <p className="text-gray-700 text-sm mb-2">
              Got a question, a suggestion, or just want to say hello? We&apos;d
              love to hear from you.
            </p>
            <p className="text-gray-600 text-sm mb-4">
              <FontAwesomeIcon icon={faGlobe} className="text-gray-400 mr-1" />
              UK-based, shipping worldwide
            </p>
            <a
              href="mailto:hello@auntiemarlenes.com"
              className="inline-block px-6 py-3 bg-sage-green hover:bg-sage-green/90 text-white font-bold rounded-md transition-colors"
            >
              hello@auntiemarlenes.com
            </a>
          </section>
        </div>
      </div>
    </div>
  );
}
