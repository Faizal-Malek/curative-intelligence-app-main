// src/app/(auth)/layout.tsx
import React from "react";

// This layout component will wrap our sign-in and sign-up pages.
// It uses flexbox to center its children both horizontally and vertically.
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen">
      {children}
    </div>
  );
}