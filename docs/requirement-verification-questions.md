# Photo Proof Mobile App - Requirements Verification Questions

     Please answer each question by filling in the letter choice after the [Answer]: tag.
     If none of the options match your needs, choose "Other" and describe your preference.

     ---

     ## Section 1: Target Users & Scope

     ### Question 1
     Who is the PRIMARY target user for the mobile app?

     A) Studio users only (photographers managing their business)
     B) Client users only (customers viewing and selecting photos)
     C) Both studio and client users with equal priority
     D) Both users, but client features are higher priority for mobile
     E) Both users, but studio features are higher priority for mobile
     F) Other (please describe after [Answer]: tag below)

     [Answer]: Both studio and client users with equal priority

     ---

     ### Question 2
     What is the scope of features for the mobile app compared to the web app?

     A) Full feature parity - ALL web features must be in mobile
     B) Core features only - Essential functionality for mobile use cases
     C) Client-focused - All client features, minimal studio features
     D) Studio-focused - All studio features, minimal client features
     E) MVP first - Start with basic features, iterate based on feedback
     F) Other (please describe after [Answer]: tag below)

     [Answer]: Full feature parity - ALL web features must be in mobile

     ---

     ## Section 2: Client Features Priority

     ### Question 3
     Which client features are MUST-HAVE for the mobile app? (Select the most important)

     A) Album browsing + Photo gallery + Lightbox viewer only
     B) Above + Favorites & Selections
     C) Above + Contract viewing & signing
     D) Above + E-commerce store (products, cart, checkout)
     E) ALL client features from web app
     F) Other (please describe after [Answer]: tag below)

     [Answer]: ALL client features from web app

     ---

     ### Question 4
     How should the photo gallery layouts work on mobile?

     A) Single responsive layout optimized for mobile
     B) 2-3 simplified layouts adapted from web
     C) All 9 web layouts adapted for mobile screens
     D) New mobile-specific layouts designed from scratch
     E) Let users choose between grid and list view only
     F) Other (please describe after [Answer]: tag below)

     [Answer]: All 9 web layouts adapted for mobile screens

     ---

     ### Question 5
     Should clients be able to leave comments on photos in mobile app?

     A) Yes, full commenting with replies (same as web)
     B) Yes, but simplified (comments only, no replies)
     C) View comments only, add via web
     D) No commenting feature needed on mobile
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Yes, full commenting with replies (same as web)

     ---

     ## Section 3: Studio Features Priority

     ### Question 6
     Which studio features are MUST-HAVE for the mobile app?

     A) View-only dashboard and notifications
     B) Above + Client management (view, basic edits)
     C) Above + Project management (view, create, basic edits)
     D) Above + Photo upload capability
     E) Full studio management including invoices, contracts, packages
     F) Other (please describe after [Answer]: tag below)

     [Answer]:Full studio management including invoices, contracts, packages

     ---

     ### Question 7
     Should the multi-step upload wizard be included in mobile?

     A) Yes, full 5-step wizard same as web
     B) Yes, but simplified (fewer steps, basic options)
     C) Quick upload only (select photos, choose project, upload)
     D) No upload on mobile - use web for uploads
     E) Other (please describe after [Answer]: tag below)

     [Answer]:Yes, full 5-step wizard same as web

     ---

     ### Question 8
     Should studio users be able to create/manage contracts on mobile?

     A) Yes, full contract management (create, edit, send, templates)
     B) View and send existing contracts only
     C) View contracts only, create via web
     D) No contract management on mobile
     E) Other (please describe after [Answer]: tag below)

     [Answer]:Yes, full contract management (create, edit, send, templates)

     ---

     ### Question 9
     Should studio users be able to create/manage invoices on mobile?

     A) Yes, full invoice management (create, edit, send)
     B) View and send existing invoices only
     C) View invoices only, create via web
     D) No invoice management on mobile
     E) Other (please describe after [Answer]: tag below)

     [Answer]:Yes, full invoice management (create, edit, send)

     ---

     ## Section 4: Technical Requirements

     ### Question 10
     What level of offline support is required?

     A) None - app requires internet connection
     B) Basic - cache recently viewed photos for offline viewing
     C) Standard - cache photos + allow queued uploads when online
     D) Full - work offline with sync when connected
     E) Other (please describe after [Answer]: tag below)

     [Answer]:  Full - work offline with sync when connected

     ---

     ### Question 11
     Which native device features should be integrated?

     A) Camera only (for direct photo capture/upload)
     B) Camera + Photo library access
     C) Above + Push notifications
     D) Above + Biometric authentication (Face ID/Touch ID)
     E) All above + Share extension (share photos to app from other apps)
     F) Other (please describe after [Answer]: tag below)

     [Answer]: A, B, C, D

     ---

     ### Question 12
     What platforms should be supported?

     A) iOS only (iPhone and iPad)
     B) Android only
     C) iOS and Android with equal priority
     D) iOS first, Android later
     E) Android first, iOS later
     F) Other (please describe after [Answer]: tag below)

     [Answer]: iOS and Android with equal priority

     ---

     ### Question 13
     How should PDF documents (contracts, invoices) be handled?

     A) Native PDF viewer within the app
     B) Open in system PDF viewer/browser
     C) WebView for viewing, native for signing
     D) Download only, view externally
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Native PDF viewer within the app

     ---

     ## Section 5: Implementation Approach

     ### Question 14
     What approach for the existing React Native codebase?

     A) Keep existing code, fix bugs and extend features
     B) Refactor existing code significantly, then add features
     C) Start fresh with new architecture, reuse some components
     D) Complete rewrite with better architecture
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Complete rewrite with better architecture

     ---

     ### Question 15
     What is the priority for code quality vs speed of delivery?

     A) Quality first - proper architecture, tests, documentation
     B) Balanced - good architecture with pragmatic shortcuts
     C) Speed first - working features quickly, refactor later
     D) MVP approach - minimum viable, iterate based on feedback
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Quality first - proper architecture, tests, documentation

     ---

     ### Question 16
     Should the app support multi-tenant/multi-studio theming?

     A) Yes, full theming based on studio branding (colors, logo)
     B) Basic theming (logo only, standard colors)
     C) No theming - single consistent design
     D) Theming for client view only, standard for studio view
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Yes, full theming based on studio branding (colors, logo)

     ---

     ## Section 6: E-Commerce & Payments

     ### Question 17
     Should the e-commerce store be included in mobile?

     A) Yes, full store (browse products, cart, checkout)
     B) Browse and add to cart only, checkout via web
     C) View products only, purchase via web
     D) No store features on mobile
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Yes, full store (browse products, cart, checkout)

     ---

     ### Question 18
     If store is included, what payment methods should be supported?

     A) Redirect to web for payment
     B) In-app payment with saved payment methods
     C) Apple Pay / Google Pay integration
     D) Multiple options (cards, UPI, wallets as configured in web)
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Multiple options (cards, UPI, wallets as configured in web)

     ---

     ## Section 7: AI Features

     ### Question 19
     Should AI Tools be included in mobile app?

     A) Yes, all AI tools (Virtual Try-On, Photo Booth, Historic Imager)
     B) Selected AI tools only (specify which in answer)
     C) AI tools as future enhancement, not in initial version
     D) No AI tools on mobile
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Yes, all AI tools (Virtual Try-On, Photo Booth, Historic Imager)

     ---

     ## Section 8: Data & Privacy

     ### Question 20
     What data privacy features are required?

     A) Basic consent screen only
     B) Full DPDPA 2023 compliance (consent, data export, deletion)
     C) GDPR compliance features
     D) Both DPDPA and GDPR compliance
     E) Other (please describe after [Answer]: tag below)

     [Answer]: Both DPDPA and GDPR compliance

     ---

     ## Section 9: Timeline & Priorities

     ### Question 21
     What is your expected timeline for the mobile app?

     A) 1-2 weeks - MVP with core features
     B) 3-4 weeks - Solid app with main features
     C) 1-2 months - Full-featured app
     D) No strict timeline - quality over speed
     E) Other (please describe after [Answer]: tag below)

     [Answer]:  No strict timeline - quality over speed

     ---

     ### Question 22
     If you had to choose only 5 features for initial release, which would they be?

     A) Login, Albums, Gallery, Photo Viewer, Favorites
     B) Login, Albums, Gallery, Contracts, Signatures
     C) Login, Dashboard, Projects, Upload, Clients
     D) Login, Albums, Gallery, Store, Cart
     E) Other (please list your top 5 after [Answer]: tag below)

     [Answer]: all

     ---

     ## Section 10: Additional Context

     ### Question 23
     Are there any specific pain points with the current mobile app that must be addressed?

     A) Authentication/login issues
     B) Performance/loading issues
     C) Native module compatibility issues
     D) UI/UX issues
     E) All of the above
     F) Other (please describe after [Answer]: tag below)

     [Answer]:  All of the above

     ---

     ### Question 24
     Any specific design preferences for the mobile app?

     A) Match web app design exactly
     B) Follow iOS/Android platform guidelines
     C) Modern minimalist design
     D) Match the existing mobile app theme (nature/camping colors)
     E) New custom design
     F) Other (please describe after [Answer]: tag below)

     [Answer]: Follow iOS/Android platform guidelines

     ---

     ### Question 25
     Any additional requirements or constraints not covered above?

     (Please describe any other requirements, constraints, or preferences)

     [Answer]:
