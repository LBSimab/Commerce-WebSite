import TeamCard from "./TeamCard";

export default function TeamBlock({ teamMembers, locale }) {
  if (!teamMembers || teamMembers.length === 0) return null;

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-gray-50 mb-12 text-center">
          {locale === "fa" ? "اعضای تیم ما" : "Our Team"}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {teamMembers.map((member) => (
            <TeamCard key={member._id} member={member} locale={locale} />
          ))}
        </div>
      </div>
    </section>
  );
}
