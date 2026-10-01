import { LoginForm } from "@/components/auth/login-form";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-12">
      <div className="mx-auto w-full max-w-[480px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#003b4d] text-xl font-bold text-white">
            N
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Welcome back
          </h1>

          <p className="mt-2 text-[#66777e]">
            Sign in to your banking account.
          </p>
        </div>

        <LoginForm />
      </div>
    </main>
  );
}