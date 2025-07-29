/**
 * QianwenOCR service for extracting invoice/receipt information using Qianwen VL OCR model
 * Requires DASHSCOPE_API_KEY environment variable to be set
 * 
 * Note: This is a web-compatible implementation that calls the Dashscope API directly
 * In production, consider using a backend proxy to protect API keys
 */
class QianwenOCR {
  constructor() {
    this.apiKey = process.env.REACT_APP_DASHSCOPE_API_KEY;
    this.isAvailable = !!this.apiKey;
    this.apiUrl = 'https://dashscope.aliyuncs.com/api/v1/services/aigc/multimodal-generation/generation';
  }

  /**
   * Extract invoice data from image file
   * @param {File} imageFile - The image file to process
   * @returns {Promise<Object>} - Extracted invoice data
   */
  async extractInvoiceData(imageFile) {
    if (!this.isAvailable) {
      throw new Error('Qianwen OCR is not available. Please set REACT_APP_DASHSCOPE_API_KEY environment variable.');
    }

    try {
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      // Prepare the message for OCR
      const messages = [
        {
          role: "user",
          content: [
            {
              image: base64Image,
              min_pixels: 28 * 28 * 4,
              max_pixels: 28 * 28 * 8192,
              enable_rotate: true,
            },
            {
              // Custom prompt for general invoice/receipt OCR adapted for Hong Kong accounting
              text: "請提取發票或收據圖像中的關鍵信息，包括但不限於：供應商名稱、金額、日期、項目描述、發票號碼、稅額等。要求準確無誤的提取上述關鍵信息、不要遺漏和捏造虛假信息，模糊或者強光遮挡的單個文字可以用英文問號?代替。返回數據格式以json方式輸出，格式為：{'supplier': 'xxx', 'amount': 'xxx', 'date': 'xxx', 'description': 'xxx', 'invoice_number': 'xxx', 'tax_amount': 'xxx', 'other_info': 'xxx'}"
            },
          ],
        }
      ];

      const requestBody = {
        model: "qwen-vl-ocr-latest",
        input: {
          messages: messages
        }
      };

      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
          'X-DashScope-Async': 'enable'
        },
        body: JSON.stringify(requestBody)
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status} ${response.statusText}`);
      }

      const responseData = await response.json();

      if (responseData && responseData.output && responseData.output.choices && responseData.output.choices[0]) {
        const content = responseData.output.choices[0].message.content[0].text;
        
        // Try to parse the JSON response
        try {
          const extractedData = JSON.parse(content);
          
          // Convert to the format expected by the accounting system
          return this.convertToAccountingFormat(extractedData);
        } catch (parseError) {
          console.warn('Failed to parse JSON response, falling back to text parsing:', parseError);
          
          // Fallback: try to extract data from plain text response
          return this.parseTextResponse(content);
        }
      } else {
        throw new Error('Invalid response from Qianwen OCR API');
      }
    } catch (error) {
      console.error('Error calling Qianwen OCR API:', error);
      throw new Error(`OCR processing failed: ${error.message}`);
    }
  }

  /**
   * Convert file to base64
   * @param {File} file - The file to convert
   * @returns {Promise<string>} - Base64 encoded string
   */
  fileToBase64(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  }

  /**
   * Convert extracted data to the format expected by the accounting system
   * @param {Object} data - Raw extracted data
   * @returns {Object} - Formatted data for accounting system
   */
  convertToAccountingFormat(data) {
    const formattedData = {
      vendor: data.supplier || data.商户 || data.供應商 || '',
      amount: this.parseAmount(data.amount || data.金额 || data.金額 || ''),
      date: this.parseDate(data.date || data.日期 || ''),
      description: data.description || data.描述 || data.项目 || data.項目 || '',
      category: this.determineCategory(data),
      debit: this.determineDebitAccount(data),
      credit: '現金', // Default to cash payment
      gstAmount: this.parseAmount(data.tax_amount || data.税额 || data.稅額 || '0'),
      taxInvoice: this.determineTaxInvoice(data)
    };

    return formattedData;
  }

  /**
   * Parse text response when JSON parsing fails
   * @param {string} text - Raw text response
   * @returns {Object} - Extracted data
   */
  parseTextResponse(text) {
    const data = {
      vendor: '',
      amount: '',
      date: '',
      description: text.substring(0, 100), // Use first part as description
      category: '其他',
      debit: '其他',
      credit: '現金',
      gstAmount: '0',
      taxInvoice: false
    };

    // Try to extract common patterns from text
    const amountMatch = text.match(/[$￥¥](\d+\.?\d*)/);
    if (amountMatch) {
      data.amount = amountMatch[1];
    }

    const dateMatch = text.match(/(\d{4}-\d{2}-\d{2}|\d{2}\/\d{2}\/\d{4}|\d{4}\/\d{2}\/\d{2})/);
    if (dateMatch) {
      data.date = this.parseDate(dateMatch[1]);
    }

    return data;
  }

  /**
   * Parse amount string to number
   * @param {string} amountStr - Amount string
   * @returns {string} - Parsed amount
   */
  parseAmount(amountStr) {
    if (!amountStr) return '';
    
    // Remove currency symbols and extract number
    const cleaned = amountStr.replace(/[^\d.-]/g, '');
    const amount = parseFloat(cleaned);
    
    return isNaN(amount) ? '' : amount.toFixed(2);
  }

  /**
   * Parse date string to YYYY-MM-DD format
   * @param {string} dateStr - Date string
   * @returns {string} - Formatted date
   */
  parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split('T')[0];

    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return new Date().toISOString().split('T')[0];
      }
      return date.toISOString().split('T')[0];
    } catch {
      return new Date().toISOString().split('T')[0];
    }
  }

  /**
   * Determine expense category based on extracted data
   * @param {Object} data - Extracted data
   * @returns {string} - Category
   */
  determineCategory(data) {
    const description = (data.description || data.描述 || '').toLowerCase();
    const supplier = (data.supplier || data.商户 || data.供應商 || '').toLowerCase();
    
    if (description.includes('餐') || description.includes('食') || supplier.includes('餐廳') || supplier.includes('茶餐廳')) {
      return '膳食費';
    }
    if (description.includes('交通') || description.includes('巴士') || description.includes('地鐵') || description.includes('的士')) {
      return '交通費';
    }
    if (description.includes('辦公') || description.includes('文具') || description.includes('紙張')) {
      return '辦公用品';
    }
    if (description.includes('租金') || description.includes('租賃')) {
      return '租金';
    }
    if (description.includes('水電') || description.includes('電費') || description.includes('水費')) {
      return '水電費';
    }
    
    return '其他';
  }

  /**
   * Determine debit account based on category
   * @param {Object} data - Extracted data
   * @returns {string} - Debit account
   */
  determineDebitAccount(data) {
    const category = this.determineCategory(data);
    
    switch (category) {
      case '膳食費':
        return '膳食費';
      case '交通費':
        return '交通費';
      case '辦公用品':
        return '辦公費用';
      case '租金':
        return '租金費用';
      case '水電費':
        return '水電費';
      default:
        return '管理費用';
    }
  }

  /**
   * Determine if this is a tax invoice
   * @param {Object} data - Extracted data
   * @returns {boolean} - Whether it's a tax invoice
   */
  determineTaxInvoice(data) {
    const taxAmount = parseFloat(data.tax_amount || data.税额 || data.稅額 || '0');
    return taxAmount > 0;
  }
}

export default QianwenOCR;