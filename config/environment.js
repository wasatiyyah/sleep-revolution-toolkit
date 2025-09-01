/**
 * Environment Configuration Manager
 * Handles all environment variables and provides type-safe access
 */

// Load environment variables from .env file
require('dotenv').config();

class EnvironmentConfig {
    constructor() {
        this.isProduction = process.env.NODE_ENV === 'production' || process.env.PRODUCTION_MODE === 'true';
        this.isDevelopment = !this.isProduction;
        this.isDebugMode = process.env.ENABLE_DEBUG_MODE === 'true';
    }

    // ===========================================
    // STRIPE CONFIGURATION
    // ===========================================
    get stripe() {
        return {
            publishableKey: this.isProduction 
                ? process.env.STRIPE_PUBLISHABLE_KEY_LIVE 
                : process.env.STRIPE_PUBLISHABLE_KEY_TEST,
            secretKey: this.isProduction 
                ? process.env.STRIPE_SECRET_KEY_LIVE 
                : process.env.STRIPE_SECRET_KEY_TEST,
            webhookSecret: this.isProduction 
                ? process.env.STRIPE_WEBHOOK_SECRET_LIVE 
                : process.env.STRIPE_WEBHOOK_SECRET_TEST,
            productId: process.env.STRIPE_PRODUCT_ID,
            priceId: process.env.STRIPE_PRICE_ID,
            paymentLink: process.env.STRIPE_PAYMENT_LINK
        };
    }

    // ===========================================
    // GOOGLE SERVICES
    // ===========================================
    get google() {
        return {
            analytics: {
                measurementId: process.env.GA4_MEASUREMENT_ID,
                apiSecret: process.env.GA4_API_SECRET
            },
            tagManager: {
                containerId: process.env.GTM_CONTAINER_ID,
                api: {
                    enabled: process.env.GTM_API_ENABLED === 'true',
                    accountId: process.env.GTM_ACCOUNT_ID,
                    containerId: process.env.GTM_CONTAINER_ID,
                    containerPublicId: process.env.GTM_CONTAINER_PUBLIC_ID || 'GTM-TPZ2XNWV',
                    workspaceId: process.env.GTM_WORKSPACE_ID,
                    apiKey: process.env.GTM_API_KEY
                }
            },
            searchConsole: {
                siteUrl: process.env.SEARCH_CONSOLE_SITE_URL,
                apiKey: process.env.SEARCH_CONSOLE_API_KEY
            },
            ads: {
                customerId: process.env.GOOGLE_ADS_CUSTOMER_ID,
                conversionId: process.env.GOOGLE_ADS_CONVERSION_ID,
                conversionLabel: process.env.GOOGLE_ADS_CONVERSION_LABEL
            },
            cloud: {
                projectId: process.env.GOOGLE_CLOUD_PROJECT_ID,
                serviceAccountKey: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY,
                serviceAccountKeyPath: process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY_PATH,
                region: process.env.GOOGLE_CLOUD_REGION || 'us-central1',
                zone: process.env.GOOGLE_CLOUD_ZONE || 'us-central1-a'
            }
        };
    }

    // ===========================================
    // SOCIAL MEDIA & TRACKING
    // ===========================================
    get tracking() {
        return {
            facebook: {
                pixelId: process.env.FACEBOOK_PIXEL_ID,
                accessToken: process.env.FACEBOOK_ACCESS_TOKEN
            },
            hotjar: {
                id: process.env.HOTJAR_ID
            },
            clarity: {
                projectId: process.env.CLARITY_PROJECT_ID
            },
            tiktok: {
                pixelId: process.env.TIKTOK_PIXEL_ID
            }
        };
    }

    // ===========================================
    // DEPLOYMENT & HOSTING
    // ===========================================
    get deployment() {
        return {
            vercel: {
                protectionBypass: process.env.VERCEL_PROTECTION_BYPASS,
                projectId: process.env.VERCEL_PROJECT_ID,
                orgId: process.env.VERCEL_ORG_ID,
                token: process.env.VERCEL_TOKEN
            },
            urls: {
                production: process.env.PRODUCTION_URL,
                development: process.env.DEVELOPMENT_URL,
                api: process.env.API_BASE_URL,
                cdn: process.env.CDN_URL
            }
        };
    }

