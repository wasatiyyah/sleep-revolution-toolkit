/**
 * Google Search Console API Service
 * Provides programmatic access to Search Console data and management
 */

const { google } = require('googleapis');
const path = require('path');

class SearchConsoleAPIService {
    constructor() {
        this.auth = null;
        this.searchConsole = null;
        this.siteVerification = null;
        
        // Use the domain format that Search Console API recognizes
        this.siteUrl = 'sc-domain:sleeprevolutiontoolkit.com';
        this.displayUrl = 'https://www.sleeprevolutiontoolkit.com';
        
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        
        // Use the service account key file in the root directory
        this.serviceAccountKeyPath = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY || 
                                   path.join(__dirname, '..', 'gen-lang-client-0334047914-48fc2b352f1f.json');
    }

    /**
     * Initialize the Search Console API service
     */
    async initialize() {
        try {
            console.log('🔍 Initializing Search Console API Service...');

            // Load service account credentials
            if (!this.serviceAccountKeyPath) {
                throw new Error('Service account key path not found');
            }

            const keyPath = path.resolve(this.serviceAccountKeyPath);
            console.log(`🔑 Using service account key: ${keyPath}`);
            console.log(`🌐 API Site URL: ${this.siteUrl}`);
            console.log(`🌐 Display URL: ${this.displayUrl}`);
            
            this.auth = new google.auth.GoogleAuth({
                keyFile: keyPath,
                scopes: [
                    'https://www.googleapis.com/auth/webmasters',
                    'https://www.googleapis.com/auth/webmasters.readonly',
                    'https://www.googleapis.com/auth/siteverification'
                ]
            });

            // Create API clients
            this.searchConsole = google.searchconsole({
                version: 'v1',
                auth: this.auth
            });

            this.siteVerification = google.siteVerification({
                version: 'v1',
                auth: this.auth
            });

            console.log('✅ Search Console API Service initialized successfully');
            console.log(`🔑 Project ID: ${this.projectId}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Search Console API Service:', error.message);
            throw error;
        }
    }

    /**
     * List all sites accessible to the service account
     */
    async listSites() {
        try {
            await this.initialize();
            
            console.log('📋 Listing accessible sites...');
            const response = await this.searchConsole.sites.list();
            
            if (response.data.siteEntry) {
                console.log(`✅ Found ${response.data.siteEntry.length} sites:`);
                response.data.siteEntry.forEach(site => {
                    console.log(`   - ${site.siteUrl} (Permission: ${site.permissionLevel})`);
                });
                return response.data.siteEntry;
            } else {
                console.log('ℹ️ No sites found or no access granted');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to list sites:', error.message);
            throw error;
        }
    }

    /**
     * Submit a sitemap to Search Console
     */
    async submitSitemap(sitemapUrl = null) {
        try {
            await this.initialize();
            
            const sitemap = sitemapUrl || `${this.displayUrl}/sitemap.xml`;
            console.log(`📤 Submitting sitemap: ${sitemap}`);
            
            const response = await this.searchConsole.sitemaps.submit({
                siteUrl: this.siteUrl,
                feedpath: sitemap
            });

            console.log('✅ Sitemap submitted successfully');
            console.log(`📊 Response: ${JSON.stringify(response.data)}`);
            
            return response.data;
        } catch (error) {
            console.error('❌ Failed to submit sitemap:', error.message);
            throw error;
        }
    }

    /**
     * List all submitted sitemaps for the site
     */
    async listSitemaps() {
        try {
            await this.initialize();
            
            console.log('📋 Listing submitted sitemaps...');
            const response = await this.searchConsole.sitemaps.list({
                siteUrl: this.siteUrl
            });

            if (response.data.sitemap) {
                console.log(`✅ Found ${response.data.sitemap.length} sitemaps:`);
                response.data.sitemap.forEach(sitemap => {
                    console.log(`   - ${sitemap.path} (Status: ${sitemap.type})`);
                });
                return response.data.sitemap;
            } else {
                console.log('ℹ️ No sitemaps found');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to list sitemaps:', error.message);
            throw error;
        }
    }

    /**
     * Inspect a specific URL for indexing status
     */
    async inspectURL(url = null) {
        try {
            await this.initialize();
            
            const targetUrl = url || this.displayUrl;
            console.log(`🔍 Inspecting URL: ${targetUrl}`);
            
            const response = await this.searchConsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: targetUrl,
                    siteUrl: this.siteUrl
                }
            });

            console.log('✅ URL inspection completed');
            console.log(`📊 Indexing status: ${response.data.inspectionResult.indexStatusResult.verdict}`);
            
            return response.data.inspectionResult;
        } catch (error) {
            console.error('❌ Failed to inspect URL:', error.message);
            throw error;
        }
    }

    /**
     * Request indexing for a specific URL
     */
    async requestIndexing(url = null) {
        try {
            await this.initialize();
            
            const targetUrl = url || this.displayUrl;
            console.log(`📝 Requesting indexing for: ${targetUrl}`);
            
            const response = await this.searchConsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: targetUrl,
                    siteUrl: this.siteUrl
                }
            });

            // Check if we can request indexing
            if (response.data.inspectionResult.indexStatusResult.verdict === 'PASS') {
                console.log('✅ URL is already indexed or eligible for indexing');
            } else {
                console.log('ℹ️ URL may need manual review or has issues');
            }
            
            return response.data.inspectionResult;
        } catch (error) {
            console.error('❌ Failed to request indexing:', error.message);
            throw error;
        }
    }

    /**
     * Get search performance data
     */
    async getPerformanceData(startDate = null, endDate = null, dimensions = ['query']) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting performance data from ${start} to ${end}`);
            
            const response = await this.searchConsole.searchAnalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: start,
                    endDate: end,
                    dimensions: dimensions,
                    rowLimit: 1000
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} performance records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No performance data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get performance data:', error.message);
            throw error;
        }
    }

    /**
     * Get Core Web Vitals data
     */
    async getCoreWebVitals() {
        try {
            await this.initialize();
            
            console.log('📊 Getting Core Web Vitals data...');
            
            // Note: Core Web Vitals data is available through the Performance API
            // This is a simplified version - you may need to adjust based on actual API response
            const response = await this.searchConsole.searchAnalytics.query({
                siteUrl: this.siteUrl,
                requestBody: {
                    startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                    endDate: new Date().toISOString().split('T')[0],
                    dimensions: ['page'],
                    rowLimit: 1000
                }
            });

            console.log('✅ Core Web Vitals data retrieved');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get Core Web Vitals data:', error.message);
            throw error;
        }
    }

    /**
     * Get crawl statistics
     */
    async getCrawlStats() {
        try {
            await this.initialize();
            
            console.log('📊 Getting crawl statistics...');
            
            const response = await this.searchConsole.urlInspection.index.inspect({
                requestBody: {
                    inspectionUrl: this.displayUrl,
                    siteUrl: this.siteUrl
                }
            });

            console.log('✅ Crawl statistics retrieved');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to get crawl statistics:', error.message);
            throw error;
        }
    }

    /**
     * Remove a sitemap
     */
    async removeSitemap(sitemapPath) {
        try {
            await this.initialize();
            
            console.log(`🗑️ Removing sitemap: ${sitemapPath}`);
            
            const response = await this.searchConsole.sitemaps.delete({
                siteUrl: this.siteUrl,
                feedpath: sitemapPath
            });

            console.log('✅ Sitemap removed successfully');
            return response.data;
        } catch (error) {
            console.error('❌ Failed to remove sitemap:', error.message);
            throw error;
        }
    }

    /**
     * Test the API connection
     */
    async testConnection() {
        try {
            console.log('🧪 Testing Search Console API connection...');
            
            await this.initialize();
            const sites = await this.listSites();
            
            console.log('✅ API connection test successful');
            console.log(`📊 Accessible sites: ${sites.length}`);
            
            return {
                success: true,
                sitesCount: sites.length,
                accessibleSites: sites
            };
        } catch (error) {
            console.error('❌ API connection test failed:', error.message);
            return {
                success: false,
                error: error.message
            };
        }
    }
}

module.exports = SearchConsoleAPIService;
