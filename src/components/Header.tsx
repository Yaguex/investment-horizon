import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const Header = () => {
  const menuItems = ["Dashboard", "Portfolio", "Transactions", "Settings"];

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-primary border-b border-gray-200 z-50">
      <div className="container h-full mx-auto px-4 flex items-center justify-between">
        <div className="text-2xl font-bold text-white">InvestTrack</div>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-white hover:bg-primary/90">
              <Menu className="h-6 w-6" />
            </Button>
          </SheetTrigger>
          <SheetContent>
            <nav className="flex flex-col gap-4 mt-8">
              {menuItems.map((item) => (
                <button
                  key={item}
                  className="text-left px-4 py-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  {item}
                </button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  );
};

export default Header;