    // ===========================================
    // EMAIL CONFIGURATION
    // ===========================================
    get email() {
        return {
            smtp: {
                host: process.env.SMTP_HOST,
                port: parseInt(process.env.SMTP_PORT) || 587,
                user: process.env.SMTP_USER,
                password: process.env.SMTP_PASSWORD
            },
            from: {
                email: process.env.FROM_EMAIL,
                name: process.env.FROM_NAME
            }
        };
    }

    // ===========================================
    // SECURITY
    // ===========================================
    get security() {
        return {
            jwtSecret: process.env.JWT_SECRET,
            sessionSecret: process.env.SESSION_SECRET,
            encryptionKey: process.env.ENCRYPTION_KEY,
            rateLimiting: {
                windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
                maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100
            }
        };
    }

    // ===========================================
    // FEATURE FLAGS
    // ===========================================
    get features() {
        return {
            analytics: process.env.ENABLE_ANALYTICS === 'true',
            adsTracking: process.env.ENABLE_ADS_TRACKING === 'true',
            emailNotifications: process.env.ENABLE_EMAIL_NOTIFICATIONS === 'true',
            debugMode: process.env.ENABLE_DEBUG_MODE === 'true'
        };
    }

    // ===========================================
    // DATABASE & STORAGE
    // ===========================================
    get storage() {
        return {
            database: {
                url: process.env.DATABASE_URL
            },
            redis: {
                url: process.env.REDIS_URL
            },
            aws: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                s3Bucket: process.env.AWS_S3_BUCKET,
                region: process.env.AWS_REGION || 'us-east-1'
            }
        };
    }

    // ===========================================
    // VALIDATION METHODS
    // ===========================================
    validateRequired() {
        const requiredVars = [
            'STRIPE_PUBLISHABLE_KEY_TEST',
            'STRIPE_SECRET_KEY_TEST'
        ];

        const missing = requiredVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
        }
    }

    validateProduction() {
        if (!this.isProduction) return;

        const requiredProdVars = [
            'STRIPE_PUBLISHABLE_KEY_LIVE',
            'STRIPE_SECRET_KEY_LIVE',
            'GA4_MEASUREMENT_ID',
            'PRODUCTION_URL',
            'GOOGLE_CLOUD_PROJECT_ID',
            'GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY'
        ];

        const missing = requiredProdVars.filter(varName => !process.env[varName]);
        
        if (missing.length > 0) {
            console.warn(`Missing production environment variables: ${missing.join(', ')}`);
        }
    }

    // ===========================================
    // UTILITY METHODS
    // ===========================================
    getWebsiteUrl() {
        return this.isProduction 
            ? this.deployment.urls.production 
            : this.deployment.urls.development;
    }

    getStripeKeys() {
        return {
            publishableKey: this.stripe.publishableKey,
            // Never expose secret key to client-side
            hasSecretKey: !!this.stripe.secretKey
        };
    }

    getClientConfig() {
        // Safe configuration for client-side use
        return {
            stripe: {
                publishableKey: this.stripe.publishableKey,
                paymentLink: this.stripe.paymentLink
            },
            google: {
                analytics: {
                    measurementId: this.google.analytics.measurementId
                },
                tagManager: {
                    containerId: this.google.tagManager.containerId
                }
            },
            tracking: {
                facebook: {
                    pixelId: this.tracking.facebook.pixelId
                },
                hotjar: {
                    id: this.tracking.hotjar.id
                },
                clarity: {
                    projectId: this.tracking.clarity.projectId
                }
            },
            features: this.features,
            isProduction: this.isProduction,
            websiteUrl: this.getWebsiteUrl()
        };
    }
}

// Create singleton instance
const config = new EnvironmentConfig();

// Validate configuration on startup
try {
    config.validateRequired();
    config.validateProduction();
} catch (error) {
    console.error('Environment Configuration Error:', error.message);
    if (config.isProduction) {
        process.exit(1);
    }
}

module.exports = config;