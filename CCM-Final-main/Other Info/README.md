# Cannabis Madrid - Dispensary Website

A modern, responsive dispensary website for Cannabis Madrid with a floating WhatsApp icon for customer communication.

## Features

- **Modern Design**: Clean, professional layout with gradient backgrounds and smooth animations
- **Responsive**: Fully responsive design that works on desktop, tablet, and mobile devices
- **Floating WhatsApp Icon**: Animated floating icon that links to your WhatsApp account
- **Interactive Elements**: Smooth scrolling, hover effects, and form validation
- **Dispensary Sections**: Cannabis products, services, about, and contact sections
- **Mobile Navigation**: Hamburger menu for mobile devices

## Files Structure

```
Server/Public/
├── index.html          # Main HTML file
├── styles.css          # CSS styling and animations
├── script.js           # JavaScript functionality
└── README.md           # This file
```

## Setup Instructions

### 1. Customize the WhatsApp Link

Edit the `index.html` file and update the WhatsApp link:

```html
<a href="https://wa.me/YOUR_PHONE_NUMBER" target="_blank" class="whatsapp-link">
```

Replace `YOUR_PHONE_NUMBER` with your actual phone number (include country code, no spaces or special characters).

### 2. Customize Content

Update the following sections in `index.html`:

- **Dispensary Name**: Change "Cannabis Madrid" to your actual dispensary name
- **Contact Information**: Update Madrid address, phone, email, and hours
- **Products**: Modify cannabis product categories and prices
- **About Section**: Update your dispensary story and statistics

### 3. Customize Colors

In `styles.css`, you can change the color scheme by updating these CSS variables:

```css
/* Primary color (used for buttons, links, etc.) */
#2d5016

/* Gradient colors (used in hero and other sections) */
#2d5016 to #4a7c59 to #6b8e23

/* WhatsApp icon colors */
#25d366 to #128c7e
```

### 4. Add Your Images

Replace the placeholder icons with actual product images:

1. Create an `images` folder in the `Public` directory
2. Add your product images
3. Update the HTML to use `<img>` tags instead of Font Awesome icons

Example:
```html
<div class="product-image">
    <img src="images/clothing.jpg" alt="Clothing">
</div>
```

## Running the Website

### Option 1: Simple HTTP Server (Python)
```bash
cd Server/Public
python -m http.server 8000
```
Then open `http://localhost:8000` in your browser.

### Option 2: Node.js HTTP Server
```bash
cd Server/Public
npx http-server -p 8000
```

### Option 3: Live Server (VS Code Extension)
If using VS Code, install the "Live Server" extension and right-click on `index.html` to open with Live Server.

## Customization Tips

### Adding New Sections
1. Add HTML structure in `index.html`
2. Add corresponding CSS in `styles.css`
3. Add any JavaScript functionality in `script.js`

### Modifying the Floating Telegram Icon
The floating Telegram icon has several customizable features:

- **Position**: Change `bottom` and `right` values in `.telegram-float`
- **Size**: Modify `width` and `height` in `.telegram-link`
- **Animation**: Adjust the `float` and `pulse` keyframes
- **Colors**: Update the gradient colors in `.telegram-link`

### Mobile Responsiveness
The website is fully responsive with breakpoints at:
- 768px (tablet)
- 480px (mobile)

## Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge
- Mobile browsers

## Performance Features

- Optimized CSS animations
- Smooth scrolling
- Lazy loading animations
- Responsive images
- Minimal JavaScript footprint

## SEO Considerations

- Semantic HTML structure
- Meta tags for mobile optimization
- Proper heading hierarchy
- Alt text for images (when added)

## Security Notes

- Form validation is client-side only
- For production, implement server-side validation
- Consider adding CSRF protection for forms
- Use HTTPS in production

## Future Enhancements

- Add a shopping cart functionality
- Implement user authentication
- Add product search and filtering
- Integrate with payment systems
- Add admin dashboard
- Implement real-time chat

## Support

For questions or customization help, refer to the code comments in each file or contact your developer.

---

**Note**: Remember to replace placeholder content with your actual business information before going live!
