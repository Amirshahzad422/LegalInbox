"use client";

export default function ConnectGmailButton() {
  return (
    <a
      href="/api/gmail/auth"
      className="inline-block px-4 py-2 rounded-md bg-white text-black font-medium hover:bg-gray-200"
    >
      Connect Gmail
    </a>
  );
}