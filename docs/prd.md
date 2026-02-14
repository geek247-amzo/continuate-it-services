# Product Requirements Document (PRD) for Continuate IT Services Website

## Version History
- **Version 1.0**  
  Date: February 9, 2026  
  Author: Grok (Assisted by Amrish)  
  Description: Initial draft for black and white themed website with integrated portals.

## 1. Overview
### 1.1 Product Summary
The Continuate IT Services website is a professional, minimalist online platform designed to showcase the company's IT Managed Security Service Provider (MSSP) offerings, including NOC/SOC services, cybersecurity, backups, networking, CCTV, biometrics, server rooms, and hardware installations. Established in 2015 and based in Johannesburg, South Africa, the website will emphasize reliability, security, and innovation in IT solutions for SMEs.

The site adopts a black and white theme for a clean, high-contrast, professional aesthetic, aligning with the tech-savvy, secure nature of IT services. It will feature high-quality images and user flows to highlight products and services, ensuring an engaging yet straightforward user experience.

Key integrations include:
- A subscription management portal for clients to handle fixed-rate plans, add-ons, billing, and account management.
- A helpdesk portal for ticket submission, tracking, and support, integrated with Atera's MSP tools for admins and users.

The website will be responsive, mobile-first, and optimized for SEO to attract Johannesburg-based SMEs in sectors like finance, retail, and manufacturing.

### 1.2 Business Goals
- Increase lead generation by 30% through clear service showcases and CTAs.
- Improve client retention via self-service portals for subscriptions and support.
- Establish brand authority as a leading MSSP in Gauteng since 2015.
- Reduce administrative overhead by automating subscription management and helpdesk ticketing.
- Achieve a conversion rate of 10% from visitors to inquiries/subscriptions.

### 1.3 Scope
**In Scope:**
- Homepage, About Us, Services, Pricing, Blog/Resources, Contact.
- Client Portal: Subscription management and helpdesk.
- Admin Dashboard: For internal management of users, tickets, and subscriptions.
- Black and white theme with grayscale images.
- Integration with Atera for helpdesk backend.
- Basic analytics (e.g., Google Analytics integration).

**Out of Scope:**
- E-commerce for hardware sales (quote-based only).
- Advanced AI features (e.g., chatbots).
- Multilingual support (English only).
- Custom mobile app (website is responsive).

### 1.4 Assumptions and Dependencies
- Development uses a CMS like WordPress or static site generator (e.g., Next.js) for ease of updates.
- Atera API integration for helpdesk and monitoring data.
- Stock or custom grayscale images for visuals.
- Hosting on a secure platform (e.g., AWS or local SA provider) with SSL.
- Compliance with POPIA for data handling.

## 2. User Personas
### 2.1 Primary Persona: SME IT Manager (User/Client)
- **Name:** Alex Johnson  
- **Role:** IT Manager at a mid-sized retail firm in Johannesburg.  
- **Goals:** Find affordable, reliable IT support; manage subscriptions easily; submit support tickets quickly.  
- **Pain Points:** Unpredictable IT costs, slow support response, lack of visibility into services.  
- **Tech Savvy:** Medium-high; uses web portals daily.

### 2.2 Secondary Persona: Business Owner (Decision Maker)
- **Name:** Sarah Mbeki  
- **Role:** Owner of a small manufacturing business.  
- **Goals:** Understand services, compare pricing, contact for quotes.  
- **Pain Points:** Overwhelmed by tech jargon, needs simple visuals and flows.  
- **Tech Savvy:** Low-medium; prefers intuitive navigation.

### 2.3 Admin Persona: Continuate Technician/Admin
- **Name:** Thabo Nkosi  
- **Role:** Internal technician or admin.  
- **Goals:** Monitor tickets, manage subscriptions, access client data.  
- **Pain Points:** Manual processes; needs centralized dashboard.  
- **Tech Savvy:** High; familiar with Atera.

