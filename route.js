// route.js - Central Routing System
class Router {
    constructor() {
        this.routes = {
            '/': 'login',
            '/login': 'login',
            '/signup': 'signup',
            '/home': 'home',
            '/checkout': 'checkout'
        };

        this.currentRoute = window.location.hash.substring(1) || '/';
        this.init();
    }

    init() {
        // Check if user is logged in
        this.currentUser = JSON.parse(localStorage.getItem('currentUser')) || null;

        // Handle hash changes
        window.addEventListener('hashchange', () => {
            this.currentRoute = window.location.hash.substring(1) || '/';
            this.navigate();
        });

        // Initial navigation
        this.navigate();
    }

    navigate() {
        const route = this.currentRoute;

        // Authentication check for protected routes
        const protectedRoutes = ['/home', '/checkout'];
        if (protectedRoutes.includes(route) && !this.currentUser) {
            window.location.hash = '#/login';
            return;
        }

        // If logged in user tries to access login/signup, redirect to home
        if ((route === '/login' || route === '/signup' || route === '/') && this.currentUser) {
            window.location.hash = '#/home';
            return;
        }

        // Load appropriate page
        this.loadPage(route);
    }

    async loadPage(route) {
        try {
            switch (route) {
                case '/':
                case '/login':
                    await this.loadLogin();
                    break;
                case '/signup':
                    await this.loadSignup();
                    break;
                case '/home':
                    await this.loadHome();
                    break;
                case '/checkout':
                    await this.loadCheckout();
                    break;
                default:
                    await this.loadLogin();
            }
        } catch (error) {
            console.error('Error loading page:', error);
            document.body.innerHTML = '<div style="padding: 2rem; text-align: center; color: #333;"><h2>Error loading page</h2><p>' + error.message + '</p><button onclick="location.reload()">Reload Page</button></div>';
        }
    }

    async loadLogin() {
        try {
            const response = await fetch('auth/login.html');
            if (!response.ok) throw new Error('Failed to load login page: ' + response.status);
            const html = await response.text();
            document.body.innerHTML = html;
            this.injectScript('auth/validation.js');
            this.setupAuthNavigation();
        } catch (error) {
            console.error('Login load error:', error);
            throw error;
        }
    }

    async loadSignup() {
        try {
            const response = await fetch('auth/signup.html');
            if (!response.ok) throw new Error('Failed to load signup page: ' + response.status);
            const html = await response.text();
            document.body.innerHTML = html;
            this.injectScript('auth/validation.js');
            this.setupAuthNavigation();
        } catch (error) {
            console.error('Signup load error:', error);
            throw error;
        }
    }

    async loadHome() {
        try {
            const response = await fetch('home/home.html');
            if (!response.ok) throw new Error('Failed to load home page: ' + response.status);
            const html = await response.text();
            document.body.innerHTML = html;

            // Inject CSS
            const homeCSS = document.createElement('link');
            homeCSS.rel = 'stylesheet';
            homeCSS.href = 'home/home.css';
            document.head.appendChild(homeCSS);

            // Inject JavaScript
            this.injectScript('home/home.js', () => {
                // Override navigation in home.js to use router
                this.overrideHomeNavigation();
            });
        } catch (error) {
            console.error('Home load error:', error);
            throw error;
        }
    }

    async loadCheckout() {
        try {
            const response = await fetch('checkout/checkout.html');
            if (!response.ok) throw new Error('Failed to load checkout page: ' + response.status);
            const html = await response.text();
            document.body.innerHTML = html;

            // Inject CSS
            const checkoutCSS = document.createElement('link');
            checkoutCSS.rel = 'stylesheet';
            checkoutCSS.href = 'checkout/checkout.css';
            document.head.appendChild(checkoutCSS);

            // Inject JavaScript
            this.injectScript('checkout/checkout.js', () => {
                // Override navigation in checkout.js to use router
                this.overrideCheckoutNavigation();
            });
        } catch (error) {
            console.error('Checkout load error:', error);
            throw error;
        }
    }

    injectScript(src, callback = null) {
        const script = document.createElement('script');
        script.src = src;
        script.onload = () => {
            if (callback) callback();
        };
        document.body.appendChild(script);
    }

    setupAuthNavigation() {
        // Find and modify links to use hash routing
        setTimeout(() => {
            const links = document.querySelectorAll('a');
            links.forEach(link => {
                const href = link.getAttribute('href');
                if (href === 'login.html' || href === 'auth/login.html') {
                    link.href = '#/login';
                } else if (href === 'signup.html' || href === 'auth/signup.html') {
                    link.href = '#/signup';
                } else if (href === 'home.html') {
                    link.href = '#/home';
                }
            });
        }, 100);
    }

    overrideHomeNavigation() {
        // Override home.js navigation to use hash routing
        setTimeout(() => {
            // Override login button
            const loginBtn = document.getElementById('loginBtn');
            if (loginBtn) {
                loginBtn.onclick = () => {
                    if (window.router) {
                        window.router.navigateTo('/login');
                    } else {
                        window.location.hash = '#/login';
                    }
                };
            }

            // Override logout button
            const logoutBtn = document.getElementById('logoutBtn');
            if (logoutBtn) {
                logoutBtn.onclick = () => {
                    localStorage.removeItem('currentUser');
                    if (window.router) {
                        window.router.logout();
                    } else {
                        window.location.hash = '#/login';
                    }
                };
            }

            // Override navigation links
            const navLinks = document.querySelectorAll('.nav-categories a');
            navLinks.forEach(link => {
                link.href = '#/home';
            });

            // Override signup links if any
            const signupLinks = document.querySelectorAll('a[href*="signup"]');
            signupLinks.forEach(link => {
                link.href = '#/signup';
            });
        }, 500);
    }

    overrideCheckoutNavigation() {
        // Override checkout.js navigation to use hash routing
        setTimeout(() => {
            // Make sure checkout links point to home
            const homeLinks = document.querySelectorAll('a[href*="home"]');
            homeLinks.forEach(link => {
                link.href = '#/home';
            });
        }, 500);
    }

    static navigateTo(route) {
        window.location.hash = `#${route}`;
    }

    static isAuthenticated() {
        return JSON.parse(localStorage.getItem('currentUser')) !== null;
    }

    static getCurrentUser() {
        return JSON.parse(localStorage.getItem('currentUser'));
    }

    static logout() {
        localStorage.removeItem('currentUser');
        window.location.hash = '#/login';
    }
}

// Initialize router when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.router = new Router();
});