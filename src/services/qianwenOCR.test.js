import QianwenOCR from '../services/qianwenOCR';

// Mock environment variable
const originalEnv = process.env;

beforeEach(() => {
  jest.resetModules();
  process.env = { ...originalEnv };
});

afterEach(() => {
  process.env = originalEnv;
});

describe('QianwenOCR', () => {
  test('should initialize without API key', () => {
    delete process.env.REACT_APP_DASHSCOPE_API_KEY;
    const ocr = new QianwenOCR();
    expect(ocr.isAvailable).toBe(false);
  });

  test('should initialize with API key', () => {
    process.env.REACT_APP_DASHSCOPE_API_KEY = 'test-api-key';
    const ocr = new QianwenOCR();
    expect(ocr.isAvailable).toBe(true);
  });

  test('should throw error when extracting data without API key', async () => {
    delete process.env.REACT_APP_DASHSCOPE_API_KEY;
    const ocr = new QianwenOCR();
    const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    await expect(ocr.extractInvoiceData(mockFile)).rejects.toThrow(
      'Qianwen OCR is not available. Please set REACT_APP_DASHSCOPE_API_KEY environment variable.'
    );
  });

  test('should parse amount correctly', () => {
    const ocr = new QianwenOCR();
    expect(ocr.parseAmount('HK$123.45')).toBe('123.45');
    expect(ocr.parseAmount('$100')).toBe('100.00');
    expect(ocr.parseAmount('invalid')).toBe('');
    expect(ocr.parseAmount('')).toBe('');
  });

  test('should parse date correctly', () => {
    const ocr = new QianwenOCR();
    expect(ocr.parseDate('2025-01-01')).toBe('2025-01-01');
    expect(ocr.parseDate('invalid-date')).toMatch(/\d{4}-\d{2}-\d{2}/);
    expect(ocr.parseDate('')).toMatch(/\d{4}-\d{2}-\d{2}/);
  });

  test('should determine category correctly', () => {
    const ocr = new QianwenOCR();
    
    expect(ocr.determineCategory({ description: '餐廳午餐' })).toBe('膳食費');
    expect(ocr.determineCategory({ description: '地鐵車票' })).toBe('交通費');
    expect(ocr.determineCategory({ description: '辦公文具' })).toBe('辦公用品');
    expect(ocr.determineCategory({ description: '商店租金' })).toBe('租金');
    expect(ocr.determineCategory({ description: '電費帳單' })).toBe('水電費');
    expect(ocr.determineCategory({ description: '其他費用' })).toBe('其他');
  });

  test('should determine debit account correctly', () => {
    const ocr = new QianwenOCR();
    
    expect(ocr.determineDebitAccount({ description: '餐廳午餐' })).toBe('膳食費');
    expect(ocr.determineDebitAccount({ description: '地鐵車票' })).toBe('交通費');
    expect(ocr.determineDebitAccount({ description: '辦公文具' })).toBe('辦公費用');
    expect(ocr.determineDebitAccount({ description: '商店租金' })).toBe('租金費用');
    expect(ocr.determineDebitAccount({ description: '電費帳單' })).toBe('水電費');
    expect(ocr.determineDebitAccount({ description: '其他費用' })).toBe('管理費用');
  });

  test('should determine tax invoice correctly', () => {
    const ocr = new QianwenOCR();
    
    expect(ocr.determineTaxInvoice({ tax_amount: '10.50' })).toBe(true);
    expect(ocr.determineTaxInvoice({ tax_amount: '0' })).toBe(false);
    expect(ocr.determineTaxInvoice({})).toBe(false);
  });

  test('should convert to accounting format correctly', () => {
    const ocr = new QianwenOCR();
    const mockData = {
      supplier: '香港茶餐廳',
      amount: 'HK$125.50',
      date: '2025-01-01',
      description: '午餐',
      tax_amount: '5.25'
    };

    const result = ocr.convertToAccountingFormat(mockData);
    
    expect(result.vendor).toBe('香港茶餐廳');
    expect(result.amount).toBe('125.50');
    expect(result.date).toBe('2025-01-01');
    expect(result.description).toBe('午餐');
    expect(result.category).toBe('膳食費');
    expect(result.debit).toBe('膳食費');
    expect(result.credit).toBe('現金');
    expect(result.gstAmount).toBe('5.25');
    expect(result.taxInvoice).toBe(true);
  });

  test('should parse text response correctly', () => {
    const ocr = new QianwenOCR();
    const mockText = 'Receipt from ABC Restaurant. Date: 2025-01-01. Amount: $50.00';
    
    const result = ocr.parseTextResponse(mockText);
    
    expect(result.amount).toBe('50.00');
    expect(result.date).toBe('2025-01-01');
    expect(result.description).toContain('Receipt from ABC Restaurant');
    expect(result.category).toBe('其他');
    expect(result.credit).toBe('現金');
  });
});