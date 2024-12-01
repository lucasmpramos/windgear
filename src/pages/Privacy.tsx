import React from 'react';
import { Helmet } from 'react-helmet-async';

function Privacy() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy & Terms | Windgear</title>
        <meta name="description" content="Privacy policy, terms of service, and marketplace guidelines for Windgear" />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Privacy Policy & Terms of Service</h1>
        
        <div className="prose prose-blue max-w-none">
          {/* Important Marketplace Notice - Added at the top for visibility */}
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
            <div className="flex">
              <div className="ml-3">
                <h2 className="text-lg font-medium text-yellow-800">
                  Important Notice About Our Marketplace
                </h2>
                <p className="mt-2 text-yellow-700">
                  Windgear is a platform that connects kitesurfing equipment buyers and sellers. We do not participate in transactions, verify items, or guarantee sales. All transactions are conducted solely between users at their own risk.
                </p>
              </div>
            </div>
          </div>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Platform Role & Limitations</h2>
            <p className="text-gray-600 mb-4">
              Windgear operates exclusively as a platform connecting kitesurfing equipment buyers and sellers. We explicitly:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Do not own, sell, buy, or trade any items listed on the platform</li>
              <li>Do not verify the authenticity or condition of listed items</li>
              <li>Do not handle payments or shipping between users</li>
              <li>Do not guarantee the accuracy of listings or user claims</li>
              <li>Do not mediate disputes between users</li>
              <li>Cannot verify the identity of users beyond basic account creation</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. User Safety & Transaction Guidelines</h2>
            <p className="text-gray-600 mb-4">
              For your safety and security, we strongly recommend:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Meeting in public, well-lit locations for in-person transactions</li>
              <li>Bringing a friend or family member to meetings</li>
              <li>Thoroughly inspecting items before purchase</li>
              <li>Using secure, traceable payment methods</li>
              <li>Keeping detailed records of all communications</li>
              <li>Photographing items during exchange</li>
              <li>Never sending payment before receiving items</li>
              <li>Being wary of deals that seem too good to be true</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Fraud Prevention</h2>
            <p className="text-gray-600 mb-4">
              While we implement security measures, users are responsible for:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Verifying the legitimacy of listings and users</li>
              <li>Protecting their account credentials</li>
              <li>Reporting suspicious activity immediately</li>
              <li>Using secure payment methods</li>
              <li>Never sharing personal financial information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Liability Disclaimer</h2>
            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-gray-600 mb-4">
                By using Windgear, you acknowledge and agree that we are not liable for:
              </p>
              <ul className="list-disc pl-6 text-gray-600 mb-4">
                <li>Any losses or damages resulting from transactions</li>
                <li>Fraudulent listings or scams</li>
                <li>Stolen or counterfeit items</li>
                <li>Quality or condition of items</li>
                <li>User behavior or communications</li>
                <li>Payment disputes between users</li>
                <li>Personal injury or property damage</li>
                <li>Lost, damaged, or undelivered items</li>
              </ul>
            </div>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Information Collection</h2>
            <p className="text-gray-600 mb-4">We collect and process:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Account information (email, name, location)</li>
              <li>Listing details and images</li>
              <li>User communications through our platform</li>
              <li>Usage data and analytics</li>
              <li>Device and browser information</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Prohibited Activities</h2>
            <p className="text-gray-600 mb-4">Users are strictly prohibited from:</p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Creating fraudulent or misleading listings</li>
              <li>Selling stolen or counterfeit items</li>
              <li>Harassing or threatening other users</li>
              <li>Creating multiple accounts for deceptive purposes</li>
              <li>Manipulating prices or feedback</li>
              <li>Using the platform for illegal activities</li>
              <li>Circumventing our security measures</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Account Termination</h2>
            <p className="text-gray-600 mb-4">
              We reserve the right to suspend or terminate accounts that:
            </p>
            <ul className="list-disc pl-6 text-gray-600 mb-4">
              <li>Violate our terms of service</li>
              <li>Engage in fraudulent activity</li>
              <li>Receive multiple user complaints</li>
              <li>Pose a risk to our community</li>
            </ul>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Changes to Terms</h2>
            <p className="text-gray-600 mb-4">
              We may update these terms at any time. Continued use of Windgear after changes constitutes acceptance of new terms.
            </p>
          </section>

          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Contact Information</h2>
            <p className="text-gray-600">
              For support or to report suspicious activity:<br />
              Email: support@windgear.com<br />
              Emergency: Contact local law enforcement for crimes or threats
            </p>
          </section>

          <div className="text-sm text-gray-500 mt-8">
            Last Updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </div>
    </>
  );
}

export default Privacy;