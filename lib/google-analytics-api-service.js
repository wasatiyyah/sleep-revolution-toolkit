/**
 * Google Analytics 4 API Service
 * Provides programmatic access to GA4 data and optimization insights
 */

const { google } = require('googleapis');
const path = require('path');

class GoogleAnalyticsAPIService {
    constructor() {
        this.auth = null;
        this.analyticsData = null;
        this.analyticsAdmin = null;
        this.propertyId = process.env.GA4_PROPERTY_ID || 'properties/503214244';
        this.measurementId = process.env.GA4_MEASUREMENT_ID || 'G-7KM8RT7SE1';
        this.projectId = process.env.GOOGLE_CLOUD_PROJECT_ID;
        
        // Use the service account key file in the root directory
        this.serviceAccountKeyPath = process.env.GOOGLE_CLOUD_SERVICE_ACCOUNT_KEY || 
                                   path.join(__dirname, '..', 'gen-lang-client-0334047914-48fc2b352f1f.json');
    }

    /**
     * Initialize the Google Analytics API service
     */
    async initialize() {
        try {
            console.log('🔍 Initializing Google Analytics API Service...');

            // Load service account credentials
            if (!this.serviceAccountKeyPath) {
                throw new Error('Service account key path not found');
            }

            const keyPath = path.resolve(this.serviceAccountKeyPath);
            console.log(`🔑 Using service account key: ${keyPath}`);
            console.log(`📊 GA4 Property ID: ${this.propertyId}`);
            console.log(`📊 Measurement ID: ${this.measurementId}`);
            
            this.auth = new google.auth.GoogleAuth({
                keyFile: keyPath,
                scopes: [
                    'https://www.googleapis.com/auth/analytics.readonly',
                    'https://www.googleapis.com/auth/analytics.edit',
                    'https://www.googleapis.com/auth/analytics.manage.users.readonly'
                ]
            });

            // Create API clients
            this.analyticsData = google.analyticsdata({
                version: 'v1beta',
                auth: this.auth
            });

            this.analyticsAdmin = google.analyticsadmin({
                version: 'v1beta',
                auth: this.auth
            });

            console.log('✅ Google Analytics API Service initialized successfully');
            console.log(`🔑 Project ID: ${this.projectId}`);

            return true;
        } catch (error) {
            console.error('❌ Failed to initialize Google Analytics API Service:', error.message);
            throw error;
        }
    }

