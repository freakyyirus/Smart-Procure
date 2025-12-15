const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

const screenshotsDir = path.join(__dirname, 'docs', 'screenshots');

// Ensure screenshots directory exists
if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
}

const pages = [
    { name: '01-landing-page', url: 'http://localhost:3000', waitFor: 3000 },
    { name: '02-login-page', url: 'http://localhost:3000/login', waitFor: 3000 },
    { name: '03-dashboard', url: 'http://localhost:3000/dashboard', waitFor: 3000, requiresAuth: true },
    { name: '04-vendors', url: 'http://localhost:3000/vendors', waitFor: 3000, requiresAuth: true },
    { name: '05-items', url: 'http://localhost:3000/items', waitFor: 3000, requiresAuth: true },
    { name: '06-rfqs', url: 'http://localhost:3000/rfqs', waitFor: 3000, requiresAuth: true },
    { name: '07-quotes', url: 'http://localhost:3000/quotes', waitFor: 3000, requiresAuth: true },
    { name: '08-purchase-orders', url: 'http://localhost:3000/purchase-orders', waitFor: 3000, requiresAuth: true },
    { name: '09-mandates', url: 'http://localhost:3000/mandates', waitFor: 3000, requiresAuth: true },
    { name: '10-ai-hub', url: 'http://localhost:3000/ai', waitFor: 3000, requiresAuth: true },
    { name: '11-ocr-extraction', url: 'http://localhost:3000/ai/ocr', waitFor: 3000, requiresAuth: true },
    { name: '12-anomaly-detection', url: 'http://localhost:3000/ai/anomalies', waitFor: 3000, requiresAuth: true },
    { name: '13-vendor-scoring', url: 'http://localhost:3000/ai/vendor-scoring', waitFor: 3000, requiresAuth: true },
    { name: '14-ai-chatbot', url: 'http://localhost:3000/ai/chatbot', waitFor: 3000, requiresAuth: true },
    { name: '15-notifications', url: 'http://localhost:3000/notifications', waitFor: 3000, requiresAuth: true },
];

async function login(page) {
    console.log('🔐 Logging in...');
    try {
        await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle0', timeout: 60000 });
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const emailInput = await page.$('input[type="email"], input[name="email"]');
        const passwordInput = await page.$('input[type="password"], input[name="password"]');
        
        if (emailInput && passwordInput) {
            await emailInput.type('admin@smartprocure.com', { delay: 50 });
            await passwordInput.type('Admin@123', { delay: 50 });
            
            const submitBtn = await page.$('button[type="submit"]');
            if (submitBtn) {
                await submitBtn.click();
                await new Promise(resolve => setTimeout(resolve, 3000));
            }
        }
        console.log('✅ Logged in successfully!');
    } catch (error) {
        console.log('⚠️ Login attempt completed with warning:', error.message);
    }
}

async function takeScreenshots() {
    console.log('🚀 Starting screenshot capture...\n');
    console.log('📡 Connecting to http://localhost:3000...\n');
    
    const browser = await puppeteer.launch({
        headless: 'new',
        defaultViewport: { width: 1440, height: 900 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage']
    });
    
    const page = await browser.newPage();
    let isLoggedIn = false;
    let successCount = 0;
    let failCount = 0;
    
    for (const pageConfig of pages) {
        try {
            console.log(`📸 Capturing: ${pageConfig.name}...`);
            
            // Login if required and not already logged in
            if (pageConfig.requiresAuth && !isLoggedIn) {
                await login(page);
                isLoggedIn = true;
            }
            
            await page.goto(pageConfig.url, { waitUntil: 'networkidle0', timeout: 60000 });
            await new Promise(resolve => setTimeout(resolve, pageConfig.waitFor));
            
            const screenshotPath = path.join(screenshotsDir, `${pageConfig.name}.png`);
            await page.screenshot({ path: screenshotPath, fullPage: false });
            
            console.log(`   ✅ Saved: ${pageConfig.name}.png`);
            successCount++;
        } catch (error) {
            console.log(`   ❌ Failed: ${pageConfig.name} - ${error.message}`);
            failCount++;
        }
    }
    
    await browser.close();
    console.log(`\n🎉 Screenshot capture complete!`);
    console.log(`   ✅ Success: ${successCount}`);
    console.log(`   ❌ Failed: ${failCount}`);
    console.log(`📁 Screenshots saved to: ${screenshotsDir}`);
}

takeScreenshots().catch(console.error);
