const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";

export function generateBookingId(): string {
  let id = "BK-";
  for (let i = 0; i < 6; i++) {
    id += CHARS.charAt(Math.floor(Math.random() * CHARS.length));
  }
  return id;
}

export function isValidBookingId(bookingId: string): boolean {
  return /^BK-[A-Z0-9]{6}$/.test(bookingId);
}
