# Real Estate Network App - Design Guidelines

## Brand Identity
**Visual Direction**: Airbnb-inspired luxury marketplace
- Clean, sophisticated, and trustworthy aesthetic
- Premium feel with minimalist execution
- Focus on beautiful property imagery and effortless browsing

**Memorable Element**: Central floating action button for quick listing creation, emphasizing community contribution

## Navigation Architecture

**Root Navigation**: Tab Navigation (5 tabs) + Side Drawer
- Bottom Tab Bar (Airbnb-style):
  1. Explore (home/search icon) - default screen
  2. Favorites (heart icon)
  3. Add Listing (center floating circular button with plus icon)
  4. My Profile (person icon)
  5. My Achievements (trophy/badge icon)

**Drawer Menu**: Accessible via hamburger icon (top-right on Explore screen)

**Initial Flow**: 
- First launch → Onboarding Carousel
- Returning users → Explore screen (tracked via AsyncStorage)

## Screen-by-Screen Specifications

### Onboarding Carousel
- **Purpose**: Introduce platform value (2-3 informational slides)
- **Layout**:
  - Full-screen slides with hero images
  - Headline and description text overlaid or below image
  - Bottom: "Skip" button (left) and "Continue" button (right)
  - Pagination dots centered
- **Components**: Carousel (react-native-snap-carousel), image, headline (Bold, large), body text, two buttons
- **Safe Area**: Full screen with bottom inset for buttons (insets.bottom + 24px)

### Login Screen
- **Purpose**: Authenticate users
- **Layout**:
  - Centered vertically
  - Logo/app icon at top
  - Three stacked buttons (equal width, full-bleed horizontal padding)
- **Components**:
  - "Continue with Email" button
  - "Continue with Google" button (with Google logo)
  - "Continue with Apple" button (with Apple logo)
  - Privacy policy & terms links (small text, centered, bottom)
- **Safe Area**: Standard (insets.top + 24px top, insets.bottom + 24px bottom)

### Explore Screen (Home)
- **Purpose**: Browse available properties
- **Layout**:
  - Transparent header with search bar
  - Top-right: Notification bell icon, hamburger menu icon
  - Scrollable list of property cards
  - Optional: Map view toggle button (floating)
- **Components**: Search bar, filter chips, PropertyCard (repeated 5-10 times with placeholder data), map view toggle
- **PropertyCard Specs**:
  - Rounded corners (12px)
  - Property image (full-width, 16:9 ratio)
  - Title (Bold, 16-18px)
  - Location (secondary text, with pin icon)
  - Price (Bold, highlighted)
  - Rating (stars icon + number)
  - Brief description (2 lines max, truncated)
  - White background, subtle shadow
- **Safe Area**: Top (headerHeight + 16px), Bottom (tabBarHeight + 16px)
- **Empty State**: "No properties found" illustration if search returns nothing

### Favorites Screen
- **Purpose**: View saved properties
- **Layout**: Same as Explore, but filtered to favorited items
- **Empty State**: Heart illustration with "No favorites yet" message

### Add Listing Screen (Modal)
- **Purpose**: Create new property listing
- **Layout**: Native modal, scrollable form
- **Components**: Image picker, text inputs (title, location, price, description), category selector, submit button
- **Safe Area**: Standard form insets

### My Profile Screen
- **Purpose**: View/edit user information
- **Layout**: Avatar at top, user info, settings list
- **Components**: Avatar, display name, email, edit button, logout button
- **Safe Area**: Standard

### My Achievements Screen
- **Purpose**: Gamification and engagement tracking
- **Layout**: Grid or list of achievement badges
- **Components**: Achievement cards (icon, title, progress bar)
- **Empty State**: Trophy illustration with "Complete actions to unlock achievements"

## Color Palette
**Primary**: #FF5A5F (Airbnb signature red/pink)
**Secondary**: #00A699 (Teal accent)
**Background**: #FFFFFF (Pure white)
**Surface**: #F7F7F7 (Light grey for cards)
**Text Primary**: #484848 (Charcoal)
**Text Secondary**: #767676 (Grey)
**Border**: #EBEBEB (Light grey)
**Success**: #00A699
**Warning**: #FFB400
**Error**: #C13515

## Typography
**Font Family**: Circular (Airbnb's font) or fallback to system sans-serif (SF Pro for iOS, Roboto for Android)
**Type Scale**:
- Hero/Display: Bold, 28-32px
- Headline: Bold, 18-22px
- Body: Regular, 14-16px
- Caption: Regular, 12-14px
- Button: Medium, 16px

**Hierarchy**: Bold for titles/prices, Regular for descriptions, Medium for buttons

## Visual Design
- **Cards**: 12px border radius, subtle shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 4)
- **Floating Action Button**: Circular, 56px diameter, Primary color, white plus icon, elevated shadow (shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2)
- **Buttons**: Rounded (8px), primary buttons use Primary color with white text, secondary buttons use white with border
- **Icons**: Use Ionicons or MaterialIcons from @expo/vector-icons, monochrome (Text Primary or white)
- **Touchable Feedback**: Opacity reduction (activeOpacity: 0.7) on press

## Assets to Generate
1. **icon.png** - App icon (Airbnb-inspired house/location mark) - Device home screen
2. **splash-icon.png** - Launch screen logo - App startup
3. **onboarding-slide-1.png** - "Discover amazing properties" illustration - Onboarding carousel slide 1
4. **onboarding-slide-2.png** - "Connect with hosts" illustration - Onboarding carousel slide 2
5. **onboarding-slide-3.png** - "Book your stay" illustration - Onboarding carousel slide 3
6. **empty-favorites.png** - Heart with home illustration - Favorites screen empty state
7. **empty-search.png** - Magnifying glass illustration - Explore screen when no results
8. **empty-achievements.png** - Trophy illustration - Achievements screen empty state
9. **default-avatar.png** - Circular user avatar placeholder - Profile screen
10. **placeholder-property.png** - Generic property image (5 variations) - PropertyCard when no image

**Image Quality**: Clean, minimal illustrations matching Airbnb's friendly, modern style. Use Primary color accents with neutral backgrounds.