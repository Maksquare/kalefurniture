

export const metadata = {
  title: "About Us | Kal Furniture",
  description: "Learn about our heritage, craftsmanship, and dedication to timeless furniture design.",
};

const AboutPage = () => {
  return (
    <div className="overflow-hidden min-h-screen">
      <main className="pt-32 pb-24 xl:pt-40 xl:pb-32 container">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="font-primary text-[40px] md:text-[52px] font-light text-secondary leading-[1.1] tracking-[-0.02em] mb-6">
            A Legacy of <em className="text-gold not-italic font-semibold">Craftsmanship.</em>
          </h1>
          <p className="font-secondary text-[16px] text-secondary/70 leading-relaxed">
            At Kal Furniture, we believe that a home is more than just a physical space—it is a sanctuary. For over two decades, we have dedicated ourselves to designing and crafting furniture that embodies elegance, comfort, and enduring quality.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="relative h-[400px] xl:h-[600px] w-full bg-muted/50 overflow-hidden">
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url('https://images.unsplash.com/photo-1595515106969-1ce29566ff1c?q=80&w=800&auto=format&fit=crop')` }}
            />
          </div>
          <div>
            <h2 className="font-primary text-[32px] text-secondary mb-6">Our Philosophy</h2>
            <p className="font-secondary text-[15px] text-secondary/70 leading-relaxed mb-6">
              Every piece in our collection is born from a meticulous process. We source only the finest sustainable materials, ensuring that each grain of wood and thread of fabric meets our rigorous standards. 
            </p>
            <p className="font-secondary text-[15px] text-secondary/70 leading-relaxed">
              Our artisans blend traditional woodworking techniques with modern design sensibilities to create furniture that not only looks beautiful but stands the test of time. We don't just furnish rooms; we help you create a backdrop for your life's most cherished moments.
            </p>
          </div>
        </div>
      </main>

    </div>
  );
};

export default AboutPage;
