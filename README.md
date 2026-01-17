# Rabuste Café – Project Documentation

## 1. Project Vision
Rabuste Café is a digital experience designed to reflect the personality of a modern, premium coffee brand built around bold Robusta coffee. The goal is to create more than a static website: it should feel like an interactive, curated experience that blends coffee, art, learning, and community.

**Current Achievement:**
• A working single-page application that simulates a full coffee shop experience online.
• A consistent brand identity with gothic typography, warm coffee-inspired colors, and subtle motion.
• An integrated AI “virtual barista” that helps users explore the menu conversationally.
• **Fully functional Admin Dashboard** for real-time sales insights and store management.
• **Interactive Franchise Portal** for potential partners.

---

## 2. User Experience and Main Flows

### 2.1 Home Experience
The home screen introduces Rabuste Café as a premium, story-driven coffee brand. It currently includes:
• **Hero Section**: Highlights the core brand promise with cinematic video backgrounds and "scrolling text" animations.
• **Interactive Storytelling**: A sticky or parallax-style section that keeps key brand messages in view as the user scrolls.
• **Gallery Teaser**: Hints at the café’s art and design elements.
• **Menu Preview**: Encourages users to dive deeper into drinks and offerings.
• **Reviews**: Social proof section to build trust.

### 2.2 Menu and Ordering Journey
The menu page presents the full Rabuste offering, structured into clear categories (Cold Coffee, Hot Classics, Manual Brews, Food).
• **Cart System**: Users can add items, adjust quantities, and manage their cart. State is persisted across sessions.
• **Smart categorization**: Filter by "Veg/Non-Veg" and dynamic categories.
• **Checkout Simulation**: A complete flow from cart -> checkout -> simulated payment.

### 2.3 Track Order [NEW]
A dedicated **Track Order** page allows customers to monitor their order status in real-time.
• **Email Lookup**: Users can retrieve their past and active orders by entering their email.
• **Live Status**: Visual indicators for order stages: *Placed*, *Preparing*, *Ready*.
• **Visual Polish**: Uses the same premium video backgrounds and seamless transitions as the main site.

### 2.4 Franchise Opportunities [NEW]
A robust platform for potential business partners, featuring:
• **Interactive Roadmap**: A scrolling SVG-animated timeline detailing the journey from "Inquiry" to "Launch".
• **Financial Clarity**: Clear breakdown of investment metrics (Royalty, Ad Fund, ROI) presented in interactive cards.
• **Enquiry System**: Integrated form for submitting franchise interest, directly linked to the Admin Dashboard.

### 2.5 Workshops & Art
• **Workshops**: Users can browse upcoming coffee brewing sessions and community events.
• **Art Gallery**: A digital gallery showcasing the artistic side of the brand.

### 2.6 Virtual Barista – Rabuste BrewDesk
A floating AI-powered chat widget (`src/components/ChatWidget.tsx`) that acts as a digital concierge.
• **Gemini Integration**: Connected to Google's Gemini models via a custom backend service.
• **Context Aware**: Knows the full menu, prices, and brand philosophy.
• **Smart Fallbacks**: Gracefully handles errors and off-topic queries.

---

## 3. Admin Experience and Operations [UPDATED]
The Admin Dashboard (`src/components/AdminDashboard.tsx`) has evolved from a simple gate into a comprehensive command center for café operations.

### 3.1 Real-Time Insights
• **Sales Dashboard**: Visual charts showing revenue trends, popular items, and category distribution.
• **Tag Performance**: Analysis of which flavor profiles (e.g., "Bold", "Sweet") are trending.
• **Item Affinity**: AI-driven insights into products frequently bought together.

### 3.2 Store Management
• **Global Store Status**: One-click toggle to open/close the online store (displays "PAUSED" to users).
• **Service Toggles**: Granular control to enable/disable specific services like *Art Orders* or *Menu Orders* independently.

### 3.3 Content Management
• **Menu Editor**: Add, edit, or delete beverages and food items. Supports image uploads, pricing, and nutritional info (caffeine, calories).
• **Category Manager**: Dynamically create and organize menu categories and sub-categories.
• **Art & Workshops**: Full CRUD capabilities for managing gallery pieces and workshop schedules.

### 3.4 Franchise Management
• **Enquiry Inbox**: View and manage franchise applications submitted through the website.
• **FAQ Manager**: Add or remove questions from the Franchise FAQ section directly from the admin panel.

---

## 4. Technical Architecture

### 4.1 Tech Stack
• **Frontend**: React (Vite), TypeScript, Tailwind CSS, Framer Motion.
• **Backend**: Node.js, Express, SQLite (local database).
• **AI**: Google Gemini API for the Chatbot.

### 4.2 Key Features
• **Persistent Cart**: LocalStorage-based cart management.
• **Responsive Design**: Mobile-first approach with custom animations for all screen sizes.
• **Secure Routes**: specific `/admin` routes guarded by detailed authentication logic.

---

## 5. Future Implementations
*Supported by design flowcharts and serving as the roadmap for future development.*

### 5.1 Intelligent Recommendation System
A hybrid recommendation framework combining predefined logic with machine learning.
• **Contextual Inputs**: User mood, time of day, and current activity.
• **Behavioral Analysis**: Suggestions based on recent orders and category preferences.

### 5.2 Smart Checkout
• **Rule-Based Pairing**: Standard suggestions (e.g., Croissant with Cappuccino).
• **Collaborative Filtering**: AI suggestions based on "Users who bought X also bought Y".

### 5.3 Advanced Store Locator
• Interactive map integration for finding physical store locations.
