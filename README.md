# SiteHub - Customer Websites Repository

This repository hosts all customer websites with automated deployment via GitHub Actions.

## 🏗️ **Architecture**

### **Multi-Site Hosting Structure**
- Each customer site gets its own subdirectory under `/sites/`
- Individual GitHub Pages deployment for each site
- Automated deployment on push to main branch
- Custom domain support for each site

### **Current Sites**
- **BuyIt** (`/sites/buyit/`) - Bicycle repair services
- **Jane Photography** (`/sites/jane-photography/`) - Professional photography

## 🔄 **Deployment Workflow**

### **Automatic Deployment**
1. Changes pushed to main branch
2. GitHub Actions detects modified sites
3. Each site deploys to its own GitHub Pages URL
4. Custom domains point to GitHub Pages (if configured)

### **Site URLs**
- **Development**: `https://deankann2023.github.io/sitehub-customer-sites/sites/[site-name]/`
- **Production**: Custom domains (configured via DNS)

## 🛠️ **Development Process**

### **Making Changes**
1. **Via SiteHub Editor**: Changes automatically sync to GitHub
2. **Direct Git**: Clone repo, make changes, push to main
3. **Pull Requests**: Create feature branches for major changes

### **Site Management**
- Each site has independent assets and configuration
- Shared styles and scripts in `/shared/` directory
- Global deployment configuration in `.github/workflows/`

## 🎯 **Benefits**

✅ **Version Control** - Full history of all site changes  
✅ **Automated Deployment** - Changes go live automatically  
✅ **Backup & Recovery** - Git serves as complete backup  
✅ **Collaboration** - Multiple developers can work on sites  
✅ **Professional Workflow** - Industry-standard development practices  
✅ **Free Hosting** - GitHub Pages provides free, reliable hosting  

## 📁 **Directory Structure**

```
sites/
├── buykit-fixed/
│   ├── index.html           # Main site file
│   ├── assets/
│   │   ├── images/          # Site images
│   │   │   ├── logo.png
│   │   │   ├── hero-bg.jpg
│   │   │   └── gallery/
│   │   ├── css/
│   │   │   └── style.css    # Site-specific styles
│   │   └── js/
│   │       └── main.js      # Site-specific scripts
│   └── README.md            # Site-specific documentation
└── natalie-photography/
    ├── index.html
    ├── assets/
    └── README.md
```

## 🔗 **Integration with SiteHub Editor**

The SiteHub customer portal integrates directly with this repository:

1. **Editor Changes** → Git commit → Automatic deployment
2. **Live Preview** → GitHub Pages URL
3. **Version History** → Git commit history
4. **Rollback** → Git revert to previous version

## 📊 **Analytics & Monitoring**

- GitHub Actions provide deployment status
- GitHub Pages analytics for traffic monitoring  
- Error tracking via GitHub Actions logs
- Performance monitoring via Lighthouse CI

---

*This repository is managed by SiteHub and automatically updated via the customer portal editor.*
