import {
  faBookOpenReader,
  faEnvelope,
  faGlobe,
  faHandHoldingSeedling,
  faHeart,
  faPeopleGroup,
  faStarSharp,
  faStore,
} from '@fortawesome/pro-regular-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';

export const metadata: Metadata = {
  title: 'About Us',
  description:
    "Auntie Marlene's is a Black-owned hair and beauty store from South London. For us, by us — curating the best products for textured hair with the knowledge that comes from living it.",
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
            For us, by us. The hair and beauty store we always deserved.
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
                Walk down any high street in the UK and you&apos;ll find a Black
                hair and beauty shop. They stock our products. They serve our
                community. But they&apos;re rarely owned by us.
              </p>
              <p>
                We started Auntie Marlene&apos;s to change that. Not with a
                manifesto &mdash; just with a shop that does what those high
                street stores have always done, but with the understanding that
                comes from living it. We know these products because we use
                them. We know what works because we&apos;ve tried everything
                that doesn&apos;t.
              </p>
              <p>
                The name comes from a real auntie &mdash; but she&apos;s not
                behind the counter. She&apos;s the feeling. That person in your
                life who always knew what your hair needed before you did. Your
                hairdresser. Your cousin. The woman at church who took one look
                at your edges and said, &ldquo;Come here, let me sort that
                out.&rdquo; That&apos;s the energy we built this on: warm,
                knowing, no nonsense.
              </p>
              <p>
                Based in South London, Black-owned, and not going anywhere.
                Every product here has been chosen with intention. If it&apos;s
                on our shelves, someone on our team has used it, rated it, and
                would recommend it to their own family.
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
                Black hair care shouldn&apos;t be an afterthought on someone
                else&apos;s shelf. It should have its own home &mdash; curated
                by people who understand it, run by people who live it.
              </p>
              <p>
                We exist so that every person with coils, curls, kinks, and locs
                has a place to shop where the knowledge runs deep. Not just a
                product catalogue &mdash; a trusted source. Whether you&apos;re
                deep into your natural hair journey or just figuring out what
                works, we want you to feel confident in every product you pick
                up.
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
                You can buy these products anywhere. Pak&apos;s has them. Amazon
                has them. Every high street shop has them. So why come here?
              </p>
              <p>
                Because we&apos;re not just stocking shelves &mdash; we&apos;re
                curating them. We know which leave-in actually works on 4C hair
                and which one just sits on top. We know the difference between a
                product that smells nice and one that delivers. Every item here
                has been chosen by someone who has the same hair as you.
              </p>
              <p>
                And when you shop here, you&apos;re supporting a Black-owned
                business. Not as a favour &mdash; because we&apos;re genuinely
                the best place to find what you need. That&apos;s the standard
                we hold ourselves to.
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
                  No gimmicks, no trends we don&apos;t believe in. If we
                  recommend something, it&apos;s because we&apos;ve used it
                  ourselves. That trust is everything to us.
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
                  This shop exists because our community needed it. What we
                  stock, how we show up, where we go next &mdash; that&apos;s
                  shaped by you, not by us guessing from the outside.
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
                  going on our shelves. Simple as that. We&apos;d rather stock
                  less and stand behind everything.
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
                  We share what we know &mdash; through our blog, our socials,
                  and honest product advice. Not to sell more, but because
                  that&apos;s what community looks like.
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
