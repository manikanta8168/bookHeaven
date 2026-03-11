import "dotenv/config";
import bcrypt from "bcryptjs";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import Book from "./models/Book.js";

const seedBooks = [
  {
    title: "Atomic Habits",
    author: "James Clear",
    genre: "Self-help",
    price: 399,
    stock: 20,
    featured: true,
    pages: 320,
    language: "English",
    publisher: "Avery",
    publishedYear: 2018,
    isbn: "9780735211292",
    description:
      "A practical framework for improving every day.\n\nInstead of chasing big goals, this book focuses on tiny systems that compound over time.",
    image:
      "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?q=80&w=600"
  },
  {
    title: "The Silent Patient",
    author: "Alex Michaelides",
    genre: "Thriller",
    price: 349,
    stock: 14,
    featured: true,
    pages: 336,
    language: "English",
    publisher: "Celadon Books",
    publishedYear: 2019,
    isbn: "9781250301697",
    description:
      "A twisted psychological mystery around a woman who stops speaking after a violent crime.\n\nA therapist becomes obsessed with uncovering the truth.",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600"
  },
  {
    title: "Deep Work",
    author: "Cal Newport",
    genre: "Productivity",
    price: 429,
    stock: 8,
    pages: 304,
    language: "English",
    publisher: "Grand Central Publishing",
    publishedYear: 2016,
    isbn: "9781455586691",
    description:
      "Rules for focused success in a distracted world.\n\nCal Newport explains why depth is becoming rare and more valuable.",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600"
  },
  {
    title: "Project Hail Mary",
    author: "Andy Weir",
    genre: "Science Fiction",
    price: 499,
    stock: 11,
    featured: true,
    pages: 496,
    language: "English",
    publisher: "Ballantine Books",
    publishedYear: 2021,
    isbn: "9780593135204",
    description:
      "A lone astronaut wakes with no memory and one mission: save Earth.\n\nA fun, science-heavy survival story with humor and heart.",
    image:
      "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600"
  },
  {
    title: "Sapiens",
    author: "Yuval Noah Harari",
    genre: "History",
    price: 459,
    stock: 16,
    pages: 464,
    language: "English",
    publisher: "Harper",
    publishedYear: 2015,
    isbn: "9780062316097",
    description:
      "A sweeping narrative of human history from ancient hunter-gatherers to modern societies.\n\nIt connects biology, culture, and economics in a clear voice.",
    image:
      "https://images.unsplash.com/photo-1491841573634-28140fc7ced7?q=80&w=600"
  },
  {
    title: "The Midnight Library",
    author: "Matt Haig",
    genre: "Fiction",
    price: 379,
    stock: 13,
    pages: 304,
    language: "English",
    publisher: "Viking",
    publishedYear: 2020,
    isbn: "9780525559474",
    description:
      "Between life and death, a library lets Nora try alternate versions of her life.\n\nA reflective novel on regret, hope, and second chances.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600"
  },
  {
    title: "The Psychology of Money",
    author: "Morgan Housel",
    genre: "Finance",
    price: 389,
    stock: 22,
    featured: true,
    pages: 256,
    language: "English",
    publisher: "Harriman House",
    publishedYear: 2020,
    isbn: "9780857197689",
    description:
      "Timeless lessons about wealth, greed, and happiness.\n\nGreat for understanding behavior behind financial decisions.",
    image:
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?q=80&w=600"
  },
  {
    title: "Educated",
    author: "Tara Westover",
    genre: "Memoir",
    price: 369,
    stock: 9,
    pages: 352,
    language: "English",
    publisher: "Random House",
    publishedYear: 2018,
    isbn: "9780399590504",
    description:
      "A memoir about growing up off the grid and finding education later in life.\n\nA powerful story of self-invention and resilience.",
    image:
      "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600"
  },
  {
    title: "Dune",
    author: "Frank Herbert",
    genre: "Science Fiction",
    price: 339,
    stock: 19,
    pages: 688,
    language: "English",
    publisher: "Ace",
    publishedYear: 1965,
    isbn: "9780441013593",
    description:
      "Politics, prophecy, and survival on the desert planet Arrakis.\n\nOne of the foundational epics of modern science fiction.",
    image:
      "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600"
  },
  {
    title: "The Alchemist",
    author: "Paulo Coelho",
    genre: "Fiction",
    price: 319,
    stock: 24,
    pages: 208,
    language: "English",
    publisher: "HarperOne",
    publishedYear: 1993,
    isbn: "9780062315007",
    description:
      "A shepherd travels in search of treasure and discovers purpose.\n\nSimple language with strong symbolic themes.",
    image:
      "https://images.unsplash.com/photo-1629992101753-56d196c8aced?q=80&w=600"
  },
  {
    title: "Thinking, Fast and Slow",
    author: "Daniel Kahneman",
    genre: "Psychology",
    price: 469,
    stock: 12,
    pages: 512,
    language: "English",
    publisher: "Farrar, Straus and Giroux",
    publishedYear: 2011,
    isbn: "9780374533557",
    description:
      "A landmark exploration of two systems that drive how we think and decide.\n\nIt explains common cognitive biases with everyday examples.",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600"
  },
  {
    title: "1984",
    author: "George Orwell",
    genre: "Classic",
    price: 329,
    stock: 17,
    pages: 328,
    language: "English",
    publisher: "Signet Classic",
    publishedYear: 1949,
    isbn: "9780451524935",
    description:
      "A dystopian novel about surveillance, censorship, and truth control.\n\nIts warnings remain relevant in the digital age.",
    image:
      "https://images.unsplash.com/photo-1541963463532-d68292c34b19?q=80&w=600"
  },
  {
    title: "The Martian",
    author: "Andy Weir",
    genre: "Science Fiction",
    price: 359,
    stock: 10,
    pages: 384,
    language: "English",
    publisher: "Crown",
    publishedYear: 2014,
    isbn: "9780804139021",
    description:
      "An astronaut is stranded on Mars and has to science his way home.\n\nHigh-stakes survival with witty narration.",
    image:
      "https://images.unsplash.com/photo-1506466010722-395aa2bef877?q=80&w=600"
  },
  {
    title: "The Pragmatic Programmer",
    author: "Andrew Hunt & David Thomas",
    genre: "Technology",
    price: 489,
    stock: 7,
    featured: true,
    pages: 352,
    language: "English",
    publisher: "Addison-Wesley",
    publishedYear: 2019,
    isbn: "9780135957059",
    description:
      "Practical engineering habits for writing maintainable software.\n\nCovers craftsmanship, communication, and long-term thinking.",
    image:
      "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600"
  },
  {
    title: "Zero to One",
    author: "Peter Thiel",
    genre: "Business",
    price: 409,
    stock: 15,
    pages: 224,
    language: "English",
    publisher: "Currency",
    publishedYear: 2014,
    isbn: "9780804139298",
    description:
      "Notes on startups and building truly new products.\n\nChallenges conventional advice around competition and innovation.",
    image:
      "https://images.unsplash.com/photo-1544947950-fa07a98d237f?q=80&w=600"
  },
  {
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    genre: "Classic",
    price: 350,
    stock: 25,
    featured: true,
    pages: 281,
    language: "English",
    publisher: "J.B. Lippincott & Co.",
    publishedYear: 1960,
    isbn: "9780060935467",
    description: "A novel about the serious issues of rape and racial inequality told from the perspective of a child.\n\nIt became an immediate success, winning the Pulitzer Prize.",
    image: "https://images.unsplash.com/photo-1543004218-ee141d0ef142?q=80&w=600"
  },
  {
    title: "The Hobbit",
    author: "J.R.R. Tolkien",
    genre: "Fantasy",
    price: 499,
    stock: 30,
    pages: 310,
    language: "English",
    publisher: "Allen & Unwin",
    publishedYear: 1937,
    isbn: "9780547928227",
    description: "Bilbo Baggins is whisked away from his comfortable home by Gandalf the wizard and a company of dwarves.\n\nA classic tale of adventure.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600"
  },
  {
    title: "Clean Code",
    author: "Robert C. Martin",
    genre: "Technology",
    price: 599,
    stock: 10,
    featured: true,
    pages: 464,
    language: "English",
    publisher: "Prentice Hall",
    publishedYear: 2008,
    isbn: "9780132350884",
    description: "A Handbook of Agile Software Craftsmanship.\n\nEven bad code can function, but if code isn't clean, it can bring a development organization to its knees.",
    image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?q=80&w=600"
  },
  {
    title: "Pride and Prejudice",
    author: "Jane Austen",
    genre: "Romance",
    price: 299,
    stock: 20,
    pages: 432,
    language: "English",
    publisher: "T. Egerton",
    publishedYear: 1813,
    isbn: "9781503290563",
    description: "A romantic novel of manners that follows the character development of Elizabeth Bennet.\n\nOne of the most popular novels in English literature.",
    image: "https://images.unsplash.com/photo-1512820790803-83ca734da794?q=80&w=600"
  },
  {
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    genre: "Fiction",
    price: 399,
    stock: 12,
    pages: 234,
    language: "English",
    publisher: "Little, Brown and Company",
    publishedYear: 1951,
    isbn: "9780316769174",
    description: "The story of teenage rebellion and angst featuring Holden Caulfield.\n\nA classic coming-of-age novel.",
    image: "https://images.unsplash.com/photo-1532012197267-da84d127e765?q=80&w=600"
  }
];

const run = async () => {
  await connectDB(process.env.MONGO_URI || process.env.MONGODB_URL || process.env.MONGODB_URI);

  await Book.deleteMany({});
  await Book.insertMany(seedBooks);

  const adminEmail = "admin@leafline.dev";
  const existingAdmin = await User.findOne({ email: adminEmail });

  if (!existingAdmin) {
    const password = await bcrypt.hash("admin123", 10);
    await User.create({
      name: "Store Admin",
      email: adminEmail,
      password,
      role: "admin"
    });
  }

  console.log("Seed completed with 20 books. Admin: admin@leafline.dev / admin123");
  process.exit(0);
};

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
