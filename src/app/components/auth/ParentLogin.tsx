import { useState } from "react";
import { ArrowLeft, Users } from "lucide-react";
import { login } from "../../../api/authService";
import { toast } from "sonner";

interface Props {
    onBack: () => void;
    onLogin: (user: any) => void;
}

export default function ParentLogin({ onBack, onLogin }: Props) {

    const [userId, setUserId] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();

        try {

            setLoading(true);

           const result = await login(
    userId,
    password,
    "Hostel"
);

            if (result.role !== "Parent") {
                toast.error("Please use Parent Login");
                return;
            }

            onLogin({
                id: result.id,
                userId: result.userId,
                name: result.fullName,
                role: "parent",
                studentId: result.studentId
            });

            toast.success("Login Successful");

        } catch (err: any) {
            toast.error(err.message);
        }

        finally {
            setLoading(false);
        }
    };

  return (
  <div className="min-h-screen bg-gray-50 flex flex-col">

    {/* Header */}
    <div className="bg-gradient-to-r from-green-500 to-green-700 pt-12 pb-8 px-6 shadow-md relative">

      <button
        onClick={onBack}
        className="absolute top-4 left-4 flex items-center text-white/80 hover:text-white"
      >
        <ArrowLeft size={20} className="mr-1" />
        <span className="text-sm">Back</span>
      </button>

      <div className="text-center mt-2">

        <div className="inline-flex bg-white/20 p-4 rounded-2xl mb-3 shadow-lg">
          <Users size={40} className="text-white" />
        </div>

        <h2 className="text-white text-2xl font-bold">
          Parent Login
        </h2>

        <p className="text-white/80 text-sm mt-1">
          Hostel Parent Portal
        </p>

      </div>

    </div>

    {/* Login Card */}
    <div className="flex-1 px-5 py-6 -mt-2 bg-gray-50 rounded-t-3xl">

      <form
        onSubmit={handleLogin}
        className="space-y-4 max-w-md mx-auto"
      >

        {/* Parent Login ID */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Parent Login ID
          </label>

          <input
            type="text"
            value={userId}
            onChange={(e) => setUserId(e.target.value)}
            className="w-full py-2 bg-transparent border-0 focus:outline-none text-gray-800"
            placeholder="Enter Parent Login ID"
            required
          />

        </div>

        {/* Password */}
        <div className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">

          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">
            Password
          </label>

          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full py-2 bg-transparent border-0 focus:outline-none text-gray-800"
            placeholder="Enter Password"
            required
          />

        </div>

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 text-white font-bold py-4 rounded-2xl shadow-lg active:scale-95 transition-transform"
        >
          {loading ? "Logging in..." : "Login"}
        </button>
<div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mt-5">

  <h3 className="text-sm font-bold text-green-700 mb-3">
    Demo Parent Accounts
  </h3>

  <div className="space-y-2">

    <button
      type="button"
      onClick={() => {
        setUserId("PMDC0001");
        setPassword("Par@477246");
      }}
      className="w-full text-left border rounded-xl p-3 hover:bg-green-50 transition"
    >
      <div className="font-semibold">PMDC0001</div>
      <div className="text-xs text-gray-500">
        Password : Par@477246
      </div>
    </button>

    <button
      type="button"
      onClick={() => {
        setUserId("PMDC0002");
        setPassword("Par@901025");
      }}
      className="w-full text-left border rounded-xl p-3 hover:bg-green-50 transition"
    >
      <div className="font-semibold">PMDC0002</div>
      <div className="text-xs text-gray-500">
        Password : Par@901025
      </div>
    </button>

    <button
      type="button"
      onClick={() => {
        setUserId("PMCP0002");
        setPassword("Par@481088");
      }}
      className="w-full text-left border rounded-xl p-3 hover:bg-green-50 transition"
    >
      <div className="font-semibold">PMCP0002</div>
      <div className="text-xs text-gray-500">
        Password : Par@481088

      </div>
    </button>

   

  </div>

</div>
      </form>

    </div>

  </div>
);
}