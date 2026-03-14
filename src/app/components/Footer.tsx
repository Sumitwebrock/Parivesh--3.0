export function Footer() {
  return (
    <footer className="bg-[#1A5C1A] text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-6">
          <div>
            <h3 className="font-semibold mb-3">Quick Links</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>
                <a href="/" className="hover:underline">
                  Home
                </a>
              </li>
              <li>
                <a href="/about" className="hover:underline">
                  About PARIVESH
                </a>
              </li>
              <li>
                <a href="/downloads" className="hover:underline">
                  Downloads
                </a>
              </li>
              <li>
                <a href="/vacancies" className="hover:underline">
                  Vacancies
                </a>
              </li>
              <li>
                <a href="/guide" className="hover:underline">
                  User Guide
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:underline">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  User Manual
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  FAQs
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Important Links</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>
                <a href="/" className="hover:underline">
                  Ministry of Environment
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Forest Department
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  Wildlife Division
                </a>
              </li>
              <li>
                <a href="/" className="hover:underline">
                  CRZ Authority
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold mb-3">Contact Us</h3>
            <ul className="space-y-2 text-sm text-green-100">
              <li>Email: parivesh@nic.in</li>
              <li>Helpline: 1800-11-2345</li>
              <li>Office Hours: 9:30 AM - 5:30 PM</li>
              <li>Monday to Friday</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-green-700 pt-6 text-center">
          <p className="text-sm">
            © 2026 Ministry of Environment, Forest and Climate Change,
            Government of India
          </p>
          <p className="text-xs text-green-200 mt-2">
            Best viewed in Chrome, Firefox, Safari, Edge | Screen Resolution: 1024x768 or higher
          </p>
        </div>
      </div>
    </footer>
  );
}