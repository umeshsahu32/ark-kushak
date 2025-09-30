// Google Apps Script code for Ark Kushak form submissions
// Copy this code into your Google Apps Script project

function doGet(e) {
  try {
    // Get the active spreadsheet
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Always add headers if sheet is empty
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 11).setValues([[
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Facing Direction',
        'Form Name',
        'UTM Campaign',
        'UTM Source',
        'UTM Medium',
        'UTM Keywords',
        'Project'
      ]]);
    }
    
    // Debug: Log the parameters
    console.log('Parameters received:', e);
    console.log('e.parameter:', e ? e.parameter : 'e is null');
    
    // Check if parameters exist (when called from web app)
    if (e && e.parameter) {
      console.log('Adding data to sheet...');
      
      // Add the form data as a new row
      const newRow = [
        e.parameter.timestamp || new Date().toISOString(),
        e.parameter.name || '',
        e.parameter.email || '',
        e.parameter.phone || '',
        e.parameter.facing || '',
        e.parameter.formName || '',
        e.parameter.utm_campaign || '',
        e.parameter.utm_source || '',
        e.parameter.utm_medium || '',
        e.parameter.utm_keywords || '',
        e.parameter.project || 'Ark Kushak'
      ];
      
      console.log('New row data:', newRow);
      sheet.appendRow(newRow);
      console.log('Data added successfully');
    } else {
      console.log('No parameters found - this was a manual test');
    }
    
    // Check if this is a JSONP request
    const callback = e && e.parameter ? e.parameter.callback : null;
    const response = {success: true, message: 'Data saved successfully'};
    
    if (callback) {
      // Return JSONP response
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(response) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Return regular JSON response
      return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }
      
  } catch (error) {
    // Check if this is a JSONP request
    const callback = e && e.parameter ? e.parameter.callback : null;
    const response = {
      success: false,
      error: error.toString(),
      message: 'Error saving data'
    };
    
    if (callback) {
      // Return JSONP error response
      return ContentService
        .createTextOutput(callback + '(' + JSON.stringify(response) + ')')
        .setMimeType(ContentService.MimeType.JAVASCRIPT);
    } else {
      // Return regular JSON error response
      return ContentService
        .createTextOutput(JSON.stringify(response))
        .setMimeType(ContentService.MimeType.JSON);
    }
  }
}

function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Get the active spreadsheet (replace with your sheet ID if needed)
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // If this is the first row, add headers
    if (sheet.getLastRow() === 0) {
      sheet.getRange(1, 1, 1, 11).setValues([[
        'Timestamp',
        'Name',
        'Email',
        'Phone',
        'Facing Direction',
        'Form Name',
        'UTM Campaign',
        'UTM Source',
        'UTM Medium',
        'UTM Keywords',
        'Project'
      ]]);
    }
    
    // Add the form data as a new row
    const newRow = [
      data.timestamp,
      data.name,
      data.email,
      data.phone,
      data.facing,
      data.formName,
      data.utm_campaign,
      data.utm_source,
      data.utm_medium,
      data.utm_keywords,
      data.project
    ];
    
    sheet.appendRow(newRow);
    
    // Return success response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({success: true}))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Return error response with CORS headers
    return ContentService
      .createTextOutput(JSON.stringify({
        success: false,
        error: error.toString()
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Handle OPTIONS request for CORS preflight
function doOptions(e) {
  return ContentService
    .createTextOutput('')
    .setMimeType(ContentService.MimeType.TEXT);
}

// Test function to verify the script works
function testFunction() {
  const testData = {
    timestamp: new Date().toISOString(),
    name: 'Test User',
    email: 'test@example.com',
    phone: '1234567890',
    facing: 'North',
    formName: 'test-form',
    utm_campaign: 'test-campaign',
    utm_source: 'test-source',
    utm_medium: 'test-medium',
    utm_keywords: 'test-keywords',
    project: 'Ark Kushak'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  const result = doPost(mockEvent);
  console.log(result.getContent());
}
