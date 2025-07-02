import React, { useState, useRef } from 'react';
import { Upload, Camera, FileText, DollarSign, Calendar, Tag, Save, Download, Trash2, Edit3, BarChart3, TrendingUp, PieChart, Calculator } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState('bookkeeping');
  const [reportPeriod, setReportPeriod] = useState({
    startDate: new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const fileInputRef = useRef(null);

  // 香港常見支出類別
  const categories = [
    '辦公用品', '膳食費', '交通費', '通訊費', '租金', 
    '水電費', '市場推廣', '設備採購', '維修費', '專業服務費',
    '保險費', '銀行費用', '娛樂費', '差旅費', '培訓費', '其他'
  ];

  // 香港常用會計科目 - 按類別分組
  const accountCategories = {
    assets: ['現金', '銀行存款', '應收帳款', '預付費用', '存貨', '固定資產', '累積折舊'],
    liabilities: ['應付帳款', '應付費用', '短期借款', '長期借款', '應付稅款'],
    equity: ['資本', '保留盈餘', '本期損益'],
    income: ['主營業務收入', '其他收入', '銀行利息收入', '租金收入'],
    expenses: ['辦公費用', '管理費用', '銷售費用', '租金費用', '薪金費用', '水電費', '交通費', '膳食費', '通訊費', '維修費', '專業服務費', '保險費', '銀行費用', '折舊費用']
  };

  const accounts = [
    ...accountCategories.assets,
    ...accountCategories.liabilities,
    ...accountCategories.equity,
    ...accountCategories.income,
    ...accountCategories.expenses
  ];

  // 模擬OCR識別功能
  const simulateOCR = (text) => {
    const mockData = {
      vendor: '香港茶餐廳有限公司',
      amount: '248.50',
      date: '2025-07-01',
      description: '工作午餐',
      category: '膳食費',
      debit: '膳食費',
      credit: '現金',
      gstAmount: '0.00',
      taxInvoice: false
    };
    return mockData;
  };

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setIsProcessing(true);
    
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

  // 過濾指定期間的記錄
  const getFilteredEntries = () => {
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      const startDate = new Date(reportPeriod.startDate);
      const endDate = new Date(reportPeriod.endDate);
      return entryDate >= startDate && entryDate <= endDate;
    });
  };

  // 計算科目餘額
  const calculateAccountBalances = () => {
    const balances = {};
    const filteredEntries = getFilteredEntries();
    
    // 初始化所有科目餘額為0
    accounts.forEach(account => {
      balances[account] = 0;
    });

    // 計算每個科目的餘額
    filteredEntries.forEach(entry => {
      if (entry.debit) {
        balances[entry.debit] = (balances[entry.debit] || 0) + entry.amount;
      }
      if (entry.credit) {
        balances[entry.credit] = (balances[entry.credit] || 0) - entry.amount;
      }
    });

    return balances;
  };

  // 生成資產負債表
  const generateBalanceSheet = () => {
    const balances = calculateAccountBalances();
    
    const assets = accountCategories.assets.map(account => ({
      account,
      balance: balances[account] || 0
    })).filter(item => item.balance !== 0);

    const liabilities = accountCategories.liabilities.map(account => ({
      account,
      balance: Math.abs(balances[account] || 0)
    })).filter(item => item.balance !== 0);

    const equity = accountCategories.equity.map(account => ({
      account,
      balance: Math.abs(balances[account] || 0)
    })).filter(item => item.balance !== 0);

    const totalAssets = assets.reduce((sum, item) => sum + item.balance, 0);
    const totalLiabilities = liabilities.reduce((sum, item) => sum + item.balance, 0);
    const totalEquity = equity.reduce((sum, item) => sum + item.balance, 0);

    return { assets, liabilities, equity, totalAssets, totalLiabilities, totalEquity };
  };

  // 生成損益表
  const generateIncomeStatement = () => {
    const balances = calculateAccountBalances();
    
    const income = accountCategories.income.map(account => ({
      account,
      balance: Math.abs(balances[account] || 0)
    })).filter(item => item.balance !== 0);

    const expenses = accountCategories.expenses.map(account => ({
      account,
      balance: balances[account] || 0
    })).filter(item => item.balance !== 0);

    const totalIncome = income.reduce((sum, item) => sum + item.balance, 0);
    const totalExpenses = expenses.reduce((sum, item) => sum + item.balance, 0);
    const netIncome = totalIncome - totalExpenses;

    return { income, expenses, totalIncome, totalExpenses, netIncome };
  };

  // 生成現金流量表
  const generateCashFlowStatement = () => {
    const filteredEntries = getFilteredEntries();
    
    const cashFlows = {
      operating: [],
      investing: [],
      financing: []
    };

    filteredEntries.forEach(entry => {
      let flowType = 'operating'; // 默認為營業活動
      
      // 簡單分類邏輯
      if (entry.category === '設備採購' || entry.debit === '固定資產') {
        flowType = 'investing';
      } else if (entry.category === '銀行費用' || entry.debit === '短期借款' || entry.debit === '長期借款') {
        flowType = 'financing';
      }

      const cashChange = entry.credit === '現金' || entry.credit === '銀行存款' ? 
        -entry.amount : 
        (entry.debit === '現金' || entry.debit === '銀行存款' ? entry.amount : 0);

      if (cashChange !== 0) {
        cashFlows[flowType].push({
          description: entry.description,
          amount: cashChange,
          date: entry.date
        });
      }
    });

    const operatingTotal = cashFlows.operating.reduce((sum, item) => sum + item.amount, 0);
    const investingTotal = cashFlows.investing.reduce((sum, item) => sum + item.amount, 0);
    const financingTotal = cashFlows.financing.reduce((sum, item) => sum + item.amount, 0);
    const netCashFlow = operatingTotal + investingTotal + financingTotal;

    return { cashFlows, operatingTotal, investingTotal, financingTotal, netCashFlow };
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

    const bom = '\uFEFF';
    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `帳目明細_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const exportReportToCSV = (reportType) => {
    let csvContent = '';
    const bom = '\uFEFF';
    
    if (reportType === 'balance') {
      const balanceSheet = generateBalanceSheet();
      csvContent = [
        '資產負債表',
        `報告期間: ${reportPeriod.startDate} 至 ${reportPeriod.endDate}`,
        '',
        '資產',
        '科目,金額(HK$)',
        ...balanceSheet.assets.map(item => `${item.account},${item.balance.toFixed(2)}`),
        `資產總計,${balanceSheet.totalAssets.toFixed(2)}`,
        '',
        '負債',
        '科目,金額(HK$)',
        ...balanceSheet.liabilities.map(item => `${item.account},${item.balance.toFixed(2)}`),
        `負債總計,${balanceSheet.totalLiabilities.toFixed(2)}`,
        '',
        '權益',
        '科目,金額(HK$)',
        ...balanceSheet.equity.map(item => `${item.account},${item.balance.toFixed(2)}`),
        `權益總計,${balanceSheet.totalEquity.toFixed(2)}`
      ].join('\n');
    } else if (reportType === 'income') {
      const incomeStatement = generateIncomeStatement();
      csvContent = [
        '損益表',
        `報告期間: ${reportPeriod.startDate} 至 ${reportPeriod.endDate}`,
        '',
        '收入',
        '科目,金額(HK$)',
        ...incomeStatement.income.map(item => `${item.account},${item.balance.toFixed(2)}`),
        `收入總計,${incomeStatement.totalIncome.toFixed(2)}`,
        '',
        '支出',
        '科目,金額(HK$)',
        ...incomeStatement.expenses.map(item => `${item.account},${item.balance.toFixed(2)}`),
        `支出總計,${incomeStatement.totalExpenses.toFixed(2)}`,
        '',
        `淨收益,${incomeStatement.netIncome.toFixed(2)}`
      ].join('\n');
    }

    const blob = new Blob([bom + csvContent], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${reportType === 'balance' ? '資產負債表' : '損益表'}_${reportPeriod.startDate}_${reportPeriod.endDate}.csv`;
    a.click();
  };

  const balanceSheet = generateBalanceSheet();
  const incomeStatement = generateIncomeStatement();
  const cashFlowStatement = generateCashFlowStatement();

  return (
    <div className="max-w-7xl mx-auto p-6 bg-gradient-to-br from-red-50 to-orange-100 min-h-screen">
      <div className="bg-white rounded-xl shadow-xl p-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-8 flex items-center gap-3">
          <FileText className="text-red-600" />
          OCR發票識別記帳系統
          <span className="text-lg bg-red-100 text-red-700 px-3 py-1 rounded-full">香港版</span>
        </h1>

        {/* 標籤導航 */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('bookkeeping')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'bookkeeping'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <Edit3 size={16} />
                  記帳管理
                </div>
              </button>
              <button
                onClick={() => setActiveTab('reports')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'reports'
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-2">
                  <BarChart3 size={16} />
                  財務報表
                </div>
              </button>
            </nav>
          </div>
        </div>

        {activeTab === 'bookkeeping' && (
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
        )}

        {activeTab === 'reports' && (
          <div className="space-y-8">
            {/* 報表期間選擇 */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="text-purple-600" />
                報表期間
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">開始日期</label>
                  <input
                    type="date"
                    value={reportPeriod.startDate}
                    onChange={(e) => setReportPeriod(prev => ({...prev, startDate: e.target.value}))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">結束日期</label>
                  <input
                    type="date"
                    value={reportPeriod.endDate}
                    onChange={(e) => setReportPeriod(prev => ({...prev, endDate: e.target.value}))}
                    className="w-full p-2 border border-gray-300 rounded-lg"
                  />
                </div>
                <div className="flex items-end">
                  <div className="text-sm text-gray-600">
                    共 {getFilteredEntries().length} 筆記錄
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* 資產負債表 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <PieChart className="text-blue-600" />
                    資產負債表
                  </h3>
                  <button
                    onClick={() => exportReportToCSV('balance')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    匯出
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* 資產 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 bg-blue-50 px-3 py-2 rounded">資產</h4>
                    <div className="space-y-1">
                      {balanceSheet.assets.map(item => (
                        <div key={item.account} className="flex justify-between text-sm">
                          <span>{item.account}</span>
                          <span className="font-mono">HK${item.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-semibold text-blue-700">
                        <span>資產總計</span>
                        <span className="font-mono">HK${balanceSheet.totalAssets.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 負債 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 bg-red-50 px-3 py-2 rounded">負債</h4>
                    <div className="space-y-1">
                      {balanceSheet.liabilities.map(item => (
                        <div key={item.account} className="flex justify-between text-sm">
                          <span>{item.account}</span>
                          <span className="font-mono">HK${item.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-semibold text-red-700">
                        <span>負債總計</span>
                        <span className="font-mono">HK${balanceSheet.totalLiabilities.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 權益 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 bg-green-50 px-3 py-2 rounded">權益</h4>
                    <div className="space-y-1">
                      {balanceSheet.equity.map(item => (
                        <div key={item.account} className="flex justify-between text-sm">
                          <span>{item.account}</span>
                          <span className="font-mono">HK${item.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-semibold text-green-700">
                        <span>權益總計</span>
                        <span className="font-mono">HK${balanceSheet.totalEquity.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 平衡檢查 */}
                  <div className="bg-gray-100 p-3 rounded">
                    <div className="flex justify-between font-semibold">
                      <span>負債 + 權益</span>
                      <span className="font-mono">HK${(balanceSheet.totalLiabilities + balanceSheet.totalEquity).toFixed(2)}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {Math.abs(balanceSheet.totalAssets - (balanceSheet.totalLiabilities + balanceSheet.totalEquity)) < 0.01 
                        ? '✓ 帳目平衡' 
                        : '⚠ 帳目不平衡，請檢查記錄'}
                    </div>
                  </div>
                </div>
              </div>

              {/* 損益表 */}
              <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="text-green-600" />
                    損益表
                  </h3>
                  <button
                    onClick={() => exportReportToCSV('income')}
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg flex items-center gap-2 text-sm"
                  >
                    <Download size={14} />
                    匯出
                  </button>
                </div>
                
                <div className="space-y-4">
                  {/* 收入 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 bg-green-50 px-3 py-2 rounded">收入</h4>
                    <div className="space-y-1">
                      {incomeStatement.income.map(item => (
                        <div key={item.account} className="flex justify-between text-sm">
                          <span>{item.account}</span>
                          <span className="font-mono">HK${item.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-semibold text-green-700">
                        <span>收入總計</span>
                        <span className="font-mono">HK${incomeStatement.totalIncome.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 支出 */}
                  <div>
                    <h4 className="font-medium text-gray-800 mb-2 bg-red-50 px-3 py-2 rounded">支出</h4>
                    <div className="space-y-1 max-h-48 overflow-y-auto">
                      {incomeStatement.expenses.map(item => (
                        <div key={item.account} className="flex justify-between text-sm">
                          <span>{item.account}</span>
                          <span className="font-mono">HK${item.balance.toFixed(2)}</span>
                        </div>
                      ))}
                      <div className="border-t pt-1 flex justify-between font-semibold text-red-700">
                        <span>支出總計</span>
                        <span className="font-mono">HK${incomeStatement.totalExpenses.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* 淨收益 */}
                  <div className={`p-4 rounded-lg ${incomeStatement.netIncome >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                    <div className="flex justify-between font-bold text-lg">
                      <span>淨收益</span>
                      <span className={`font-mono ${incomeStatement.netIncome >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                        HK${incomeStatement.netIncome.toFixed(2)}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mt-1">
                      {incomeStatement.netIncome >= 0 ? '盈利' : '虧損'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* 現金流量表 */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold flex items-center gap-2">
                  <Calculator className="text-purple-600" />
                  現金流量表
                </h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 營業活動現金流 */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 bg-blue-50 px-3 py-2 rounded">營業活動</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cashFlowStatement.cashFlows.operating.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="truncate mr-2">{item.description}</span>
                        <span className={`font-mono ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount >= 0 ? '+' : ''}HK${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-semibold text-blue-700">
                      <span>小計</span>
                      <span className="font-mono">HK${cashFlowStatement.operatingTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 投資活動現金流 */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 bg-yellow-50 px-3 py-2 rounded">投資活動</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cashFlowStatement.cashFlows.investing.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="truncate mr-2">{item.description}</span>
                        <span className={`font-mono ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount >= 0 ? '+' : ''}HK${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-semibold text-yellow-700">
                      <span>小計</span>
                      <span className="font-mono">HK${cashFlowStatement.investingTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 融資活動現金流 */}
                <div>
                  <h4 className="font-medium text-gray-800 mb-2 bg-purple-50 px-3 py-2 rounded">融資活動</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {cashFlowStatement.cashFlows.financing.map((item, index) => (
                      <div key={index} className="flex justify-between text-xs">
                        <span className="truncate mr-2">{item.description}</span>
                        <span className={`font-mono ${item.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {item.amount >= 0 ? '+' : ''}HK${item.amount.toFixed(2)}
                        </span>
                      </div>
                    ))}
                    <div className="border-t pt-1 flex justify-between font-semibold text-purple-700">
                      <span>小計</span>
                      <span className="font-mono">HK${cashFlowStatement.financingTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* 現金流量淨額 */}
              <div className={`mt-6 p-4 rounded-lg ${cashFlowStatement.netCashFlow >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
                <div className="flex justify-between font-bold text-lg">
                  <span>現金流量淨額</span>
                  <span className={`font-mono ${cashFlowStatement.netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>
                    HK${cashFlowStatement.netCashFlow.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>

            {/* 財務指標摘要 */}
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="text-indigo-600" />
                財務指標摘要
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    HK${balanceSheet.totalAssets.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">總資產</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${incomeStatement.netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    HK${incomeStatement.netIncome.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">淨收益</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className={`text-2xl font-bold ${cashFlowStatement.netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    HK${cashFlowStatement.netCashFlow.toFixed(0)}
                  </div>
                  <div className="text-sm text-gray-600">現金流淨額</div>
                </div>
                <div className="bg-white p-4 rounded-lg text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {getFilteredEntries().length}
                  </div>
                  <div className="text-sm text-gray-600">交易筆數</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InvoiceOCRBookkeeping;