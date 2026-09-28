import crypto from "crypto";

function randomDigits(length: number) {
  let value = "";

  for (let i = 0; i < length; i++) {
    value += crypto.randomInt(0, 10).toString();
  }

  return value;
}

export function generateCustomerId() {
  return randomDigits(7);
}

export function generateAccountNumber() {
  return randomDigits(10);
}

export function generateTransactionReference() {
  return `TRX-${Date.now()}-${randomDigits(6)}`;
}