## 3. Design and Theme Specifications
### 3.1 Overall Theme
- **Color Palette:**  
  - Primary: Black (#000000) for text/backgrounds.  
  - Secondary: White (#FFFFFF) for backgrounds/text.  
  - Accents: Grayscale shades (#333333 to #CCCCCC) for hover effects, borders, and subtle highlights.  
  - No colors; all elements in black, white, or gray to evoke professionalism, security, and minimalism.

- **Typography:**  
  - Font Family: Sans-serif (e.g., Inter or Roboto) for readability.  
  - Headings: Bold, 24-48pt, black on white.  
  - Body Text: 16pt, gray (#333333) on white.  
  - Links: Underlined on hover, gray to black transition.

- **Layout:**  
  - Grid-based, responsive (mobile: 320px+, tablet: 768px+, desktop: 1024px+).  
  - Header: Fixed navigation bar (black background, white text).  
  - Footer: Black with white links, copyright, and contact info.  
  - Spacing: Ample white space for a clean feel; 16-32px margins/padding.

### 3.2 Image Specifications
- **Style:** All images in grayscale (black and white filter applied) to match theme. High-resolution, professional stock or custom photos/illustrations.  
- **Formats:** WebP for optimization; fallback to PNG/JPG.  
- **Sizes:**  
  - Hero Images: 1920x1080px (full-width, compressed to <200KB).  
  - Service Icons/Thumbnails: 300x300px squares.  
  - Gallery/Flow Diagrams: 800x600px, vector-based for scalability.  
- **Alt Text:** Descriptive for accessibility (e.g., "Grayscale image of secure server room installation").  
- **Usage:** Lazy loading; used sparingly to maintain fast load times (<3s). Examples:  
  - Service pages: Flowcharts showing NOC/SOC processes (e.g., threat detection flow in grayscale diagram).  
  - Testimonials: Grayscale headshots.

### 3.3 User Flows and Wireframes
- **High-Level Flows:**  
  1. **Visitor to Lead:** Homepage > Services > Pricing > Contact Form (CTA buttons throughout).  
  2. **Client Signup/Login:** Header Login > Portal Dashboard > Subscription Setup.  
  3. **Support Request:** Portal > Helpdesk > New Ticket > Track Status.  
  4. **Admin Management:** Admin Login > Dashboard > View Tickets/Subscriptions.

- **Key Wireframe Specs:**  
  - **Homepage:** Hero section with grayscale IT infrastructure image, tagline "Secure IT Continuity Since 2015", service teasers in cards.  
  - **Services Page:** Accordion or tabbed sections for each service (e.g., Cybersecurity: Description + grayscale flow diagram of threat response).  
  - **Pricing Page:** Tiered cards (Tier 1-3 fixed rates), add-on checkboxes, "Subscribe Now" button leading to portal.  
  - **Portal Dashboard:** Sidebar navigation (Subscriptions, Helpdesk, Account), main content with tables/charts (grayscale).  

## 4. Functional Requirements
### 4.1 Core Website Features
- **Navigation:**  
  - Main Menu: Home, About, Services, Pricing, Blog, Contact, Login.  
  - Sub-Menus: Under Services (e.g., Managed IT, Cybersecurity, Hardware).  
- **Content Pages:**  
  - About: Company history since 2015, team bios with grayscale photos.  
  - Services: Detailed descriptions, benefits, grayscale images/flows (e.g., CCTV installation flow: Consultation > Design > Install > Monitor).  
  - Pricing: Fixed-rate tiers (e.g., Tier 1: R2,500/month), add-ons, calculator widget.  
  - Blog: Articles on IT trends, SEO-optimized.  
  - Contact: Form with fields (Name, Email, Message), map of Johannesburg location.
- **Search Functionality:** Site-wide search bar for services/articles.

### 4.2 Subscription Management Portal
- **User Features:**  
  - View/manage subscriptions (e.g., upgrade from base to +cybersecurity).  
  - Billing history, invoice downloads (PDF).  
  - Payment integration (e.g., PayFast or Stripe for SA).  
  - Auto-renewal toggles, cancellation requests.  
- **Admin Features:**  
  - Approve/deny subscriptions, view client details.  
  - Reporting: Active subs, revenue dashboards (grayscale charts).  
- **Integration:** Sync with Atera for device monitoring data display.

### 4.3 Helpdesk Portal
- **User Features:**  
  - Ticket creation: Form with category (e.g., NOC issue, Backup query), attachments, priority.  
  - Ticket tracking: Status updates, comments, history.  
  - Knowledge Base: Searchable FAQs/articles.  
- **Admin Features:**  
  - Ticket assignment, responses, escalations.  
  - Analytics: Response times, common issues (grayscale graphs).  
- **Integration:** Atera backend for real-time NOC/SOC alerts; email/SMS notifications.

## 5. Non-Functional Requirements
### 5.1 Performance
- Page Load Time: <3 seconds on 4G.  
- Uptime: 99.9% with monitoring.  

### 5.2 Security
- HTTPS, CAPTCHA on forms.  
- Role-based access (user vs. admin).  
- Data encryption for portals.  
- Compliance: POPIA, GDPR basics.

### 5.3 Accessibility
- WCAG 2.1 AA compliant: High contrast (black/white), alt text, keyboard navigation.  

### 5.4 SEO and Analytics
- Meta tags, sitemap.xml.  
- Track user behavior via Google Analytics.

## 6. Technical Specifications
- **Frontend:** HTML5, CSS3 (Tailwind for black/white styling), JavaScript (React for portals).  
- **Backend:** Node.js or PHP, database (MongoDB/MySQL) for user data.  
- **APIs:** Atera API for helpdesk; payment gateways.  
- **Testing:** Unit, integration, user testing; cross-browser (Chrome, Firefox, Safari).

## 7. Timeline and Milestones
- **Phase 1 (1-2 months):** Design wireframes, theme development.  
- **Phase 2 (2-3 months):** Core site build, portal integrations.  
- **Phase 3 (1 month):** Testing, launch.  
- Launch Date: Q2 2026.

## 8. Risks and Mitigations
- Risk: Atera integration delays – Mitigation: Start with mock data.  
- Risk: Theme limits visual appeal – Mitigation: Use subtle grays for depth.  
- Risk: Low traffic – Mitigation: SEO and paid ads.

## Appendices
- Wireframe Sketches (to be added).  
- Sample Grayscale Images.  
- API Documentation Links (e.g., Atera API).