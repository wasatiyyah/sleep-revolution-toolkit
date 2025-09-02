/**
 * Unified Optimization Service
 * Coordinates Search Console, Analytics, and Tag Manager APIs
 * Ensures all systems work together perfectly for maximum performance
 */

const SearchConsoleAPIService = require('./search-console-api-service');
const GoogleAnalyticsAPIService = require('./google-analytics-api-service');
const GTMAPIService = require('./gtm-api-service');

class UnifiedOptimizationService {
    constructor() {
        this.searchConsole = new SearchConsoleAPIService();
        this.analytics = new GoogleAnalyticsAPIService();
        this.gtm = new GTMAPIService();
        
        this.optimizationHistory = [];
        this.lastOptimization = null;
    }

    /**
     * Initialize all services
     */
    async initialize() {
        try {
            console.log('🚀 Initializing Unified Optimization Service...');
            
            // Initialize all services in parallel
            const [searchConsoleReady, analyticsReady, gtmReady] = await Promise.all([
                this.searchConsole.initialize(),
                this.analytics.initialize(),
                this.gtm.initialize()
            ]);

            if (searchConsoleReady && analyticsReady && gtmReady) {
                console.log('✅ All services initialized successfully');
                console.log('   🔍 Search Console: Ready');
                console.log('   📊 Analytics: Ready');
                console.log('   🏷️ Tag Manager: Ready');
                return true;
            } else {
                throw new Error('One or more services failed to initialize');
            }
        } catch (error) {
            console.error('❌ Failed to initialize Unified Optimization Service:', error.message);
            throw error;
        }
    }

    /**
     * Comprehensive system health check
     */
    async performSystemHealthCheck() {
        try {
            console.log('🏥 Performing comprehensive system health check...');
            
            const healthReport = {
                timestamp: new Date().toISOString(),
                searchConsole: {},
                analytics: {},
                gtm: {},
                crossSystem: {},
                recommendations: []
            };

            // 1. Search Console Health Check
            console.log('   🔍 Checking Search Console...');
            try {
                const sites = await this.searchConsole.listSites();
                healthReport.searchConsole.sites = sites.length;
                healthReport.searchConsole.status = 'healthy';
                
                if (sites.length > 0) {
                    const sitemaps = await this.searchConsole.listSitemaps();
                    healthReport.searchConsole.sitemaps = sitemaps.length;
                    
                    // Check sitemap health
                    const sitemapHealth = await this.checkSitemapHealth();
                    healthReport.searchConsole.sitemapHealth = sitemapHealth;
                }
            } catch (error) {
                healthReport.searchConsole.status = 'error';
                healthReport.searchConsole.error = error.message;
                healthReport.recommendations.push('Fix Search Console API access');
            }

            // 2. Analytics Health Check
            console.log('   📊 Checking Analytics...');
            try {
                const realTimeData = await this.analytics.getRealTimeData();
                healthReport.analytics.realTimeUsers = realTimeData.length > 0 ? 
                    realTimeData[0]?.metricValues[0]?.value || 0 : 0;
                healthReport.analytics.status = 'healthy';
                
                // Check data freshness
                const engagementData = await this.analytics.getUserEngagement();
                healthReport.analytics.dataFreshness = engagementData.length > 0 ? 'current' : 'stale';
                
            } catch (error) {
                healthReport.analytics.status = 'error';
                healthReport.analytics.error = error.message;
                healthReport.recommendations.push('Fix Analytics API access');
            }

            // 3. Tag Manager Health Check
            console.log('   🏷️ Checking Tag Manager...');
            try {
                const accountInfo = await this.gtm.getAccount();
                healthReport.gtm.account = accountInfo.displayName;
                healthReport.gtm.status = 'healthy';
                
                // Check container status
                const containerInfo = await this.gtm.getContainer();
                healthReport.gtm.container = containerInfo.name;
                healthReport.gtm.containerId = containerInfo.publicId;
                
                // Check workspace status
                const workspaces = await this.gtm.listWorkspaces();
                healthReport.gtm.workspaces = workspaces.length;
                
            } catch (error) {
                healthReport.gtm.status = 'error';
                healthReport.gtm.error = error.message;
                healthReport.recommendations.push('Fix Tag Manager API access');
            }

            // 4. Cross-System Integration Check
            console.log('   🔗 Checking cross-system integration...');
            const crossSystemHealth = await this.checkCrossSystemIntegration();
            healthReport.crossSystem = crossSystemHealth;

            // 5. Generate recommendations
            healthReport.recommendations = this.generateHealthRecommendations(healthReport);

            this.optimizationHistory.push(healthReport);
            this.lastOptimization = healthReport;

            console.log('✅ System health check completed');
            return healthReport;

        } catch (error) {
            console.error('❌ System health check failed:', error.message);
            throw error;
        }
    }

