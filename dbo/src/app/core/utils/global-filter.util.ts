


export function handleKeyDown(event: KeyboardEvent): void {
  const allowedKeys = ["Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab"];

  // Allow navigation and control keys
  if (allowedKeys.includes(event.key)) {
    return;
  }

  // Block any non-digit key
  if (!/^[0-9]$/.test(event.key)) {
    event.preventDefault();
  }
}


export function parseToCents(value?: number | null): number | null {
  if (typeof value !== 'number' || isNaN(value)) {
    return null;
  }
  return Math.round(value * 100);
}


export function getFormattedAmount(amount: number | null  | undefined) {
  if (!amount) {
    return { integer: '0', decimal: '00' };
  } else {
    const sum = Number(amount) || 0;
    const absSum = Math.abs(sum);
    const integer = Math.floor(absSum / 100)
    const decimal = (absSum % 100).toString().padStart(2, "0");
    return { integer, decimal };
  }

}


export function formatExpireDate(value: string | number | undefined): string {
  if (!value) return '--/--';
  const raw = value.toString().trim();
  if (!raw) return ""

  if (/^\d{4}$/.test(raw)) {
    return `${raw.slice(0, 2)}/${raw.slice(2, 4)}`;
  }
  return raw;
}

 export function maskNumber(value: string | number | undefined, start = 5, end = 3, maskChar = '*'): string {
  if(!value) return ""
  const str = String(value);
  if (str.length <= start + end) return str;
  const maskedLength = str.length - start - end;
  return (
    str.slice(0, start) +
    maskChar.repeat(maskedLength) +
    str.slice(-end)
  );
}

