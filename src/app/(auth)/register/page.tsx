import { RegisterForm } from "@/components/auth/register-form";

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-[#eef6fb] px-4 py-10">
      <div className="mx-auto max-w-[620px]">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#003b4d] text-xl font-bold text-white">
            N
          </div>

          <h1 className="mt-5 text-3xl font-bold">
            Create your account
          </h1>

          <p className="mt-2 text-[#66777e]">
            Enter your information to create your simulated banking profile.
          </p>
        </div>

        <RegisterForm />
      </div>
    </main>
  );
}