    /**
     * Get real-time user data
     */
    async getRealTimeData() {
        try {
            await this.initialize();
            
            console.log('📊 Getting real-time user data...');
            
            const response = await this.analyticsData.properties.runRealtimeReport({
                property: this.propertyId,
                requestBody: {
                    dimensions: [
                        { name: 'city' },
                        { name: 'country' }
                    ],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'screenPageViews' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} real-time records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No real-time data available');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get real-time data:', error.message);
            throw error;
        }
    }

    /**
     * Get user engagement metrics
     */
    async getUserEngagement(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting user engagement data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'date' },
                        { name: 'pagePath' }
                    ],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'screenPageViews' },
                        { name: 'sessions' },
                        { name: 'averageSessionDuration' },
                        { name: 'bounceRate' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} engagement records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No engagement data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get user engagement data:', error.message);
            throw error;
        }
    }

    /**
     * Get conversion and e-commerce data
     */
    async getConversionData(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting conversion data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'date' },
                        { name: 'pagePath' }
                    ],
                    metrics: [
                        { name: 'transactions' },
                        { name: 'totalRevenue' },
                        { name: 'purchaseToViewRate' },
                        { name: 'addToCarts' },
                        { name: 'checkouts' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} conversion records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No conversion data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get conversion data:', error.message);
            throw error;
        }
    }

    /**
     * Get traffic sources and channels
     */
    async getTrafficSources(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting traffic sources data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'sessionSource' },
                        { name: 'sessionMedium' },
                        { name: 'sessionCampaignId' }
                    ],
                    metrics: [
                        { name: 'sessions' },
                        { name: 'activeUsers' },
                        { name: 'screenPageViews' },
                        { name: 'bounceRate' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} traffic source records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No traffic source data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get traffic sources data:', error.message);
            throw error;
        }
    }

    /**
     * Get page performance data
     */
    async getPagePerformance(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting page performance data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'pagePath' },
                        { name: 'pageTitle' }
                    ],
                    metrics: [
                        { name: 'screenPageViews' },
                        { name: 'activeUsers' },
                        { name: 'averageSessionDuration' },
                        { name: 'bounceRate' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} page performance records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No page performance data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get page performance data:', error.message);
            throw error;
        }
    }

    /**
     * Get user demographics and interests
     */
    async getUserDemographics(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting user demographics data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'userAgeBracket' },
                        { name: 'userGender' },
                        { name: 'userInterestCategory' }
                    ],
                    metrics: [
                        { name: 'activeUsers' },
                        { name: 'sessions' },
                        { name: 'screenPageViews' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} demographics records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No demographics data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get demographics data:', error.message);
            throw error;
        }
    }

    /**
     * Get custom events and conversions
     */
    async getCustomEvents(startDate = null, endDate = null) {
        try {
            await this.initialize();
            
            const start = startDate || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
            const end = endDate || new Date().toISOString().split('T')[0];
            
            console.log(`📊 Getting custom events data from ${start} to ${end}`);
            
            const response = await this.analyticsData.properties.runReport({
                property: this.propertyId,
                requestBody: {
                    dateRanges: [{ startDate: start, endDate: end }],
                    dimensions: [
                        { name: 'eventName' },
                        { name: 'pagePath' }
                    ],
                    metrics: [
                        { name: 'eventCount' },
                        { name: 'eventValue' },
                        { name: 'uniqueEvents' }
                    ]
                }
            });

            if (response.data.rows) {
                console.log(`✅ Retrieved ${response.data.rows.length} custom event records`);
                return response.data.rows;
            } else {
                console.log('ℹ️ No custom event data available for the specified period');
                return [];
            }
        } catch (error) {
            console.error('❌ Failed to get custom events data:', error.message);
            throw error;
        }
    }

    /**
     * Analyze and provide optimization recommendations
     */
    async getOptimizationRecommendations() {
        try {
            await this.initialize();
            
            console.log('🔍 Analyzing data for optimization recommendations...');
            
            // Get various data points for analysis
            const [engagement, conversions, traffic, pages] = await Promise.all([
                this.getUserEngagement(),
                this.getConversionData(),
                this.getTrafficSources(),
                this.getPagePerformance()
            ]);

            const recommendations = {
                userEngagement: this.analyzeUserEngagement(engagement),
                conversions: this.analyzeConversions(conversions),
                traffic: this.analyzeTrafficSources(traffic),
                pages: this.analyzePagePerformance(pages),
                overall: this.generateOverallRecommendations(engagement, conversions, traffic, pages)
            };

            console.log('✅ Optimization analysis completed');
            return recommendations;
        } catch (error) {
            console.error('❌ Failed to get optimization recommendations:', error.message);
            throw error;
        }
    }

    /**
     * Analyze user engagement patterns
     */
    analyzeUserEngagement(data) {
        if (!data || data.length === 0) {
            return { insights: [], recommendations: [] };
        }

        const insights = [];
        const recommendations = [];

        // Analyze session duration
        const avgSessionDuration = data.reduce((sum, row) => {
            const duration = parseFloat(row.metricValues[3]?.value || 0);
            return sum + duration;
        }, 0) / data.length;

        if (avgSessionDuration < 60) {
            insights.push('Low average session duration');
            recommendations.push('Improve page content and user experience to increase engagement');
        }

        // Analyze bounce rate
        const avgBounceRate = data.reduce((sum, row) => {
            const bounceRate = parseFloat(row.metricValues[4]?.value || 0);
            return sum + bounceRate;
        }, 0) / data.length;

        if (avgBounceRate > 70) {
            insights.push('High bounce rate detected');
            recommendations.push('Optimize landing pages and improve content relevance');
        }

        return { insights, recommendations, metrics: { avgSessionDuration, avgBounceRate } };
    }

    /**
     * Analyze conversion patterns
     */
    analyzeConversions(data) {
        if (!data || data.length === 0) {
            return { insights: [], recommendations: [] };
        }

        const insights = [];
        const recommendations = [];

        // Analyze conversion rate
        const totalViews = data.reduce((sum, row) => {
            return sum + parseInt(row.metricValues[2]?.value || 0);
        }, 0);

        const totalTransactions = data.reduce((sum, row) => {
            return sum + parseInt(row.metricValues[0]?.value || 0);
        }, 0);

        const conversionRate = totalViews > 0 ? (totalTransactions / totalViews) * 100 : 0;

        if (conversionRate < 2) {
            insights.push('Low conversion rate');
            recommendations.push('Optimize checkout process and improve product presentation');
        }

        return { insights, recommendations, metrics: { conversionRate, totalViews, totalTransactions } };
    }

    /**
     * Analyze traffic sources
     */
    analyzeTrafficSources(data) {
        if (!data || data.length === 0) {
            return { insights: [], recommendations: [] };
        }

        const insights = [];
        const recommendations = [];

        // Find top traffic sources
        const sourceAnalysis = data.reduce((acc, row) => {
            const source = row.dimensionValues[0]?.value || 'Unknown';
            const sessions = parseInt(row.metricValues[0]?.value || 0);
            
            if (!acc[source]) acc[source] = 0;
            acc[source] += sessions;
            return acc;
        }, {});

        const topSource = Object.entries(sourceAnalysis)
            .sort(([,a], [,b]) => b - a)[0];

        if (topSource && topSource[1] > 100) {
            insights.push(`Top traffic source: ${topSource[0]} (${topSource[1]} sessions)`);
            recommendations.push(`Focus on optimizing for ${topSource[0]} traffic`);
        }

        return { insights, recommendations, metrics: { sourceAnalysis } };
    }

    /**
     * Analyze page performance
     */
    analyzePagePerformance(data) {
        if (!data || data.length === 0) {
            return { insights: [], recommendations: [] };
        }

        const insights = [];
        const recommendations = [];

        // Find top performing pages
        const pageAnalysis = data
            .map(row => ({
                path: row.dimensionValues[0]?.value || 'Unknown',
                views: parseInt(row.metricValues[0]?.value || 0),
                bounceRate: parseFloat(row.metricValues[4]?.value || 0)
            }))
            .sort((a, b) => b.views - a.views)
            .slice(0, 5);

        if (pageAnalysis.length > 0) {
            insights.push('Top performing pages identified');
            recommendations.push('Use insights from top pages to optimize underperforming ones');
        }

        return { insights, recommendations, metrics: { topPages: pageAnalysis } };
    }

    /**
     * Generate overall optimization recommendations
     */
    generateOverallRecommendations(engagement, conversions, traffic, pages) {
        const recommendations = [];

        // Overall site performance
        if (engagement.length > 0) {
            recommendations.push('Monitor user engagement metrics weekly');
        }

        if (conversions.length > 0) {
            recommendations.push('Track conversion rates and optimize checkout flow');
        }

        if (traffic.length > 0) {
            recommendations.push('Analyze traffic sources and optimize top channels');
        }

        if (pages.length > 0) {
            recommendations.push('Identify and fix underperforming pages');
        }

        recommendations.push('Set up automated reporting for key metrics');
        recommendations.push('Implement A/B testing for conversion optimization');
        recommendations.push('Monitor Core Web Vitals and page speed');

        return recommendations;
    }

    /**
     * Test the API connection
     */
    async testConnection() {
        try {
            console.log('🧪 Testing Google Analytics API connection...');
            
            await this.initialize();
            const realTimeData = await this.getRealTimeData();
            
            console.log('✅ API connection test successful');
            console.log(`📊 Real-time users: ${realTimeData.length > 0 ? realTimeData[0]?.metricValues[0]?.value || 0 : 0}`);
            
            return {
                success: true,
                realTimeUsers: realTimeData.length > 0 ? realTimeData[0]?.metricValues[0]?.value || 0 : 0,
                dataAvailable: realTimeData.length > 0
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

module.exports = GoogleAnalyticsAPIService;
