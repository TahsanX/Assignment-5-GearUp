import type { Metadata } from 'next';
import { Suspense } from 'react';
import { RegisterForm } from './register-form';

export const metadata: Metadata = {
  title: 'Create an account',
  description: 'Join GearUp as a customer or a gear provider.',
};

export default function RegisterPage() {
  return (
    <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-md flex-col justify-center px-4 py-12">
      <Suspense fallback={<div className="skeleton h-[32rem] rounded-xl" />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
