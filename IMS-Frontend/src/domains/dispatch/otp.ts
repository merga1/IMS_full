
export function validateOTPInput(otp: string): boolean {
    return otp.length === 6;
}

export function verifyRequestOTP(
    reqId: string,
    otpInput: string,
    verifierFn: (id: string, otp: string) => boolean
): boolean {
    return verifierFn(reqId, otpInput);
}
