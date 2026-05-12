import dbConnect from "@/lib/mongodb";
import Location from "@/models/Location";
import LocationsClient from "./LocationsClient";

export default async function AdminLocationsPage({ params }) {
  const { locale } = await params;
  await dbConnect();

  const locations = await Location.find().sort({ order: 1 }).lean();
  return (
    <LocationsClient
      initialLocations={JSON.parse(JSON.stringify(locations))}
      locale={locale}
    />
  );
}
