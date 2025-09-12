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
  const message = `MISSING CHILD ALERT: ${report.childName}, Age ${report.childAge}, last seen at ${report.lastSeenLocation}. Contact: ${report.parentPhone}. Photo: https://bit.ly/${report.childName}  . Help us find them! - SafeKid Nepal`;
  
  const mockPhones = [
    '9841184511',
    '9841258222', 
    '9843964733',
    '9842245444',
    '9845349525',
    '9843695111',
    '9842224592', 
    '9843334593',
    '9844459844',
    '9845336455',
  ];

  console.log(`Broadcasting to ${area} area:`, message);
  
  for (const phone of mockPhones) {
    await sendSMSAlert(phone, message);
  }

  return { success: true, sentTo: mockPhones.length };
};