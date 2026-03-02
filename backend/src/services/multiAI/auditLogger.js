/**
 * AUDIT LOGGER - Enterprise-Grade Audit Trail System
 * 
 * Provides comprehensive logging, decision trail tracking, and audit reporting
 * for the multi-AI skill analysis system.
 * 
 * @module AuditLogger
 */

const fs = require('fs').promises;
const path = require('path');

class AuditLogger {
  constructor(config = {}) {
    this.logLevel = config.logLevel || 'info';
    this.retentionDays = config.retentionDays || 90;
    this.logDir = path.join(__dirname, '..', '..', '..', 'logs');
    this.auditDir = path.join(__dirname, '..', '..', '..', 'audit');
    
    // In-memory storage for current session
    this.analyses = [];
    this.costTracker = { daily: 0, monthly: 0, lastReset: new Date() };
    
    // Initialize log directories
    this.initializeDirectories();
  }

  /**
   * Initialize log and audit directories
   */
  async initializeDirectories() {
    try {
      await fs.mkdir(this.logDir, { recursive: true });
      await fs.mkdir(this.auditDir, { recursive: true });
      this.info('✅ Audit logger initialized');
    } catch (error) {
      console.error('Failed to initialize audit directories:', error.message);
    }
  }

  /**
   * Log analysis result
   */
  async logAnalysis(result) {
    try {
      // Store in memory
      this.analyses.push({
        ...result,
        loggedAt: new Date().toISOString()
      });
      
      // Update cost tracker
      this.updateCostTracker(parseFloat(result.metadata.totalCost));
      
      // Write to audit file
      const auditFile = path.join(this.auditDir, `${result.analysisId}.json`);
      await fs.writeFile(auditFile, JSON.stringify(result, null, 2), 'utf8');
      
      this.info(`📝 Audit log saved: ${result.analysisId}`);
      
      // Append to daily log
      await this.appendToDailyLog(result);
      
    } catch (error) {
      this.error(`Failed to log analysis: ${error.message}`);
    }
  }

  /**
   * Log error
   */
  async logError(analysisId, error) {
    try {
      const errorLog = {
        analysisId,
        error: {
          message: error.message,
          stack: error.stack,
          timestamp: new Date().toISOString()
        }
      };
      
      const errorFile = path.join(this.logDir, `error_${analysisId}.json`);
      await fs.writeFile(errorFile, JSON.stringify(errorLog, null, 2), 'utf8');
      
    } catch (err) {
      console.error('Failed to log error:', err.message);
    }
  }

  /**
   * Update cost tracker
   */
  updateCostTracker(cost) {
    const now = new Date();
    const lastReset = new Date(this.costTracker.lastReset);
    
    // Reset daily cost if new day
    if (now.getDate() !== lastReset.getDate()) {
      this.costTracker.daily = 0;
      this.costTracker.lastReset = now;
    }
    
    // Reset monthly cost if new month
    if (now.getMonth() !== lastReset.getMonth()) {
      this.costTracker.monthly = 0;
    }
    
    this.costTracker.daily += cost;
    this.costTracker.monthly += cost;
  }

  /**
   * Get today's total cost
   */
  async getTodayCost() {
    return this.costTracker.daily;
  }

  /**
   * Get monthly total cost
   */
  async getMonthlyCost() {
    return this.costTracker.monthly;
  }

  /**
   * Append to daily log file
   */
  async appendToDailyLog(result) {
    try {
      const today = new Date().toISOString().split('T')[0];
      const dailyLogFile = path.join(this.logDir, `analyses_${today}.jsonl`);
      
      const logLine = JSON.stringify({
        analysisId: result.analysisId,
        timestamp: result.timestamp,
        skills: result.metadata.totalSkills,
        cost: result.metadata.totalCost,
        time: result.metadata.totalTime
      }) + '\n';
      
      await fs.appendFile(dailyLogFile, logLine, 'utf8');
      
    } catch (error) {
      this.error(`Failed to append to daily log: ${error.message}`);
    }
  }

  /**
   * Export audit trail for analysis
   */
  async exportAuditTrail(analysisId, format = 'json') {
    try {
      const auditFile = path.join(this.auditDir, `${analysisId}.json`);
      const data = await fs.readFile(auditFile, 'utf8');
      
      if (format === 'json') {
        return JSON.parse(data);
      } else if (format === 'pdf') {
        // TODO: Implement PDF export
        throw new Error('PDF export not yet implemented');
      }
      
      return data;
      
    } catch (error) {
      this.error(`Failed to export audit trail: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get statistics for period
   */
  async getStatistics(days = 30) {
    try {
      const stats = {
        totalAnalyses: this.analyses.length,
        totalCost: this.analyses.reduce((sum, a) => sum + parseFloat(a.metadata.totalCost || 0), 0),
        avgTime: 0,
        avgSkills: 0,
        avgConfidence: 0,
        costByLayer: {},
        topSkills: {}
      };
      
      if (this.analyses.length > 0) {
        stats.avgTime = this.analyses.reduce((sum, a) => sum + a.metadata.totalTime, 0) / this.analyses.length;
        stats.avgSkills = this.analyses.reduce((sum, a) => sum + a.metadata.totalSkills, 0) / this.analyses.length;
        stats.avgConfidence = this.analyses.reduce((sum, a) => sum + a.metadata.avgConfidence, 0) / this.analyses.length;
      }
      
      return stats;
      
    } catch (error) {
      this.error(`Failed to get statistics: ${error.message}`);
      return null;
    }
  }

  /**
   * Clean old audit logs
   */
  async cleanOldLogs() {
    try {
      const files = await fs.readdir(this.auditDir);
      const now = Date.now();
      const retentionMs = this.retentionDays * 24 * 60 * 60 * 1000;
      
      let deleted = 0;
      
      for (const file of files) {
        const filePath = path.join(this.auditDir, file);
        const stats = await fs.stat(filePath);
        
        if (now - stats.mtimeMs > retentionMs) {
          await fs.unlink(filePath);
          deleted++;
        }
      }
      
      if (deleted > 0) {
        this.info(`🗑️ Cleaned ${deleted} old audit logs`);
      }
      
    } catch (error) {
      this.error(`Failed to clean old logs: ${error.message}`);
    }
  }

  /**
   * Logging methods
   */
  info(message) {
    if (['debug', 'info', 'warn', 'error'].includes(this.logLevel)) {
      console.log(`[INFO] ${new Date().toISOString()} - ${message}`);
    }
  }

  warn(message) {
    if (['warn', 'error'].includes(this.logLevel)) {
      console.warn(`[WARN] ${new Date().toISOString()} - ${message}`);
    }
  }

  error(message) {
    if (this.logLevel === 'error') {
      console.error(`[ERROR] ${new Date().toISOString()} - ${message}`);
    }
  }

  debug(message, data = null) {
    if (this.logLevel === 'debug') {
      console.log(`[DEBUG] ${new Date().toISOString()} - ${message}`);
      if (data) {
        console.log(JSON.stringify(data, null, 2));
      }
    }
  }
}

module.exports = { AuditLogger };
