import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, DollarSign, Calendar, Tag, Save, Download, Trash2, Edit3 } from 'lucide-react';

const InvoiceOCRBookkeeping = () => {
  const [entries, setEntries] = useState([]);
  const [currentEntry, setCurrentEntry] = useState({
    date: new Date().toISOString().split('T')[0],
    description: '',
    amount: '',
    category: '',
    vendor: '',
    debit: '',
    credit: '',
    gstAmount: '',
    taxInvoice: false
  });
  const [ocrText, setOcrText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef(null);

  // 香港常見支出類別
  const categories = [
    '辦公用品', '膳食費', '交通費', '通訊費', '租金', 
    '水電費', '市場推廣', '設備採購', '維修費', '專業服務費',
    '保險費', '銀行費用', '娛樂費', '差旅費', '培訓費', '其他'
  ];

  // 香港常用會計科目
  const accounts = [
    '現金', '銀行存款', '應收帳款', '應付帳款', '預付費用',
    '辦公費用', '管理費用', '銷售費用', '租金費用', '薪金費用',
    '主營業務收入', '其他收入', '銀行利息收入', '固定資產', '累積折舊'
  ];

  // 模擬OCR識別功能（香港發票格式）
  const simulateOCR = (text) => {
    const mockData = {
      vendor: '香港茶餐廳有限公司',
      amount: '248.50',
      date: '2025-07-01',
      description: '工作午餐',
      category: '膳食費',
      gstAmount: '0.00', // 香港沒有GST，但保留欄位備用
      taxInvoice: false
    };
    return mockData;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
    // 模擬OCR處理時間
    setTimeout(() => {
      const extractedData = simulateOCR();
      setOcrText(`識別結果：
商戶：${extractedData.vendor}
金額：HK$${extractedData.amount}
日期：${extractedData.date}
描述：${extractedData.description}
類別：${extractedData.category}`);
      
      setCurrentEntry(prev => ({
        ...prev,
        ...extractedData
      }));
      setIsProcessing(false);
    }, 2000);
  };

  const handleAddEntry = () => {
    if (!currentEntry.amount || !currentEntry.description) {
      alert('請填寫金額和描述');
      return;
    }

    const newEntry = {
      ...currentEntry,
      id: Date.now(),
      amount: parseFloat(currentEntry.amount),
      gstAmount: parseFloat(currentEntry.gstAmount || 0)
    };

    setEntries(prev => [...prev, newEntry]);
    setCurrentEntry({
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: '',
      category: '',
      vendor: '',
      debit: '',
      credit: '',
      gstAmount: '',
      taxInvoice: false
    });
    setOcrText('');
  };

  const handleDeleteEntry = (id) => {
    setEntries(prev => prev.filter(entry => entry.id !== id));
  };

  const calculateTotal = () => {
    return entries.reduce((sum, entry) => sum + entry.amount, 0).toFixed(2);
  };

  const calculateGSTTotal = () => {
    return entries.reduce((sum, entry) => sum + (entry.gstAmount || 0), 0).toFixed(2);
  };

  const exportToCSV = () => {
    const headers = ['日期', '描述', '供應商', '類別', '金額(HK$)', '借方科目', '貸方科目', 'GST金額', '稅務發票'];
    const csvContent = [
      headers.join(','),
      ...entries.map(entry => [
        entry.date,
        `"${entry.description}"`,
        `"${entry.vendor}"`,
        entry.category,
        entry.amount,
        entry.debit,
        entry.credit,
        entry.gstAmount || 0,
        entry.taxInvoice ? '是' : '否'
      ].join(','))
    ].join('\n');

    // 加入BOM以支援中文顯示
    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `帳目明細_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportToHKTaxReport = () => {
    // 生成適合香港稅務申報的報表
    const taxReport = entries.filter(entry => entry.taxInvoice).map(entry => ({
      date: entry.date,
      vendor: entry.vendor,
      description: entry.description,
      amount: entry.amount,
      category: entry.category
    }));

    const csvContent = [
      ['日期', '供應商', '描述', '金額(HK$)', '類別'].join(','),
      ...taxReport.map(entry => [
        entry.date,
        `"${entry.vendor}"`,
        `"${entry.description}"`,
        entry.amount,
        entry.category
      ].join(','))
    ].join('\n');

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `稅務申報_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="max-w-6xl mx-auto p-6 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FileText className="text-red-600" />
          OCR發票識別記帳系統
          <span className="text-lg bg-red-100 text-red-700 px-3 py-1 rounded-full">香港版</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* 左側：OCR識別區域 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Camera className="text-green-600" />
                發票識別
              </h2>
              
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleImageUpload}
                  accept="image/*"
                  className="hidden"
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isProcessing}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg flex items-center gap-2 mx-auto disabled:opacity-50"
                >
                  <Upload size={20} />
                  {isProcessing ? '識別中...' : '上傳發票圖片'}
                </button>
                <p className="text-sm text-gray-500 mt-2">
                  支援餐廳收據、商店發票、服務單據等
                </p>
              </div>

              {ocrText && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h3 className="font-semibold text-green-800 mb-2">OCR識別結果：</h3>
                  <pre className="text-sm text-green-700 whitespace-pre-wrap">{ocrText}</pre>
                </div>
              )}
            </div>

            {/* 帳目錄入表單 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Edit3 className="text-purple-600" />
                帳目錄入
              </h2>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">日期</label>
                    <input
                      type="date"
                      value={currentEntry.date}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, date: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">金額 (HK$)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentEntry.amount}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, amount: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">描述</label>
                  <input
                    type="text"
                    value={currentEntry.description}
                    onChange={(e) => setCurrentEntry(prev => ({...prev, description: e.target.value}))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                    placeholder="費用描述"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">供應商</label>
                    <input
                      type="text"
                      value={currentEntry.vendor}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, vendor: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="供應商名稱"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">類別</label>
                    <select
                      value={currentEntry.category}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, category: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">選擇類別</option>
                      {categories.map(cat => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">借方科目</label>
                    <select
                      value={currentEntry.debit}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, debit: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">選擇借方科目</option>
                      {accounts.map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">貸方科目</label>
                    <select
                      value={currentEntry.credit}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, credit: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                    >
                      <option value="">選擇貸方科目</option>
                      {accounts.map(account => (
                        <option key={account} value={account}>{account}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">GST金額 (如適用)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={currentEntry.gstAmount}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, gstAmount: e.target.value}))}
                      className="w-full p-2 border border-gray-300 rounded-lg"
                      placeholder="0.00"
                    />
                  </div>
                  <div className="flex items-center mt-6">
                    <input
                      type="checkbox"
                      id="taxInvoice"
                      checked={currentEntry.taxInvoice}
                      onChange={(e) => setCurrentEntry(prev => ({...prev, taxInvoice: e.target.checked}))}
                      className="mr-2"
                    />
                    <label htmlFor="taxInvoice" className="text-sm font-medium">
                      稅務發票
                    </label>
                  </div>
                </div>

                <button
                  onClick={handleAddEntry}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg flex items-center justify-center gap-2"
                >
                  <Save size={16} />
                  新增帳目
                </button>
              </div>
            </div>
          </div>

          {/* 右側：帳目列表 */}
          <div className="space-y-6">
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <DollarSign className="text-blue-600" />
                  帳目明細
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={exportToHKTaxReport}
                    className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    稅務報表
                  </button>
                  <button
                    onClick={exportToCSV}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    匯出CSV
                  </button>
                </div>
              </div>

              <div className="mb-4 p-4 bg-blue-50 rounded-lg">
                <div className="text-lg font-semibold text-blue-800">
                  總計：HK${calculateTotal()}
                </div>
                <div className="text-sm text-blue-600">
                  共 {entries.length} 筆記錄
                  {parseFloat(calculateGSTTotal()) > 0 && (
                    <span className="ml-4">GST總額：HK${calculateGSTTotal()}</span>
                  )}
                </div>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-2">
                {entries.length === 0 ? (
                  <div className="text-center text-gray-500 py-8">
                    暫無記錄
                  </div>
                ) : (
                  entries.map(entry => (
                    <div key={entry.id} className="bg-white p-4 rounded-lg border border-gray-200">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar size={14} className="text-gray-500" />
                            <span className="text-sm text-gray-600">{entry.date}</span>
                            <Tag size={14} className="text-gray-500" />
                            <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {entry.category}
                            </span>
                            {entry.taxInvoice && (
                              <span className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded">
                                稅務發票
                              </span>
                            )}
                          </div>
                          <div className="font-medium text-gray-800 mb-1">
                            {entry.description}
                          </div>
                          {entry.vendor && (
                            <div className="text-sm text-gray-600 mb-1">
                              供應商: {entry.vendor}
                            </div>
                          )}
                          {(entry.debit || entry.credit) && (
                            <div className="text-xs text-gray-500 mb-1">
                              借: {entry.debit} → 貸: {entry.credit}
                            </div>
                          )}
                          {entry.gstAmount > 0 && (
                            <div className="text-xs text-orange-600">
                              GST: HK${entry.gstAmount.toFixed(2)}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="text-right">
                            <span className="text-lg font-semibold text-green-600">
                              HK${entry.amount.toFixed(2)}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteEntry(entry.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InvoiceOCRBookkeeping;