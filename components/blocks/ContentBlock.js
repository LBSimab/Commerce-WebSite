import HeroBlock from "./HeroBlock";
import TextBlock from "./TextBlock";
import FeaturesBlock from "./FeaturesBlock";
import TeamBlock from "./TeamBlock";
import LocationsBlock from "./LocationsBlock";
import TestimonialsBlock from "./TestimonialsBlock";
import CTABlock from "./CTABlock.js";
import ContactFormBlock from "./ContactFormBlock";
import ContactInfoBlock from "./ContactInfoBlock";

const blockComponents = {
  hero: HeroBlock,
  text: TextBlock,
  features: FeaturesBlock,
  team: TeamBlock,
  locations: LocationsBlock,
  testimonials: TestimonialsBlock,
  cta: CTABlock,
  "contact-form": ContactFormBlock,
  "contact-info": ContactInfoBlock,
};

export default function ContentBlocks({
  blocks,
  teamMembers = [],
  locations = [],
  reviews = [],
  locale,
  page,
}) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-4">
          {locale === "fa" ? "محتوایی یافت نشد" : "No content found"}
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          {locale === "fa"
            ? "این بخش هنوز تکمیل نشده است."
            : "This section has not been set up yet."}
        </p>
      </div>
    );
  }

  return (
    <div>
      {blocks.map((block) => {
        const Component = blockComponents[block.type];
        if (!Component) return null;

        return (
          <Component
            key={block._id}
            data={block.data || {}}
            teamMembers={teamMembers}
            locations={locations}
            reviews={reviews}
            locale={locale}
            page={page}
          />
        );
      })}
    </div>
  );
}
