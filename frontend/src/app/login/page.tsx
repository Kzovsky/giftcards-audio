"use client";
import React, { Suspense } from "react";
import dynamic from "next/dynamic";

const LoginClient = dynamic(() => import("./LoginClient"), { ssr: false });

export default function LoginPage() {
	return (
		<Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
			<LoginClient />
		</Suspense>
	);
}
