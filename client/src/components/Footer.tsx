import { Link } from "wouter";

export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-12 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">Indian Cotton</h3>
            <p className="text-gray-400 text-sm">Premium quality fabrics for all your needs. From traditional to contemporary designs, we have it all.</p>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Home</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Shop</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Categories</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white">About Us</a></Link></li>
              <li><Link href="/"><a className="text-gray-400 hover:text-white">Contact</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/?category=lehenga"><a className="text-gray-400 hover:text-white">Lehenga</a></Link></li>
              <li><Link href="/?category=frock"><a className="text-gray-400 hover:text-white">Frock</a></Link></li>
              <li><Link href="/?category=kurta"><a className="text-gray-400 hover:text-white">Kurta</a></Link></li>
              <li><Link href="/?category=net"><a className="text-gray-400 hover:text-white">Net</a></Link></li>
              <li><Link href="/?category=cutpiece"><a className="text-gray-400 hover:text-white">Cutpiece</a></Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium mb-4">Contact Us</h4>
            <ul className="space-y-2 text-sm text-gray-400">
              <li className="flex items-start">
                <i className="fas fa-map-marker-alt mt-1 mr-2"></i>
                <span>Rangar Galli, City Chowk, Aurangabad, 431001</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-phone-alt mr-2"></i>
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center">
                <i className="fas fa-envelope mr-2"></i>
                <span>info@indiancotton.com</span>
              </li>
            </ul>
            
            <div className="mt-4 flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white">
                <i className="fab fa-pinterest"></i>
              </a>
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-400">&copy; {new Date().getFullYear()} Indian Cotton. All rights reserved.</p>
          <div className="mt-4 md:mt-0 flex space-x-4">
            <a href="#" className="text-sm text-gray-400 hover:text-white">Privacy Policy</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Terms of Service</a>
            <a href="#" className="text-sm text-gray-400 hover:text-white">Shipping Policy</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
