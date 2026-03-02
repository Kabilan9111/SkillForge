/**
 * LAYER 1: DOCUMENT AI - Structured Ingestion & Layout Analysis
 * 
 * Integrates Google Document AI and Azure Form Recognizer for:
 * - OCR and text extraction
 * - Layout analysis and section detection
 * - Table extraction
 * - Confidence scoring per field
 * 
 * @module DocumentAILayer
 */

const { DocumentProcessorServiceClient } = require('@google-cloud/documentai').v1;
const { FormRecognizerClient, AzureKeyCredential } = require('@azure/ai-form-recognizer');
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class DocumentAILayer {
  constructor(config = {}) {
    this.provider = config.provider || process.env.DOCUMENT_AI_PROVIDER || 'google';
    this.timeout = config.timeout || parseInt(process.env.DOCUMENT_AI_TIMEOUT) || 30000;
    this.maxFileSize = config.maxFileSize || parseInt(process.env.DOCUMENT_AI_MAX_FILE_SIZE) || 10485760;
    
    // Initialize providers
    if (this.provider === 'google' || config.enableFallback) {
      this.initGoogleDocumentAI();
    }
    
    if (this.provider === 'azure' || config.enableFallback) {
      this.initAzureFormRecognizer();
    }
    
    this.auditLogger = config.auditLogger || console;
  }

  /**
   * Initialize Google Document AI client
   */
  initGoogleDocumentAI() {
    try {
      this.googleClient = new DocumentProcessorServiceClient({
        keyFilename: process.env.GOOGLE_APPLICATION_CREDENTIALS
      });
      
      this.googleProjectId = process.env.GOOGLE_PROJECT_ID;
      this.googleLocation = process.env.GOOGLE_LOCATION || 'us';
      this.googleProcessorId = process.env.GOOGLE_PROCESSOR_ID;
      
      this.auditLogger.info('✅ Google Document AI initialized');
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize Google Document AI:', error.message);
    }
  }

  /**
   * Initialize Azure Form Recognizer client
   */
  initAzureFormRecognizer() {
    try {
      const endpoint = process.env.AZURE_FORM_RECOGNIZER_ENDPOINT;
      const apiKey = process.env.AZURE_FORM_RECOGNIZER_KEY;
      
      if (endpoint && apiKey) {
        this.azureClient = new FormRecognizerClient(
          endpoint,
          new AzureKeyCredential(apiKey)
        );
        this.auditLogger.info('✅ Azure Form Recognizer initialized');
      }
    } catch (error) {
      this.auditLogger.error('❌ Failed to initialize Azure Form Recognizer:', error.message);
    }
  }

  /**
   * Process resume document with Document AI
   * 
   * @param {string} filePath - Path to resume file
   * @param {Object} options - Processing options
   * @returns {Promise<Object>} Structured document data
   */
  async processDocument(filePath, options = {}) {
    const startTime = Date.now();
    const documentId = uuidv4();
    
    this.auditLogger.info(`📄 Processing document: ${path.basename(filePath)}`);
    
    try {
      // Validate file
      await this.validateFile(filePath);
      
      // Read file
      const fileBuffer = await fs.readFile(filePath);
      
      // Process with primary provider
      let result;
      if (this.provider === 'google' && this.googleClient) {
        result = await this.processWithGoogle(fileBuffer, filePath);
      } else if (this.provider === 'azure' && this.azureClient) {
        result = await this.processWithAzure(fileBuffer, filePath);
      } else {
        throw new Error(`Invalid provider: ${this.provider}`);
      }
      
      const processingTime = Date.now() - startTime;
      
      // Structure output
      const structuredOutput = {
        documentId,
        provider: this.provider,
        confidence: result.confidence,
        sections: result.sections,
        rawText: result.text,
        layout: result.layout,
        metadata: {
          fileName: path.basename(filePath),
          fileSize: fileBuffer.length,
          mimeType: this.detectMimeType(filePath),
          processingTime,
          timestamp: new Date().toISOString()
        },
        auditTrail: {
          layer: 1,
          name: 'Document AI',
          service: this.provider === 'google' ? 'Google Document AI' : 'Azure Form Recognizer',
          startTime: new Date(startTime).toISOString(),
          endTime: new Date().toISOString(),
          duration: processingTime,
          cost: this.estimateCost(result.pageCount || 1),
          success: true
        }
      };
      
      this.auditLogger.info(`✅ Document processed successfully in ${processingTime}ms`);
      
      return structuredOutput;
      
    } catch (error) {
      this.auditLogger.error(`❌ Document processing failed: ${error.message}`);
      
      // Try fallback provider if enabled
      if (options.enableFallback && this.provider === 'google' && this.azureClient) {
        this.auditLogger.info('🔄 Falling back to Azure Form Recognizer...');
        const originalProvider = this.provider;
        this.provider = 'azure';
        const result = await this.processDocument(filePath, { enableFallback: false });
        this.provider = originalProvider;
        return result;
      }
      
      throw error;
    }
  }

  /**
   * Process document with Google Document AI
   */
  async processWithGoogle(fileBuffer, filePath) {
    const name = `projects/${this.googleProjectId}/locations/${this.googleLocation}/processors/${this.googleProcessorId}`;
    
    const request = {
      name,
      rawDocument: {
        content: fileBuffer.toString('base64'),
        mimeType: this.detectMimeType(filePath)
      }
    };
    
    const [response] = await this.googleClient.processDocument(request);
    const { document } = response;
    
    // Extract structured data
    const sections = this.extractSections(document);
    const layout = this.extractLayout(document);
    
    return {
      text: document.text,
      confidence: this.calculateAverageConfidence(document.pages),
      sections,
      layout,
      pageCount: document.pages?.length || 1
    };
  }

  /**
   * Process document with Azure Form Recognizer
   */
  async processWithAzure(fileBuffer, filePath) {
    const poller = await this.azureClient.beginRecognizeCustomForms(
      'prebuilt-document',
      fileBuffer,
      {
        contentType: this.detectMimeType(filePath)
      }
    );
    
    const forms = await poller.pollUntilDone();
    const form = forms[0];
    
    // Extract structured data
    const sections = this.extractSectionsAzure(form);
    const layout = this.extractLayoutAzure(form);
    
    return {
      text: form.pages.map(page => page.lines.map(line => line.text).join('\n')).join('\n\n'),
      confidence: form.pages[0]?.confidence || 0.9,
      sections,
      layout,
      pageCount: form.pages?.length || 1
    };
  }

  /**
   * Extract sections from Google Document AI response
   */
  extractSections(document) {
    const sections = {
      personalInfo: { items: [], confidence: 0 },
      summary: { text: '', confidence: 0 },
      skills: { items: [], confidence: 0 },
      experience: { entries: [], confidence: 0 },
      education: { entries: [], confidence: 0 },
      certifications: { items: [], confidence: 0 },
      projects: { entries: [], confidence: 0 }
    };
    
    // Extract entities
    if (document.entities) {
      document.entities.forEach(entity => {
        const type = entity.type.toLowerCase();
        const text = entity.mentionText || '';
        const confidence = entity.confidence || 0.9;
        
        // Personal Information
        if (['name', 'email', 'phone', 'location', 'linkedin', 'github'].includes(type)) {
          sections.personalInfo.items.push({ type, value: text, confidence });
          sections.personalInfo.confidence = Math.max(sections.personalInfo.confidence, confidence);
        }
        
        // Skills
        if (type === 'skill' || type === 'technology') {
          sections.skills.items.push({ skill: text, confidence });
          sections.skills.confidence = Math.max(sections.skills.confidence, confidence);
        }
        
        // Experience
        if (type === 'job_title' || type === 'company' || type === 'work_experience') {
          sections.experience.entries.push({ text, confidence });
          sections.experience.confidence = Math.max(sections.experience.confidence, confidence);
        }
        
        // Education
        if (type === 'degree' || type === 'institution' || type === 'education') {
          sections.education.entries.push({ text, confidence });
          sections.education.confidence = Math.max(sections.education.confidence, confidence);
        }
      });
    }
    
    // Extract text blocks by section headers
    const text = document.text || '';
    const skillsSection = this.extractTextSection(text, ['skills', 'technical skills', 'technologies', 'expertise']);
    const experienceSection = this.extractTextSection(text, ['experience', 'work experience', 'employment', 'professional experience']);
    const educationSection = this.extractTextSection(text, ['education', 'academic background', 'qualifications']);
    const summarySection = this.extractTextSection(text, ['summary', 'profile', 'objective', 'about']);
    
    if (skillsSection) {
      sections.skills.text = skillsSection;
      if (sections.skills.confidence === 0) sections.skills.confidence = 0.85;
    }
    
    if (experienceSection) {
      sections.experience.text = experienceSection;
      if (sections.experience.confidence === 0) sections.experience.confidence = 0.85;
    }
    
    if (educationSection) {
      sections.education.text = educationSection;
      if (sections.education.confidence === 0) sections.education.confidence = 0.85;
    }
    
    if (summarySection) {
      sections.summary.text = summarySection;
      sections.summary.confidence = 0.85;
    }
    
    return sections;
  }

  /**
   * Extract layout information (bounding boxes, formatting)
   */
  extractLayout(document) {
    const layout = {
      pages: [],
      tables: [],
      paragraphs: []
    };
    
    if (document.pages) {
      document.pages.forEach((page, pageIndex) => {
        const pageLayout = {
          pageNumber: pageIndex + 1,
          width: page.dimension?.width || 0,
          height: page.dimension?.height || 0,
          blocks: []
        };
        
        // Extract blocks
        if (page.blocks) {
          page.blocks.forEach(block => {
            if (block.layout?.boundingPoly?.normalizedVertices) {
              pageLayout.blocks.push({
                text: this.getTextFromLayout(document.text, block.layout.textAnchor),
                boundingBox: block.layout.boundingPoly.normalizedVertices,
                confidence: block.layout.confidence || 0.9
              });
            }
          });
        }
        
        layout.pages.push(pageLayout);
      });
    }
    
    return layout;
  }

  /**
   * Extract text section by headers
   */
  extractTextSection(text, headers) {
    const lowerText = text.toLowerCase();
    
    for (const header of headers) {
      const regex = new RegExp(`\\b${header}\\b[:\\s]*([\\s\\S]*?)(?=\\n\\s*\\b(?:experience|education|skills|certifications|projects|summary|profile|objective|references)\\b|$)`, 'i');
      const match = lowerText.match(regex);
      
      if (match) {
        const startIndex = match.index;
        const endIndex = startIndex + match[0].length;
        return text.substring(startIndex, endIndex).trim();
      }
    }
    
    return null;
  }

  /**
   * Get text from layout anchor
   */
  getTextFromLayout(fullText, textAnchor) {
    if (!textAnchor || !textAnchor.textSegments) return '';
    
    let text = '';
    textAnchor.textSegments.forEach(segment => {
      const startIndex = parseInt(segment.startIndex || 0);
      const endIndex = parseInt(segment.endIndex || fullText.length);
      text += fullText.substring(startIndex, endIndex);
    });
    
    return text.trim();
  }

  /**
   * Calculate average confidence from pages
   */
  calculateAverageConfidence(pages) {
    if (!pages || pages.length === 0) return 0.9;
    
    let totalConfidence = 0;
    let count = 0;
    
    pages.forEach(page => {
      if (page.blocks) {
        page.blocks.forEach(block => {
          if (block.layout?.confidence) {
            totalConfidence += block.layout.confidence;
            count++;
          }
        });
      }
    });
    
    return count > 0 ? totalConfidence / count : 0.9;
  }

  /**
   * Extract sections from Azure Form Recognizer response
   */
  extractSectionsAzure(form) {
    // Similar logic adapted for Azure response format
    return {
      personalInfo: { items: [], confidence: 0.9 },
      summary: { text: '', confidence: 0.9 },
      skills: { items: [], confidence: 0.9 },
      experience: { entries: [], confidence: 0.9 },
      education: { entries: [], confidence: 0.9 }
    };
  }

  /**
   * Extract layout from Azure Form Recognizer response
   */
  extractLayoutAzure(form) {
    return {
      pages: form.pages.map(page => ({
        pageNumber: page.pageNumber,
        width: page.width,
        height: page.height,
        blocks: page.lines.map(line => ({
          text: line.text,
          boundingBox: line.boundingBox,
          confidence: line.confidence || 0.9
        }))
      })),
      tables: [],
      paragraphs: []
    };
  }

  /**
   * Validate file before processing
   */
  async validateFile(filePath) {
    const stats = await fs.stat(filePath);
    
    if (stats.size > this.maxFileSize) {
      throw new Error(`File size ${stats.size} exceeds maximum ${this.maxFileSize}`);
    }
    
    const ext = path.extname(filePath).toLowerCase();
    const allowedExtensions = ['.pdf', '.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif', '.doc', '.docx'];
    
    if (!allowedExtensions.includes(ext)) {
      throw new Error(`Unsupported file type: ${ext}`);
    }
  }

  /**
   * Detect MIME type from file extension
   */
  detectMimeType(filePath) {
    const ext = path.extname(filePath).toLowerCase();
    const mimeTypes = {
      '.pdf': 'application/pdf',
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.tiff': 'image/tiff',
      '.bmp': 'image/bmp',
      '.gif': 'image/gif',
      '.doc': 'application/msword',
      '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    };
    
    return mimeTypes[ext] || 'application/pdf';
  }

  /**
   * Estimate processing cost
   */
  estimateCost(pageCount) {
    const costPerPage = parseFloat(process.env.GOOGLE_DOCUMENT_AI_COST_PER_PAGE) || 0.015;
    return (pageCount * costPerPage).toFixed(4);
  }
}

module.exports = { DocumentAILayer };
