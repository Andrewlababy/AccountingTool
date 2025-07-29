# OCR Invoice Bookkeeping System (Hong Kong Edition)

This project is a React-based Invoice OCR Bookkeeping System specifically designed for Hong Kong businesses. It features automated invoice recognition with OCR capabilities and comprehensive financial reporting.

## Features

- **OCR Invoice Recognition**: Automatically extract information from invoices and receipts
  - **Qianwen OCR Integration**: Uses Alibaba's Qianwen VL OCR model for high-accuracy text extraction
  - **Mock OCR Fallback**: Works without API keys using simulated OCR for development/testing
- **Multi-language Support**: Designed for Hong Kong with Traditional Chinese interface
- **Comprehensive Accounting**: Double-entry bookkeeping with Hong Kong chart of accounts
- **Financial Reports**: Generate balance sheets, income statements, and cash flow statements
- **Export Capabilities**: Export data and reports to CSV format
- **Responsive Design**: Works on desktop and mobile devices

## Qianwen OCR Setup

To enable real OCR functionality with Qianwen VL OCR:

1. **Get API Key**: Obtain a Dashscope API key from [Alibaba Cloud](https://dashscope.aliyun.com/)

2. **Set Environment Variable**: Create a `.env` file in the project root:
   ```
   REACT_APP_DASHSCOPE_API_KEY=sk-your-api-key-here
   ```

3. **Security Note**: The API key will be included in the client-side bundle. For production use, consider implementing a backend proxy to protect the API key.

4. **Fallback**: If no API key is provided, the system will use mock OCR for demonstration purposes.

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

## System Architecture

- **Frontend**: React 19 with Tailwind CSS for styling
- **OCR Service**: QianwenOCR service for image text extraction
- **State Management**: React hooks for local state management
- **File Processing**: Client-side image processing and data extraction
- **Export**: Client-side CSV generation with proper encoding for Chinese characters

## Supported Invoice Types

The system is optimized for Hong Kong business documents:
- Restaurant receipts (茶餐廳收據)
- Shop invoices (商店發票)
- Service bills (服務單據)
- Transportation receipts (交通收據)
- Utility bills (水電費帳單)
- Office supplies receipts (辦公用品收據)

## Chart of Accounts

Pre-configured with Hong Kong standard accounts:
- **Assets**: Cash, Bank deposits, Accounts receivable, Fixed assets
- **Liabilities**: Accounts payable, Short/long-term loans, Tax payable
- **Equity**: Capital, Retained earnings, Current profit/loss
- **Income**: Operating income, Other income, Interest income
- **Expenses**: Office expenses, Rent, Salaries, Utilities, Transportation

## Learn More

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).
