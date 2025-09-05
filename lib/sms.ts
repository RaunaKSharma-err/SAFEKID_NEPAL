export const sendSMSAlert = async (phone: string, message: string) => {
  try {
    console.log(`SMS Alert sent to ${phone}: ${message}`);
    
    const response = await fetch('https://api.sparrowsms.com/v2/sms/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_SPARROW_SMS_TOKEN',
      },
      body: JSON.stringify({
        from: 'SafeKid',
        to: phone,
        text: message,
      }),
    });

    return { success: true, data: await response.json() };
  } catch (error) {
    console.error('SMS sending failed:', error);
    return { success: false, error: 'Failed to send SMS' };
  }
};

export const broadcastAlert = async (report: any, area: string) => {
  const message = `MISSING CHILD ALERT: ${report.childName}, Age ${report.childAge}, last seen at ${report.lastSeenLocation}. Contact: ${report.parentPhone}. Help us find them! - SafeKid Nepal`;
  
  const mockPhones = [
    '9841111111',
    '9842222222', 
    '9843333333',
    '9844444444',
    '9845555555'
  ];

  console.log(`Broadcasting to ${area} area:`, message);
  
  for (const phone of mockPhones) {
    await sendSMSAlert(phone, message);
  }

  return { success: true, sentTo: mockPhones.length };
};