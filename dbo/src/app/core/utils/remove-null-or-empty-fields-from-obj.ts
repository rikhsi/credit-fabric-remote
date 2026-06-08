export function removeNullOrEmptyFieldsFromObject(
  obj: Record<string, any>,
  isZeroAcceptable: boolean = true,
  zeroNotRemovableFields: string[] = []
): Record<string, any> {
  const cleanedObj: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    if (
      value === null ||
      value === undefined ||
      value === '' ||
      (Array.isArray(value) && value.length === 0)
    ) {
      continue;
    }

    if (value === 0) {
      if (!isZeroAcceptable || !zeroNotRemovableFields.includes(key)) {
        continue;
      }
    }

    cleanedObj[key] = value;
  }

  return cleanedObj;
}
