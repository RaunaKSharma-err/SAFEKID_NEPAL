import type { BroadcastArea } from '@/types/report';

export const getAreaCost = (area: BroadcastArea): number => {
  switch (area) {
    case 'city':
      return 100;
    case 'province':
      return 300;
    case 'nationwide':
      return 500;
    default:
      return 100;
  }
};

export const calculateFinalCost = (baseCost: number, tokensUsed: number): number => {
  return Math.max(0, baseCost - tokensUsed);
};

export const processPayment = async (
  method: 'esewa' | 'khalti',
  amount: number,
  reportId: string
): Promise<{ success: boolean; transactionId?: string; error?: string }> => {
  try {
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const transactionId = `${method.toUpperCase()}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    console.log(`Payment processed via ${method}: Rs. ${amount}, Transaction: ${transactionId}`);
    
    return {
      success: true,
      transactionId,
    };
  } catch (error) {
    console.error('Payment processing failed:', error);
    return {
      success: false,
      error: 'Payment failed. Please try again.',
    };
  }
};

export const distributePrize = async (reportId: string, totalAmount: number) => {
  const appFee = totalAmount * 0.2;
  const finderReward = totalAmount * 0.6;
  const helperTokens = totalAmount * 0.2;

  console.log('Prize Distribution:', {
    reportId,
    totalAmount,
    appFee,
    finderReward,
    helperTokens: helperTokens / 2,
  });

  return {
    appFee,
    finderReward,
    helperTokens: helperTokens / 2,
  };
};