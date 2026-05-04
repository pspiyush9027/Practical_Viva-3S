import dotenv from 'dotenv';

dotenv.config();

export const validateEmailWithAbstract = async (email) => {
  const validationApiKey = process.env.ABSTRACT_API_KEY;
  const reputationApiKey = process.env.EMAIL_API_KEY;

  if (!validationApiKey && !reputationApiKey) {
    return {
      isAccepted: true,
      reason: 'Abstract API key is not configured, skipping validation',
      data: null,
    };
  }

  if (validationApiKey) {
    // External email verification API integration: Abstract Email Validation API
    const url = new URL('https://emailvalidation.abstractapi.com/v1/');
    url.searchParams.set('api_key', validationApiKey);
    url.searchParams.set('email', email);

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Abstract Email Validation API failed with status ${response.status}`);
    }

    const data = await response.json();
    const isFormatValid = Boolean(data?.is_valid_format?.value);
    const isDeliverable =
      data?.deliverability === 'DELIVERABLE' || data?.deliverability === 'UNKNOWN';
    const isDisposable = Boolean(data?.is_disposable_email?.value);

    return {
      isAccepted: isFormatValid && isDeliverable && !isDisposable,
      reason: !isFormatValid
        ? 'Invalid email format'
        : isDisposable
          ? 'Disposable email addresses are not allowed'
          : !isDeliverable
            ? 'Email is not deliverable'
            : 'Email accepted',
      data,
    };
  }

  // External email verification API integration: Abstract Email Reputation API
  const url = new URL('https://emailreputation.abstractapi.com/v1/');
  url.searchParams.set('api_key', reputationApiKey);
  url.searchParams.set('email', email);

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Abstract Email Reputation API failed with status ${response.status}`);
  }

  const data = await response.json();
  const status = data?.email_deliverability?.status;
  const isFormatValid = Boolean(data?.email_deliverability?.is_format_valid);
  const isDisposable = Boolean(data?.email_quality?.is_disposable);
  const addressRiskStatus = data?.email_risk?.address_risk_status;
  const isDeliverable = status === 'deliverable' || status === 'unknown';
  const isLowOrUnknownRisk =
    !addressRiskStatus || addressRiskStatus === 'low' || addressRiskStatus === 'medium';

  return {
    isAccepted: isFormatValid && isDeliverable && !isDisposable && isLowOrUnknownRisk,
    reason: !isFormatValid
      ? 'Invalid email format'
      : isDisposable
        ? 'Disposable email addresses are not allowed'
        : !isDeliverable
          ? 'Email is not deliverable'
          : !isLowOrUnknownRisk
            ? 'Email address has high risk status'
            : 'Email accepted',
    data,
  };
};