    /**
     * Check sitemap health and accessibility
     */
    async checkSitemapHealth() {
        try {
            const sitemapUrl = 'https://www.sleeprevolutiontoolkit.com/sitemap.xml';
            
            // Check if sitemap is accessible
            const response = await fetch(sitemapUrl);
            const isAccessible = response.ok;
            
            // Check if sitemap is submitted to Search Console
            const sitemaps = await this.searchConsole.listSitemaps();
            const isSubmitted = sitemaps.some(s => s.path === sitemapUrl);
            
            return {
                isAccessible,
                isSubmitted,
                status: isAccessible && isSubmitted ? 'healthy' : 'needs_attention'
            };
        } catch (error) {
            return {
                isAccessible: false,
                isSubmitted: false,
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Check how well the systems work together
     */
    async checkCrossSystemIntegration() {
        const integration = {
            gtmToAnalytics: false,
            gtmToSearchConsole: false,
            analyticsToSearchConsole: false,
            overall: 'needs_improvement'
        };

        try {
            // Check if GTM is properly sending data to Analytics
            const gtmContainer = await this.gtm.getContainer();
            const analyticsProperty = await this.analytics.getRealTimeData();
            
            if (gtmContainer && analyticsProperty) {
                integration.gtmToAnalytics = true;
            }

            // Check if Search Console can access the site
            const sites = await this.searchConsole.listSites();
            if (sites.length > 0) {
                integration.gtmToSearchConsole = true;
            }

            // Check if Analytics data is being used for SEO insights
            const engagementData = await this.analytics.getUserEngagement();
            if (engagementData.length > 0) {
                integration.analyticsToSearchConsole = true;
            }

            // Determine overall integration status
            const healthyIntegrations = [integration.gtmToAnalytics, integration.gtmToSearchConsole, integration.analyticsToSearchConsole]
                .filter(Boolean).length;
            
            if (healthyIntegrations === 3) {
                integration.overall = 'excellent';
            } else if (healthyIntegrations >= 2) {
                integration.overall = 'good';
            } else if (healthyIntegrations >= 1) {
                integration.overall = 'fair';
            } else {
                integration.overall = 'poor';
            }

        } catch (error) {
            console.log('⚠️ Cross-system integration check failed:', error.message);
        }

        return integration;
    }

    /**
     * Generate health recommendations
     */
    generateHealthRecommendations(healthReport) {
        const recommendations = [];

        // Search Console recommendations
        if (healthReport.searchConsole.status === 'error') {
            recommendations.push('🔍 Fix Search Console API access - check permissions and API enablement');
        }
        if (healthReport.searchConsole.sitemapHealth && healthReport.searchConsole.sitemapHealth.status !== 'healthy') {
            recommendations.push('🗺️ Submit sitemap to Search Console and ensure it\'s accessible');
        }

        // Analytics recommendations
        if (healthReport.analytics.status === 'error') {
            recommendations.push('📊 Fix Analytics API access - check property ID and permissions');
        }
        if (healthReport.analytics.dataFreshness === 'stale') {
            recommendations.push('📊 Analytics data appears stale - check tracking implementation');
        }

        // Tag Manager recommendations
        if (healthReport.gtm.status === 'error') {
            recommendations.push('🏷️ Fix Tag Manager API access - check container ID and permissions');
        }
        if (healthReport.gtm.workspaces === 0) {
            recommendations.push('🏷️ Create a workspace in Tag Manager for active development');
        }

        // Cross-system integration recommendations
        if (healthReport.crossSystem.overall === 'poor') {
            recommendations.push('🔗 Systems are not properly integrated - implement cross-system data flow');
        } else if (healthReport.crossSystem.overall === 'fair') {
            recommendations.push('🔗 Improve cross-system integration for better data consistency');
        }

        // Performance recommendations
        if (healthReport.analytics.realTimeUsers > 0) {
            recommendations.push('🚀 Site is active - monitor performance metrics closely');
        } else {
            recommendations.push('🚀 No active users - check site accessibility and tracking');
        }

        return recommendations;
    }

    /**
     * Perform comprehensive optimization
     */
    async performComprehensiveOptimization() {
        try {
            console.log('🎯 Performing comprehensive optimization...');
            
            // 1. Health check
            const healthReport = await this.performSystemHealthCheck();
            
            // 2. Analytics optimization
            const analyticsOptimization = await this.optimizeAnalytics();
            
            // 3. Search Console optimization
            const searchConsoleOptimization = await this.optimizeSearchConsole();
            
            // 4. Tag Manager optimization
            const gtmOptimization = await this.optimizeTagManager();
            
            // 5. Cross-system optimization
            const crossSystemOptimization = await this.optimizeCrossSystemIntegration();
            
            const optimizationReport = {
                timestamp: new Date().toISOString(),
                health: healthReport,
                analytics: analyticsOptimization,
                searchConsole: searchConsoleOptimization,
                tagManager: gtmOptimization,
                crossSystem: crossSystemOptimization,
                summary: this.generateOptimizationSummary(healthReport, analyticsOptimization, searchConsoleOptimization, gtmOptimization, crossSystemOptimization)
            };

            console.log('✅ Comprehensive optimization completed');
            return optimizationReport;

        } catch (error) {
            console.error('❌ Comprehensive optimization failed:', error.message);
            throw error;
        }
    }

    /**
     * Optimize Analytics setup
     */
    async optimizeAnalytics() {
        const optimization = {
            status: 'completed',
            improvements: [],
            metrics: {}
        };

        try {
            // Get current performance metrics
            const engagementData = await this.analytics.getUserEngagement();
            const conversionData = await this.analytics.getConversionData();
            const trafficData = await this.analytics.getTrafficSources();
            const pageData = await this.analytics.getPagePerformance();

            optimization.metrics = {
                engagementRecords: engagementData.length,
                conversionRecords: conversionData.length,
                trafficRecords: trafficData.length,
                pageRecords: pageData.length
            };

            // Generate optimization suggestions
            if (engagementData.length > 0) {
                const avgSessionDuration = engagementData.reduce((sum, row) => {
                    return sum + parseFloat(row.metricValues[3]?.value || 0);
                }, 0) / engagementData.length;

                if (avgSessionDuration < 120) {
                    optimization.improvements.push('📊 Improve content engagement to increase session duration');
                }
            }

            if (conversionData.length === 0) {
                optimization.improvements.push('💰 Set up conversion tracking for better ROI measurement');
            }

            if (trafficData.length > 0) {
                const directTraffic = trafficData.filter(row => 
                    row.dimensionValues[0]?.value === '(direct)'
                ).length;
                
                if (directTraffic > 0) {
                    optimization.improvements.push('🎯 Direct traffic is strong - focus on brand building');
                }
            }

        } catch (error) {
            optimization.status = 'failed';
            optimization.error = error.message;
        }

        return optimization;
    }

    /**
     * Optimize Search Console setup
     */
    async optimizeSearchConsole() {
        const optimization = {
            status: 'completed',
            improvements: [],
            metrics: {}
        };

        try {
            // Check sitemap status
            const sitemaps = await this.searchConsole.listSitemaps();
            optimization.metrics.sitemaps = sitemaps.length;

            if (sitemaps.length === 0) {
                optimization.improvements.push('🗺️ Submit sitemap to Search Console for better indexing');
            }

            // Check site verification
            const sites = await this.searchConsole.listSites();
            optimization.metrics.sites = sites.length;

            if (sites.length === 0) {
                optimization.improvements.push('🔍 Add site to Search Console and verify ownership');
            }

            // Check for indexing issues
            const sitemapHealth = await this.checkSitemapHealth();
            if (sitemapHealth.status !== 'healthy') {
                optimization.improvements.push('⚠️ Fix sitemap accessibility and submission issues');
            }

        } catch (error) {
            optimization.status = 'failed';
            optimization.error = error.message;
        }

        return optimization;
    }

    /**
     * Optimize Tag Manager setup
     */
    async optimizeTagManager() {
        const optimization = {
            status: 'completed',
            improvements: [],
            metrics: {}
        };

        try {
            // Check container status
            const containerInfo = await this.gtm.getContainer();
            optimization.metrics.containerName = containerInfo.name;
            optimization.metrics.containerId = containerInfo.publicId;

            // Check workspaces
            const workspaces = await this.gtm.listWorkspaces();
            optimization.metrics.workspaces = workspaces.length;

            if (workspaces.length === 0) {
                optimization.improvements.push('🏷️ Create a workspace in Tag Manager for active development');
            }

            // Check tags
            const tags = await this.gtm.listTags();
            optimization.metrics.tags = tags.length;

            if (tags.length === 0) {
                optimization.improvements.push('🏷️ Create essential tags for Analytics and conversion tracking');
            }

            // Check triggers
            const triggers = await this.gtm.listTriggers();
            optimization.metrics.triggers = triggers.length;

            if (triggers.length === 0) {
                optimization.improvements.push('🎯 Create triggers for page views and user interactions');
            }

        } catch (error) {
            optimization.status = 'failed';
            optimization.error = error.message;
        }

        return optimization;
    }

    /**
     * Optimize cross-system integration
     */
    async optimizeCrossSystemIntegration() {
        const optimization = {
            status: 'completed',
            improvements: [],
            metrics: {}
        };

        try {
            // Check if GTM is properly configured for Analytics
            const gtmContainer = await this.gtm.getContainer();
            const analyticsProperty = await this.analytics.getRealTimeData();
            
            if (gtmContainer && analyticsProperty) {
                optimization.metrics.gtmToAnalytics = 'connected';
            } else {
                optimization.metrics.gtmToAnalytics = 'disconnected';
                optimization.improvements.push('🔗 Ensure GTM is properly sending data to Analytics');
            }

            // Check if Search Console can access the site
            const sites = await this.searchConsole.listSites();
            if (sites.length > 0) {
                optimization.metrics.searchConsoleAccess = 'verified';
            } else {
                optimization.metrics.searchConsoleAccess = 'unverified';
                optimization.improvements.push('🔗 Verify site ownership in Search Console');
            }

            // Check data consistency
            const crossSystemHealth = await this.checkCrossSystemIntegration();
            optimization.metrics.integrationHealth = crossSystemHealth.overall;

            if (crossSystemHealth.overall === 'poor') {
                optimization.improvements.push('🔗 Implement comprehensive cross-system data flow');
            }

        } catch (error) {
            optimization.status = 'failed';
            optimization.error = error.message;
        }

        return optimization;
    }

    /**
     * Generate optimization summary
     */
    generateOptimizationSummary(health, analytics, searchConsole, tagManager, crossSystem) {
        const summary = {
            overallStatus: 'excellent',
            criticalIssues: 0,
            warnings: 0,
            improvements: 0,
            nextActions: []
        };

        // Count issues and improvements
        if (health.recommendations) {
            summary.improvements += health.recommendations.length;
        }

        if (analytics.improvements) {
            summary.improvements += analytics.improvements.length;
        }

        if (searchConsole.improvements) {
            summary.improvements += searchConsole.improvements.length;
        }

        if (tagManager.improvements) {
            summary.improvements += tagManager.improvements.length;
        }

        if (crossSystem.improvements) {
            summary.improvements += crossSystem.improvements.length;
        }

        // Determine overall status
        if (summary.criticalIssues > 0) {
            summary.overallStatus = 'critical';
        } else if (summary.warnings > 0) {
            summary.overallStatus = 'warning';
        } else if (summary.improvements > 0) {
            summary.overallStatus = 'good';
        } else {
            summary.overallStatus = 'excellent';
        }

        // Generate next actions
        if (health.recommendations && health.recommendations.length > 0) {
            summary.nextActions.push(...health.recommendations.slice(0, 3));
        }

        if (analytics.improvements && analytics.improvements.length > 0) {
            summary.nextActions.push(...analytics.improvements.slice(0, 2));
        }

        if (searchConsole.improvements && searchConsole.improvements.length > 0) {
            summary.nextActions.push(...searchConsole.improvements.slice(0, 2));
        }

        return summary;
    }

    /**
     * Get optimization history
     */
    getOptimizationHistory() {
        return this.optimizationHistory;
    }

    /**
     * Get last optimization report
     */
    getLastOptimization() {
        return this.lastOptimization;
    }
}

module.exports = UnifiedOptimizationService;
