const AdmZip = require('adm-zip');
const yauzl = require('yauzl');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

/**
 * Code Scanner Module for Emergence Platform
 * Provides security scanning and analysis of uploaded agent files
 */

class CodeScanner {
  constructor() {
    // Suspicious patterns for security scanning
    this.securityPatterns = {
      // Potentially dangerous imports/requires
      dangerousImports: [
        /import\s+.*?['"][^'"]*(?:subprocess|exec|eval|shell|os|sys|file|socket|http|request)['"]/, 
        /require\s*\(\s*['"][^'"]*(?:child_process|exec|eval|fs|os|net|http|https|crypto)['"]/, 
        /from\s+['"][^'"]*(?:subprocess|exec|eval|shell|os|sys|socket)['"]/, 
      ],
      
      // Dangerous function calls
      dangerousCalls: [
        /eval\s*\(/,
        /exec\s*\(/,
        /system\s*\(/,
        /shell_exec\s*\(/,
        /popen\s*\(/,
        /subprocess\.call/,
        /subprocess\.run/,
        /os\.system/,
        /os\.popen/,
      ],
      
      // Network operations
      networkOperations: [
        /urllib\.request/,
        /requests\.(?:get|post|put|delete)/,
        /fetch\s*\(/,
        /axios\./,
        /http\.request/,
        /socket\.socket/,
      ],
      
      // File system operations
      fileSystemOps: [
        /open\s*\(/,
        /\.read\(\)/,
        /\.write\(/,
        /fs\.(?:readFile|writeFile|unlink|rmdir)/,
        /os\.remove/,
        /shutil\.rmtree/,
      ],
      
      // Obfuscation indicators
      obfuscation: [
        /\\x[0-9a-fA-F]{2}/,  // hex encoding
        /\\[0-7]{3}/,         // octal encoding
        /base64/i,
        /atob\s*\(/,
        /btoa\s*\(/,
      ]
    };

    // Allowed file extensions
    this.allowedExtensions = [
      '.py', '.js', '.json', '.txt', '.md', '.yml', '.yaml', 
      '.toml', '.cfg', '.conf', '.ini', '.env.example'
    ];

    // Maximum file size for analysis (5MB)
    this.maxFileSize = 5 * 1024 * 1024;
    
    // Maximum number of files to analyze
    this.maxFiles = 100;
  }

  /**
   * Extract and analyze a zip file
   * @param {string} zipPath - Path to the zip file
   * @param {Object} options - Analysis options
   * @returns {Promise<Object>} Analysis results
   */
  async scanZipFile(zipPath, options = {}) {
    const results = {
      timestamp: new Date().toISOString(),
      zipPath: zipPath,
      fileCount: 0,
      totalSize: 0,
      files: [],
      securityFindings: [],
      metadata: {},
      summary: {
        safe: true,
        riskLevel: 'low',
        warnings: [],
        errors: []
      }
    };

    try {
      // Verify zip file exists and is readable
      if (!fs.existsSync(zipPath)) {
        throw new Error(`Zip file not found: ${zipPath}`);
      }

      const stats = fs.statSync(zipPath);
      results.metadata.zipSize = stats.size;
      results.metadata.zipModified = stats.mtime;

      console.log(`🔍 Starting code scan of: ${zipPath}`);
      console.log(`📦 Zip file size: ${stats.size} bytes`);

      // Extract and analyze files
      await this.extractAndAnalyzeZip(zipPath, results, options);

      // Calculate risk level
      this.calculateRiskLevel(results);

      console.log(`✅ Code scan completed: ${results.fileCount} files analyzed`);
      console.log(`🛡️  Risk level: ${results.summary.riskLevel}`);

      return results;

    } catch (error) {
      console.error('❌ Code scanning error:', error);
      results.summary.errors.push(error.message);
      results.summary.safe = false;
      results.summary.riskLevel = 'error';
      return results;
    }
  }

  /**
   * Extract files from zip and analyze each one
   */
  async extractAndAnalyzeZip(zipPath, results, options) {
    return new Promise((resolve, reject) => {
      yauzl.open(zipPath, { lazyEntries: true }, (err, zipfile) => {
        if (err) {
          reject(new Error(`Failed to open zip file: ${err.message}`));
          return;
        }

        zipfile.readEntry();
        
        zipfile.on('entry', (entry) => {
          results.fileCount++;
          
          // Skip directories
          if (/\/$/.test(entry.fileName)) {
            zipfile.readEntry();
            return;
          }

          // Check file count limit
          if (results.files.length >= this.maxFiles) {
            results.summary.warnings.push(`File limit reached (${this.maxFiles}), skipping remaining files`);
            zipfile.readEntry();
            return;
          }

          // Analyze file entry
          const fileAnalysis = this.analyzeFileEntry(entry);
          results.files.push(fileAnalysis);
          results.totalSize += entry.uncompressedSize;

          // Extract and scan file content if it's a code file
          if (this.shouldAnalyzeFileContent(entry.fileName, entry.uncompressedSize)) {
            zipfile.openReadStream(entry, (err, readStream) => {
              if (err) {
                fileAnalysis.error = `Failed to read file: ${err.message}`;
                zipfile.readEntry();
                return;
              }

              let fileContent = '';
              readStream.on('data', (chunk) => {
                fileContent += chunk.toString('utf8');
              });

              readStream.on('end', () => {
                // Store the actual content for later use
                fileAnalysis.content = fileContent;
                
                // Analyze file content
                const contentAnalysis = this.analyzeFileContent(fileContent, entry.fileName);
                Object.assign(fileAnalysis, contentAnalysis);
                
                // Add security findings to global results
                if (contentAnalysis.securityFindings.length > 0) {
                  results.securityFindings.push(...contentAnalysis.securityFindings.map(finding => ({
                    ...finding,
                    file: entry.fileName
                  })));
                }

                zipfile.readEntry();
              });

              readStream.on('error', (err) => {
                fileAnalysis.error = `Stream error: ${err.message}`;
                zipfile.readEntry();
              });
            });
          } else {
            zipfile.readEntry();
          }
        });

        zipfile.on('end', () => {
          resolve();
        });

        zipfile.on('error', (err) => {
          reject(new Error(`Zip processing error: ${err.message}`));
        });
      });
    });
  }

  /**
   * Analyze a file entry (metadata only)
   */
  analyzeFileEntry(entry) {
    const fileName = entry.fileName;
    const extension = path.extname(fileName).toLowerCase();
    
    return {
      fileName: fileName,
      path: path.dirname(fileName),
      extension: extension,
      size: entry.uncompressedSize,
      compressedSize: entry.compressedSize,
      compressionRatio: entry.compressedSize / entry.uncompressedSize,
      isAllowedExtension: this.allowedExtensions.includes(extension),
      isCodeFile: this.isCodeFile(fileName),
      lastModified: entry.getLastModDate?.() || null,
      suspicious: this.isSuspiciousFileName(fileName)
    };
  }

  /**
   * Extract content from zip file for platform scoring
   * @param {string} zipPath - Path to the zip file
   * @returns {Promise<string>} Combined content from all code files
   */
  async extractContentFromZip(zipPath) {
    return new Promise((resolve, reject) => {
      let combinedContent = '';
      let processedFiles = 0;
      let totalCodeFiles = 0;

      const zip = new AdmZip(zipPath);
      const entries = zip.getEntries();
      
      // Count code files first
      for (const entry of entries) {
        if (!entry.isDirectory && this.isCodeFile(entry.entryName) && entry.header.size > 0) {
          totalCodeFiles++;
        }
      }

      if (totalCodeFiles === 0) {
        resolve('// No code files found');
        return;
      }

      // Extract content from code files
      for (const entry of entries) {
        if (!entry.isDirectory && this.isCodeFile(entry.entryName) && entry.header.size > 0) {
          try {
            const content = entry.getData().toString('utf8');
            combinedContent += `\n// File: ${entry.entryName}\n${content}\n`;
            processedFiles++;
            
            if (processedFiles >= totalCodeFiles) {
              resolve(combinedContent);
              return;
            }
          } catch (err) {
            console.warn(`Warning: Could not read ${entry.entryName}:`, err.message);
            processedFiles++;
            
            if (processedFiles >= totalCodeFiles) {
              resolve(combinedContent || '// Could not extract file content');
              return;
            }
          }
        }
      }
    });
  }

  /**
   * Determine if we should analyze file content
   */
  shouldAnalyzeFileContent(fileName, size) {
    return this.isCodeFile(fileName) && 
           size <= this.maxFileSize && 
           size > 0;
  }

  /**
   * Check if file is a code file that should be analyzed
   */
  isCodeFile(fileName) {
    const extension = path.extname(fileName).toLowerCase();
    const codeExtensions = ['.py', '.js', '.ts', '.json', '.yml', '.yaml', '.toml'];
    return codeExtensions.includes(extension);
  }

  /**
   * Check for suspicious file names
   */
  isSuspiciousFileName(fileName) {
    const suspiciousPatterns = [
      /\.(exe|bat|cmd|sh|scr|com|pif)$/i,
      /__pycache__/,
      /\.git/,
      /node_modules/,
      /\.(log|tmp|temp|bak|old)$/i,
      /^\.env$/,  // actual .env files (not .env.example)
    ];

    return suspiciousPatterns.some(pattern => pattern.test(fileName));
  }

  /**
   * Analyze file content for security issues
   */
  analyzeFileContent(content, fileName) {
    const analysis = {
      lineCount: content.split('\n').length,
      characterCount: content.length,
      securityFindings: [],
      codeMetrics: {},
      hash: crypto.createHash('sha256').update(content).digest('hex').substring(0, 16)
    };

    // Security pattern scanning
    for (const [category, patterns] of Object.entries(this.securityPatterns)) {
      for (const pattern of patterns) {
        const matches = content.match(new RegExp(pattern.source, 'gm'));
        if (matches) {
          matches.forEach((match, index) => {
            analysis.securityFindings.push({
              category: category,
              pattern: pattern.source,
              match: match.trim(),
              severity: this.getSeverityForCategory(category),
              line: this.getLineNumber(content, content.indexOf(match))
            });
          });
        }
      }
    }

    // Language-specific analysis
    if (fileName.endsWith('.py')) {
      analysis.codeMetrics = this.analyzePythonCode(content);
    } else if (fileName.endsWith('.js') || fileName.endsWith('.ts')) {
      analysis.codeMetrics = this.analyzeJavaScriptCode(content);
    } else if (fileName.endsWith('.json')) {
      analysis.codeMetrics = this.analyzeJsonContent(content);
    }

    return analysis;
  }

  /**
   * Get severity level for security category
   */
  getSeverityForCategory(category) {
    const severityMap = {
      dangerousImports: 'high',
      dangerousCalls: 'critical',
      networkOperations: 'medium',
      fileSystemOps: 'medium',
      obfuscation: 'high'
    };
    return severityMap[category] || 'low';
  }

  /**
   * Get line number for a position in content
   */
  getLineNumber(content, position) {
    if (position < 0) return 1;
    return content.substring(0, position).split('\n').length;
  }

  /**
   * Analyze Python code specifically
   */
  analyzePythonCode(content) {
    const imports = (content.match(/^(?:import|from)\s+.+$/gm) || []).length;
    const functions = (content.match(/^def\s+\w+/gm) || []).length;
    const classes = (content.match(/^class\s+\w+/gm) || []).length;
    
    return {
      language: 'python',
      imports: imports,
      functions: functions,
      classes: classes,
      complexity: this.calculateComplexity(content)
    };
  }

  /**
   * Analyze JavaScript/TypeScript code specifically
   */
  analyzeJavaScriptCode(content) {
    const imports = (content.match(/^(?:import|require).+$/gm) || []).length;
    const functions = (content.match(/(?:function\s+\w+|const\s+\w+\s*=\s*(?:\([^)]*\)\s*=>|function))/gm) || []).length;
    const classes = (content.match(/^class\s+\w+/gm) || []).length;
    
    return {
      language: 'javascript',
      imports: imports,
      functions: functions,
      classes: classes,
      complexity: this.calculateComplexity(content)
    };
  }

  /**
   * Analyze JSON content
   */
  analyzeJsonContent(content) {
    try {
      const parsed = JSON.parse(content);
      return {
        language: 'json',
        valid: true,
        keys: Object.keys(parsed).length,
        depth: this.calculateJsonDepth(parsed)
      };
    } catch (error) {
      return {
        language: 'json',
        valid: false,
        error: error.message
      };
    }
  }

  /**
   * Calculate code complexity (simple metric)
   */
  calculateComplexity(content) {
    const controlStructures = (content.match(/\b(?:if|for|while|try|catch|switch|case)\b/g) || []).length;
    const lines = content.split('\n').filter(line => line.trim().length > 0).length;
    return Math.round((controlStructures / Math.max(lines, 1)) * 100) / 100;
  }

  /**
   * Calculate JSON depth
   */
  calculateJsonDepth(obj, depth = 0) {
    if (typeof obj !== 'object' || obj === null) {
      return depth;
    }
    
    let maxDepth = depth;
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        const currentDepth = this.calculateJsonDepth(obj[key], depth + 1);
        maxDepth = Math.max(maxDepth, currentDepth);
      }
    }
    
    return maxDepth;
  }

  /**
   * Calculate overall risk level
   */
  calculateRiskLevel(results) {
    let riskScore = 0;
    const findings = results.securityFindings;

    // Count findings by severity
    const severityCounts = {
      critical: findings.filter(f => f.severity === 'critical').length,
      high: findings.filter(f => f.severity === 'high').length,
      medium: findings.filter(f => f.severity === 'medium').length,
      low: findings.filter(f => f.severity === 'low').length
    };

    // Calculate risk score
    riskScore += severityCounts.critical * 10;
    riskScore += severityCounts.high * 5;
    riskScore += severityCounts.medium * 2;
    riskScore += severityCounts.low * 1;

    // Check for suspicious files
    const suspiciousFiles = results.files.filter(f => f.suspicious).length;
    riskScore += suspiciousFiles * 3;

    // Determine risk level
    if (riskScore === 0) {
      results.summary.riskLevel = 'safe';
      results.summary.safe = true;
    } else if (riskScore <= 5) {
      results.summary.riskLevel = 'low';
      results.summary.safe = true;
    } else if (riskScore <= 15) {
      results.summary.riskLevel = 'medium';
      results.summary.safe = false;
      results.summary.warnings.push('Medium risk detected - review security findings');
    } else if (riskScore <= 30) {
      results.summary.riskLevel = 'high';
      results.summary.safe = false;
      results.summary.warnings.push('High risk detected - manual review required');
    } else {
      results.summary.riskLevel = 'critical';
      results.summary.safe = false;
      results.summary.errors.push('Critical risk detected - upload blocked');
    }

    results.summary.riskScore = riskScore;
    results.summary.severityCounts = severityCounts;
  }

  /**
   * Pattern Detection Foundation
   * Search text content for specific patterns and return boolean results
   * @param {string} content - Text content to search
   * @param {string|RegExp|Array} patterns - Pattern(s) to search for
   * @param {Object} options - Search options
   * @returns {Object} Pattern detection results
   */
  detectPatterns(content, patterns, options = {}) {
    const {
      caseSensitive = false,
      wholeWord = false,
      returnMatches = false
    } = options;

    // Normalize patterns to array
    const patternArray = Array.isArray(patterns) ? patterns : [patterns];
    
    const results = {
      found: false,
      matches: [],
      patternResults: {}
    };

    for (const pattern of patternArray) {
      let regex;
      let patternKey = pattern.toString();

      // Convert string patterns to regex
      if (typeof pattern === 'string') {
        let regexPattern = pattern;
        
        // Escape special regex characters if it's a plain string
        if (!options.isRegex) {
          regexPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }
        
        // Add word boundary if wholeWord is true
        if (wholeWord) {
          regexPattern = `\\b${regexPattern}\\b`;
        }
        
        const flags = caseSensitive ? 'g' : 'gi';
        regex = new RegExp(regexPattern, flags);
      } else if (pattern instanceof RegExp) {
        regex = new RegExp(pattern.source, pattern.flags + (pattern.flags.includes('g') ? '' : 'g'));
      } else {
        continue; // Skip invalid patterns
      }

      // Search for matches
      const matches = content.match(regex) || [];
      const found = matches.length > 0;

      // Store results for this pattern
      results.patternResults[patternKey] = {
        found: found,
        count: matches.length,
        matches: returnMatches ? matches : []
      };

      // Update global results
      if (found) {
        results.found = true;
        if (returnMatches) {
          results.matches.push(...matches);
        }
      }
    }

    return results;
  }

  /**
   * Detect communication patterns specifically
   * @param {string} content - Text content to search
   * @returns {Object} Communication pattern detection results
   */
  detectCommunicationPatterns(content) {
    const communicationPatterns = [
      // API endpoints
      'api/webhook',
      'api/callback',
      '/webhook',
      '/callback',
      
      // HTTP methods
      'requests.post',
      'requests.get',
      'requests.put',
      'requests.delete',
      'fetch(',
      'axios.post',
      'axios.get',
      
      // Network communication
      'http://',
      'https://',
      'ws://',
      'wss://',
      
      // Common API patterns
      'POST ',
      'GET ',
      'PUT ',
      'DELETE ',
      'PATCH '
    ];

    return this.detectPatterns(content, communicationPatterns, {
      caseSensitive: false,
      returnMatches: true
    });
  }

  /**
   * Platform Endpoint Detection
   * Scans for specific platform endpoints like webhook registration and ping
   * @param {string} content - Text content to search
   * @returns {Object} Platform endpoint detection results
   */
  detectPlatformEndpoints(content) {
    const platformEndpoints = [
      '/api/webhook/register',
      '/api/webhook/ping',
      'api/webhook/register',
      'api/webhook/ping',
      '/webhook/register',
      '/webhook/ping',
      'webhook/register',
      'webhook/ping'
    ];

    return this.detectPatterns(content, platformEndpoints, {
      caseSensitive: false,
      returnMatches: true
    });
  }

  /**
   * HTTP Library Detection
   * Detects common HTTP libraries and methods
   * @param {string} content - Text content to search
   * @returns {Object} HTTP library detection results with counts
   */
  detectHttpLibraries(content) {
    const httpLibraries = {
      // Python requests
      requests: [
        'import requests',
        'from requests',
        'requests.get',
        'requests.post',
        'requests.put',
        'requests.delete',
        'requests.patch',
        'requests.head',
        'requests.options'
      ],
      
      // JavaScript fetch
      fetch: [
        'fetch(',
        'fetch (',
        'window.fetch',
        'global.fetch'
      ],
      
      // JavaScript axios
      axios: [
        'import axios',
        'require(\'axios\')',
        'require("axios")',
        'axios.get',
        'axios.post',
        'axios.put',
        'axios.delete',
        'axios.patch',
        'axios.head',
        'axios.options',
        'axios.request'
      ],
      
      // cURL (command line and code references)
      curl: [
        'curl ',
        'curl.exe',
        'subprocess.*curl',
        'os.system.*curl',
        'exec.*curl',
        '`curl',
        '"curl ',
        "'curl "
      ]
    };

    const results = {
      found: false,
      totalCount: 0,
      libraries: {},
      allMatches: []
    };

    // Process each library category
    for (const [libraryName, patterns] of Object.entries(httpLibraries)) {
      const libraryResult = this.detectPatterns(content, patterns, {
        caseSensitive: false,
        returnMatches: true,
        isRegex: libraryName === 'curl' // curl patterns include regex
      });

      results.libraries[libraryName] = {
        found: libraryResult.found,
        count: libraryResult.matches.length,
        matches: libraryResult.matches,
        patterns: {}
      };

      // Count occurrences of each specific pattern
      for (const pattern of patterns) {
        const patternKey = pattern.toString();
        const patternResult = libraryResult.patternResults[patternKey];
        if (patternResult && patternResult.found) {
          results.libraries[libraryName].patterns[pattern] = patternResult.count;
        }
      }

      if (libraryResult.found) {
        results.found = true;
        results.totalCount += libraryResult.matches.length;
        results.allMatches.push(...libraryResult.matches);
      }
    }

    return results;
  }

  /**
   * Count Pattern Occurrences
   * Count how many times specific patterns appear in content
   * @param {string} content - Text content to search
   * @param {string|Array} patterns - Pattern(s) to count
   * @param {Object} options - Search options
   * @returns {Object} Pattern count results
   */
  countPatterns(content, patterns, options = {}) {
    const result = this.detectPatterns(content, patterns, {
      ...options,
      returnMatches: true
    });

    const counts = {
      total: result.matches.length,
      patterns: {},
      found: result.found
    };

    // Get individual pattern counts
    for (const [pattern, patternResult] of Object.entries(result.patternResults)) {
      counts.patterns[pattern] = patternResult.count;
    }

    return counts;
  }

  /**
   * Comprehensive Platform Analysis
   * Combines endpoint detection, HTTP library detection, and pattern counting
   * @param {string} content - Text content to search
   * @returns {Object} Comprehensive platform analysis results
   */
  analyzePlatformUsage(content) {
    const endpoints = this.detectPlatformEndpoints(content);
    const httpLibraries = this.detectHttpLibraries(content);
    const communicationPatterns = this.detectCommunicationPatterns(content);

    const analysis = {
      timestamp: new Date().toISOString(),
      endpoints: endpoints,
      httpLibraries: httpLibraries,
      communicationPatterns: communicationPatterns,
      summary: {
        hasPlatformEndpoints: endpoints.found,
        hasHttpLibraries: httpLibraries.found,
        hasCommunicationPatterns: communicationPatterns.found,
        totalFindings: endpoints.matches.length + httpLibraries.totalCount + communicationPatterns.matches.length,
        endpointCount: endpoints.matches.length,
        httpLibraryCount: httpLibraries.totalCount,
        communicationPatternCount: communicationPatterns.matches.length
      }
    };

    return analysis;
  }

  /**
   * Simple boolean check for specific patterns
   * @param {string} content - Text content to search
   * @param {string|Array} patterns - Pattern(s) to search for
   * @returns {boolean} True if any pattern is found
   */
  hasPatterns(content, patterns) {
    const result = this.detectPatterns(content, patterns);
    return result.found;
  }

  /**
   * Scoring Algorithm
   * Calculates a score (0-100) based on found patterns and categorizes agents
   * @param {string} content - Text content to analyze
   * @param {Object} options - Scoring options
   * @returns {Object} Scoring results with category and breakdown
   */
  calculatePlatformScore(content, options = {}) {
    const {
      weights = {
        platformEndpoints: 30,    // /api/webhook/register, /api/webhook/ping
        httpLibraries: 25,        // requests, fetch, axios, curl
        communicationPatterns: 20, // general network patterns
        codeQuality: 15,          // imports, functions, structure
        securityCompliance: 10    // lack of dangerous patterns
      },
      bonusPoints = {
        multipleLibraries: 5,     // bonus for using multiple HTTP libraries
        properErrorHandling: 5,   // bonus for try/catch or error handling
        configurationManagement: 5 // bonus for config files or env vars
      }
    } = options;

    let score = 0;
    const breakdown = {
      platformEndpoints: 0,
      httpLibraries: 0,
      communicationPatterns: 0,
      codeQuality: 0,
      securityCompliance: 0,
      bonusPoints: 0,
      penalties: 0
    };

    // 1. Platform Endpoints Score (0-30 points)
    const endpoints = this.detectPlatformEndpoints(content);
    if (endpoints.found) {
      const uniqueEndpoints = [...new Set(endpoints.matches)];
      const registrationEndpoints = uniqueEndpoints.filter(ep => 
        ep.includes('register') || ep.includes('ping')
      );
      
      if (registrationEndpoints.length >= 2) {
        breakdown.platformEndpoints = weights.platformEndpoints; // Full points
      } else if (registrationEndpoints.length === 1) {
        breakdown.platformEndpoints = weights.platformEndpoints * 0.6; // Partial points
      }
    }

    // 2. HTTP Libraries Score (0-25 points)
    const httpLibs = this.detectHttpLibraries(content);
    if (httpLibs.found) {
      const librariesUsed = Object.values(httpLibs.libraries).filter(lib => lib.found).length;
      const totalCalls = httpLibs.totalCount;
      
      // Base score: 10 points for having HTTP libraries
      let libraryScore = 10;
      
      // Additional points based on usage depth
      if (totalCalls >= 3) libraryScore += 8;      // 18 total
      else if (totalCalls >= 2) libraryScore += 5;  // 15 total  
      else if (totalCalls >= 1) libraryScore += 2;  // 12 total
      
      // Additional points for multiple library types
      if (librariesUsed >= 2) libraryScore += 5;   // Up to 23
      if (librariesUsed >= 3) libraryScore += 2;   // Up to 25
      
      breakdown.httpLibraries = Math.min(libraryScore, weights.httpLibraries);
      
      // Bonus for multiple libraries
      if (librariesUsed > 1) {
        breakdown.bonusPoints += bonusPoints.multipleLibraries;
      }
    }

    // 3. Communication Patterns Score (0-20 points)
    const commPatterns = this.detectCommunicationPatterns(content);
    if (commPatterns.found) {
      const patternDiversity = Math.min(commPatterns.matches.length, 10);
      breakdown.communicationPatterns = (patternDiversity / 10) * weights.communicationPatterns;
    }

    // 4. Code Quality Score (0-15 points)
    const codeMetrics = this.analyzeCodeQuality(content);
    breakdown.codeQuality = codeMetrics.qualityScore * (weights.codeQuality / 100);

    // 5. Security Compliance Score (0-10 points)
    const securityAnalysis = this.analyzeSecurityCompliance(content);
    breakdown.securityCompliance = securityAnalysis.complianceScore * (weights.securityCompliance / 100);
    breakdown.penalties += securityAnalysis.penalties;

    // 6. Bonus Points
    // Error handling bonus
    if (this.hasPatterns(content, ['try:', 'except:', 'catch(', 'throw', 'error'])) {
      breakdown.bonusPoints += bonusPoints.properErrorHandling;
    }
    
    // Configuration management bonus
    if (this.hasPatterns(content, ['config', 'env', 'settings', 'getenv', 'process.env'])) {
      breakdown.bonusPoints += bonusPoints.configurationManagement;
    }

    // Calculate final score
    score = Math.max(0, Math.min(100, 
      breakdown.platformEndpoints + 
      breakdown.httpLibraries + 
      breakdown.communicationPatterns + 
      breakdown.codeQuality + 
      breakdown.securityCompliance + 
      breakdown.bonusPoints - 
      breakdown.penalties
    ));

    // Determine category
    let category, confidence;
    if (score >= 80) {
      category = 'Verified';
      confidence = 'High';
    } else if (score >= 40) {
      category = 'Likely';
      confidence = 'Medium';
    } else {
      category = 'Unlikely';
      confidence = 'Low';
    }

    return {
      score: Math.round(score),
      category,
      confidence,
      breakdown,
      weights,
      recommendations: this.generateScoreRecommendations(breakdown, score)
    };
  }

  /**
   * Analyze code quality metrics
   * @param {string} content - Code content to analyze
   * @returns {Object} Code quality analysis
   */
  analyzeCodeQuality(content) {
    const metrics = {
      hasImports: this.hasPatterns(content, ['import ', 'require(', 'from ']),
      hasFunctions: this.hasPatterns(content, ['def ', 'function ', 'const ', '=>']),
      hasClasses: this.hasPatterns(content, ['class ']),
      hasComments: this.hasPatterns(content, ['#', '//', '/*', '"""', "'''"]),
      hasStructure: content.length > 100,
      lineCount: content.split('\n').length
    };

    let qualityScore = 0;
    if (metrics.hasImports) qualityScore += 20;
    if (metrics.hasFunctions) qualityScore += 25;
    if (metrics.hasClasses) qualityScore += 20;
    if (metrics.hasComments) qualityScore += 15;
    if (metrics.hasStructure) qualityScore += 10;
    if (metrics.lineCount > 20) qualityScore += 10;

    return {
      qualityScore: Math.min(qualityScore, 100),
      metrics
    };
  }

  /**
   * Analyze security compliance
   * @param {string} content - Code content to analyze
   * @returns {Object} Security compliance analysis
   */
  analyzeSecurityCompliance(content) {
    const dangerousPatterns = [
      'eval(', 'exec(', 'system(', 'shell_exec',
      'subprocess.run', 'os.system', 'popen'
    ];
    
    const securityBestPractices = [
      'https://', 'authorization', 'token', 'api_key', 'bearer'
    ];

    let complianceScore = 100; // Start with full compliance
    let penalties = 0;

    // Check for dangerous patterns (penalties)
    for (const pattern of dangerousPatterns) {
      const count = this.countPatterns(content, pattern);
      if (count.found) {
        const penalty = count.total * 15; // 15 points per dangerous pattern
        penalties += penalty;
        complianceScore -= penalty;
      }
    }

    // Check for security best practices (bonuses)
    let securityBonus = 0;
    for (const practice of securityBestPractices) {
      if (this.hasPatterns(content, practice)) {
        securityBonus += 5;
      }
    }

    complianceScore = Math.max(0, Math.min(100, complianceScore + securityBonus));

    return {
      complianceScore,
      penalties,
      securityBonus,
      hasDangerousPatterns: penalties > 0
    };
  }

  /**
   * Generate scoring recommendations
   * @param {Object} breakdown - Score breakdown
   * @param {number} score - Total score
   * @returns {Array} Array of recommendations
   */
  generateScoreRecommendations(breakdown, score) {
    const recommendations = [];

    if (breakdown.platformEndpoints < 15) {
      recommendations.push({
        category: 'Platform Integration',
        message: 'Add webhook registration and ping endpoints (/api/webhook/register, /api/webhook/ping)',
        impact: 'High',
        points: 30 - breakdown.platformEndpoints
      });
    }

    if (breakdown.httpLibraries < 15) {
      recommendations.push({
        category: 'HTTP Libraries',
        message: 'Implement HTTP client functionality (requests, fetch, axios)',
        impact: 'Medium',
        points: 25 - breakdown.httpLibraries
      });
    }

    if (breakdown.communicationPatterns < 10) {
      recommendations.push({
        category: 'Communication',
        message: 'Add more network communication patterns',
        impact: 'Medium',
        points: 20 - breakdown.communicationPatterns
      });
    }

    if (breakdown.codeQuality < 10) {
      recommendations.push({
        category: 'Code Quality',
        message: 'Improve code structure with functions, classes, and comments',
        impact: 'Low',
        points: 15 - breakdown.codeQuality
      });
    }

    if (breakdown.penalties > 0) {
      recommendations.push({
        category: 'Security',
        message: 'Remove dangerous patterns and improve security practices',
        impact: 'Critical',
        points: breakdown.penalties
      });
    }

    return recommendations.sort((a, b) => {
      const impactOrder = { 'Critical': 4, 'High': 3, 'Medium': 2, 'Low': 1 };
      return impactOrder[b.impact] - impactOrder[a.impact];
    });
  }

  /**
   * Generate a simple report
   */
  generateReport(scanResults) {
    const report = [];
    report.push('='.repeat(60));
    report.push('CODE SCANNER REPORT');
    report.push('='.repeat(60));
    report.push(`Timestamp: ${scanResults.timestamp}`);
    report.push(`File: ${path.basename(scanResults.zipPath)}`);
    report.push(`Files Analyzed: ${scanResults.fileCount}`);
    report.push(`Total Size: ${(scanResults.totalSize / 1024).toFixed(2)} KB`);
    report.push(`Risk Level: ${scanResults.summary.riskLevel.toUpperCase()}`);
    report.push('');

    if (scanResults.securityFindings.length > 0) {
      report.push('SECURITY FINDINGS:');
      report.push('-'.repeat(40));
      scanResults.securityFindings.forEach((finding, index) => {
        report.push(`${index + 1}. [${finding.severity.toUpperCase()}] ${finding.file}`);
        report.push(`   Category: ${finding.category}`);
        report.push(`   Line: ${finding.line}`);
        report.push(`   Match: ${finding.match}`);
        report.push('');
      });
    }

    if (scanResults.summary.warnings.length > 0) {
      report.push('WARNINGS:');
      report.push('-'.repeat(40));
      scanResults.summary.warnings.forEach(warning => {
        report.push(`⚠️  ${warning}`);
      });
      report.push('');
    }

    if (scanResults.summary.errors.length > 0) {
      report.push('ERRORS:');
      report.push('-'.repeat(40));
      scanResults.summary.errors.forEach(error => {
        report.push(`❌ ${error}`);
      });
      report.push('');
    }

    return report.join('\n');
  }
}

module.exports = CodeScanner;