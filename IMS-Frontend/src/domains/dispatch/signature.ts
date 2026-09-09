
export function validateSignature(sigPadRef: any, items: any[]): boolean {
    if (!items) return true;
    const hasSerialized = items.some((i: any) => i.type === 'SERIALIZED');

    if (hasSerialized) {
        if (!sigPadRef || !sigPadRef.current || sigPadRef.current.isEmpty()) {
            return false;
        }
    }
    return true;
}

export function clearSignature(sigPadRef: any) {
    sigPadRef.current?.clear();
}
