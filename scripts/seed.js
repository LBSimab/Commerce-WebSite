import mongoose from "mongoose";
import Category from "../models/Category.js";
import Product from "../models/Product.js";
import Location from "../models/Location.js";
import Warehouse from "../models/Warehouse.js";
import Item from "../models/Item.js";
import Review from "../models/Review.js";
import User from "../models/User.js";

const MONGODB_URI =
  process.env.MONGODB_URI || "mongodb://localhost:27017/sahandcover";

async function seedDatabase() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("Connected successfully\n");

    // Clear all existing data
    console.log("Clearing existing data...");
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Location.deleteMany({});
    await Warehouse.deleteMany({});
    await Item.deleteMany({});
    await Review.deleteMany({});
    await User.deleteMany({});
    console.log("Existing data cleared\n");

    // ----- CATEGORIES -----
    console.log("Creating categories...");
    const seatCovers = await Category.create({
      name: "Seat Covers",
      nameFa: "کاور صندلی",
      description: "Premium car seat covers for all models",
      descriptionFa: "کاور صندلی با کیفیت برای تمام مدل‌های خودرو",
      image: "",
      order: 1,
    });

    const steeringWheels = await Category.create({
      name: "Steering Wheels",
      nameFa: "فرمان",
      description: "Steering wheel covers and accessories",
      descriptionFa: "روکش و لوازم جانبی فرمان",
      image: "",
      order: 2,
    });

    const floorMats = await Category.create({
      name: "Floor Mats",
      nameFa: "کفپوش",
      description: "All-weather floor protection",
      descriptionFa: "محافظت از کف خودرو در تمام فصول",
      image: "",
      order: 3,
    });
    console.log(`Categories created: ${await Category.countDocuments()}\n`);

    // ----- LOCATIONS -----
    console.log("Creating locations...");
    const tehranWarehouse = await Location.create({
      name: "Tehran Warehouse",
      nameFa: "انبار تهران",
      type: "warehouse",
      address: "Tehran, South Industrial Zone, Warehouse District",
      addressFa: "تهران، منطقه صنعتی جنوب، شهرک انبارها",
      phone: "021-12345678",
      email: "warehouse@sahandcover.com",
      workingHours: "Sat-Thu: 8 AM - 6 PM",
      workingHoursFa: "شنبه تا پنجشنبه: ۸ صبح تا ۶ عصر",
      order: 1,
    });

    const tabrizWarehouse = await Location.create({
      name: "Tabriz Warehouse",
      nameFa: "انبار تبریز",
      type: "warehouse",
      address: "Tabriz, Industrial Zone",
      addressFa: "تبریز، منطقه صنعتی",
      phone: "041-87654321",
      email: "tabriz@sahandcover.com",
      workingHours: "Sat-Thu: 8 AM - 5 PM",
      workingHoursFa: "شنبه تا پنجشنبه: ۸ صبح تا ۵ عصر",
      order: 2,
    });

    const mainStore = await Location.create({
      name: "SahandCover Main Store",
      nameFa: "فروشگاه اصلی سهندکاور",
      type: "store",
      address: "Tehran, Valiasr St, No. 123",
      addressFa: "تهران، خیابان ولیعصر، پلاک ۱۲۳",
      phone: "021-99999999",
      phone2: "0912-3456789",
      email: "info@sahandcover.com",
      workingHours: "Sat-Thu: 9 AM - 9 PM, Fri: 10 AM - 4 PM",
      workingHoursFa: "شنبه تا پنجشنبه: ۹ صبح تا ۹ شب، جمعه: ۱۰ صبح تا ۴ عصر",
      order: 1,
    });
    console.log(`Locations created: ${await Location.countDocuments()}\n`);

    // ----- WAREHOUSES -----
    console.log("Creating warehouses...");
    const mainWarehouse = await Warehouse.create({
      name: "Main Warehouse",
      location: tehranWarehouse._id,
      capacity: 1000,
      code: "MAIN01",
    });

    const secondWarehouse = await Warehouse.create({
      name: "Second Warehouse",
      location: tabrizWarehouse._id,
      capacity: 500,
      code: "SEC02",
    });
    console.log(`Warehouses created: ${await Warehouse.countDocuments()}\n`);

    // ----- PRODUCTS -----
    console.log("Creating products...");
    const product1 = await Product.create({
      name: "Premium Leather Seat Cover Set",
      nameFa: "ست کاور صندلی چرم طبیعی",
      description:
        "High-quality genuine leather seat covers. Custom-fit for most car models. Includes front and rear seats complete set. Water-resistant and easy to clean.",
      descriptionFa:
        "کاور صندلی چرم طبیعی با کیفیت بالا. مناسب برای اکثر مدل‌های خودرو. شامل ست کامل صندلی‌های جلو و عقب. مقاوم در برابر آب و قابل شستشو.",
      price: 2500000,
      category: seatCovers._id,
      mainImage: "",
      images: [],
      colors: ["Black", "Beige", "Gray"],
      compatibleCars: ["Pride", "Samand", "206", "Tiba"],
      material: "Genuine Leather",
    });

    const product2 = await Product.create({
      name: "Sport Fabric Seat Cover",
      nameFa: "کاور صندلی اسپرت پارچه‌ای",
      description:
        "Breathable sport fabric seat covers. Perfect for hot weather. Machine washable and durable. Available in multiple colors.",
      descriptionFa:
        "کاور صندلی پارچه‌ای اسپرت با قابلیت تنفس. مناسب برای هوای گرم. قابل شستشو با ماشین لباسشویی و بادوام. در رنگ‌های متنوع.",
      price: 1200000,
      category: seatCovers._id,
      mainImage: "",
      images: [],
      colors: ["Red", "Blue", "Black"],
      compatibleCars: ["Pride", "Samand", "206", "Tiba", "L90"],
      material: "Polyester Fabric",
    });

    const product3 = await Product.create({
      name: "Leather Steering Wheel Cover",
      nameFa: "روکش فرمان چرم طبیعی",
      description:
        "Genuine leather steering wheel cover. Anti-slip design for better grip. Easy to install without tools. Universal fit for most steering wheels.",
      descriptionFa:
        "روکش فرمان چرم طبیعی. طراحی ضد لغزش برای کنترل بهتر. نصب آسان بدون نیاز به ابزار. مناسب برای اکثر فرمان‌های خودرو.",
      price: 450000,
      category: steeringWheels._id,
      mainImage: "",
      images: [],
      colors: ["Black", "Brown", "Gray"],
      compatibleCars: [],
      material: "Genuine Leather",
    });

    const product4 = await Product.create({
      name: "Carbon Fiber Steering Wheel Wrap",
      nameFa: "گارد فرمان فیبر کربن",
      description:
        "Sporty carbon fiber pattern steering wheel cover. Provides excellent grip and modern look. UV resistant and long-lasting.",
      descriptionFa:
        "روکش فرمان با طرح فیبر کربن اسپرت. چسبندگی عالی و ظاهری مدرن. مقاوم در برابر اشعه UV و بادوام.",
      price: 350000,
      category: steeringWheels._id,
      mainImage: "",
      images: [],
      colors: ["Black", "Silver"],
      compatibleCars: [],
      material: "Carbon Fiber PVC",
    });

    const product5 = await Product.create({
      name: "All-Weather Floor Mats Set",
      nameFa: "ست کفپوش تمام فصول",
      description:
        "Heavy-duty rubber floor mats. Deep grooves trap water, mud, and snow. Easy to remove and clean. Complete set of 4 mats.",
      descriptionFa:
        "کفپوش لاستیکی سنگین. شیارهای عمیق برای نگهداری آب، گل و برف. قابل شستشو و تمیز کردن آسان. ست کامل ۴ عددی.",
      price: 800000,
      category: floorMats._id,
      mainImage: "",
      images: [],
      colors: ["Black", "Gray"],
      compatibleCars: ["Pride", "Samand", "206", "Tiba", "L90"],
      material: "Rubber",
    });

    const product6 = await Product.create({
      name: "Premium Carpet Floor Mats",
      nameFa: "کفپوش مخملی لوکس",
      description:
        "Luxurious carpet floor mats with embroidered logo. Thick pile for comfort and sound insulation. Available in multiple colors.",
      descriptionFa:
        "کفپوش مخملی لوکس با لوگوی گلدوزی شده. پرزهای ضخیم برای راحتی و عایق صدا. در رنگ‌های متنوع.",
      price: 650000,
      category: floorMats._id,
      mainImage: "",
      images: [],
      colors: ["Black", "Beige", "Gray"],
      compatibleCars: ["Samand", "206", "L90"],
      material: "Nylon Carpet",
    });

    const allProducts = [
      product1,
      product2,
      product3,
      product4,
      product5,
      product6,
    ];
    console.log(`Products created: ${allProducts.length}\n`);

    // ----- ITEMS -----
    console.log("Creating items (stock for each variant)...");

    // Product 1: 4 colors × 4 cars = many combos — let's create a subset
    const createItemsForProduct = async (
      product,
      warehouse,
      colorList,
      carList,
    ) => {
      const items = [];
      const actualColors = colorList.length > 0 ? colorList : [null];
      const actualCars = carList.length > 0 ? carList : [null];

      for (const color of actualColors) {
        for (const car of actualCars) {
          items.push({
            product: product._id,
            warehouse: warehouse._id,
            color: color,
            compatibleCar: car,
            quantity: Math.floor(Math.random() * 30) + 5,
            lowStockThreshold: 5,
            location: `A${Math.floor(Math.random() * 5) + 1}-S${Math.floor(Math.random() * 10) + 1}`,
          });
        }
      }
      return items;
    };

    // Create items in both warehouses for all products
    for (const product of allProducts) {
      const items1 = await createItemsForProduct(
        product,
        mainWarehouse,
        product.colors,
        product.compatibleCars,
      );
      const items2 = await createItemsForProduct(
        product,
        secondWarehouse,
        product.colors,
        product.compatibleCars,
      );

      if (items1.length > 0) await Item.insertMany(items1);
      if (items2.length > 0) await Item.insertMany(items2);
    }

    console.log(`Items created: ${await Item.countDocuments()}\n`);

    // ----- REVIEWS -----
    console.log("Creating reviews...");
    await Review.insertMany([
      {
        product: product1._id,
        reviewerName: "Ali Rezaei",
        rating: 5,
        title: "عالی و باکیفیت",
        comment:
          "Excellent quality leather covers. Perfect fit for my Samand. The stitching is professional and the material feels premium.",
        pros: ["Perfect fit", "Premium leather", "Easy to clean"],
        cons: [],
        isApproved: true,
        isVerifiedPurchase: true,
      },
      {
        product: product1._id,
        reviewerName: "Sara Mohammadi",
        rating: 4,
        title: "خوب اما نصب سخت",
        comment:
          "Good quality but installation took some time. Looks great after setup.",
        pros: ["Looks great", "Good material"],
        cons: ["Difficult installation"],
        isApproved: true,
        isVerifiedPurchase: true,
      },
      {
        product: product3._id,
        reviewerName: "Reza Karimi",
        rating: 4,
        title: "چسبندگی عالی",
        comment: "Great grip, feels premium. The leather smell is nice too.",
        pros: ["Good grip", "Nice smell"],
        cons: ["Slightly expensive"],
        isApproved: true,
        isVerifiedPurchase: true,
      },
      {
        product: product5._id,
        reviewerName: "Maryam Ahmadi",
        rating: 5,
        title: "مناسب برای روزهای بارانی",
        comment: "Perfect for rainy days. Easy to clean, just hose them down.",
        pros: ["Easy to clean", "Durable"],
        cons: [],
        isApproved: true,
        isVerifiedPurchase: true,
      },
    ]);
    console.log(`Reviews created: ${await Review.countDocuments()}\n`);

    // ----- DEMO -----
    console.log("--- Seed Demo ---");
    const demoProduct = await Product.findOne();
    const availableColors = await demoProduct.getAvailableColors(
      mainWarehouse._id,
    );
    console.log(`${demoProduct.name}:`);
    console.log(`  Available colors: ${availableColors.join(", ")}`);

    if (availableColors.length > 0) {
      const cars = await demoProduct.getAvailableCars(
        mainWarehouse._id,
        availableColors[0],
      );
      console.log(`  Cars for ${availableColors[0]}: ${cars.join(", ")}`);

      const stock = await demoProduct.getVariantStock(
        mainWarehouse._id,
        availableColors[0],
        cars[0],
      );
      console.log(
        `  Stock for ${availableColors[0]} + ${cars[0]}: ${stock.available} available`,
      );
    }

    console.log("\n✅ Database seeded successfully!");
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("\n❌ Error seeding database:", error.message);
    console.error(error);
    process.exit(1);
  }
}

seedDatabase();
